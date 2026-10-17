import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { selectIsLoggedIn, selectUser } from '../../../../store/slices/authSlice'
import VLECard from './VLECard'
import Pagination from '../../../../components/ui/Pagination'
import SharePopup from '../../../../components/ui/SharePopup'
import ViewContactPopup from '../../../../components/ui/ViewContactPopup'
import PageLoader from '../../../../components/ui/PageLoader'
import { viewContact } from '../../../../api/common'
import { useSaveProfile, useUnsaveProfile } from '../../../../hooks/mutations/common'
import { useGetSavedProfiles } from '../../../../hooks/queries/common'

const VLEGridSection = ({ vles, isLoading, currentPage, totalPages, onPageChange }) => {
  const navigate = useNavigate()
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  const isApproved = isLoggedIn && user?.status === 'APPROVED'

  const [shareConfig, setShareConfig] = useState({ isOpen: false, url: '' })
  const [contactConfig, setContactConfig] = useState({ isOpen: false, data: null })
  const [savedIds, setSavedIds] = useState(new Set())
  const [pendingIds, setPendingIds] = useState(new Set())
  const { data: savedData, isLoading: savedLoading } = useGetSavedProfiles()
  const saveMutation = useSaveProfile()
  const unsaveMutation = useUnsaveProfile()

  useEffect(() => {
    if (savedData?.data?.savedProfiles) {
      setSavedIds(new Set(savedData.data.savedProfiles.map(s => s.savedUserId?._id ?? s.savedUserId)))
    }
  }, [savedData])

  const handleSaveVle = (id) => {
    if (!isApproved) {
      if (!isLoggedIn) { toast.error('Please login to continue'); navigate('/login'); return }
      else toast.error('Your account is not approved yet')
      return
    }
    if (pendingIds.has(id)) return
    setPendingIds(prev => new Set([...prev, id]))
    const clearPending = () => setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s; })
    if (savedIds.has(id)) {
      setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; })
      unsaveMutation.mutate(id, {
        onError: () => setSavedIds(prev => new Set([...prev, id])),
        onSettled: clearPending,
      })
    } else {
      setSavedIds(prev => new Set([...prev, id]))
      saveMutation.mutate(id, {
        onError: () => setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; }),
        onSettled: clearPending,
      })
    }
  }

  const handleOpenShare = (id) => {
    setShareConfig({ isOpen: true, url: `https://techdhaara.com/vle/${id}` })
  }

  const handleOpenContact = async (vle) => {
    if (!isLoggedIn) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }
    if (!isApproved) {
      toast.error('Your account is not approved yet')
      return
    }
    try {
      const res = await viewContact(vle.id)
      setContactConfig({
        isOpen: true,
        data: {
          name: vle.name,
          location: vle.location,
          image: vle.profileImage,
          phone: res?.data?.user?.contactDetails?.phone ?? '',
          email: res?.data?.user?.contactDetails?.email ?? '',
        }
      })
    } catch (_) { /* non-blocking */ }
  }

  if (isLoading || savedLoading) {
    return <PageLoader className="py-10 sm:py-12" />
  }

  return (
    <div className="container mb-10 sm:mb-12 lg:mb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-6 sm:mb-8">
        {vles.length > 0 ? (
          vles.map((vle) => (
            <VLECard
              key={vle.id}
              vle={vle}
              isSaved={savedIds.has(vle.id)}
              isSaving={pendingIds.has(vle.id)}
              onSave={() => handleSaveVle(vle.id)}
              onShare={() => handleOpenShare(vle.id)}
              onViewContact={() => handleOpenContact(vle)}
            />
          ))
        ) : (
          <div className="col-span-full py-10 sm:py-12 text-center text-muted">
            No VLEs found matching your filters.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPrevious={() => onPageChange(Math.max(1, currentPage - 1))}
          onNext={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          canGoPrevious={currentPage > 1}
          canGoNext={currentPage < totalPages}
        />
      )}

      <SharePopup
        isOpen={shareConfig.isOpen}
        url={shareConfig.url}
        onClose={() => setShareConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <ViewContactPopup
        isOpen={contactConfig.isOpen}
        data={contactConfig.data}
        onClose={() => setContactConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

export default VLEGridSection