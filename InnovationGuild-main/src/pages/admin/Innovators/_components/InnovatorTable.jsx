import { useMemo } from 'react';
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

const InnovatorTable = ({
  data = [],
  activeTab = 'approved',
  isLoading = false,
  onEdit = () => { },
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
      columnHelper.accessor('enterprise', {
        header: 'Enterprise Name',
        meta: { sticky: true, left: '3.5rem' },
        cell: (info) => {
          const content = (
            <div className="flex items-center gap-2">
              <span className="text-[#6D3C31] underline font-body  transition-colors cursor-pointer">
                {info.getValue() ?? '—'}
              </span>
              <img src={expand} className="w-4 h-4" alt="expand" />
            </div>
          );

          if (activeTab === 'pipeline') {
            return (
              <div onClick={() => onEdit(info.row.original)}>
                {content}
              </div>
            );
          }

          return (
            <Link to={`/admin/innovators/${info.row.original.id}`}>
              {content}
            </Link>
          );
        },
      }),
    ];

    const commonCols = [
      columnHelper.accessor('name', {
        header: 'Innovator Name',
        cell: (info) => {
          const content = <span className="text-gray-900">{info.getValue() ?? '—'}</span>;

          if (activeTab === 'pipeline') {
            return (
              <div 
                className="cursor-pointer hover:text-accent-green-dark transition-colors" 
                onClick={() => onEdit(info.row.original)}
              >
                {content}
              </div>
            );
          }

          return content;
        },
      }),
      columnHelper.accessor('state', {
        header: 'State',
        cell: (info) => <span className="text-gray-900">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('district', {
        header: 'District',
        cell: (info) => <span className="text-gray-900">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('mobile', {
        header: 'Mobile',
        cell: (info) => <span className="text-gray-900">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('emailId', {
        header: 'Email ID',
        cell: (info) => <span className="text-gray-900">{info.getValue() ?? '—'}</span>,
      }),
    ];

    if (activeTab === 'approved') {
      return [
        ...baseCols,
        ...commonCols,
        columnHelper.accessor('igImplementation', {
          header: 'TechDhaara Implementation',
          cell: (info) => {
            const status = info.getValue();
            if (!status) return <span className="text-muted">—</span>;
            const bgColor =
              status === 'Yes'
                ? 'bg-green-100 text-green-700'
                : status === 'No'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700';
            return (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                {status}
              </span>
            );
          },
        }),
      ];
    }

    return [...baseCols, ...commonCols];
  }, [activeTab]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted font-body">Loading Innovators...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full min-w-[1000px]">
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
                  No innovators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {data.length > 0 && (
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
      )}
    </div>
  );
};

export default InnovatorTable;