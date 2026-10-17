const InnovationRequest = require('../../models/InnovationRequest');
const Innovation = require('../../models/Innovation');
const Match = require('../../models/Match');
const { calculateMatchScore } = require('./scoringEngine');
const { MATCHING_CONFIG } = require('./matchingConfig');

async function findMatchingInnovations(problemId) {
  try {
    const problem = await InnovationRequest.findById(problemId);
    if (!problem) {
      throw new Error(`InnovationRequest not found with id: ${problemId}`);
    }

    if (problem.status !== 'PUBLISHED' || !problem.matchingEnabled) {
      return { savedCount: 0, topMatches: [] };
    }

    const innovations = await Innovation.find({
      status: 'PUBLISHED',
      matchingEnabled: true
    });

    if (innovations.length === 0) {
      return { savedCount: 0, topMatches: [] };
    }

    const scoredMatches = [];
    for (const innovation of innovations) {
      const scoreResult = await calculateMatchScore(problem, innovation);

      if (scoreResult.totalScore >= MATCHING_CONFIG.AUTO_MATCH_MIN_SCORE) {
        scoredMatches.push({
          problemId: problem._id,
          innovationId: innovation._id,
          matchScore: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdown,
          matchDetails: scoreResult.matchDetails,
          locationMatch: scoreResult.locationMatch
        });
      }
    }

    // Sort by score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Take top N matches
    const topMatches = scoredMatches.slice(0, MATCHING_CONFIG.AUTO_SAVE_TOP_N);

    if (topMatches.length === 0) {
      return { savedCount: 0, topMatches: [] };
    }

    await Match.deleteMany({ problemId: problem._id });

    // Batch insert top matches
    const savedMatches = await Match.insertMany(topMatches);

    return {
      savedCount: savedMatches.length,
      topMatches: savedMatches
    };
  } catch (error) {
    console.error('Error in findMatchingInnovations:', error);
    throw error;
  }
}

async function findMatchingInnovationRequests(innovationId) {
  try {
    const innovation = await Innovation.findById(innovationId);
    if (!innovation) {
      throw new Error(`Innovation not found with id: ${innovationId}`);
    }

    if (innovation.status !== 'PUBLISHED' || !innovation.matchingEnabled) {
      return { savedCount: 0, topMatches: [] };
    }

    const problems = await InnovationRequest.find({
      status: 'PUBLISHED',
      matchingEnabled: true
    });

    if (problems.length === 0) {
      return { savedCount: 0, topMatches: [] };
    }

    const scoredMatches = [];
    for (const problem of problems) {
      const scoreResult = await calculateMatchScore(problem, innovation);

      if (scoreResult.totalScore >= MATCHING_CONFIG.AUTO_MATCH_MIN_SCORE) {
        scoredMatches.push({
          problemId: problem._id,
          innovationId: innovation._id,
          matchScore: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdown,
          matchDetails: scoreResult.matchDetails,
          locationMatch: scoreResult.locationMatch
        });
      }
    }

    // Sort by score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Take top N matches
    const topMatches = scoredMatches.slice(0, MATCHING_CONFIG.AUTO_SAVE_TOP_N);

    if (topMatches.length === 0) {
      return { savedCount: 0, topMatches: [] };
    }

    await Match.deleteMany({ innovationId: innovation._id });

    // Batch insert top matches
    const savedMatches = await Match.insertMany(topMatches);

    return {
      savedCount: savedMatches.length,
      topMatches: savedMatches
    };
  } catch (error) {
    console.error('Error in findMatchingInnovationRequests:', error);
    throw error;
  }
}

async function runOnDemandMatching(problemId, page = 1, limit = MATCHING_CONFIG.ON_DEMAND_PAGE_SIZE) {
  try {
    const problem = await InnovationRequest.findById(problemId);
    if (!problem) {
      throw new Error(`InnovationRequest not found with id: ${problemId}`);
    }

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(
      Math.max(1, parseInt(limit) || MATCHING_CONFIG.ON_DEMAND_PAGE_SIZE),
      MATCHING_CONFIG.ON_DEMAND_PAGE_SIZE
    );

    const innovations = await Innovation.find({
      status: 'PUBLISHED',
      matchingEnabled: true
    });

    if (innovations.length === 0) {
      return { matches: [], totalCount: 0, page: 1, totalPages: 0 };
    }

    const scoredMatches = [];
    for (const innovation of innovations) {
      const scoreResult = await calculateMatchScore(problem, innovation);

      if (scoreResult.totalScore >= MATCHING_CONFIG.ON_DEMAND_MIN_SCORE) {
        scoredMatches.push({
          problemId: problem._id,
          innovationId: innovation._id,
          innovation: innovation, // Populate for response
          matchScore: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdown,
          matchDetails: scoreResult.matchDetails,
          locationMatch: scoreResult.locationMatch
        });
      }
    }

    // Sort by score descending
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply result limit
    const limitedMatches = scoredMatches.slice(0, MATCHING_CONFIG.ON_DEMAND_MAX_RESULTS);

    const totalCount = limitedMatches.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = limitedMatches.slice(startIndex, endIndex);

    return {
      matches: paginatedMatches,
      totalCount,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Error in runOnDemandMatching:', error);
    throw error;
  }
}

async function saveManualMatch(problemId, innovationId) {
  try {
    const problem = await InnovationRequest.findById(problemId);
    if (!problem) {
      throw new Error(`InnovationRequest not found with id: ${problemId}`);
    }

    const innovation = await Innovation.findById(innovationId);
    if (!innovation) {
      throw new Error(`Innovation not found with id: ${innovationId}`);
    }

    const existingMatch = await Match.findOne({ problemId, innovationId });
    if (existingMatch) {
      return existingMatch;
    }

    const scoreResult = await calculateMatchScore(problem, innovation);

    if (scoreResult.totalScore < MATCHING_CONFIG.MANUAL_SAVE_MIN_SCORE) {
      throw new Error(`Match score ${scoreResult.totalScore} is below minimum threshold ${MATCHING_CONFIG.MANUAL_SAVE_MIN_SCORE}`);
    }

    const match = new Match({
      problemId,
      innovationId,
      matchScore: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown,
      matchDetails: scoreResult.matchDetails,
      locationMatch: scoreResult.locationMatch
    });

    await match.save();
    return match;
  } catch (error) {
    console.error('Error in saveManualMatch:', error);
    throw error;
  }
}

async function runOnDemandMatchingForInnovation(innovationId, page = 1, limit = MATCHING_CONFIG.ON_DEMAND_PAGE_SIZE) {
  try {
    const innovation = await Innovation.findById(innovationId);
    if (!innovation) {
      throw new Error(`Innovation not found with id: ${innovationId}`);
    }

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(
      Math.max(1, parseInt(limit) || MATCHING_CONFIG.ON_DEMAND_PAGE_SIZE),
      MATCHING_CONFIG.ON_DEMAND_PAGE_SIZE
    );

    const problems = await InnovationRequest.find({
      status: 'PUBLISHED',
      matchingEnabled: true
    });

    if (problems.length === 0) {
      return { matches: [], totalCount: 0, page: 1, totalPages: 0 };
    }

    const scoredMatches = [];
    for (const problem of problems) {
      const scoreResult = await calculateMatchScore(problem, innovation);

      if (scoreResult.totalScore >= MATCHING_CONFIG.ON_DEMAND_MIN_SCORE) {
        scoredMatches.push({
          problem,
          innovation,
          matchScore: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdown,
          matchDetails: scoreResult.matchDetails,
          locationMatch: scoreResult.locationMatch
        });
      }
    }

    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    const limitedMatches = scoredMatches.slice(0, MATCHING_CONFIG.ON_DEMAND_MAX_RESULTS);
    const totalCount = limitedMatches.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = limitedMatches.slice(startIndex, endIndex);

    return {
      matches: paginatedMatches,
      totalCount,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Error in runOnDemandMatchingForInnovation:', error);
    throw error;
  }
}

module.exports = {
  findMatchingInnovations,
  findMatchingInnovationRequests,
  runOnDemandMatching,
  runOnDemandMatchingForInnovation,
  saveManualMatch
};
