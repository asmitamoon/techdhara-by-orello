import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn, selectUser } from '../../../../store/slices/authSlice'
import toast from 'react-hot-toast'
import InnovationCard from './InnovationCard'
import PageLoader from '../../../../components/ui/PageLoader'
import Pagination from '../../../../components/ui/Pagination'
import { useSaveInnovation, useUnsaveInnovation } from '../../../../hooks/mutations/common'
import { useGetSavedInnovations } from '../../../../hooks/queries/common'

import catAgriTools from '../../../../assets/icons/catAgriTools.svg'
import catTextiles from '../../../../assets/icons/catTextiles.svg'
import catFisheries from '../../../../assets/icons/catFisheries.svg'
import catBamboo from '../../../../assets/icons/catBamboo.svg'
import catPoultry from '../../../../assets/icons/catPoultry.svg'
import catDairy from '../../../../assets/icons/catDairy.svg'
import catOthers from '../../../../assets/icons/catOthers.svg'

const CATEGORY_CONFIG = {
  agriculture: { color: '#C76D6D', icon: catAgriTools },
  textiles:    { color: '#C78E6D', icon: catTextiles },
  fisheries:   { color: '#C7BF6D', icon: catFisheries },
  bamboo:      { color: '#8CBA79', icon: catBamboo },
  poultry:     { color: '#6DB9C7', icon: catPoultry },
  dairy:       { color: '#6D79C7', icon: catDairy },
  others:      { color: '#AA6DC7', icon: catOthers },
}

const InnovationsGridSection = ({
  innovations, isLoading, pagination, onShare,
  selectedCategory, onCategoryChange, categorizedInnovations
}) => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  const navigate = useNavigate()
  const [savedIds, setSavedIds] = useState(new Set());
  const [pendingIds, setPendingIds] = useState(new Set());
  const { data: savedData, isLoading: savedLoading } = useGetSavedInnovations();
  const saveMutation = useSaveInnovation();
  const unsaveMutation = useUnsaveInnovation();

  useEffect(() => {
    if (savedData?.data?.savedInnovations) {
      setSavedIds(new Set(savedData.data.savedInnovations.map(s => s.innovationId?._id ?? s.innovationId)));
    }
  }, [savedData]);

  const handleSave = (id) => {
    if (!isLoggedIn) { toast.error('Please login to continue'); navigate('/login'); return }
    if (user?.status !== 'APPROVED') { toast.error('Your account is not approved yet'); return }
    if (pendingIds.has(id)) return;
    setPendingIds(prev => new Set([...prev, id]));
    const clearPending = () => setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    if (savedIds.has(id)) {
      setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      unsaveMutation.mutate(id, {
        onError: () => setSavedIds(prev => new Set([...prev, id])),
        onSettled: clearPending,
      });
    } else {
      setSavedIds(prev => new Set([...prev, id]));
      saveMutation.mutate(id, {
        onError: () => setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; }),
        onSettled: clearPending,
      });
    }
  };

  if (isLoading || savedLoading) {
    return (
      <div className="pb-10 sm:pb-12 lg:pb-16">
        <div className="container">
          <PageLoader className="py-10 sm:py-12" />
        </div>
      </div>
    )
  }

  // All view: grouped by category
  if (selectedCategory === 'all' && categorizedInnovations) {
    return (
      <div className="pb-10 sm:pb-12 lg:pb-16">
        <div className="container">
          {categorizedInnovations.length === 0 ? (
            <div className="py-10 sm:py-12 text-center text-muted">
              No innovations found matching your filters.
            </div>
          ) : (
            <>
              {categorizedInnovations.map(({ id, name, innovations: catInnos, count }) => {
                const config = CATEGORY_CONFIG[id] || {}
                return (
                  <div key={id} className="mb-8 sm:mb-10 lg:mb-12">
                    <div className="flex flex-row items-center justify-between mb-4 sm:mb-5 lg:mb-6">
                      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: config.color }}
                        >
                          <img src={config.icon} alt={name} className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-primary">{name}</h2>
                          <p className="text-xs sm:text-sm lg:text-base text-muted">{count} Innovations available</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onCategoryChange(id)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border border-input-border rounded-lg text-xs sm:text-sm lg:text-base text-primary hover:bg-header transition-all cursor-pointer whitespace-nowrap"
                      >
                        View All
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                      {catInnos.map((innovation) => (
                        <InnovationCard
                          key={innovation.id}
                          id={innovation.id}
                          title={innovation.title}
                          description={innovation.description}
                          image={innovation.image}
                          company={innovation.company}
                          location={innovation.location}
                          isSaved={savedIds.has(innovation.id)}
                          isSaving={pendingIds.has(innovation.id)}
                          onSave={() => handleSave(innovation.id)}
                          onShare={() => onShare && onShare(innovation.id, innovation.title)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    )
  }

  // Specific category view: flat paginated grid
  return (
    <div className="pb-10 sm:pb-12 lg:pb-16">
      <div className="container">
        {innovations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {innovations.map((innovation) => (
                <InnovationCard
                  key={innovation.id}
                  id={innovation.id}
                  title={innovation.title}
                  description={innovation.description}
                  image={innovation.image}
                  company={innovation.company}
                  location={innovation.location}
                  isSaved={savedIds.has(innovation.id)}
                  isSaving={pendingIds.has(innovation.id)}
                  onSave={() => handleSave(innovation.id)}
                  onShare={() => onShare && onShare(innovation.id, innovation.title)}
                />
              ))}
            </div>

            {pagination && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                onPrevious={pagination.onPrevious}
                onNext={pagination.onNext}
                canGoPrevious={pagination.canGoPrevious}
                canGoNext={pagination.canGoNext}
              />
            )}
          </>
        ) : (
          <div className="py-10 sm:py-12 text-center text-muted">
            No innovations found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}

export default InnovationsGridSection
