const catchAsync = require('../../../utils/catchAsync');
const User = require('../../../models/User');
const VleProfile = require('../../../models/VleProfile');
const InnovationRequest = require('../../../models/InnovationRequest');
const Pilot = require('../../../models/Pilot');

const getImpactStats = catchAsync(async (_req, res) => {
  const [
    nodalOrgs,
    affiliatedOrgs,
    innovatorsOnboarded,
    problemsIdentified,
    activeVlesResult,
    statesResult,
    implementedInnovationIds,
  ] = await Promise.all([
    User.countDocuments({ role: 'NO', status: 'APPROVED' }),
    User.countDocuments({ role: 'AO', status: 'APPROVED' }),
    User.countDocuments({ role: 'INNOVATOR', status: 'APPROVED' }),
    InnovationRequest.countDocuments({ status: 'PUBLISHED' }),
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
    Pilot.distinct('innovationId', { status: 'IMPLEMENTED' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      states:                  statesResult[0]?.total ?? 0,
      nodalOrgs,
      affiliatedOrgs,
      activeVles:              activeVlesResult[0]?.total ?? 0,
      problemsIdentified,
      innovatorsOnboarded,
      technologiesImplemented: implementedInnovationIds.length,
    },
  });
});

module.exports = { getImpactStats };
