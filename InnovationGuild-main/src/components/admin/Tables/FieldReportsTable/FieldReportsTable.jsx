import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import AdminTablePagination from '../../AdminTablePagination';
import expand from '../../../../assets/icons/expand.svg';

const columnHelper = createColumnHelper();

const STATUS_CONFIG = {
  TRIAL_STARTED: { label: 'Trial Started', className: 'bg-blue-100 text-blue-700' },
  IMPLEMENTED:   { label: 'Implemented',   className: 'bg-green-100 text-green-700' },
  CANCELLED:     { label: 'Cancelled',     className: 'bg-red-100 text-red-600' },
};

const FieldReportsTable = ({
  data = [],
  isLoading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => {},
    onPrevious: () => {},
    onNext: () => {},
    canGoPrevious: false,
    canGoNext: false
  },
  vleId,
  routePrefix = '/admin',
  getProblemLink,
  currentTab,
  currentSubTab
}) => {
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: '',
      meta: { sticky: true, left: 0 },
      cell: (info) => <span className="text-dark font-body">{info.row.index + 1}</span>,
    }),
    columnHelper.accessor('innovation', {
      header: 'Innovation',
      meta: { sticky: true, left: '3.5rem' },
      cell: (info) => (
        <Link to={`${routePrefix}/innovations/${info.row.original.innovationId}`}>
          <div className="flex items-center gap-2">
            <span className="text-accent-green-dark underline font-body hover:text-accent-green transition-colors cursor-pointer">
              {info.getValue() ?? '—'}
            </span>
            <img src={expand} className="w-4 h-4 shrink-0" alt="expand" />
          </div>
        </Link>
      ),
    }),
    columnHelper.accessor('Problem', {
      header: 'Problem',
      cell: (info) => (
        <Link to={getProblemLink ? getProblemLink(info.row.original.problemId) : `${routePrefix}/vles/${vleId}/pilots/${info.row.original.id}/problem`}>
          <div className="flex items-center gap-2">
            <span className="text-accent-green-dark underline font-body hover:text-accent-green transition-colors cursor-pointer line-clamp-1 max-w-[300px]">{info.getValue() ?? '—'}</span>
            <img src={expand} className="w-4 h-4 cursor-pointer shrink-0" alt="expand" />
          </div>
        </Link>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const cfg = STATUS_CONFIG[info.getValue()] ?? { label: info.getValue() ?? '—', className: 'bg-gray-100 text-gray-600' };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.className}`}>
            {cfg.label}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'fieldreport',
      header: 'Field Report',
      cell: (info) => (
        <Link
          to={`${routePrefix}/vles/${vleId}/field-reports?pilotId=${info.row.original.id}`}
          state={currentTab !== undefined ? { returnTab: currentTab, returnSubTab: currentSubTab } : undefined}
        >
          <button className="px-6 py-1 cursor-pointer bg-[#DAF7A8] text-lime-700 rounded-full hover:bg-lime-200 border border-accent-green-dark transition-colors font-medium text-sm">
            View Field Reports
          </button>
        </Link>
      ),
    }),
  ], [vleId, routePrefix, getProblemLink, currentTab, currentSubTab]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full admin-table border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-input-border">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  return (
                    <th
                      key={header.id}
                      className={`px-5 sm:px-6 py-3 sm:py-4 text-left text-sm font-medium text-gray-700 bg-white ${
                        meta?.sticky ? 'sticky z-10' : ''
                      }`}
                      style={meta?.sticky ? { left: meta.left } : {}}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-muted">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-muted">
                  No field reports found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-input-border hover:bg-header/50 transition-colors">
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <td
                        key={cell.id}
                        className={`px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base ${
                          meta?.sticky ? 'sticky bg-white z-10' : ''
                        }`}
                        style={meta?.sticky ? { left: meta.left } : {}}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-4 border-t border-input-border">
        <AdminTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          onPrevious={pagination.onPrevious}
          onNext={pagination.onNext}
          canGoPrevious={pagination.canGoPrevious}
          canGoNext={pagination.canGoNext}
        />
      </div>
    </div>
  );
};

export default FieldReportsTable;
