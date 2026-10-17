import React, { useMemo } from 'react';
import { Link } from 'react-router';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import AdminTablePagination from '../../../../components/admin/AdminTablePagination';
import expand from '../../../../assets/icons/expand.svg';

const columnHelper = createColumnHelper();

const NoTable = ({
  data = [],
  activeTab = 'approved',
  isLoading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => {},
    onPrevious: () => {},
    onNext: () => {},
    canGoPrevious: false,
    canGoNext: false
  }
}) => {
  const columns = useMemo(() => {
    const baseCols = [
      columnHelper.accessor('id', {
        header: '',
        meta: { sticky: true, left: 0 },
        cell: (info) => <span className="text-dark font-body">{String(info.row.index + 1).padStart(2, '0')}</span>,
      }),
      columnHelper.accessor('noList', {
        header: 'NO List',
        meta: { sticky: true, left: '3.5rem' },
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <span className="text-muted font-body">—</span>;
          return (
            <Link to={`/admin/nodal-organizations/${info.row.original.id}`}>
              <div className="flex items-center gap-2">
                <span className="text-[#6D3C31] underline font-body  transition-colors">
                  {value}
                </span>
                <img src={expand} className="w-4 h-4" alt="expand" />
              </div>
            </Link>
          );
        },
      }),
    ];

    const aosCol = columnHelper.accessor('aos', {
      header: 'AOs',
      cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
    });

    const remainingCols = [
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('hqState', {
        header: 'HQ State',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('operationalStates', {
        header: 'Operational States',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('website', {
        header: 'Website',
        cell: (info) => {
          const value = info.getValue();
          if (!value) return <span className="text-muted font-body">—</span>;
          return (
            <a
              href={`https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-green-dark underline font-body hover:text-accent-green transition-colors"
            >
              {value}
            </a>
          );
        },
      }),
    ];

    return activeTab === 'approved'
      ? [...baseCols, aosCol, ...remainingCols]
      : [...baseCols, ...remainingCols];
  }, [activeTab]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted">
        Loading Nodal Organizations...
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
                    style={header.column.columnDef.meta?.sticky
                      ? { position: 'sticky', left: header.column.columnDef.meta.left, zIndex: 2 }
                      : {}}
                    className={`px-5 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-muted uppercase tracking-wider font-heading ${header.column.columnDef.meta?.sticky ? 'bg-white' : ''}`}
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
                <td colSpan={columns.length} className="px-5 py-8 text-center text-muted italic">
                  No nodal organizations found.
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

export default NoTable;