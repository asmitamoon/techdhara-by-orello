import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../../store/slices/authSlice'

import profilepopupMyDashboard from '../../assets/icons/profilepopupMydashboard.svg'
import profilepopupMyProfile from '../../assets/icons/profilepopupMyprofile.svg'
import profilepopupMyInnovation from '../../assets/icons/profilepopupMyinnovation.svg'
import profilepopupSimilarProblems from '../../assets/icons/profilepopupInterestedproblems.svg'
import profilepopupSavedInnovation from '../../assets/icons/profilepopupSavedinnovation.svg'
import profilepopupSavedProblems from '../../assets/icons/profilepopupSavedproblems.svg'
import profilepopupBookkeeping from '../../assets/icons/profilepopupBookkeeping.svg'
import notificationIcon from '../../assets/icons/notificationIcon.svg' 
import profilepopupSavedProfiles from '../../assets/icons/profilepopupSavedProfiles.svg'
import profilepopupBusinessModel from '../../assets/icons/profilepopupBusinessModel.svg'

const ChevronRight = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="white" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const ALL_MENU_ITEMS = {
  myProfile: {
    label: "My Profile",
    path: "/myprofile",
    icon: profilepopupMyProfile
  },
  myProblemStatements: {
    label: "My Problem Statements",
    path: "/my-problem-statements",
    icon: profilepopupMyInnovation
  },
  myInnovations: {
    label: "My Innovations",
    path: "/my-innovations",
    icon: profilepopupMyInnovation
  },
  similarProblemsFaced: {
    label: "Similar Problems Faced",
    path: "/similar-problems-faced",
    icon: profilepopupSimilarProblems
  },
  savedInnovations: {
    label: "Saved Innovations",
    path: "/saved-innovations",
    icon: profilepopupSavedInnovation
  },
  savedProblems: {
    label: "Saved Problems",
    path: "/saved-problems",
    icon: profilepopupSavedProblems
  },
  savedProfiles: {
    label: "Saved Profiles",
    path: "/saved-profiles",
    icon: profilepopupSavedProfiles
  },
  bookkeeping: {
    label: "Bookkeeping",
    path: "/bookkeeping",
    icon: profilepopupBookkeeping
  },
  businessModels: {
    label: "Business Models",
    path: "/business-models",
    icon: profilepopupBusinessModel
  },
  myDashboardAo: {
    label: "My Dashboard",
    path: "/ao",
    icon: profilepopupMyDashboard
  },
  myDashboardNo: {
    label: "My Dashboard",
    path: "/no",
    icon: profilepopupMyDashboard
  },
  notifications: {
    label: "Notifications",
    path: "/notifications",
    icon: notificationIcon
  }
}

const roleConfig = {
  general_user: [
    'myProfile',
    'savedInnovations',
    'savedProblems',
    'savedProfiles',
    'notifications'
  ],
  vle: [
    'myProfile',
    'myProblemStatements',
    'similarProblemsFaced',
    'savedInnovations',
    'savedProblems',
    'savedProfiles',
    'bookkeeping',
    'businessModels',
    'notifications'
  ],
  innovator: [
    'myProfile',
    'myInnovations',
    'savedProblems',
    'savedInnovations',
    'savedProfiles',
    'notifications'
  ],
  ao: [
    'myProfile',
    'myProblemStatements',
    'savedInnovations',
    'savedProblems',
    'savedProfiles',
    'myDashboardAo',
    'notifications'
  ],
  no: [
    'myProfile',
    'myProblemStatements',
    'savedInnovations',
    'savedProblems',
    'savedProfiles',
    'myDashboardNo',
    'notifications'
  ]
}

const ProfileDropdown = ({ isOpen, onClose, dropdownRef, unreadCount = 0 }) => {
  const userRole = useSelector(selectUserRole)

  if (!isOpen) return null

  // Determine active role (fallback to 'general_user' if null)
  const activeRole = userRole ? userRole.toLowerCase() : 'general_user'
  
  // Get menu items for the role
  const menuKeys = roleConfig[activeRole] || roleConfig['general_user']

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 sm:top-16 lg:top-[70px] w-[280px] sm:w-[320px] lg:w-[340px] bg-white rounded-2xl shadow-xl border border-[#D9EAD3] z-50 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="absolute -top-[9px] right-3 sm:right-4 lg:right-5 w-4 h-4 bg-white rotate-45 border-l border-t border-[#D9EAD3]"></div>

      <div className="py-2 px-2 sm:py-3 sm:px-2 lg:py-3 lg:px-3 relative z-10 bg-white rounded-2xl">
        <ul className="space-y-0.5 sm:space-y-1">
          {menuKeys.map((key) => {
            const item = ALL_MENU_ITEMS[key]
            if (!item) return null

            return (
              <li key={key}>
                <Link 
                  to={item.path} 
                  onClick={onClose} 
                  className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 lg:px-4 lg:py-3.5 rounded-xl hover:bg-[#eedbd3] transition-colors group"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                    <img 
                      src={item.icon} 
                      alt={item.label} 
                      className="w-[18px] h-[18px] sm:w-5 sm:h-5 flex-shrink-0" 
                    />
                    
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[15px] sm:text-base lg:text-lg font-medium text-primary">
                        {item.label}
                      </span>

                      {key === 'notifications' && unreadCount > 0 && (
                        <div className="bg-red-500 rounded-full px-1.5 py-0.5 sm:px-2 text-[11px] sm:text-xs font-medium text-white">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F4D5CC] flex items-center justify-center group-hover:bg-[#A54025] transition-colors">
                    <ChevronRight />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

      </div>
    </div>
  )
}

export default ProfileDropdown