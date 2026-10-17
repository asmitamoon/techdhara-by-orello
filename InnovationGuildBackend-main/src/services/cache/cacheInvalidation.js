const { invalidateInnovationCaches, invalidateProblemCaches, invalidateAllInnovations, invalidateAllProblems } = require('./publicContentCache');
const invalidateInnovationOnApproval = async (innovationId) => {
  try {
    await invalidateInnovationCaches(innovationId);
    console.log(`[Cache Invalidation] Innovation approved: ${innovationId}`);
  } catch (error) {
    console.error('[Cache Invalidation Error] invalidateInnovationOnApproval:', error.message);
  }
};

const invalidateInnovationOnModification = async (innovationId) => {
  try {
    await invalidateInnovationCaches(innovationId);
    console.log(`[Cache Invalidation] Innovation modified/deleted: ${innovationId}`);
  } catch (error) {
    console.error('[Cache Invalidation Error] invalidateInnovationOnModification:', error.message);
  }
};

const invalidateProblemOnApproval = async (problemId) => {
  try {
    await invalidateProblemCaches(problemId);
    console.log(`[Cache Invalidation] Problem approved: ${problemId}`);
  } catch (error) {
    console.error('[Cache Invalidation Error] invalidateProblemOnApproval:', error.message);
  }
};

const invalidateProblemOnModification = async (problemId) => {
  try {
    await invalidateProblemCaches(problemId);
    console.log(`[Cache Invalidation] Problem modified/deleted: ${problemId}`);
  } catch (error) {
    console.error('[Cache Invalidation Error] invalidateProblemOnModification:', error.message);
  }
};

const invalidateUserContent = async (userId) => {
  try {
    await invalidateAllInnovations();
    await invalidateAllProblems();
    console.log(`[Cache Invalidation] User content cleared for user: ${userId}`);
  } catch (error) {
    console.error('[Cache Invalidation Error] invalidateUserContent:', error.message);
  }
};

module.exports = {
  invalidateInnovationOnApproval,
  invalidateInnovationOnModification,
  invalidateProblemOnApproval,
  invalidateProblemOnModification,
  invalidateUserContent
};
