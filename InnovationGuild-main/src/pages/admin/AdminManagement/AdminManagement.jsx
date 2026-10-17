import { useState } from 'react';
import { Plus } from 'lucide-react';
import AdminTable from './_components/AdminTable';
import AddAdminModel from './_components/AddAdminModel';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import { useGetAdminAdmins, useDeleteAdminAdmin } from '../../../hooks/queries/admin';

const LIMIT = 10;

const AdminManagement = () => {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, adminId: null });
  const [currentPage, setCurrentPage] = useState(1);

  const { data: adminsData, isLoading } = useGetAdminAdmins({ page: currentPage, limit: LIMIT });
  const { mutate: deleteAdmin } = useDeleteAdminAdmin();

  const admins = (adminsData?.data?.admins ?? []).map((a, i) => ({
    id: a._id,
    rowNum: (currentPage - 1) * LIMIT + i + 1,
    adminName: a.fullName,
    email: a.email,
    dateAdded: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  const totalPages = adminsData?.data?.pagination?.totalPages ?? 1;

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
    setDeleteConfirm({ isOpen: true, adminId: id });
  };

  const handleConfirmDelete = () => {
    deleteAdmin(deleteConfirm.adminId, {
      onSuccess: () => {
        if (admins.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
        setDeleteConfirm({ isOpen: false, adminId: null });
      }
    });
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-5xl sm:text-6xl font-regular">Admin Management</h1>
          <button
            onClick={() => setShowAddAdmin(true)}
            className="flex items-center gap-2 bg-accent-green-dark  text-white px-6 py-3 rounded-lg transition-colors font-medium whitespace-nowrap cursor-pointer"
          >
            <Plus size={18} />
            Add New Admin
          </button>
        </div>

        <div className="border-t border-accent-green-dark mb-8" />

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden border border-accent-green-dark">
          <AdminTable
            data={admins}
            isLoading={isLoading}
            pagination={paginationProps}
            onDelete={handleDeleteRequest}
          />
        </div>
      </div>

      <AddAdminModel
        open={showAddAdmin}
        onClose={() => setShowAddAdmin(false)}
      />

      <ConfirmPopup
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, adminId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        confirmLabel="Delete"
        variant="red"
      />
    </div>
  );
};

export default AdminManagement;
