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

const AoTable = ({
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
    // Adding showAllColumns to make it reusable for NodalOrganizationDetails
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
                header: 'Name of AO',
                meta: { sticky: true, left: '3.5rem' },
                cell: (info) => (
                    <Link to={`${routePrefix}/affiliated-organizations/${info.row.original.id}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-[#6D3C31] underline font-body  transition-colors">
                                {info.getValue()}
                            </span>
                            <img src={expand} className="w-4 h-4" alt="expand" />
                        </div>
                    </Link>
                ),
            })
        ];

        const remainingCols = [
            columnHelper.accessor('state', {
                header: 'State',
                cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
            }),
            columnHelper.accessor('district', {
                header: 'District',
                cell: (info) => (
                    <span className="text-muted font-body">{info.getValue() ?? '—'}</span>
                ),
            }),
            columnHelper.accessor('poc', {
                header: 'Organization POC',
                cell: (info) => (
                    <span className="text-muted font-body">{info.getValue() ?? '—'}</span>
                ),
            }),
        ];

        const approvedOnlyCols = [
            columnHelper.accessor('vles', {
                header: 'No. of VLEs',
                cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
            }),
            columnHelper.accessor('prob', {
                header: 'No. of Problems',
                cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
            }),
            columnHelper.accessor('probVle', {
                header: 'No. of Problems (VLE)',
                cell: (info) => <span className="text-muted font-body">{info.getValue() ?? '—'}</span>,
            })
        ];

        if (showAllColumns || activeTab === 'approved') {
            return [...baseCols, ...remainingCols, ...approvedOnlyCols];
        }
        return [...baseCols, ...remainingCols];
    }, [activeTab, showAllColumns]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted">
                Loading Affiliated Organizations...
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
                                    No affiliated organizations found.
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

export default AoTable;
