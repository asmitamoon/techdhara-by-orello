import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import InnovationMainContent from './InnovationMainContent'
import InnovationProductDetails from './InnovationProductDetails'
import InnovationInterestCard from './InnovationInterestCard'
import CommentsSection from './CommentsSection'
import UserInfoCard from '../../../../components/ui/UserInoCard'
import SuggestedMatchesSection from '../../../../components/ui/SuggestedMatchesSection'
import SupportPopup from '../../../../components/ui/SupportPopup'
import ViewContactPopup from '../../../../components/ui/ViewContactPopup'
import { viewContact } from '../../../../api/common'
import { selectIsLoggedIn, selectUserRole, selectUser } from '../../../../store/slices/authSlice'
import { useGetMyProfile } from '../../../../hooks/queries/common'
import toast from 'react-hot-toast'

const InnovationDetailsSection = ({ innovationData }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const isVle = userRole === 'vle'
  const { data: myProfile } = useGetMyProfile()
  const hasAffiliatedOrg = isVle ? !!myProfile?.data?.profile?.affiliatedOrg : true
  const [isSupportPopupOpen, setIsSupportPopupOpen] = useState(false)
  const [isContactLoading, setIsContactLoading] = useState(false)
  const [contactConfig, setContactConfig] = useState({
    isOpen: false,
    data: null
  })

  const handleWantInnovation = () => {
    setIsSupportPopupOpen(true)
  }

  const handleContactInnovator = async () => {
    if (!isLoggedIn) { toast.error('Please login to continue'); navigate('/login'); return }
    if (user?.status !== 'APPROVED') { toast.error('Your account is not approved yet'); return }
    if (!innovationData.innovator.userId) return
    setIsContactLoading(true)
    try {
      const res = await viewContact(innovationData.innovator.userId)
      const contactUser = res.data.user
      setContactConfig({
        isOpen: true,
        data: {
          name: innovationData.innovator.name,
          location: innovationData.innovator.location,
          phone: contactUser.contactDetails?.phone ?? '',
          email: contactUser.contactDetails?.email ?? innovationData.innovator.email,
          image: contactUser.profilePicture ?? null,
        }
      })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Unable to load contact details right now.')
    } finally {
      setIsContactLoading(false)
    }
  }

  return (
    <div className="container py-6 sm:py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 relative">

        <div className='space-y-4 sm:space-y-5 flex-1'>
          <InnovationMainContent innovationData={innovationData} />
          <InnovationProductDetails productData={innovationData.productDetails} />
          <CommentsSection
            innovationId={innovationData.id}
          />
          <SuggestedMatchesSection title="Similar Innovations" innovationId={innovationData.id} />
        </div>

        <div className="flex gap-4 flex-col sm:flex-row lg:flex-col min-w-[300px] lg:w-[350px] lg:sticky lg:top-35 h-fit">
          <div className='w-full sm:w-[50%] lg:w-full'>
            <InnovationInterestCard
              onWantInnovation={handleWantInnovation}
              onContactInnovator={handleContactInnovator}
              isContactLoading={isContactLoading}
              showWantButton={isVle}
            />
          </div>

          <div className='w-full sm:w-[50%] lg:w-full'>
             <UserInfoCard
              type={"Innovator"}
              name={innovationData.innovator.name}
              location={innovationData.innovator.location}
              intro={innovationData.innovator.description}
              userId={innovationData.innovator.userId}
            />
          </div>
        </div>
      </div>

      <SupportPopup
        isOpen={isSupportPopupOpen}
        onClose={() => setIsSupportPopupOpen(false)}
        innovationId={innovationData.id}
        innovatorUserId={innovationData.innovator.userId}
        innovatorName={innovationData.innovator.name}
        innovatorLocation={innovationData.innovator.location}
        hasAffiliatedOrg={hasAffiliatedOrg}
      />

      <ViewContactPopup
        isOpen={contactConfig.isOpen}
        data={contactConfig.data}
        onClose={() => setContactConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default InnovationDetailsSection
