import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams, useNavigate, useBlocker } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { selectUser, selectIsLoggedIn, selectRegistrationComplete, updateUser } from '../../../store/slices/authSlice'
import {
  completeVleRegistration,
  completeInnovatorRegistration,
  completeAoRegistration,
  completeNodalOrgRegistration,
  completeGeneralUserRegistration,
  uploadProfileImage,
} from '../../../api/auth'
import RegistrationForm from './_components/RegistrationForm.jsx'
import VleProfileForm from './_components/VleProfileForm.jsx'
import InnovatorProfileForm from './_components/InnovatorProfileForm.jsx'
import AffiliatedOrgProfileForm from './_components/AffiliatedOrgProfileForm.jsx'
import NodalOrgProfileForm from './_components/NodalOrgProfileForm.jsx'
import GeneralUserProfileForm from './_components/GeneralUserProfileForm.jsx'
import SelectionCard from './_components/SelectionCard.jsx'

import RoleIconGeneralUser from '../../../assets/icons/RoleIconGeneralUser.svg'
import RoleIconTechDharak from '../../../assets/icons/RoleIconTechDharak.svg'
import RoleIconTechSetu from '../../../assets/icons/RoleIconTechSetu.svg'
import RoleIconTechNirmata from '../../../assets/icons/RoleIconTechNirmata.svg'
import RoleIconAffiliatedOrganization from '../../../assets/icons/RoleIconAffiliatedOrganization.svg'
import RoleIconNodalOrganization from '../../../assets/icons/RoleIconNodalOrganization.svg'

const STEPS = {
  ROLE_SELECTION: 1,
  REGISTRATION: 2,
  PROFILE_DETAILS: 3,
  QUIZ: 4,
};

const QUIZ_OPTIONS = [
  { label: 'I build technologies for villages', role: 'innovator' },
  { label: 'I supply technologies for villages', role: 'innovator' },
  { label: 'I am part of organization building and running livelihood programs for multiple districts or states', role: 'nodal_organization' },
  { label: 'I work with village level organizations for forward market linkage', role: 'affiliated_organization' },
  { label: 'I am part of an organization working at village level, under or in partnership with bigger organizations', role: 'affiliated_organization' },
  { label: 'I fabricate machines at village level', role: 'vle' },
  { label: 'I provide repair services at my village', role: 'vle' },
  { label: 'I run a small machine rental service at my village', role: 'vle' },
  { label: 'I am just exploring', role: 'general_user' },
];

const ROLE_CONFIG = [
  { id: 'vle', title: 'Tech Dhaarak', description: 'I report local challenges and try out solutions that can grow my livelihood.', icon: RoleIconTechDharak, cardBg: '#FFEEDD', iconBg: '#C1772E', titleColor: '#C1772E' },
  { id: 'tech_setu', title: 'Tech Setu', description: 'The bridging organizations connecting innovators and communities.', icon: RoleIconTechSetu, cardBg: '#EFF8EF', iconBg: '#9ED2A1', titleColor: '#4A8A4A' },
  { id: 'innovator', title: 'Tech Nirmata', description: 'I create innovations and want to connect with people who can use them.', icon: RoleIconTechNirmata, cardBg: '#F7E7E4', iconBg: '#FC7760', titleColor: '#FC7760' },
  { id: 'general_user', title: 'Just Browsing', description: 'I want to explore problems, solutions, and stories from the community.', icon: RoleIconGeneralUser, cardBg: '#F9F7F3', iconBg: '#403F32', titleColor: '#403F32', borderColor: '#69AD63' },
];

const ORG_ROLES = [
  { id: 'affiliated_organization', title: 'Affiliated Organization', description: 'I represent an organization directly affiliated with the guild.', icon: RoleIconAffiliatedOrganization, cardBg: '#EFF8EF', iconBg: '#9ED2A1', titleColor: '#4A8A4A' },
  { id: 'nodal_organization', title: 'Nodal Organization', description: 'I act as a central node connecting various stakeholders.', icon: RoleIconNodalOrganization, cardBg: '#F5EFDA', iconBg: '#E4C656', titleColor: '#A08C40' },
];

const ROLE_FORMS = {
  vle: VleProfileForm,
  innovator: InnovatorProfileForm,
  affiliated_organization: AffiliatedOrgProfileForm,
  nodal_organization: NodalOrgProfileForm,
  general_user: GeneralUserProfileForm,
};

const COMPLETE_REGISTRATION_MAP = {
  vle: completeVleRegistration,
  innovator: completeInnovatorRegistration,
  affiliated_organization: completeAoRegistration,
  nodal_organization: completeNodalOrgRegistration,
  general_user: completeGeneralUserRegistration,
};

const IMAGE_FIELD_MAP = {
  vle: 'profilePic',
  innovator: 'profilePic',
  general_user: 'profilePic',
  affiliated_organization: 'logo',
  nodal_organization: 'logo',
};

const RegisterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(STEPS.QUIZ);
  const [selectedType, setSelectedType] = useState(null);
  const [isOrgOnlyMode, setIsOrgOnlyMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const registrationComplete = useSelector(selectRegistrationComplete);

  const googleData = useMemo(() => {
    if (!user?.profilePicture) return null;
    return {
      fullName: user?.fullName || null,
      profilePicture: user.profilePicture,
    };
  }, [user]);

  const skipBlocker = useRef(false);

  // Block in-app navigation when profile form is shown but not yet submitted
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !skipBlocker.current &&
      currentStep === STEPS.PROFILE_DETAILS &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      toast.error('Please complete your profile before leaving');
      blocker.reset();
    }
  }, [blocker.state]);

  // Handle URL parameters on mount
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const typeParam = searchParams.get('type');
    const quizParam = searchParams.get('quiz');

    // Valid roles that can be pre-selected
    const validRoles = ['vle', 'innovator', 'general_user', 'nodal_organization', 'affiliated_organization'];

    if (roleParam && validRoles.includes(roleParam)) {
      setSelectedType(roleParam);
      // Jump to profile form if already registered but profile incomplete (covers Google auth too)
      const alreadyRegistered = isLoggedIn && registrationComplete === false;
      setCurrentStep(alreadyRegistered ? STEPS.PROFILE_DETAILS : STEPS.REGISTRATION);
    } else if (typeParam === 'org') {
      // Show organization-only selection
      setIsOrgOnlyMode(true);
      setCurrentStep(STEPS.ROLE_SELECTION);
    } else if (quizParam === 'true') {
      setCurrentStep(STEPS.QUIZ);
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // When logged out (e.g. via Navbar), bypass the navigation blocker and go home
  const wasLoggedIn = useRef(isLoggedIn);
  useEffect(() => {
    if (wasLoggedIn.current && !isLoggedIn) {
      skipBlocker.current = true;
      navigate('/');
    }
    wasLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  const handleRoleSelection = (typeId) => {
    setSelectedType(typeId);
    setCurrentStep(STEPS.REGISTRATION);
    // Clear URL params when user manually selects a role
    setSearchParams({});
  };

  const handleRegistrationSuccess = () => {
    setCurrentStep(STEPS.PROFILE_DETAILS);
  };

  const handleProfileSubmit = async (data) => {
    try {
      const imageFieldName = IMAGE_FIELD_MAP[selectedType];
      const imageFile = data[imageFieldName];
      if (imageFile && typeof imageFile !== 'string') {
        const formData = new FormData();
        formData.append('profileImage', imageFile);
        const uploadResult = await uploadProfileImage(formData);
        dispatch(updateUser({ profilePicture: uploadResult.data.profilePicture }));
      }
      const { profilePic, logo, ...profileData } = data;
      await COMPLETE_REGISTRATION_MAP[selectedType](profileData);
      dispatch(updateUser({ registrationComplete: true, ...(profileData.fullName && { fullName: profileData.fullName }) }));
      toast.success('Profile completed successfully!');
      skipBlocker.current = true;
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Profile completion failed');
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case STEPS.ROLE_SELECTION: {
        const displayRoles = isOrgOnlyMode ? ORG_ROLES : ROLE_CONFIG;

        return (
          <div className="container mx-auto flex flex-col items-center gap-5 sm:gap-6 lg:gap-8">
            {isOrgOnlyMode && (
              <button
                type="button"
                onClick={() => { setIsOrgOnlyMode(false); setSearchParams({}); setCurrentStep(STEPS.QUIZ); }}
                className="self-start text-sm sm:text-base text-primary hover:text-secondary underline cursor-pointer"
              >
                ← Back
              </button>
            )}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 w-full">
              {displayRoles.map((type) => (
                <SelectionCard
                  key={type.id}
                  {...type}
                  onClick={() => {
                    if (type.id === 'tech_setu') {
                      setIsOrgOnlyMode(true);
                      setSearchParams({});
                    } else {
                      handleRoleSelection(type.id);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        );
      }

      case STEPS.REGISTRATION:
        return (
          <div className="container mx-auto">
            <RegistrationForm
              onBack={() => {
                // Clear URL params and return to role selection
                setSearchParams({});
                setIsOrgOnlyMode(false);
                setCurrentStep(STEPS.ROLE_SELECTION);
              }}
              onRegisterSuccess={handleRegistrationSuccess}
              role={selectedType}
            />
          </div>
        );

      case STEPS.PROFILE_DETAILS: {
        const ProfileForm = ROLE_FORMS[selectedType];
        return (
          <div className="container mx-auto">
            {ProfileForm ? (
              <ProfileForm
                onCancel={() => setCurrentStep(STEPS.REGISTRATION)}
                onSubmit={handleProfileSubmit}
                googleData={googleData}
              />
            ) : (
              <div className="text-center text-red-500">Error: No form found for this role.</div>
            )}
          </div>
        );
      }

      case STEPS.QUIZ:
        return (
          <div className="container mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mb-6 text-sm sm:text-base text-primary hover:text-secondary underline cursor-pointer"
            >
              ← Back
            </button>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">Which best describes you?</h2>
            <p className="text-sm sm:text-base text-muted mb-8">Select the option that fits you most.</p>
            <div className="flex flex-col gap-3 mb-8">
              {QUIZ_OPTIONS.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${quizAnswer === idx ? 'bg-accent-green/20 border border-accent-green' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name="quiz"
                    value={idx}
                    checked={quizAnswer === idx}
                    onChange={() => setQuizAnswer(idx)}
                    className="accent-accent-green w-4 h-4 flex-shrink-0"
                  />
                  <span className="text-sm sm:text-base text-primary">{opt.label}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={quizAnswer === null}
              onClick={() => handleRoleSelection(QUIZ_OPTIONS[quizAnswer].role)}
              className="w-full sm:w-auto bg-button-primary text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent-gold transition-colors"
            >
              Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-navbar bg-[#faf8f5] pb-8 sm:pb-10 lg:pb-12">
      
      {(currentStep === STEPS.ROLE_SELECTION || currentStep === STEPS.QUIZ) && (
        <div className="container mx-auto text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-accent-gold mb-1 sm:mb-2">Welcome to</h1>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-primary">Tech Dhaara</h2>
        </div>
      )}

      {renderContent()}

      {(currentStep === STEPS.ROLE_SELECTION || currentStep === STEPS.QUIZ) && (
        <div className="container mx-auto mt-8 sm:mt-10 lg:mt-12 text-center">
          <p className="text-sm sm:text-base text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-secondary underline">
              Log in
            </Link>
          </p>
        </div>
      )}

    </div>
  );
};

export default RegisterPage;