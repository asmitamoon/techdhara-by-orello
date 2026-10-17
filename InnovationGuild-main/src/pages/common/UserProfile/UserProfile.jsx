import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useParams, Navigate } from 'react-router'
import { selectUser, selectIsLoggedIn } from '../../../store/slices/authSlice'
import { useUserById, useGetMyProfile } from '../../../hooks/queries/common'
import { viewContact } from '../../../api/common'
import UserProfileSection from './_components/UserProfileSection'
import ContactSection from '../../../components/layout/ContactSection'
import AddedInnovation from './_components/AddedInnovation'
import AddedProblems from './_components/AddedProblems'

const UserProfile = ({ isOwnProfileRoute = false }) => {
  const { id } = useParams()
  const currentUser = useSelector(selectUser)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  if (isOwnProfileRoute && !isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  const profileId = isOwnProfileRoute ? (currentUser?._id || currentUser?.id) : id
  const { data: profileData, isLoading, error } = useUserById(profileId)
  const { data: myProfileData } = useGetMyProfile()

  useEffect(() => {
    if (!isOwnProfileRoute && profileId) {
      viewContact(profileId).catch(() => {})
    }
  }, [profileId, isOwnProfileRoute])

  const profileRole = profileData?.role?.toLowerCase()
  const editRequested = isOwnProfileRoute ? (myProfileData?.data?.editRequested ?? false) : false
  const editRequestReason = isOwnProfileRoute ? (myProfileData?.data?.editRequestReason ?? '') : ''

  return (
    <div className="min-h-screen bg-light pt-navbar">
      <UserProfileSection
        profileData={profileData}
        isLoading={isLoading}
        error={error}
        isOwnProfile={isOwnProfileRoute}
        editRequested={editRequested}
        editRequestReason={editRequestReason}
      />
      {!isOwnProfileRoute && ['vle', 'ao', 'no'].includes(profileRole) && (
        <AddedProblems userId={profileId} />
      )}
      {!isOwnProfileRoute && profileRole === 'innovator' && (
        <AddedInnovation userId={profileId} />
      )}
      <ContactSection />
    </div>
  )
}

export default UserProfile
