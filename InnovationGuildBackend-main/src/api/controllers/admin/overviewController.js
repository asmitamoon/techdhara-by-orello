const User = require('../../../models/User');
const Innovation = require('../../../models/Innovation');
const Problem = require('../../../models/InnovationRequest');
const Pilot = require('../../../models/Pilot');
const ContactView = require('../../../models/ContactView');
const VleProfile = require('../../../models/VleProfile');
const catchAsync = require('../../../utils/catchAsync');

const getAdminOverview = catchAsync(async (req, res) => {
  const [
    totalNOs,
    totalAOs,
    totalVLEs,
    totalInnovators,
    totalInnovations,
    totalProblems,
    totalImplementations,
    totalInteractions,
    recentInnovations,
    recentProblems
  ] = await Promise.all([
    User.countDocuments({ role: 'NO', status: 'APPROVED' }),
    User.countDocuments({ role: 'AO', status: 'APPROVED' }),
    User.countDocuments({ role: 'VLE', status: 'APPROVED' }),
    User.countDocuments({ role: 'INNOVATOR', status: 'APPROVED' }),
    Innovation.countDocuments({ status: 'PUBLISHED' }),
    Problem.countDocuments({ status: 'PUBLISHED' }),
    Pilot.countDocuments({ status: 'IMPLEMENTED' }),
    ContactView.countDocuments(),
    Innovation.find({ status: 'PUBLISHED' })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('innovationName innovatorId media.images')
      .populate('innovatorId', 'fullName')
      .lean(),
    Problem.find({ status: 'PUBLISHED' })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('problemTitle postedBy')
      .populate('postedBy', 'fullName')
      .lean()
  ]);

  const approvedVleUserIds = await User.find({ role: 'VLE', status: 'APPROVED' }).distinct('_id');
  const recentVleProfiles = await VleProfile.find({ userId: { $in: approvedVleUserIds } })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('userId state district')
    .lean();

  const vleUserIds = recentVleProfiles.map(p => p.userId);
  const vleUsers = await User.find({ _id: { $in: vleUserIds } })
    .select('_id fullName profilePicture')
    .lean();

  const userMap = {};
  vleUsers.forEach(u => { userMap[u._id.toString()] = u; });

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalNOs,
        totalAOs,
        totalVLEs,
        totalInnovators,
        totalInnovations,
        totalProblems,
        totalImplementations,
        totalInteractions
      },
      recentApprovals: {
        innovations: recentInnovations.map(i => ({
          id: i._id,
          title: i.innovationName,
          subtitle: i.innovatorId?.fullName || '',
          image: i.media?.images?.[0]?.url ?? null
        })),
        vles: recentVleProfiles.map(p => ({
          id: p.userId,
          name: userMap[p.userId.toString()]?.fullName || '',
          stateCode: p.state,
          districtCode: p.district,
          profilePicture: userMap[p.userId.toString()]?.profilePicture || null
        })),
        problems: recentProblems.map(p => ({
          id: p._id,
          title: p.problemTitle,
          author: p.postedBy?.fullName || '',
          type: 'innovation-request'
        }))
      }
    }
  });
});

module.exports = { getAdminOverview };
