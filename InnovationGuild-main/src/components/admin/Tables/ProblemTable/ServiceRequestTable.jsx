import { useMemo } from 'react';
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

const ServiceRequestTable = ({
  data = [],
  isLoading = false,
  showVleColumn = false,
  vleContext = null,
  routePrefix = '/admin',
  pagination = {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => { },
    onPrevious: () => { },
    onNext: () => { },
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
      columnHelper.accessor('techName', {
        header: 'Technology Name',
        meta: { sticky: true, left: '3.5rem' },
        cell: (info) => {
          const url = `${routePrefix}/problems/service-request/${info.row.original.id}`;

          return (
            <Link to={url}>
              <div className="flex items-center gap-2">
                <span className="text-accent-green-dark underline font-body hover:text-accent-green transition-colors line-clamp-1 max-w-[200px]">
                  {info.getValue() ?? '—'}
                </span>
                <img src={expand} className="w-4 h-4 shrink-0" alt="expand" />
              </div>
            </Link>
          );
        },
      }),
    ];

    const vleCol = columnHelper.accessor('vle', {
      header: 'Name of User',
      cell: (info) => {
        const { posterType, profileId } = info.row.original;
        if (!profileId) return <span className="font-body">{info.getValue() ?? '—'}</span>;
        const path = posterType === 'AO'
          ? `${routePrefix}/affiliated-organizations/${profileId}`
          : posterType === 'NO'
            ? `${routePrefix}/nodal-organizations/${profileId}`
            : `${routePrefix}/vles/${profileId}`;
        return (
          <Link to={path}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-accent-green-dark underline font-body hover:text-accent-green transition-colors cursor-pointer">
                {info.getValue() ?? '—'}
              </span>
              <img src={expand} className="w-4 h-4 cursor-pointer" alt="view profile" />
            </div>
          </Link>
        );
      },
    });

    const commonCols = [
      columnHelper.accessor('techCompany', {
        header: 'Technology Company',
        cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('unitType', {
        header: 'Unit Type',
        cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('ownership', {
        header: 'Ownership',
        cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('nodalOrg', {
        header: 'Nodal Org',
        cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('affiliatedOrg', {
        header: 'Affiliated Org',
        cell: (info) => <span className="text-gray-900 font-body">{info.getValue() ?? '—'}</span>,
      }),
    ];

    if (showVleColumn) {
      const result = [...baseCols];
      result.splice(2, 0, vleCol);
      return [...result, ...commonCols];
    }

    return [...baseCols, ...commonCols];
  }, [showVleColumn, vleContext]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted font-body">
        Loading Service Requests...
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                  No service requests found.
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

export default ServiceRequestTable;
