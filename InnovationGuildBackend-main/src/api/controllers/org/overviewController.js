const VleProfile = require('../../../models/VleProfile');
const Problem = require('../../../models/InnovationRequest');
const Pilot = require('../../../models/Pilot');
const User = require('../../../models/User');
const catchAsync = require('../../../utils/catchAsync');

const getOrgOverview = catchAsync(async (req, res) => {
  // Step 1: Get all scoped VLE profiles sorted newest first
  const vleProfiles = await VleProfile.find(req.orgScope.vleFilter)
    .select('userId state district')
    .sort({ createdAt: -1 })
    .lean();

  const allVleUserIds = vleProfiles.map(p => p.userId);

  // Filter to approved VLEs only (status lives on User, not VleProfile)
  const approvedVleIds = new Set(
    (await User.find({ _id: { $in: allVleUserIds }, status: 'APPROVED' }).distinct('_id'))
      .map(id => id.toString())
  );
  const approvedVleProfiles = vleProfiles.filter(p => approvedVleIds.has(p.userId.toString()));
  const vleUserIds = approvedVleProfiles.map(p => p.userId);
  const totalVLEs = approvedVleProfiles.length;

  // Step 2: Parallel counts + recent problems (vleUserIds now approved-only)
  const [totalProblems, totalImplementations, recentProblems] = await Promise.all([
    Problem.countDocuments({ postedBy: { $in: vleUserIds }, status: 'PUBLISHED' }),
    Pilot.countDocuments({ vleId: { $in: vleUserIds }, status: 'IMPLEMENTED' }),
    Problem.find({ postedBy: { $in: vleUserIds }, status: 'PUBLISHED' })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('problemTitle postedBy')
      .populate('postedBy', 'fullName')
      .lean()
  ]);

  // Step 3: Resolve fullName for top 6 approved VLEs (already sorted by createdAt desc)
  const recentVleProfiles = approvedVleProfiles.slice(0, 6);
  const vleUsers = await User.find({ _id: { $in: recentVleProfiles.map(p => p.userId) } })
    .select('_id fullName profilePicture')
    .lean();

  const userMap = {};
  vleUsers.forEach(u => { userMap[u._id.toString()] = u; });

  // Step 4: Build role-conditional stats
  const stats = { totalVLEs, totalProblems, totalImplementations };
  if (req.orgScope.role === 'NO') {
    stats.totalAOs = await User.countDocuments({
      _id: { $in: req.orgScope.aoUserIds },
      status: 'APPROVED'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      recentApprovals: {
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

module.exports = { getOrgOverview };
