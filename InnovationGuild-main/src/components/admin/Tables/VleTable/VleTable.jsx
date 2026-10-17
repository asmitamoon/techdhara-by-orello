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

const VleTable = ({
  data = [],
  activeTab = 'approved',
  isLoading = false,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => { },
    onPrevious: () => { },
    onNext: () => { },
    canGoPrevious: false,
    canGoNext: false
  },
  showAllColumns = false,
  routePrefix = '/admin'
}) => {
  const columns = useMemo(() => {
    const baseCols = [
      columnHelper.accessor('id', {
        header: '',
        meta: { sticky: true, left: 0 },
        cell: (info) => <span className="text-dark font-body">{String(info.row.index + 1).padStart(2, '0')}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Name of VLE',
        meta: { sticky: true, left: '3.5rem' },
        cell: (info) => (
          <Link to={`${routePrefix}/vles/${info.row.original.id}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#6D3C31] underline font-body  transition-colors">
                {info.getValue() ?? '—'}
              </span>
              <img src={expand} className="w-4 h-4" alt="expand" />
            </div>
          </Link>
        ),
      }),
    ];

    const statusCol = columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="text-muted">—</span>;

        let colorClass = 'bg-blue-100 text-blue-700';
        if (val === 'active') colorClass = 'bg-green-100 text-green-700';
        if (val === 'interested') colorClass = 'bg-yellow-100 text-yellow-700';
        if (val === 'commercial') colorClass = 'bg-purple-100 text-purple-700';

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
            {val}
          </span>
        );
      },
    });

    const commonCols = [
      columnHelper.accessor('gender', {
        header: 'Gender',
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-muted font-body">—</span>;
          return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              val.toLowerCase() === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor('state', {
        header: 'State',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('district', {
        header: 'District',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('village', {
        header: 'Village',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('mobile', {
        header: 'Mobile',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-muted font-body">{info.getValue() ?? info.row.original.emailId ?? '—'}</span>,
      }),
    ];

    if (showAllColumns || activeTab === 'approved') {
      const approvedCols = [
        columnHelper.accessor('problems', {
          header: 'Problems',
          cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '0'}</span>,
        }),
        columnHelper.accessor('persona', {
          header: 'Persona',
          cell: (info) => {
            const personas = info.getValue();
            if (!personas || !Array.isArray(personas)) return <span className="text-muted font-body">—</span>;
            return (
              <div className="flex flex-wrap gap-1">
                {personas.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 bg-accent-green/10 text-accent-green-dark rounded text-[10px] font-medium uppercase tracking-wider">
                    {p}
                  </span>
                ))}
              </div>
            );
          },
        }),
        columnHelper.accessor('training', {
          header: 'TechDhaara Training',
          cell: (info) => {
            const val = info.getValue();
            if (!val || val.length === 0) return <span className="text-muted font-body">—</span>;
            return (
              <div className="flex flex-wrap gap-1">
                {val.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                    {t}
                  </span>
                ))}
              </div>
            );
          },
        })
      ];

      // Order: ID, Name, Status, Gender, Problems, State, District, Village, Mobile, Email, Persona, Training
      const result = [...baseCols, statusCol];
      result.push(commonCols[0]); // gender
      result.push(approvedCols[0]); // problems
      result.push(...commonCols.slice(1)); // state, dist, village, mobile, email
      result.push(approvedCols[1]); // persona
      result.push(approvedCols[2]); // training
      return result;
    }

    // Pending tab: no status column
    return [...baseCols, ...commonCols];
  }, [activeTab, showAllColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted font-body">Loading VLEs...</div>;
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
                  No VLEs found.
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

export default VleTable;
