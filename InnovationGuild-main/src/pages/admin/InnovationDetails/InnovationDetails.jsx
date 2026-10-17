import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import InnovationProfileForm from '../../../components/admin/Forms/InnovationProfileForm';
import AdminDetailActions from '../../../components/admin/AdminDetailActions';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';
import RequestEditPopup from '../../../components/admin/Popups/RequestEditPopup';
import { selectUserRole } from '../../../store/slices/authSlice';
import {
  useGetAdminInnovationById,
  useApproveAdminInnovation,
  useRejectAdminInnovation,
  useRequestEditAdminInnovation,
  useUpdateAdminInnovation,
  useDeleteAdminInnovation,
} from '../../../hooks/queries/admin';

const sellingPriceToString = (price) => {
  if (!price || (price.min == null && price.max == null)) return '';
  if (price.min === price.max) return String(price.min);
  return `${price.min}-${price.max}`;
};

const toFormData = (inv) => ({
  innovationName: inv.innovationName ?? '',
  yearLaunched: inv.yearLaunched ? String(inv.yearLaunched) : '',
  description: inv.description ?? '',
  category: [...(inv.category ?? []), ...(inv.categoryOther ? ['others'] : [])],
  categoryOther: inv.categoryOther ?? '',
  subcategory: [...(inv.subcategory ?? []), ...(inv.subcategoryOther ? ['others'] : [])],
  subcategoryOther: inv.subcategoryOther ?? '',
  innovationStage: inv.innovationStage ?? '',
  salesLocation: inv.salesLocation ?? [],
  distributorNetwork: inv.distributorNetwork ?? '',
  sellingPrice: sellingPriceToString(inv.sellingPrice),
  manufacturingLocation: inv.manufacturingLocation ?? '',
  importedParts: inv.importedParts ?? '',
  importedPartsNotApplicable: !inv.importedParts,
  spareParts: inv.spareParts ?? '',
  powerSource: inv.powerSource ?? '',
  pullCapacity: inv.pullCapacity ?? '',
  pullCapacityNotKnown: !inv.pullCapacity && ['manual', 'bullock'].includes(inv.powerSource),
  engineCapacity: inv.engineCapacity ?? '',
  motorCapacity: inv.motorCapacity ?? '',
  renewableType: inv.renewableType ?? '',
  dimensions: inv.dimensions ?? '',
  weight: inv.weight ?? '',
  attachments: inv.attachments ?? '',
  performanceParams: inv.performanceParams ?? '',
  coveredOperations: inv.coveredOperations ?? [],
  suitableCrops: inv.suitableCrops ?? '',
  suitableTerrains: inv.suitableTerrains ?? '',
  suitableSoil: inv.suitableSoil ?? '',
  weatherConditions: inv.weatherConditions ?? '',
  otherUsageConditions: inv.otherUsageConditions ?? '',
  maintenanceTraining: inv.maintenanceTraining ?? '',
  financingSupport: inv.financingSupport ?? '',
  technicalTraining: inv.technicalTraining ?? '',
  demoInstallations: inv.demoInstallations ?? '',
  status: inv.status === 'PUBLISHED' ? 'approved' : (inv.status?.toLowerCase() || 'pending'),
  submittedDate: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : '',
  approvedDate: inv.approvedAt
    ? new Date(inv.approvedAt).toISOString().split('T')[0]
    : (inv.status === 'PUBLISHED' && inv.updatedAt ? new Date(inv.updatedAt).toISOString().split('T')[0] : ''),
  mediaItems: (() => {
    const allMedia = [
      ...(inv.media?.images ?? []).map(m => ({ ...m, _kind: 'image' })),
      ...(inv.media?.videos ?? []).map(m => ({ ...m, _kind: 'video' })),
    ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return allMedia.map(item => {
      if (item._kind === 'image')
        return { type: 'existing', fileType: 'image', url: item.url, _id: item._id, name: item.filename };
      if (item.isExternal)
        return { type: 'url', url: item.url, _id: item._id };
      return { type: 'existing', fileType: 'video', url: item.url, _id: item._id, name: item.filename };
    });
  })(),
  otherDocuments: (inv.downloadableResources ?? []).filter(doc => doc.type !== 'VIDEO').map(doc => ({
    type: 'existing', _id: doc._id, id: doc._id,
    name: doc.filename, size: doc.size, url: doc.url,
  })),
});

const CONFIRM_CONFIG = {
  approve: { title: 'Approve Innovation', message: 'Are you sure you want to approve this innovation?', label: 'Approve', variant: 'green' },
  submit:  { title: 'Submit Changes', message: 'Are you sure you want to submit these changes?', label: 'Submit', variant: 'green' },
};

const InnovationDetails = () => {
  const { innovationId: id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const latestFormDataRef = useRef(null);
  const formRef = useRef(null);
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, type: null });
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showRequestEditPopup, setShowRequestEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const isSuperAdmin = useSelector(selectUserRole) === 'super_admin';

  const { data: innovationData, isLoading: profileLoading } = useGetAdminInnovationById(id);
  const inv = innovationData?.data?.innovation;
  const innovationProfile = inv ? toFormData(inv) : null;
  const statusMap = { PUBLISHED: 'approved', PENDING_APPROVAL: 'pending' };
  const status = (inv?.status && statusMap[inv.status]) || inv?.status?.toLowerCase() || 'pending';
  const showStickyBar = status === 'pending' || isEditMode;

  const { mutate: approveMutate, isPending: isApproving } = useApproveAdminInnovation();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectAdminInnovation();
  const { mutate: requestEditMutate, isPending: isRequestingEdit } = useRequestEditAdminInnovation();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateAdminInnovation();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteAdminInnovation();

  const handleApprove = () => setConfirmPopup({ isOpen: true, type: 'approve' });
  const handleReject = () => setShowRejectPopup(true);
  const handleRequestEdit = () => setShowRequestEditPopup(true);

  const handleDeleteConfirm = () => {
    deleteMutate(id, {
      onSuccess: () => { setShowDeletePopup(false); navigate(-1); },
    });
  };

  const handleConfirmAction = () => {
    if (confirmPopup.type === 'approve') {
      approveMutate(id, {
        onSuccess: () => setConfirmPopup({ isOpen: false, type: null }),
      });
    } else if (confirmPopup.type === 'submit') {
      const data = latestFormDataRef.current;
      const originalIds = new Set(
        (innovationProfile?.mediaItems ?? []).filter(item => item._id).map(item => String(item._id))
      );
      const currentIds = new Set(
        (data.mediaItems ?? []).filter(item => item._id).map(item => String(item._id))
      );
      const deletedMediaIds = [...originalIds].filter(id => !currentIds.has(id));

      const fd = new FormData();

      const stringFields = [
        'innovationName', 'yearLaunched', 'description',
        'innovationStage', 'distributorNetwork',
        'manufacturingLocation', 'importedParts', 'spareParts',
        'powerSource', 'pullCapacity', 'engineCapacity', 'motorCapacity', 'renewableType',
        'dimensions', 'weight', 'attachments', 'performanceParams',
        'suitableCrops', 'suitableTerrains', 'suitableSoil', 'weatherConditions',
        'otherUsageConditions', 'maintenanceTraining', 'financingSupport',
        'technicalTraining', 'demoInstallations',
      ];
      stringFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== '') fd.append(field, data[field]);
      });
      // Always send these so the backend can explicitly clear them when 'others' is removed
      fd.append('categoryOther', data.categoryOther ?? '');
      fd.append('subcategoryOther', data.subcategoryOther ?? '');

      // Arrays as JSON strings
      ['category', 'subcategory', 'salesLocation', 'coveredOperations'].forEach(field => {
        if (data[field]?.length > 0) fd.append(field, JSON.stringify(data[field]));
      });

      // sellingPrice is { min, max } after Zod transform
      if (data.sellingPrice) fd.append('sellingPrice', JSON.stringify(data.sellingPrice));

      // New media files only
      const imagePositions = [];
      const videoPositions = [];
      (data.mediaItems ?? []).forEach((item, index) => {
        if (item.type !== 'file') return;
        if (item.fileType === 'image') { fd.append('images', item.file); imagePositions.push(index); }
        else if (item.fileType === 'video') { fd.append('videos', item.file); videoPositions.push(index); }
      });
      if (imagePositions.length > 0) fd.append('imagePositions', JSON.stringify(imagePositions));
      if (videoPositions.length > 0) fd.append('videoPositions', JSON.stringify(videoPositions));

      const mediaOrder = [];
      (data.mediaItems ?? []).forEach((item, index) => {
        if (item._id) mediaOrder.push({ _id: item._id, position: index });
      });
      if (mediaOrder.length > 0) fd.append('mediaOrder', JSON.stringify(mediaOrder));

      // New YouTube URLs only (existing ones stay on backend)
      const originalExternalUrls = new Set(
        (innovationProfile?.mediaItems ?? []).filter(i => i.type === 'url').map(i => i.url)
      );
      const externalVideoData = [];
      (data.mediaItems ?? []).forEach((item, index) => {
        if (item.type === 'url' && !originalExternalUrls.has(item.url)) {
          externalVideoData.push({ url: item.url, position: index });
        }
      });
      if (externalVideoData.length > 0) fd.append('externalVideoData', JSON.stringify(externalVideoData));

      if (deletedMediaIds.length > 0) fd.append('deletedMediaIds', JSON.stringify(deletedMediaIds));

      // Track deleted documents
      const originalDocIds = new Set(
        (innovationProfile?.otherDocuments ?? []).filter(d => d._id).map(d => String(d._id))
      );
      const currentDocIds = new Set(
        (data.otherDocuments ?? []).filter(d => d._id).map(d => String(d._id))
      );
      const deletedDocumentIds = [...originalDocIds].filter(id => !currentDocIds.has(id));

      // New documents only (skip existing)
      (data.otherDocuments ?? []).forEach(doc => {
        if (doc.type === 'existing') return;
        fd.append('documents', doc.file);
      });

      if (deletedDocumentIds.length > 0) fd.append('deletedDocumentIds', JSON.stringify(deletedDocumentIds));

      updateMutate(
        { innovationId: id, data: fd },
        { onSuccess: () => { setIsEditMode(false); setConfirmPopup({ isOpen: false, type: null }); } }
      );
    } else {
      setConfirmPopup({ isOpen: false, type: null });
    }
  };

  const handleRejectSubmit = (reason) => {
    rejectMutate(
      { innovationId: id, reason },
      { onSuccess: () => { setShowRejectPopup(false); navigate(-1); } }
    );
  };

  const handleRequestEditSubmit = (reason) => {
    requestEditMutate(
      { innovationId: id, reason },
      { onSuccess: () => { setShowRequestEditPopup(false); navigate(-1); } }
    );
  };

  const handleFormDataChange = (currentFormData) => {
    latestFormDataRef.current = currentFormData;
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const handleFormSubmit = (validatedData) => {
    latestFormDataRef.current = validatedData;
    setConfirmPopup({ isOpen: true, type: 'submit' });
  };

  const handleCancel = () => setIsEditMode(false);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center py-12 text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-page ${showStickyBar ? 'pb-28' : ''}`}>
      <div className="flex flex-col gap-8">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
              aria-label="Go back"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-muted group-hover:text-dark transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-regular text-black">
              Innovation Details
            </h1>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => setShowDeletePopup(true)}
                className="flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-[#D97373] bg-[#D55E5E] text-white text-sm font-medium hover:bg-[#c24d4d] transition-colors cursor-pointer whitespace-nowrap"
              >
                Delete
              </button>
            )}
          </div>
          <div className="border-t mt-6 border-accent-green-dark"></div>
        </div>

        {innovationProfile && (
          <InnovationProfileForm
            ref={formRef}
            initialData={innovationProfile}
            isEditMode={isEditMode}
            onEditToggle={() => setIsEditMode(true)}
            onDataChange={handleFormDataChange}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>

      <AdminDetailActions
        status={status}
        isEditMode={isEditMode}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestEdit={handleRequestEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={CONFIRM_CONFIG[confirmPopup.type]?.title}
        message={CONFIRM_CONFIG[confirmPopup.type]?.message}
        confirmLabel={CONFIRM_CONFIG[confirmPopup.type]?.label}
        variant={CONFIRM_CONFIG[confirmPopup.type]?.variant}
        isLoading={confirmPopup.type === 'approve' ? isApproving : isUpdating}
      />

      <ConfirmPopup
        isOpen={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Innovation"
        message="This permanently deletes the innovation and its matches, comments, saved entries, and files. This cannot be undone. Innovations already involved in a pilot (or that have a business model) cannot be deleted."
        confirmLabel="Delete"
        variant="red"
        isLoading={isDeleting}
      />

      <RequestEditPopup
        isOpen={showRejectPopup}
        onClose={() => setShowRejectPopup(false)}
        onSubmit={handleRejectSubmit}
        title="Reject Innovation"
        isLoading={isRejecting}
      />

      <RequestEditPopup
        isOpen={showRequestEditPopup}
        onClose={() => setShowRequestEditPopup(false)}
        onSubmit={handleRequestEditSubmit}
        isLoading={isRequestingEdit}
      />
    </div>
  );
};

export default InnovationDetails;
