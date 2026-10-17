const AdminTablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  canGoPrevious = true,
  canGoNext = true
}) => {
  const renderPageNumbers = () => {
    const pages = []
    const delta = 1

    const renderPageButton = (pageNum) => {
      return (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-base sm:text-lg lg:text-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            currentPage === pageNum
              ? 'bg-dark text-light'
              : 'bg-transparent text-dark hover:bg-black/5'
          }`}
        >
          {pageNum}
        </button>
      )
    }

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i))
      }
      return pages
    }

    pages.push(renderPageButton(1))

    let rangeStart = Math.max(2, currentPage - delta)
    let rangeEnd = Math.min(totalPages - 1, currentPage + delta)

    if (currentPage <= 3) {
      rangeEnd = 5
    }

    if (currentPage >= totalPages - 2) {
      rangeStart = totalPages - 4
    }

    if (rangeStart > 2) {
      pages.push(
        <span key="ellipsis-left" className="text-secondary px-1 sm:px-2 text-sm sm:text-base">
          ...
        </span>
      )
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(renderPageButton(i))
    }

    if (rangeEnd < totalPages - 1) {
      pages.push(
        <span key="ellipsis-right" className="text-secondary px-1 sm:px-2 text-sm sm:text-base">
          ...
        </span>
      )
    }

    pages.push(renderPageButton(totalPages))

    return pages
  }

  return (
    <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3 w-full sm:w-auto">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2 rounded-xl lg:rounded-2xl border border-input-border text-primary hover:bg-header transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer whitespace-nowrap"
      >
        Previous
      </button>

      <span className="sm:hidden text-sm font-medium text-secondary">
        Page {currentPage} of {totalPages}
      </span>

      <div className="hidden sm:flex items-center gap-1">
        {renderPageNumbers()}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-2 rounded-xl lg:rounded-2xl border border-input-border text-primary hover:bg-header transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer whitespace-nowrap"
      >
        Next
      </button>
    </div>
  )
}

export default AdminTablePagination