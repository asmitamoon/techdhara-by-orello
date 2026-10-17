const InnovationInterestCard = ({ onWantInnovation, onContactInnovator, isContactLoading = false, showWantButton = false }) => {
  return (
    <div className="border border-input-border rounded-xl sm:rounded-2xl p-4 sm:p-5">
      <h3 className="text-sm sm:text-base lg:text-lg text-primary mb-2.5 sm:mb-3">
        Interested in this innovation?
      </h3>
      <div className="space-y-2.5 sm:space-y-3">
        {showWantButton && (
          <button
            onClick={onWantInnovation}
            className="w-full bg-button-primary border border-input-border text-light py-2.5 sm:py-3 rounded-xl hover:bg-accent-gold transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            I want this Innovation
          </button>
        )}

        <button
          onClick={onContactInnovator}
          disabled={isContactLoading}
          className="w-full bg-button-primary border border-input-border text-light py-2.5 sm:py-3 rounded-xl hover:bg-accent-gold transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isContactLoading ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          )}
          {isContactLoading ? 'Loading...' : 'Contact Innovator'}
        </button>
      </div>
    </div>
  )
}

export default InnovationInterestCard