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
import { getStateName } from '../../../../utils/LocationData/locationData';

const columnHelper = createColumnHelper();

const InnovationTable = ({
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
    showInnovatorColumn = true,
    showInnovatorLink = true,
    showAllColumns = false
}) => {
    const columns = useMemo(() => {
        const baseCols = [
            columnHelper.accessor('id', {
                header: '',
                meta: { sticky: true, left: 0 },
                cell: (info) => <span className="text-dark font-body">{info.row.index + 1}</span>,
            }),
            columnHelper.accessor('innovationName', {
                header: 'Innovation Name',
                meta: { sticky: true, left: '3.5rem' },
                cell: (info) => (
                    <Link to={`/admin/innovations/${info.row.original.id}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-[#6D3C31] underline font-body  transition-colors">
                                {info.getValue() ?? '—'}
                            </span>
                            <img src={expand} className="w-4 h-4" alt="expand" />
                        </div>
                    </Link>
                ),
            }),
        ];

        const innovatorCol = columnHelper.accessor('innovatorName', {
            header: 'Innovator',
            cell: (info) => {
                const value = info.getValue();
                if (!value) return <span className="text-muted">—</span>;

                if (showInnovatorLink) {
                    return (
                        <Link to={`/admin/innovators/${info.row.original.innovatorId || info.row.original.id}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-[#6D3C31] underline font-body  transition-colors cursor-pointer">
                                    {value}
                                </span>
                                <img src={expand} className="w-4 h-4" alt="expand" />
                            </div>
                        </Link>
                    );
                }
                return <span className="text-gray-900">{value}</span>;
            },
        });

        const commonCols = [
            columnHelper.accessor('category', {
                header: 'Category',
                cell: (info) => {
                    const val = info.getValue();
                    const arr = Array.isArray(val) ? val : (val ? [val] : []);
                    if (!arr.length) return <span className="text-muted">—</span>;
                    const visible = arr.slice(0, 2);
                    const remaining = arr.length - 2;
                    return (
                        <div className="flex flex-wrap gap-1">
                            {visible.map((cat, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-accent-green/10 text-[#8bad8e] rounded text-[10px] font-medium uppercase tracking-wider">
                                    {cat}
                                </span>
                            ))}
                            {remaining > 0 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-muted rounded text-[10px] font-medium">+{remaining}</span>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor('subCategory', {
                header: 'Sub Category',
                cell: (info) => {
                    const val = info.getValue();
                    const arr = Array.isArray(val) ? val : (val ? [val] : []);
                    if (!arr.length) return <span className="text-muted">—</span>;
                    const visible = arr.slice(0, 2);
                    const remaining = arr.length - 2;
                    return (
                        <div className="flex flex-wrap gap-1">
                            {visible.map((sub, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-accent-green/10 text-[#8bad8e] rounded text-[10px] font-medium uppercase tracking-wider">
                                    {sub}
                                </span>
                            ))}
                            {remaining > 0 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-muted rounded text-[10px] font-medium">+{remaining}</span>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor('headquarters', {
                header: 'Sales Locations',
                cell: (info) => {
                    const locations = info.getValue();
                    const arr = Array.isArray(locations) ? locations : (locations ? [locations] : []);
                    if (!arr.length) return <span className="text-muted">—</span>;
                    const visible = arr.slice(0, 2);
                    const remaining = arr.length - 2;
                    return (
                        <div className="flex flex-wrap gap-1">
                            {visible.map((loc, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-accent-green/10 text-[#8bad8e] rounded text-[10px] font-medium uppercase tracking-wider">
                                    {getStateName(loc)}
                                </span>
                            ))}
                            {remaining > 0 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-muted rounded text-[10px] font-medium">+{remaining}</span>
                            )}
                        </div>
                    );
                },
            }),
        ];

        const result = [...baseCols];
        if (showInnovatorColumn) {
            result.push(innovatorCol);
        }
        result.push(...commonCols);

        if (showAllColumns || activeTab === 'approved') {
            result.push(
                columnHelper.accessor('noImplemented', {
                    header: 'Implemented',
                    cell: (info) => <span className="text-gray-900 font-medium">{info.getValue() ?? '0'}</span>,
                })
            );
        }

        return result;
    }, [activeTab, showInnovatorColumn, showInnovatorLink, showAllColumns]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return <div className="p-8 text-center text-muted font-body">Loading Innovations...</div>;
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
                                    No innovations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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

export default InnovationTable;
