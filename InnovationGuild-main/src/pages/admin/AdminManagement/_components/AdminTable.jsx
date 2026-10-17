import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import AdminTablePagination from '../../../../components/admin/AdminTablePagination';
import bin from '../../../../assets/icons/bin.svg';

const columnHelper = createColumnHelper();

const AdminTable = ({
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
  onDelete = () => {}
}) => {
  const columns = useMemo(() => [
    columnHelper.accessor('rowNum', {
      header: '',
      cell: (info) => <span className="text-dark font-body">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('adminName', {
      header: 'Admin Name',
      cell: (info) => <span className="text-accent-brown font-body font-medium">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email ID',
      cell: (info) => <span className="text-dark font-body">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('dateAdded', {
      header: 'Date Added',
      cell: (info) => <span className="text-dark font-body">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <button
          onClick={() => onDelete(info.row.original.id)}
          className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          aria-label="Delete admin"
        >
          <img src={bin} className="w-5 h-5" alt="Delete" />
        </button>
      ),
    }),
  ], [onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted">
        Loading admins...
      </div>
    );
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
                    className="px-5 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-muted uppercase tracking-wider font-heading"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                      className="px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-muted italic">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
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

export default AdminTable;
