const VleProfile = require('../../models/VleProfile');
const InnovatorProfile = require('../../models/InnovatorProfile');

async function compareLocations(problem, innovation) {
  try {
    // Default result in case of errors
    const defaultResult = {
      stateMatch: false,
      districtMatch: false,
      problemLocation: null,
      innovationLocation: null
    };

    // Step 1: Lookup VLE location from problem.postedBy
    let problemLocation = null;
    try {
      const vleProfile = await VleProfile.findOne({ userId: problem.postedBy });
      if (vleProfile) {
        problemLocation = {
          village: vleProfile.village || null,
          district: vleProfile.district || null,
          state: vleProfile.state || null
        };
      }
    } catch (error) {
      console.error('Error fetching VLE profile:', error);
    }

    // Step 2: Lookup Innovator location from innovation.innovatorId
    let innovationLocation = null;
    try {
      const innovatorProfile = await InnovatorProfile.findOne({ userId: innovation.innovatorId });
      if (innovatorProfile) {
        innovationLocation = {
          district: innovatorProfile.district || null,
          state: innovatorProfile.state || null
        };
      }
    } catch (error) {
      console.error('Error fetching Innovator profile:', error);
    }

    // Step 3: If either profile not found, return default
    if (!problemLocation || !innovationLocation) {
      return {
        ...defaultResult,
        problemLocation,
        innovationLocation
      };
    }

    // Step 4: Compare locations
    const stateMatch = problemLocation.state && innovationLocation.state &&
                      problemLocation.state.toLowerCase() === innovationLocation.state.toLowerCase();

    const districtMatch = problemLocation.district && innovationLocation.district &&
                         problemLocation.district.toLowerCase() === innovationLocation.district.toLowerCase();

    // Step 5: Return comparison result with location snapshots
    return {
      stateMatch,
      districtMatch,
      problemLocation,
      innovationLocation
    };
  } catch (error) {
    console.error('Error in compareLocations:', error);
    // Return default result on error
    return {
      stateMatch: false,
      districtMatch: false,
      problemLocation: null,
      innovationLocation: null
    };
  }
}

module.exports = {
  compareLocations
};
