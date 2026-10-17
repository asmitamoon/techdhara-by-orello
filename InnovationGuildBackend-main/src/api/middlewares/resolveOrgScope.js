const AoProfile = require('../../models/AoProfile');

// Resolves the organizational scope for a request based on user role.
// Attaches req.orgScope with pre-computed filters and a scope-validation helper.
// Must be used after authenticate middleware.
const resolveOrgScope = async (req, res, next) => {
  try {
    if (req.user.role === 'AO') {
      const myId = req.user._id;

      req.orgScope = {
        role: 'AO',
        vleFilter: { affiliatedOrg: myId },
        problemFilter: { registeredBy: myId },
        fieldReportFilter: { createdBy: myId },
        // Returns true if the given userId (or populated object with ._id) is the AO themselves
        isInScope: (userIdOrObject) => {
          const id = userIdOrObject && userIdOrObject._id ? userIdOrObject._id : userIdOrObject;
          return id.toString() === myId.toString();
        }
      };
      return next();
    }

    if (req.user.role === 'NO') {
      // 2-step hierarchy: NO → AO user IDs → VLE/Problem/FieldReport filters
      const aoProfiles = await AoProfile.find({ nodalOrg: req.user._id }).select('userId');
      const aoUserIds = aoProfiles.map(p => p.userId);

      req.orgScope = {
        role: 'NO',
        aoUserIds,
        vleFilter: { affiliatedOrg: { $in: aoUserIds } },
        // Problems created by any of NO's AOs OR by NO directly
        problemFilter: { registeredBy: { $in: [...aoUserIds, req.user._id] } },
        // Field reports created by any of NO's AOs
        fieldReportFilter: { createdBy: { $in: aoUserIds } },
        // Returns true if the given userId belongs to one of NO's managed AOs
        isInScope: (userIdOrObject) => {
          const id = userIdOrObject && userIdOrObject._id ? userIdOrObject._id : userIdOrObject;
          return aoUserIds.some(aoId => aoId.toString() === id.toString());
        }
      };
      return next();
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { resolveOrgScope };
