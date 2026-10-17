/**
 * Mock profile data for different user roles
 *
 * This file contains ONLY user-specific data that would come from an API.
 * UI configuration (colors, grid layouts, section types) stays in the component.
 *
 * TODO: Replace with actual API data using React Query
 */

const mockProfileData = {
  vle: {
    role: "VLE",
    fullName: "Name of the VLE",
    location: "Ballari, Karnataka, India",
    profileImage: null,
    tags: ["Listed"], // Only 1 tag will come from API
    basicInfo: {
      age: "45",
      gender: "Female",
      mobile: "00000-00000",
      email: "generaluser@gmail.com",
      languages: "Kannada, Hindi"
    },
    organizationalBackground: {
      nodalOrganization: "WASSAN",
      affiliatedOrg: "Lipok Organization"
    },
    background: {
      vleCategory: "Mechanic",
      mainLivelihood: "Agriculture",
      livelihoodExperience: "8 years",
      qualification: "Higher Secondary",
      otherLivelihoods: "Handicrafts",
      machineExpYears: "5 years"
    },
    techdharaEngagement: {
      persona: "Sales, Fabrication",
      machinesWorkedWith: "Agritech",
      trainingsTaken: "Welding Basics"
    },
    engagement: {
      title: "TechDhaara Engagement",
      text: "Active member since 2020"
    },
  },

  general_user: {
    role: "General User",
    fullName: "Name of the General User",
    location: "Ballari, Karnataka, India",
    profileImage: null,
    tags: [],
    basicInfo: {
      age: "45",
      gender: "Female",
      mobile: "00000-00000",
      email: "generaluser@gmail.com"
    },
    engagement: null,
  },

  innovator: {
    role: "Innovator",
    innovatorName: "Name of the Innovator",
    location: "Ballari, Karnataka, India",
    profileImage: null,
    tags: [],
    basicInfo: {
      mobile: "00000-00000",
      email: "vle@gmail.com",
      links: "www.website.com"
    },
    background: {
      enterpriseName: "Green Tech Solutions",
      startDate: "2005"
    },
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    engagement: {
      title: "TechDhaara Engagement",
      text: "Active member since 2020"
    },
  },

  ao: {
    role: "Affiliated Organization",
    fullName: "Name of the Affiliated Organization",
    location: "Ballari, Karnataka, India",
    profileImage: null,
    tags: [],
    basicInfo: {
      mobile: "00000-00000",
      email: "ao@gmail.com",
      links: "www.website.com"
    },
    background: {
      typeOfOrganisation: "NGO",
      streamOfWork: "Agriculture",
      nodalOrganization: "Handicrafts"
    },
    organizationPOC: {
      pocOfAO: "Prateek Ghosh"
    },
    engagement: {
      title: "TechDhaara Engagement",
      text: "Active member since 2020"
    },
  },

  no: {
    role: "Nodal Organization",
    fullName: "Name of the Nodal Organization",
    location: "Ballari, Karnataka, India",
    profileImage: null,
    tags: [],
    basicInfo: {
      mobile: "00000-00000",
      email: "no@gmail.com",
      links: "www.website.com"
    },
    background: {
      typeOfOrganisation: "Government",
      streamOfWork: "Agriculture",
      operationalStates: "Karnataka, Tamil Nadu, Andhra Pradesh"
    },
    overview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    organizationPOC: {
      pocOfNO: "Prateek Ghosh"
    },
    engagement: {
      title: "TechDhaara Engagement",
      text: "Active member since 2020"
    },
  }
}

export default mockProfileData
