import React, { useMemo } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import AdminTablePagination from '../../AdminTablePagination';

const columnHelper = createColumnHelper();

const BookkeepingDataTable = ({
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
  routePrefix = '/admin',
  vleId = null
}) => {
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'serial',
      header: '',
      meta: { sticky: true, left: 0 },
      cell: (info) => <span className="text-dark font-body">{info.row.index + 1}</span>,
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('period', {
      header: 'Period',
      cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => (
        <Link to={`${routePrefix}/vles/${vleId || info.row.original.vleId}/bookkeepings/${info.row.original.id}`}>
          <button className="px-6 py-1 cursor-pointer bg-[#DAF7A8] text-lime-700 rounded-full hover:bg-lime-200 border border-accent-green-dark transition-colors font-medium text-sm whitespace-nowrap">
            View Entry
          </button>
        </Link>
      ),
    }),
  ], [routePrefix, vleId]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted font-body">Loading Bookkeeping Entries...</div>;
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
                  No bookkeeping entries found.
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

export default BookkeepingDataTable;
