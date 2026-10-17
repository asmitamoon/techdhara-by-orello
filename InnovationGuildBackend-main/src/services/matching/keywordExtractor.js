const natural = require('natural');
const { STOPWORDS } = require('./stopwords');
const InnovationRequest = require('../../models/InnovationRequest');
const Innovation = require('../../models/Innovation');

const stemmer = natural.PorterStemmer;

function extractKeywords(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Step 1 & 2: Convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  // Step 3: Split into words
  const words = cleanText.split(/\s+/);

  // Step 4, 5, 6, 7: Filter, stem, and remove duplicates
  const keywords = words
    .filter(word =>
      word.length > 3 &&              // Min length 4 characters
      !STOPWORDS.includes(word) &&    // Not in stopwords list
      !/^\d+$/.test(word)             // Not a pure number
    )
    .map(word => stemmer.stem(word)); // Apply Porter Stemmer

  // Step 8: Remove duplicates (stemming may create duplicates)
  return [...new Set(keywords)];
}

async function updateProblemKeywords(problemId) {
  try {
    const problem = await InnovationRequest.findById(problemId);

    if (!problem) {
      throw new Error(`Problem not found with id: ${problemId}`);
    }

    const parts = [
      problem.problemTitle,
      problem.problemDescription,
      problem.crops,
      problem.currentMethodology,
      problem.machineChallenge,
      problem.specificInfo,
      problem.categoryOther,
      ...(problem.operationsUndertaken || []),
      ...(problem.valueChainStages || []),
      ...(problem.machineOperations || []),
      ...(problem.energySource || []),
    ].filter(Boolean);
    const combinedText = parts.join(' ');
    const keywords = extractKeywords(combinedText);

    problem.keywords = keywords;
    await problem.save();

    return problem;
  } catch (error) {
    console.error(`Error updating keywords for problem ${problemId}:`, error);
    throw error;
  }
}

async function updateInnovationKeywords(innovationId) {
  try {
    const innovation = await Innovation.findById(innovationId);

    if (!innovation) {
      throw new Error(`Innovation not found with id: ${innovationId}`);
    }

    const combinedText = `${innovation.innovationName} ${innovation.description}`;
    const keywords = extractKeywords(combinedText);

    innovation.keywords = keywords;
    await innovation.save();

    return innovation;
  } catch (error) {
    console.error(`Error updating keywords for innovation ${innovationId}:`, error);
    throw error;
  }
}

async function batchUpdateAllKeywords() {
  try {
    console.log('Starting keyword backfill for all PUBLISHED content...');

    const publishedProblems = await InnovationRequest.find({
      status: 'PUBLISHED'
    });

    let problemsUpdated = 0;
    for (const problem of publishedProblems) {
      try {
        await updateProblemKeywords(problem._id);
        problemsUpdated++;
      } catch (error) {
        console.error(`Failed to update problem ${problem._id}:`, error.message);
      }
    }

    const publishedInnovations = await Innovation.find({
      status: 'PUBLISHED'
    });

    let innovationsUpdated = 0;
    for (const innovation of publishedInnovations) {
      try {
        await updateInnovationKeywords(innovation._id);
        innovationsUpdated++;
      } catch (error) {
        console.error(`Failed to update innovation ${innovation._id}:`, error.message);
      }
    }

    console.log('Keyword backfill completed successfully!');
    return {
      problemsUpdated,
      innovationsUpdated,
      totalUpdated: problemsUpdated + innovationsUpdated
    };
  } catch (error) {
    console.error('Error in batch keyword update:', error);
    throw error;
  }
}

module.exports = {
  extractKeywords,
  updateProblemKeywords,
  updateInnovationKeywords,
  batchUpdateAllKeywords
};
