import { useState, useEffect } from 'react';

const RequestEditPopup = ({ isOpen, onClose, onSubmit, isLoading = false, title = 'Request Edit', description = 'Please provide the reason for requesting an edit.' }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={isLoading ? undefined : onClose}>
      <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>
        <p className="text-sm text-muted mb-4">{description}</p>
        <div className="mb-5">
          <label className="form-label">Reason</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason here..."
            className="form-input resize-none"
          />
        </div>
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => onSubmit(reason)}
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#3C8F23] text-white text-sm font-medium border-2 border-[#6B9655] rounded-full hover:bg-[#347a1f] cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Submit'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 bg-white text-muted text-sm font-medium border-2 border-input-border rounded-full hover:bg-header cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestEditPopup;
