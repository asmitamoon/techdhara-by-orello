import { Link, useLocation, useNavigate } from 'react-router'
import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectIsLoggedIn, selectUser } from '../../store/slices/authSlice'
import { clearToken } from '../../utils/tokenStore'
import api from '../../api/axiosInstance'
import Logo from '../../assets/icons/logo.svg'
import ProfileDropdown from '../ui/ProfileDropdown'
import LogoutConfirmPopup from '../ui/LogoutConfirmPopup'
import { useOnClickOutside } from '../../helpers/useOnClickOutside'
import { useGetMyNotifications } from '../../hooks/queries/common'
import GoogleTranslate from '../ui/GoogleTranslate'

const Navbar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [profileImgError, setProfileImgError] = useState(false)

  useEffect(() => { setProfileImgError(false) }, [user?.profilePicture])

  const { data: notifData } = useGetMyNotifications({ page: 1, limit: 1 }, { enabled: isLoggedIn })
  const unreadCount = notifData?.data?.unreadCount ?? 0

  const profileDropdownRef = useRef(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useOnClickOutside(profileDropdownRef, () => {
    setTimeout(() => {
      setIsProfileDropdownOpen(false)
    },100)
  })

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleLogout = () => {
    api.post('/auth/logout').catch(() => {})
    dispatch(logout())
    clearToken()
    setIsProfileDropdownOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#273228]/57 backdrop-blur-sm">
      <div className="container py-3 sm:py-4 lg:py-5">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
              <img src={Logo} alt="Tech Dhaara Logo" className="h-7 sm:h-9 lg:h-11 w-auto" />
            </Link>
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 lg:gap-6 font-heading xl:gap-8 text-white text-sm lg:text-base xl:text-lg 2xl:text-xl leading-relaxed pl-4">
            <Link to="/" className={`transition-colors hover:text-accent-gold ${location.pathname === '/' ? 'text-accent-gold' : ''}`}>Home</Link>
            <Link to="/about-us" className={`transition-colors hover:text-accent-gold ${location.pathname === '/about-us' ? 'text-accent-gold' : ''}`}>About</Link>
            <Link to="/innovations" className={`transition-colors hover:text-accent-gold ${location.pathname === '/innovations' ? 'text-accent-gold' : ''}`}>Innovations</Link>
            <Link to="/vles" className={`transition-colors hover:text-accent-gold ${location.pathname === '/vles' ? 'text-accent-gold' : ''}`}>TechDhaaraks</Link>
            <Link to="/problems" className={`transition-colors hover:text-accent-gold ${location.pathname === '/problems' ? 'text-accent-gold' : ''}`}>Problems</Link>
            <Link to="/resources" className={`transition-colors hover:text-accent-gold ${location.pathname === '/resources' ? 'text-accent-gold' : ''}`}>Resources</Link>
          </div>

          {/* Right side — always in DOM, never conditionally rendered */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Auth buttons — desktop only */}
            {!isLoggedIn ? (
              <>
                <Link to="/register?quiz=true" className="hidden lg:inline-flex bg-light text-primary text-sm lg:text-base xl:text-lg 2xl:text-xl leading-relaxed px-3 lg:px-4 xl:px-6 py-1.5 rounded-md hover:bg-gray-100 transition-colors font-medium cursor-pointer">Register</Link>
                <Link to="/login" className="hidden lg:inline-flex bg-accent-green-dark text-light text-sm lg:text-base xl:text-lg 2xl:text-xl leading-relaxed px-3 lg:px-4 xl:px-6 py-1.5 rounded-md hover:bg-accent-gold transition-colors font-medium cursor-pointer">Login</Link>
              </>
            ) : (
              <>
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-accent-tan hover:bg-[#6B5026] transition-colors flex items-center justify-center cursor-pointer overflow-hidden"
                    aria-label="Profile menu"
                  >
                    {user?.profilePicture && !profileImgError ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" onError={() => setProfileImgError(true)} />
                    ) : (
                      <span className="text-light text-xs lg:text-sm font-medium">{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#273228]" />
                    )}
                  </button>
                  <ProfileDropdown
                    isOpen={isProfileDropdownOpen}
                    onClose={() => setIsProfileDropdownOpen(false)}
                    dropdownRef={profileDropdownRef}
                    unreadCount={unreadCount}
                  />
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="hidden lg:inline-flex bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm lg:text-base xl:text-lg 2xl:text-xl leading-relaxed px-3 lg:px-4 xl:px-6 py-1.5 rounded-md transition-colors font-medium cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}

            {/* GoogleTranslate — single permanent instance, never unmounts */}
            <GoogleTranslate />

            {/* Hamburger — mobile only */}
            <button onClick={toggleMobileMenu} className="lg:hidden text-white p-1.5 sm:p-2">
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-white/20">
            <div className="flex flex-col items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-white text-sm sm:text-base">
              <Link to="/" onClick={toggleMobileMenu} className={`transition-colors hover:text-accent-gold ${location.pathname === '/' ? 'text-accent-gold' : ''}`}>Home</Link>
              <Link to="/about-us" onClick={toggleMobileMenu} className={`transition-colors hover:text-accent-gold flex items-center gap-1 ${location.pathname === '/about-us' ? 'text-accent-gold' : ''}`}>About</Link>
              <Link to="/innovations" onClick={toggleMobileMenu} className={`transition-colors hover:text-accent-gold ${location.pathname === '/innovations' ? 'text-accent-gold' : ''}`}>Innovations</Link>
              <Link to="/vles" onClick={toggleMobileMenu} className={`transition-colors hover:text-accent-gold ${location.pathname === '/vles' ? 'text-accent-gold' : ''}`}>VLEs</Link>
              <Link to="/problems" onClick={toggleMobileMenu} className={`transition-colors hover:text-accent-gold ${location.pathname === '/problems' ? 'text-accent-gold' : ''}`}>Problems</Link>
              <Link to="/resources" onClick={toggleMobileMenu} className={`transition-colors hover:text-accent-gold ${location.pathname === '/resources' ? 'text-accent-gold' : ''}`}>Resources</Link>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 mt-4 sm:mt-6">
              {!isLoggedIn ? (
                <>
                  <Link to="/register?quiz=true" onClick={toggleMobileMenu} className="bg-light text-primary text-sm sm:text-base leading-relaxed px-5 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-center">Register</Link>
                  <Link to="/login" onClick={toggleMobileMenu} className="w-full bg-accent-tan text-light text-sm sm:text-base leading-relaxed px-5 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-[#6B5026] transition-colors font-medium text-center">Login</Link>
                </>
              ) : (
                <>
                  <Link to="/myprofile" onClick={toggleMobileMenu} className="text-sm sm:text-base text-light text-center bg-light/10 px-4 py-1.5 sm:py-2 rounded-md hover:bg-light/20 transition-colors">My Profile</Link>
                  <button onClick={() => setShowLogoutConfirm(true)} className="text-sm sm:text-base text-red-400 text-center bg-light/10 px-4 py-1.5 sm:py-2 rounded-md hover:bg-light/20 transition-colors">Logout</button>
                </>
              )}
            </div>

            <div className="flex justify-center mt-3 sm:mt-4 pt-3 border-t border-white/10">
              <GoogleTranslate />
            </div>
          </div>
        )}
      </div>
    </nav>

    <LogoutConfirmPopup
      isOpen={showLogoutConfirm}
      onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
      onCancel={() => setShowLogoutConfirm(false)}
    />
    </>
  )
}

export default Navbar