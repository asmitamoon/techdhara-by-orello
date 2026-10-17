import React from 'react';

const AdminDetailActions = ({
  status,
  isEditMode,
  onApprove,
  onReject,
  onRequestEdit,
  onSave,
  onCancel,
  showOnStatus = (status, isEditMode) => !(status === 'approved' && !isEditMode),
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  approveLabel = "Approve",
  rejectLabel = "Reject",
  requestEditLabel = "Request Edit"
}) => {
  if (!showOnStatus(status, isEditMode)) return null;

  return (
    <div className="fixed bottom-0 left-0 lg:left-72 right-0 z-40 bg-white border-t border-input-border shadow-lg">
      <div className="max-w-[1080px] 2xl:max-w-[1380px] mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {isEditMode ? (
            <>
              <button
                onClick={onSave}
                className="px-8 py-3 bg-[#3C8F23] cursor-pointer text-white text-base font-medium border-2 border-[#6B9655] rounded-full hover:bg-[#347a1f] transition-colors"
              >
                {submitLabel}
              </button>
              <button
                onClick={onCancel}
                className="px-8 py-3 bg-white cursor-pointer text-muted text-base font-medium border-2 border-input-border rounded-full hover:bg-header transition-colors"
              >
                {cancelLabel}
              </button>
            </>
          ) : (
            <>
              {onApprove && (
                <button
                  onClick={onApprove}
                  className="px-10 py-3 bg-[#3C8F23] cursor-pointer text-white text-base font-medium border-2 border-[#6B9655] rounded-full hover:bg-[#347a1f] transition-colors"
                >
                  {approveLabel}
                </button>
              )}
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-10 py-3 bg-[#D55E5E] cursor-pointer text-white text-base font-medium border-2 border-[#D97373] rounded-full hover:bg-[#c24d4d] transition-colors"
                >
                  {rejectLabel}
                </button>
              )}
              {onRequestEdit && (
                <button
                  onClick={onRequestEdit}
                  className="px-10 py-3 bg-white cursor-pointer text-accent-green-dark text-base font-medium border-2 border-accent-green-dark rounded-full hover:bg-accent-green/5 transition-colors"
                >
                  {requestEditLabel}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDetailActions;
