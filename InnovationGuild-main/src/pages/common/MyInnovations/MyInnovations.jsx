import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import InnovationCard from './_components/InnovationCard';
import SelectFilter from '../../../components/ui/SelectFilter';
import TabFilter from '../../../components/ui/TabFilter';
import { useGetMyInnovations } from '../../../hooks/queries/innovator';
import { useDeleteInnovation } from '../../../hooks/mutations/innovator';
import PageLoader from '../../../components/ui/PageLoader';

const filterOptions = [
  { value: 'drafts', label: 'Drafts' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' }
];

const STATUS_MAP = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'submitted',
  PUBLISHED: 'approved',
  REJECTED: 'rejected',
};

const MyInnovations = () => {
  const [activeTab, setActiveTab] = useState('drafts');
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  const { data, isLoading, isError } = useGetMyInnovations();
  const deleteMutation = useDeleteInnovation();

  const innovations = data?.data?.innovations ?? [];

  const filteredInnovations = innovations.filter(({ status }) => {
    if (activeTab === 'drafts') return status === 'DRAFT' || status === 'REJECTED';
    if (activeTab === 'submitted') return status === 'PENDING_APPROVAL';
    if (activeTab === 'approved') return status === 'PUBLISHED';
    return false;
  });

  const selectedOption = filterOptions.find(option => option.value === activeTab);

  const handleDeleteRequest = (id, name) => setDeleteTarget({ id, name });

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Innovation deleted successfully');
    } catch {
      toast.error('Failed to delete innovation');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">
        <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary mb-4 sm:mb-5 lg:mb-6">
              My Innovations
            </h1>

            <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
              <TabFilter
                options={filterOptions}
                activeTab={activeTab}
                onChange={setActiveTab}
              />

              <div className="sm:hidden w-full max-w-[140px]">
                <SelectFilter
                  value={selectedOption}
                  onChange={(option) => setActiveTab(option.value)}
                  options={filterOptions}
                />
              </div>

              <Link
                to="/submit-innovation"
                className="inline-flex items-center justify-center gap-2 bg-button-primary hover:bg-button-primary-hover text-white text-sm sm:text-base font-medium px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Innovation</span>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <PageLoader className="py-10 sm:py-12" />
          ) : isError ? (
            <div className="py-16 text-center text-red-500">Failed to load innovations. Please try again.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredInnovations.length > 0 ? (
                filteredInnovations.map((innovation) => (
                  <InnovationCard
                    key={innovation._id}
                    id={innovation._id}
                    title={innovation.innovationName}
                    description={innovation.description}
                    image={innovation.media?.images?.[0]?.url}
                    status={STATUS_MAP[innovation.status] ?? 'draft'}
                    rejectionReason={innovation.rejectionReason}
                    onDeleteRequest={handleDeleteRequest}
                  />
                ))
              ) : (
                <div className="col-span-full py-10 sm:py-12 text-center text-muted">
                  No innovations found in {activeTab}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation popup */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 w-[90%] max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">Delete Innovation</h3>
              <p className="text-muted text-sm">
                Are you sure you want to delete <span className="font-medium text-primary">"{deleteTarget.name}"</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-light text-primary border border-input-border py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInnovations;
