const catchAsync = require('../../../utils/catchAsync');
const VleProfile = require('../../../models/VleProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const Pilot = require('../../../models/Pilot');

const getVleStats = catchAsync(async (_req, res) => {
  const [activeVlesResult, statesResult, problemsSubmitted, implementedVleIds] = await Promise.all([
    VleProfile.aggregate([
      { $match: { vleStatus: 'active' } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.status': 'APPROVED' } },
      { $count: 'total' },
    ]),
    VleProfile.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.status': 'APPROVED', state: { $nin: [null, ''] } } },
      { $group: { _id: '$state' } },
      { $count: 'total' },
    ]),
    InnovationRequest.countDocuments({ status: 'PUBLISHED' }),
    Pilot.distinct('vleId', { status: 'IMPLEMENTED' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      activeVles:      activeVlesResult[0]?.total ?? 0,
      statesCovered:   statesResult[0]?.total ?? 0,
      problemsSubmitted,
      successStories:  implementedVleIds.length,
    },
  });
});

module.exports = { getVleStats };
