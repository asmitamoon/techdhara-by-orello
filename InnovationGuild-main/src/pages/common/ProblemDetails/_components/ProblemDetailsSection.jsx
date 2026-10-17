import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import SimilarProblemCard from './SimilarProblemCard'
import SolutionStatusSection from './SolutionStatusSection'
import CommentsSection from './CommentsSection'
import { IoBookmarkOutline, IoBookmark } from 'react-icons/io5'
import ShareIconBig from '../../../../assets/icons/shareIconBig.svg'
import SuggestedMatchesSection from '../../../../components/ui/SuggestedMatchesSection'
import UserInfoCard from '../../../../components/ui/UserInoCard'
import SharePopup from '../../../../components/ui/SharePopup'
import ViewContactPopup from '../../../../components/ui/ViewContactPopup'
import { viewContact } from '../../../../api/common'
import { getStateName, getDistrictName } from '../../../../utils/LocationData/locationData'
import { useSaveProblem, useUnsaveProblem } from '../../../../hooks/mutations/common'
import { useGetSavedProblems } from '../../../../hooks/queries/common'
import { useOperations } from '../../../../hooks/queries/public'
import { operationLabel } from '../../../../utils/operationLabel'
import { selectIsLoggedIn, selectUser } from '../../../../store/slices/authSlice'
import toast from 'react-hot-toast'

const ProblemDetailsSection = ({ problemData: problem }) => {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false)
  const [isContactLoading, setIsContactLoading] = useState(false)
  const [contactConfig, setContactConfig] = useState({ isOpen: false, data: null })
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const { data: operations = [] } = useOperations()
  const { data: savedData } = useGetSavedProblems()
  const isSaved = savedData?.data?.savedProblems?.some(
    s => (s.problemId?._id ?? s.problemId) === problem?.id
  ) ?? false
  const saveMutation = useSaveProblem()
  const unsaveMutation = useUnsaveProblem()

  const handleSaveProblem = () => {
    if (!isLoggedIn) { toast.error('Please login to continue'); navigate('/login'); return }
    if (user?.status !== 'APPROVED') { toast.error('Your account is not approved yet'); return }
    if (isSaved) {
      unsaveMutation.mutate(problem.id)
    } else {
      saveMutation.mutate(problem.id)
    }
  }

  const handleShare = () => setIsSharePopupOpen(true)

  const handleViewContact = async () => {
    if (!isLoggedIn) { toast.error('Please login to continue'); navigate('/login'); return }
    if (user?.status !== 'APPROVED') { toast.error('Your account is not approved yet'); return }
    if (!problem.vle.id) return
    setIsContactLoading(true)
    try {
      const res = await viewContact(problem.vle.id)
      const user = res.data.user
      setContactConfig({
        isOpen: true,
        data: {
          name: problem.vle.name,
          location: getStateName(problem.vle.location) ?? problem.vle.location,
          phone: user.contactDetails?.phone ?? '',
          email: user.contactDetails?.email ?? '',
          image: user.profilePicture ?? null,
        },
      })
    } catch {
      // Contact details not available
    } finally {
      setIsContactLoading(false)
    }
  }

  const capacity = [problem.pullCapacity, problem.engineCapacity, problem.motorCapacity]
    .filter(Boolean).join(' / ') || '—'

  return (
    <div className="container py-8 sm:py-10 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 relative">

        {/* Main Content Column */}
        <div className='space-y-4 sm:space-y-5 flex-1'>
          {/* Mobile Action Buttons */}
          <div className="flex sm:hidden justify-end gap-2">
            <button
              onClick={handleSaveProblem}
              disabled={saveMutation.isPending || unsaveMutation.isPending}
              className={`w-10 h-10 rounded-full border border-accent-green flex items-center justify-center group transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isSaved ? 'bg-accent-green hover:bg-accent-green/80' : 'bg-button-dark hover:bg-accent-gold'}`}
            >
              {isSaved ? <IoBookmark className="w-5 h-5 text-white" /> : <IoBookmarkOutline className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-button-dark border border-accent-green flex items-center justify-center hover:bg-accent-gold group transition-all cursor-pointer"
            >
              <img src={ShareIconBig} alt="Share" className="w-5 h-5 group-hover:brightness-0 group-hover:invert transition-all" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl leading-tight text-heading">
                  {problem.problemTitle}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-heading mt-1 sm:mt-2">{problem.date}</p>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleSaveProblem}
                disabled={saveMutation.isPending || unsaveMutation.isPending}
                className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border border-accent-green flex items-center justify-center group transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isSaved ? 'bg-accent-green hover:bg-accent-green/80' : 'bg-button-dark hover:bg-accent-gold'}`}
              >
                {isSaved ? <IoBookmark className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" /> : <IoBookmarkOutline className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />}
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-button-dark border border-accent-green flex items-center justify-center hover:bg-accent-gold group transition-all cursor-pointer"
              >
                <img src={ShareIconBig} alt="Share" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 group-hover:brightness-0 group-hover:invert transition-all" />
              </button>
            </div>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-heading">
            {problem.problemDescription}
          </p>

          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-5 sm:gap-y-6">
              <div>
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">Requirements</h3>
                  <div className="text-sm sm:text-base lg:text-xl">
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input-border">
                      <span className="text-heading">Operations:</span>
                      <span className="text-heading wrap-break-word">{problem.machineOperations.length ? problem.machineOperations.map(op => operationLabel(operations, op)).join(', ') : '—'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input-border">
                      <span className="text-heading">Raw Materials:</span>
                      <span className="text-heading wrap-break-word">{problem.crops || '—'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input-border">
                      <span className="text-heading">Any other usability conditions:</span>
                      <span className="text-heading wrap-break-word">{problem.specificInfo || '—'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input-border">
                      <span className="text-heading">Number of machines required:</span>
                      <span className="text-heading wrap-break-word">{problem.problemSize || '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">Specifications Required:</h3>
                  <div className="text-sm sm:text-base lg:text-xl">
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input-border">
                      <span className="text-heading">Capacity of the machine:</span>
                      <span className="text-heading wrap-break-word">{capacity}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-input-border">
                      <span className="text-heading">Energy source:</span>
                      <span className="text-heading wrap-break-word">{problem.energySource.length ? problem.energySource.join(', ') : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">Current Methodology</h3>
                  <p className="text-sm sm:text-base lg:text-xl text-heading">{problem.currentMethodology || '—'}</p>
                </div>

                <div className="mb-5 sm:mb-6">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">Challenges with current methodology:</h3>
                  <p className="text-sm sm:text-base lg:text-xl text-heading">{problem.machineChallenge || '—'}</p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-heading mb-3 sm:mb-4">Locations to be covered:</h3>
                  <p className="text-sm sm:text-base lg:text-xl text-heading">
                    {[
                      problem.regionVillage,
                      getDistrictName(problem.regionDistrict, problem.regionState) ?? problem.regionDistrict,
                      getStateName(problem.regionState) ?? problem.regionState,
                    ].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {problem.coverImage && (
            <div className="w-full rounded-lg overflow-hidden h-56 sm:h-72 lg:h-80 bg-gray-100 flex items-center justify-center">
              <img src={problem.coverImage} alt="Problem" className="w-full h-full object-contain" />
            </div>
          )}

          <SuggestedMatchesSection title="Matched Innovations" problemId={problem.id} />

          <CommentsSection problemId={problem.id} />
        </div>

        {/* Sidebar Column */}
        <div className="flex gap-2 lg:gap-4 flex-col sm:flex-row lg:flex-col min-w-[300px] lg:w-[350px] lg:sticky lg:top-35 h-fit">
          <div className='w-full sm:w-[50%] lg:w-full'>
            <SimilarProblemCard problemId={problem.id} problemOwnerId={problem.vle.id} onViewContact={handleViewContact} isContactLoading={isContactLoading} />
          </div>
          <div className='w-full sm:w-[50%] lg:w-full'>
            <UserInfoCard
              type={"User"}
              name={problem.vle.name}
              location={getStateName(problem.vle.location) ?? problem.vle.location}
              userId={problem.vle.id}
            />
          </div>
        </div>
      </div>

      <SharePopup
        isOpen={isSharePopupOpen}
        onClose={() => setIsSharePopupOpen(false)}
        url={window.location.href}
      />

      <ViewContactPopup
        isOpen={contactConfig.isOpen}
        data={contactConfig.data}
        onClose={() => setContactConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default ProblemDetailsSection
