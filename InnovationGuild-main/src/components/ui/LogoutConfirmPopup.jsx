const LogoutConfirmPopup = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 sm:p-8 w-[90%] max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Confirm Logout</h3>
          <p className="text-muted text-sm">Are you sure you want to log out of your account?</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-light text-primary border border-input-border py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmPopup
