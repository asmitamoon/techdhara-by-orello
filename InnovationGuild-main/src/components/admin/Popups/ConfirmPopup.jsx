const ConfirmPopup = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, variant = 'green', isLoading = false }) => {
  if (!isOpen) return null;

  const confirmBtnClass = variant === 'red'
    ? 'bg-[#D55E5E] border-[#D97373] hover:bg-[#c24d4d]'
    : 'bg-[#3C8F23] border-[#6B9655] hover:bg-[#347a1f]';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={isLoading ? undefined : onClose}>
      <div className="bg-white w-full max-w-100 rounded-2xl shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 text-white text-sm font-medium border-2 ${confirmBtnClass} rounded-full cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? '...' : confirmLabel}
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

export default ConfirmPopup;
