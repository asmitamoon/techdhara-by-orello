import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import AdminTablePagination from '../../AdminTablePagination';

const columnHelper = createColumnHelper();

const FieldReportDataTable = ({
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
  routePrefix = '/admin'
}) => {
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: '',
      meta: { sticky: true, left: 0 },
      cell: (info) => <span className="text-dark font-body">{info.row.index + 1}</span>,
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => (
        <Link to={`${routePrefix}/vles/${info.row.original.vleId}/field-reports/${info.row.original.id}`}>
          <button className="px-6 py-1 cursor-pointer bg-[#DAF7A8] text-lime-700 rounded-full hover:bg-lime-200 border border-accent-green-dark transition-colors font-medium text-sm whitespace-nowrap">
            View Report
          </button>
        </Link>
      ),
    }),
  ], [routePrefix]);

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

export default FieldReportDataTable;
