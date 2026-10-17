
const MATCHING_CONFIG = {
  // Scoring: score = opOverlap * 5 + cropOverlap, and requires >=1 operation overlap.
  // So the minimum score for any real match is 5 (one shared operation, no shared crops).

  // Automatic Matching (Triggered on approval)
  AUTO_SAVE_TOP_N: 10,
  AUTO_MATCH_MIN_SCORE: 5,  // >=1 shared operation

  // On-Demand Matching (Real-time view, not saved)
  ON_DEMAND_MIN_SCORE: 5,   // >=1 shared operation
  ON_DEMAND_PAGE_SIZE: 20,
  ON_DEMAND_MAX_RESULTS: 1000,

  // Manual Save (Admin can override)
  MANUAL_SAVE_MIN_SCORE: 1,

  // Performance Settings
  MATCHING_TIMEOUT_MS: 30000, 
  BATCH_INSERT_SIZE: 100, 
};

module.exports = { MATCHING_CONFIG };
