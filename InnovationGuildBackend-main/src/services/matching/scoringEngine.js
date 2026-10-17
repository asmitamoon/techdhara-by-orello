const { compareLocations } = require('./locationUtils');

// Normalize a free-text crop / raw-material list into a set of comparable tokens.
// Handles comma/slash/newline separated lists and multi-word names ("Bombay Duck",
// "wheat grain"); strips punctuation and a simple trailing plural 's'.
function normalizeCrops(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .split(/[,/;\n]+/)
      .flatMap(s => s.trim().split(/\s+/))
      .map(t => t.replace(/[^a-z0-9]/g, '').replace(/s$/, ''))
      .filter(t => t.length > 2)
  );
}

// Lightweight structured match: operations overlap (primary) + raw-material overlap (tie-break).
// Operations are the essential fit signal — a match requires at least one operation in common.
async function calculateMatchScore(problem, innovation) {
  try {
    // 1) Operations overlap (exact enum codes)
    const problemOps = new Set([
      ...(problem.operationsUndertaken || []),
      ...(problem.machineOperations || []),
    ]);
    const innovationOps = new Set(innovation.coveredOperations || []);
    const matchedOperations = [...problemOps].filter(op => innovationOps.has(op));
    const opOverlap = matchedOperations.length;

    // 2) Raw-material (crop) overlap — problem.crops vs innovation.suitableCrops
    const innovationCrops = normalizeCrops(innovation.suitableCrops);
    const matchedCrops = [...normalizeCrops(problem.crops)].filter(c => innovationCrops.has(c));
    const matOverlap = matchedCrops.length;

    // Require >=1 operation overlap. Operations dominate the score; crops break ties.
    const totalScore = opOverlap === 0 ? 0 : (opOverlap * 5 + matOverlap);

    // Location is still computed and stored (used for display), but not part of the score.
    const locationMatch = await compareLocations(problem, innovation);

    return {
      totalScore,
      breakdown: {
        operationMatch: opOverlap,
        rawMaterialMatch: matOverlap,
      },
      matchDetails: {
        matchedOperations,
        matchedCrops,
      },
      locationMatch,
    };
  } catch (error) {
    console.error('Error in calculateMatchScore:', error);
    throw error;
  }
}

module.exports = {
  calculateMatchScore,
};
