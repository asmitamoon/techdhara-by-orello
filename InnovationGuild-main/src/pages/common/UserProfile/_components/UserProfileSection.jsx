import { useState } from 'react';
import { useSelector } from 'react-redux';
import PageLoader from '../../../../components/ui/PageLoader';
import { Link } from 'react-router';
import { selectUserRole } from '../../../../store/slices/authSlice';
import mockProfileData from './mockProfileData';

import location from '../../../../assets/icons/location.svg';
import ageIcon from '../../../../assets/icons/ageIcon.svg';
import genderIcon from '../../../../assets/icons/genderIcon.svg';
import mobileIcon from '../../../../assets/icons/mobileIcon.svg';
import mailIcon from '../../../../assets/icons/mailIcon.svg';
import globeicon from '../../../../assets/icons/globeicon.svg';
import languagesIcon from '../../../../assets/icons/languagesIcon.svg';

const tagStyles = {
  'Listed': 'bg-[#316CEB]',
  'Interested': 'bg-[#FFB200]',
  'Active': 'bg-[#639F38]',
  'Commercial': 'bg-[#6F389F]',
};

const sectionLayouts = {
  vle: [
    {
      title: "Organizational Background",
      type: "grid",
      gridCols: "grid-cols-1 lg:grid-cols-2",
      fields: ['nodalOrganization', 'affiliatedOrg'],
      dataKey: 'organizationalBackground'
    },
    {
      title: "Background",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: [
        'vleCategory', 'mainLivelihood', 'livelihoodExperience',
        'qualification', 'otherLivelihoods', 'machineExpYears'
      ],
      dataKey: 'background'
    },
    {
      title: "TechDhaara Engagement",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: ['persona', 'equippedMachinery', 'trainings'],
      dataKey: 'techdharaEngagement'
    }
  ],
  innovator: [
    {
      title: "Background",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: ['enterpriseName', 'startDate'],
      dataKey: 'background'
    },
    {
      title: "Overview",
      type: "text",
      dataKey: 'description'
    }
  ],
  ao: [
    {
      title: "Background",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: ['typeOfOrganisation', 'streamOfWork', 'nodalOrganization'],
      dataKey: 'background'
    },
    {
      title: "Organization POC",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: ['pocOfAO'],
      dataKey: 'organizationPOC'
    }
  ],
  no: [
    {
      title: "Background",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: ['typeOfOrganisation', 'streamOfWork', 'operationalStates'],
      dataKey: 'background'
    },
    {
      title: "Overview",
      type: "text",
      dataKey: 'overview'
    },
    {
      title: "Organization POC",
      type: "grid",
      gridCols: "lg:grid-cols-3",
      fields: ['pocOfNO'],
      dataKey: 'organizationPOC'
    }
  ],
  general_user: []
};

const fieldLabels = {
  nodalOrganization: "Nodal Organization",
  affiliatedOrg: "Affiliated Organization",
  vleCategory: "Category",
  persona: "Persona",
  trainings: "Trainings",
  equippedMachinery: "Equipped Machinery",
  mainLivelihood: "Main Livelihood",
  qualification: "Highest Qualification",
  livelihoodExperience: "Years in main livelihood",
  otherLivelihoods: "Other Livelihoods",
  machineExpYears: "Years of machinery experience",
  enterprise: "Enterprise",
  enterpriseName: "Enterprise Name",
  typeOfOrganisation: "Type of Organisation",
  operationalStates: "Operational States",
  startDate: "EST (Established Date)",
  streamOfWork: "Stream of Work",
  pocOfAO: "POC of AO",
  pocOfNO: "POC of NO"
};

const InfoItem = ({ icon, label, value, isLink }) => (
  <div className="flex items-center gap-2 min-w-fit">
    {icon && <span className="text-secondary opacity-70 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">{icon}</span>}
    {label && <span className="text-secondary opacity-80 text-xs sm:text-sm lg:text-base 2xl:text-lg">{label}</span>}
    {isLink ? (
      <a href={`https://${value}`} target="_blank" rel="noreferrer" className="text-primary font-medium text-xs sm:text-sm lg:text-base 2xl:text-lg hover:underline">{value}</a>
    ) : (
      <span className="text-primary font-medium text-xs sm:text-sm lg:text-base 2xl:text-lg">{value}</span>
    )}
  </div>
);

const DataSection = ({ title, items, gridCols = "grid-cols-1 lg:grid-cols-2" }) => (
  <div className="mb-5 sm:mb-6 lg:mb-8 border-t border-[#E5E7EB] pt-4 sm:pt-5 lg:pt-6">
    <h3 className="text-base sm:text-lg lg:text-xl 2xl:text-2xl font-semibold text-primary mb-3 sm:mb-4">{title}</h3>
    <div className={`grid ${gridCols} gap-y-3 sm:gap-y-4 gap-x-6 sm:gap-x-8`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col">
          <span className="text-secondary text-xs sm:text-sm lg:text-base 2xl:text-lg mb-0.5 sm:mb-1">{item.label}</span>
          <span className="text-primary font-medium text-sm sm:text-base lg:text-lg 2xl:text-xl">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TextSection = ({ title, content }) => (
  <div className="mb-5 sm:mb-6 lg:mb-8 border-t border-[#E5E7EB] pt-4 sm:pt-5 lg:pt-6">
    <h3 className="text-base sm:text-lg lg:text-xl 2xl:text-2xl font-semibold text-primary mb-2 sm:mb-3">{title}</h3>
    <p className="text-secondary text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed">
      {content}
    </p>
  </div>
);

const UserProfileSection = ({
  profileData: propProfileData,
  isLoading = false,
  error = null,
  isOwnProfile = false,
  editRequested = false,
  editRequestReason = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const userRole = useSelector(selectUserRole);
  const profileRole = propProfileData?.role?.toLowerCase().replace(/ /g, '_');
  const activeRole = profileRole || (userRole ? userRole.toLowerCase() : 'vle');
  const profileData = propProfileData || mockProfileData[activeRole];

  if (isLoading) {
    return (
      <div className="container py-6 sm:py-8">
        <PageLoader className="py-10 sm:py-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6 sm:py-8">
        <div className="text-center py-10 sm:py-12 text-muted">
          We couldn't load this profile right now. Please try again.
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container py-6 sm:py-8">
        <div className="text-center py-10 sm:py-12">No profile data available for role: {activeRole}</div>
      </div>
    );
  }

  const layoutKey = activeRole.replace(' ', '_');
  const roleSections = sectionLayouts[layoutKey] || [];
  const nameInitial = (profileData.fullName || profileData.innovatorName || '?').charAt(0).toUpperCase();

  return (
    <div className="container">
      <div className="relative mb-5 sm:mb-6 bg-white rounded-2xl border border-input-border overflow-hidden">

        {isOwnProfile && editRequested && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2">
            <span className="text-amber-600 text-sm font-medium shrink-0">Edit requested</span>
            {editRequestReason && (
              <span className="text-amber-700 text-sm">&mdash; {editRequestReason}</span>
            )}
          </div>
        )}

        <div className="w-full h-28 sm:h-32 lg:h-40 bg-[#D9EAD3]/70 relative">

          {isOwnProfile && editRequested && (
            <Link to="/edit-profile" className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white px-4 sm:px-5 py-1 sm:py-1.5 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-accent-green z-10">
              <span className="text-xs sm:text-sm font-medium text-accent-green">Edit Profile</span>
            </Link>
          )}

          <div className="hidden lg:block h-full">
            <div className="absolute top-20 left-8 xl:left-10">
              <div className="w-36 xl:w-40 h-36 xl:h-40 rounded-full bg-[#D5E4C9] border-4 border-white shadow-md flex items-center justify-center shrink-0 text-2xl xl:text-3xl text-gray-500 font-medium overflow-hidden">
                {profileData.profileImage && !imageError ? (
                  <img src={profileData.profileImage} alt="" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  nameInitial
                )}
              </div>
            </div>

            <div className="h-full flex flex-col justify-center pl-52 xl:pl-56 pr-8 xl:pr-10 pt-16">
              <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-semibold text-[#403F32] leading-tight mb-2 xl:mb-3">
                {profileData.fullName || profileData.innovatorName}
              </h1>
              {profileData.tags && (
                <div className="flex flex-wrap gap-1.5 xl:gap-2">
                  {profileData.tags.map((tag, idx) => (
                    <span key={idx} className={`px-2.5 xl:px-3 py-0.5 xl:py-1 rounded-full text-white text-xs xl:text-sm font-medium ${tagStyles[tag] || 'bg-gray-500'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden w-full h-full relative">
            <div className="absolute -bottom-14 sm:-bottom-16 left-1/2 -translate-x-1/2">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#D5E4C9] border-4 border-white shadow-md flex items-center justify-center text-2xl sm:text-3xl text-gray-500 font-medium overflow-hidden">
                {profileData.profileImage && !imageError ? (
                  <img src={profileData.profileImage} alt="" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  nameInitial
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 lg:pl-52 xl:pl-56 pb-8 sm:pb-10">

          <div className="lg:hidden mt-16 sm:mt-20 mb-6 sm:mb-8 flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#403F32] leading-tight mb-2 sm:mb-3">
              {profileData.fullName || profileData.innovatorName}
            </h1>
            {profileData.tags && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                {profileData.tags.map((tag, idx) => (
                  <span key={idx} className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-xs font-medium ${tagStyles[tag] || 'bg-gray-500'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:block mb-6 xl:mb-8"></div>

          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img src={location} alt="" className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
              <span className="text-[#403F32] font-semibold text-sm sm:text-base lg:text-lg 2xl:text-xl">
                {profileData.location}
              </span>
            </div>

            {(profileData.basicInfo.age || profileData.basicInfo.gender) && (
              <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 sm:gap-y-3">
                {profileData.basicInfo.age && (
                  <InfoItem
                    icon={<img src={ageIcon} alt="" className="w-full h-full" />}
                    label="Age"
                    value={profileData.basicInfo.age}
                  />
                )}
                {profileData.basicInfo.gender && (
                  <InfoItem
                    icon={<img src={genderIcon} alt="" className="w-full h-full" />}
                    label="Gender"
                    value={profileData.basicInfo.gender}
                  />
                )}
              </div>
            )}

            {(profileData.basicInfo.mobile || profileData.basicInfo.email || profileData.basicInfo.links) && (
              <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 sm:gap-y-3">
                {profileData.basicInfo.mobile && (
                  <InfoItem
                    icon={<img src={mobileIcon} alt="" className="w-full h-full" />}
                    label="Mobile Number"
                    value={profileData.basicInfo.mobile}
                  />
                )}
                {profileData.basicInfo.email && (
                  <InfoItem
                    icon={<img src={mailIcon} alt="" className="w-full h-full" />}
                    label="Mail"
                    value={profileData.basicInfo.email}
                  />
                )}
                {profileData.basicInfo.links && (
                  <InfoItem
                    icon={<img src={globeicon} alt="" className="w-full h-full" />}
                    label="Links"
                    value={profileData.basicInfo.links}
                    isLink={true}
                  />
                )}
              </div>
            )}

            {profileData.basicInfo.languages && (
              <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 sm:gap-y-3">
                <InfoItem
                  icon={<img src={languagesIcon} alt="" className="w-full h-full" />}
                  label="Languages"
                  value={profileData.basicInfo.languages}
                />
              </div>
            )}
          </div>

          {roleSections.map((section, index) => {
            if (section.type === 'grid') {
              const sectionData = profileData[section.dataKey] || {};
              const items = section.fields.map(field => ({
                label: fieldLabels[field] || field,
                value: sectionData[field] || ''
              })).filter(item => item.value);

              if (items.length === 0) return null;

              return (
                <DataSection
                  key={index}
                  title={section.title}
                  items={items}
                  gridCols={section.gridCols}
                />
              );
            }
            if (section.type === 'text') {
              const content = profileData[section.dataKey];
              if (!content) return null;

              return (
                <TextSection
                  key={index}
                  title={section.title}
                  content={content}
                />
              );
            }
            return null;
          })}

          {profileData.engagement && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 lg:pt-6 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#639F38]"></div>
                <span className="text-primary text-sm sm:text-base lg:text-lg">
                  {profileData.engagement.text}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfileSection;