import { useState, useEffect } from 'react';
import NotificationItem from './_components/NotificationItem';
import Pagination from '../../../components/ui/Pagination';
import { useGetMyNotifications } from '../../../hooks/queries/common';
import { useMarkAllNotificationsRead, useDeleteNotification, useClearAllNotifications } from '../../../hooks/mutations/common';

const LIMIT = 20;

const formatTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Notifications = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetMyNotifications({ page: currentPage, limit: LIMIT });
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  // Auto mark all as read when page opens and there are unread notifications
  useEffect(() => {
    if (unreadCount > 0) markAllRead();
  }, [unreadCount]);

  if (isLoading) {
    return (
      <div className="bg-light pt-navbar min-h-screen flex items-center justify-center">
        <p className="text-muted font-body">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">
        <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

          {/* Header Section */}
          <div className="flex md:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <div className="border border-accent-green rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-accent-green">
                  {String(unreadCount).padStart(2, '0')}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => clearAll.mutate()}
                disabled={clearAll.isPending}
                className="bg-accent-green hover:bg-accent-green-dark text-white text-xs md:text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm self-start md:self-auto cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {clearAll.isPending ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>

          {/* Divider Line */}
          <hr className="border-t border-gray-200 mb-4 sm:mb-6 lg:mb-8" />

          {/* Notifications List */}
          <div className="flex flex-col gap-6">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  sender="Techdhaara"
                  title={notification.title}
                  message={notification.message}
                  time={formatTime(notification.createdAt)}
                  onDelete={() => deleteOne.mutate(notification._id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted">
                You have no new notifications.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
                onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                canGoPrevious={currentPage > 1}
                canGoNext={currentPage < totalPages}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Notifications;
