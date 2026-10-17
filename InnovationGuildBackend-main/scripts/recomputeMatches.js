/**
 * Recompute all saved problem↔innovation matches.
 *
 * The public problem/innovation pages read PRECOMPUTED `Match` records that are
 * written at approval time using MATCHING_CONFIG thresholds. When those thresholds
 * change (e.g. raising AUTO_MATCH_MIN_SCORE to drop category-only matches), existing
 * saved matches do NOT update on their own — they must be regenerated.
 *
 * This script:
 *   1. Wipes ALL existing Match records (also clears any stale matches for problems
 *      that no longer have any qualifying innovation).
 *   2. Refreshes NLP keywords for every PUBLISHED + matchingEnabled problem & innovation.
 *   3. Re-runs findMatchingInnovations() per problem to regenerate matches under the
 *      current threshold.
 *
 * Usage:
 *   node scripts/recomputeMatches.js      (or: npm run recompute-matches)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

const InnovationRequest = require('../src/models/InnovationRequest');
const Innovation = require('../src/models/Innovation');
const Match = require('../src/models/Match');

const { updateProblemKeywords, extractKeywords } = require('../src/services/matching/keywordExtractor');
const { findMatchingInnovations } = require('../src/services/matching/matchingService');

async function main() {
  await connectDB();
  console.log('── Recomputing all matches ──');

  // 1. Wipe all existing matches up front
  const { deletedCount } = await Match.deleteMany({});
  console.log(`  Cleared ${deletedCount} existing match record(s)`);

  const problems = await InnovationRequest.find({ status: 'PUBLISHED', matchingEnabled: true });
  const innovations = await Innovation.find({ status: 'PUBLISHED', matchingEnabled: true });

  // 2a. Refresh problem keywords (InnovationRequest.save() has no image restriction)
  for (const p of problems) {
    try { await updateProblemKeywords(p._id); }
    catch (e) { console.error(`  ✗ kw-problem ${p._id}: ${e.message}`); }
  }

  // 2b. Refresh innovation keywords via direct update — avoids the pre-save hook that
  // requires media.images.length >= 1 (migrated innovations may have no images yet)
  for (const inv of innovations) {
    try {
      const kw = extractKeywords(`${inv.innovationName} ${inv.description}`);
      await Innovation.updateOne({ _id: inv._id }, { $set: { keywords: kw } });
    } catch (e) { console.error(`  ✗ kw-innovation ${inv._id}: ${e.message}`); }
  }

  // 3. Re-fetch problems so they carry the freshly stored keywords, then regenerate matches
  const freshProblems = await InnovationRequest.find({ status: 'PUBLISHED', matchingEnabled: true });
  let totalMatches = 0;
  for (const p of freshProblems) {
    try {
      const r = await findMatchingInnovations(p._id);
      totalMatches += r.savedCount;
      if (r.savedCount > 0) console.log(`  ✓ "${p.problemTitle}": ${r.savedCount} match(es)`);
    } catch (e) { console.error(`  ✗ match-problem ${p._id}: ${e.message}`); }
  }

  console.log(`\n  Done. Problems: ${problems.length} | Innovations: ${innovations.length} | Matches saved: ${totalMatches}`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Unexpected error:', err.message);
  process.exit(1);
});
