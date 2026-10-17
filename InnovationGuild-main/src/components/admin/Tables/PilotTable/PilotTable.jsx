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
import FormSelectSmall from '../../../ui/FormSelectSmall';

const columnHelper = createColumnHelper();

const PilotTable = ({
    data = [],
    activeTab = 'requests',
    isLoading = false,
    onStatusChange = () => { },
    pilotStatusOptions = [],
    pagination = {
        currentPage: 1,
        totalPages: 1,
        onPageChange: () => { },
        onPrevious: () => { },
        onNext: () => { },
        canGoPrevious: false,
        canGoNext: false
    },
    showVleColumn = true,
    routePrefix = '/admin',
    vleId = null, // If provided, uses nested routes for pilots
    isVleContext = false, // Helps in determining link structure for VLE Details page
    problemUrlSuffix = '',
}) => {
    const columns = useMemo(() => {
        const baseCols = [
            columnHelper.accessor('id', {
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
                            <span className="text-accent-green-dark underline font-body  transition-colors cursor-pointer">
                                {info.getValue() ?? '—'}
                            </span>
                            <img src={expand} className="w-4 h-4 shrink-0" alt="expand" />
                        </div>
                    </Link>
                ),
            }),
        ];

        const vleCol = columnHelper.accessor('vleName', {
            header: 'Name of VLE',
            cell: (info) => (
                <Link to={`${routePrefix}/vles/${info.row.original.vleId}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-accent-green-dark underline font-body  transition-colors cursor-pointer">{info.getValue() ?? '—'}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${info.row.original.vleStatus === 'commercial' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></span>
                        <img src={expand} className="w-4 h-4 cursor-pointer" alt="expand" />
                    </div>
                </Link>
            ),
        });

        const problemAndBusinessCols = [
            columnHelper.accessor('Problem', {
                header: 'Problem',
                cell: (info) => {
                    const problemId = info.row.original.problemId || info.row.original.id;
                    const link = `${routePrefix}/problems/innovation-request/${problemId}${problemUrlSuffix}`;
                    return (
                        <Link to={link}>
                            <div className="flex items-center gap-2">
                                <span className="text-accent-green-dark underline font-body  transition-colors cursor-pointer line-clamp-1 max-w-[200px]">{info.getValue() ?? '—'}</span>
                                <img src={expand} className="w-4 h-4 cursor-pointer shrink-0" alt="expand" />
                            </div>
                        </Link>
                    );
                },
            }),
            columnHelper.accessor('businessModel', {
                header: 'Business Model',
                cell: (info) => {
                    const hasBm = info.row.original.businessModel;
                    const pilotVleId = vleId || info.row.original.vleId;
                    const link = `${routePrefix}/vles/${pilotVleId}/pilots/${info.row.original.id}/business-model`;

                    return (
                        <Link to={link}>
                            <button className="px-6 py-1 cursor-pointer bg-[#f4d5cc] text-accent-green-dark border border-accent-green-dark rounded-full transition-colors font-medium text-sm">
                                {hasBm ? 'View' : 'Create'}
                            </button>
                        </Link>
                    );
                },
            }),
        ];

        const STATUS_TRANSITIONS = {
            started: ['trial', 'cancelled'],
            trial: ['implemented', 'cancelled'],
        };

        const actionCol = columnHelper.display({
            id: 'action',
            header: activeTab === 'requests' ? 'Action' : 'Pilot Status',
            cell: (info) => {
                if (activeTab === 'recently_started') {
                    const currentStatus = info.row.original.pilotStatus;
                    const availableOptions = (STATUS_TRANSITIONS[currentStatus] || [])
                        .map(v => pilotStatusOptions.find(o => o.value === v))
                        .filter(Boolean);

                    if (!availableOptions.length) {
                        const label = pilotStatusOptions.find(o => o.value === currentStatus)?.label ?? currentStatus ?? '—';
                        return <span className="px-3 py-1 text-sm font-medium text-muted italic">{label}</span>;
                    }

                    return (
                        <div className="w-40">
                            <FormSelectSmall
                                options={availableOptions}
                                value={pilotStatusOptions.find(opt => opt.value === currentStatus) || null}
                                onChange={(opt) => onStatusChange(info.row.original.id, opt.value)}
                                placeholder="Update Status"
                            />
                        </div>
                    );
                }
                const noBm = activeTab === 'requests' && !info.row.original.businessModel;
                return (
                    <button
                        onClick={!noBm && activeTab === 'requests' ? () => onStatusChange(info.row.original.id, 'started') : undefined}
                        disabled={noBm}
                        title={noBm ? 'Create a business model before starting the pilot' : undefined}
                        className={`px-6 py-1 rounded-full border transition-colors font-medium text-sm whitespace-nowrap ${noBm ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-[#f4d5cc] text-accent-green-dark hover:bg-lime-200 border-accent-green-dark cursor-pointer'}`}>
                        {activeTab === 'requests' ? 'Start Pilot' : 'Manage'}
                    </button>
                );
            },
        });

        const result = [...baseCols];
        if (showVleColumn) {
            result.push(vleCol);
        }
        result.push(...problemAndBusinessCols);
        result.push(actionCol);

        return result;
    }, [activeTab, pilotStatusOptions, onStatusChange, routePrefix, showVleColumn, vleId, isVleContext, problemUrlSuffix]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return <div className="p-8 text-center text-muted font-body">Loading Pilots...</div>;
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

export default PilotTable;
