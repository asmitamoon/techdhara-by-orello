import { useState } from 'react';
import { Download } from 'lucide-react';
import NewsletterTable from './_components/NewsletterTable';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import { useGetAdminNewsletterSubscriptions, useDeleteAdminNewsletterSubscription } from '../../../hooks/queries/admin';
import { exportAdminNewsletterSubscriptions } from '../../../api/admin';

const LIMIT = 10;

const NewsletterSubscriptions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, subscriptionId: null });
  const [isExporting, setIsExporting] = useState(false);

  const params = { page: currentPage, limit: LIMIT };

  const { data, isLoading } = useGetAdminNewsletterSubscriptions(params);
  const { mutate: deleteSubscription } = useDeleteAdminNewsletterSubscription();

  const subscriptions = (data?.data?.subscriptions ?? []).map((s, i) => ({
    id: s._id,
    rowNum: (currentPage - 1) * LIMIT + i + 1,
    email: s.email,
    subscribedAt: new Date(s.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    onPrevious: () => setCurrentPage(prev => Math.max(1, prev - 1)),
    onNext: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };

  const handleDeleteRequest = (id) => {
    setDeleteConfirm({ isOpen: true, subscriptionId: id });
  };

  const handleConfirmDelete = () => {
    deleteSubscription(deleteConfirm.subscriptionId, {
      onSuccess: () => {
        if (subscriptions.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
        setDeleteConfirm({ isOpen: false, subscriptionId: null });
      },
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportAdminNewsletterSubscriptions({});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscriptions-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // error handled by axios interceptor / toast
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-5xl sm:text-6xl font-regular">Newsletter Subscriptions</h1>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-accent-green-dark text-white px-6 py-3 rounded-lg transition-colors font-medium whitespace-nowrap cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        <div className="border-t border-accent-green-dark mb-6" />

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden border border-accent-green-dark">
          <NewsletterTable
            data={subscriptions}
            isLoading={isLoading}
            pagination={paginationProps}
            onDelete={handleDeleteRequest}
          />
        </div>
      </div>

      <ConfirmPopup
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, subscriptionId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmLabel="Delete"
        variant="red"
      />
    </div>
  );
};

export default NewsletterSubscriptions;
