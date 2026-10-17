import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from '@tanstack/react-table'
import { selectIsLoggedIn, selectUserRole } from '../../../../store/slices/authSlice'
import Pagination from '../../../../components/ui/Pagination'
import ProblemsIcon from '../../../../assets/icons/problems.svg'
import DateIcon from '../../../../assets/icons/date.svg'
import PostedByIcon from '../../../../assets/icons/postedby.svg'
import LocationIcon from '../../../../assets/icons/location.svg'
import SimilarInterestIcon from '../../../../assets/icons/similarIntrest.svg'
import SearchIcon from '../../../../assets/icons/search.svg'

const toSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const columns = [
    {
      accessorKey: 'title',
      header: 'Problems',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'postedBy',
      header: 'Posted By',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: (info) => info.getValue()
    },
    {
      accessorKey: 'similarInterests',
      header: 'Similar Interests',
      cell: (info) => info.getValue()
    }
  ]

const ProblemsTableSection = ({
  problems,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}) => {
  const navigate = useNavigate()

  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  const canPost = isLoggedIn && ['vle', 'ao', 'no'].includes(userRole) // mirrors RequireProblemAccess

  const table = useReactTable({
    data: problems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <div className="container py-6 sm:py-8 lg:py-12">
      <div className="mb-5 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[600px]">
          <input
            type="text"
            placeholder="Search problems…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 sm:px-5 sm:py-3 pr-11 sm:pr-12 rounded-lg border border-input-border bg-white text-primary placeholder:text-placeholder focus:outline-none text-sm sm:text-base lg:text-lg"
          />
          <button className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
            <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {canPost && (
          <button
            onClick={() => navigate('/submit-problem')}
            className="shrink-0 px-5 py-2.5 sm:py-3 rounded-lg bg-button-primary text-light text-sm sm:text-base lg:text-lg hover:bg-accent-gold transition-all cursor-pointer whitespace-nowrap"
          >
            Add Problem
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        <div className="hidden lg:grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr] gap-6 lg:gap-8 px-6 lg:px-8 py-3 lg:py-4 bg-[#F4D5CC] rounded-xl mb-2 lg:mb-3">
          {table.getHeaderGroups()[0]?.headers.map((header, index) => {
            const icons = [ProblemsIcon, DateIcon, PostedByIcon, LocationIcon, SimilarInterestIcon]
            const icon = icons[index]

            return (
              <div
                key={header.id}
                className={`flex items-center gap-2 text-dark font-medium text-base lg:text-lg xl:text-xl ${
                  index > 0 ? 'justify-center' : ''
                }`}
              >
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-light flex items-center justify-center shrink-0">
                  <img src={icon} alt={header.column.columnDef.header} className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            )
          })}
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-3">
          {isLoading && !problems.length ? (
            <div className="py-10 sm:py-12 text-center text-muted">Loading…</div>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                onClick={() => navigate(`/problems/${row.original.id}/${toSlug(row.original.title)}`)}
                className="flex flex-col lg:grid lg:grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr] gap-2.5 sm:gap-3 lg:gap-6 xl:gap-8 p-4 sm:p-5 lg:px-6 lg:py-4 xl:px-8 bg-white rounded-xl lg:rounded-lg border lg:border-0 border-input-border shadow-sm lg:shadow-none hover:bg-header transition-all duration-200 cursor-pointer group items-start lg:items-center relative"
              >
                {row.getVisibleCells().map((cell, index) => {
                  const label = cell.column.columnDef.header

                  if (cell.column.id === 'similarInterests') {
                    const value = cell.getValue()
                    return (
                      <div key={cell.id} className="w-full lg:w-auto flex items-center justify-between lg:justify-center mt-2 lg:mt-0 pt-2.5 sm:pt-3 lg:pt-0 border-t lg:border-0 border-gray-100">
                        <span className="lg:hidden text-xs sm:text-sm font-medium text-secondary">Similar Interests:</span>

                        <div className="flex items-center justify-center">
                           <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-disabled flex items-center justify-center text-primary text-sm sm:text-base lg:text-lg font-semibold shadow-sm shrink-0">
                            {value}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (index === 0) {
                     return (
                      <div key={cell.id} className="w-full mb-1 lg:mb-0">
                        <span className="lg:hidden text-xs text-secondary uppercase tracking-wider mb-1 block">Problem Statement</span>
                        <div className="text-lg sm:text-xl lg:text-lg xl:text-xl font-semibold lg:font-normal text-primary group-hover:text-accent-brown transition-colors">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                     )
                  }

                  return (
                    <div
                      key={cell.id}
                      className="w-full lg:w-auto flex flex-row lg:block items-center justify-between lg:text-center text-sm sm:text-base lg:text-lg xl:text-xl text-primary"
                    >
                      <span className="lg:hidden text-xs sm:text-sm font-medium text-secondary w-1/3">{label}:</span>

                      <span className="text-right lg:text-center w-2/3 lg:w-auto">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            <div className="py-10 sm:py-12 text-center text-muted">
              No problems found matching your search.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
          canGoPrevious={currentPage > 1}
          canGoNext={currentPage < totalPages}
        />
      )}
    </div>
  )
}

export default ProblemsTableSection