import React, { useMemo } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import AdminTablePagination from '../../AdminTablePagination';
import expand from '../../../../assets/icons/expand.svg';

const columnHelper = createColumnHelper();

const BookkeepingsTable = ({
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
  problemUrlSuffix = '',
}) => {
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'serial',
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
        <Link to={`${routePrefix}/problems/innovation-request/${info.row.original.problemId}${problemUrlSuffix}`}>
          <div className="flex items-center gap-2">
            <span className="text-accent-green-dark underline font-body hover:text-accent-green transition-colors cursor-pointer line-clamp-1 max-w-[300px]">{info.getValue() ?? '—'}</span>
            <img src={expand} className="w-4 h-4 cursor-pointer shrink-0" alt="expand" />
          </div>
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'bookkeeping',
      header: 'Bookkeeping',
      cell: (info) => (
        <Link
          to={`${routePrefix}/vles/${vleId}/bookkeepings?pilotId=${info.row.original.id}`}
          state={{ returnTab: 'bookkeeping' }}
        >
          <button className="px-6 py-1 cursor-pointer bg-[#DAF7A8] text-lime-700 rounded-full hover:bg-lime-200 border border-accent-green-dark transition-colors font-medium text-sm">
            View Bookkeepings
          </button>
        </Link>
      ),
    }),
  ], [routePrefix, vleId, problemUrlSuffix]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted font-body">Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full">
          <thead className="bg-white border-b border-input-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={header.column.columnDef.meta?.sticky
                      ? { position: 'sticky', left: header.column.columnDef.meta.left, zIndex: 2 }
                      : {}}
                    className={`px-5 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-muted uppercase tracking-wider font-heading ${header.column.columnDef.meta?.sticky ? 'bg-white' : ''}`}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-input-border">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-light transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={cell.column.columnDef.meta?.sticky
                        ? { position: 'sticky', left: cell.column.columnDef.meta.left, zIndex: 1 }
                        : {}}
                      className={`px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base whitespace-nowrap ${cell.column.columnDef.meta?.sticky ? 'bg-white' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-muted italic font-body">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-input-border flex justify-center">
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

export default BookkeepingsTable;
