import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Components
import PilotTable from '../../../components/admin/Tables/PilotTable/PilotTable';
import PilotFilter from '../../../components/admin/Tables/PilotTable/PilotFilter';
import Tabs from '../../../components/admin/Tabs';
import ConfirmPopup from '../../../components/admin/Popups/ConfirmPopup';

// Hooks
import { getStateOptions } from '../../../utils/LocationData/locationData';
import useDebounce from '../../../hooks/useDebounce';
import {
  useGetAdminPilots,
  useStartAdminPilot,
  useStartAdminPilotTrial,
  useMarkAdminPilotImplemented,
  useCancelAdminPilot,
} from '../../../hooks/queries/admin';

const PILOT_STATUS_MAP = {
  PILOT_STARTED: 'started',
  TRIAL_STARTED: 'trial',
  IMPLEMENTED: 'implemented',
  CANCELLED: 'cancelled',
};

const PILOT_STATUS_OPTIONS = [
  { value: 'started', label: 'Started' },
  { value: 'trial', label: 'Trial' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Pilots = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPilotStatus, setSelectedPilotStatus] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'commercial', label: 'Commercial' },
  ];
  const [confirmPopup, setConfirmPopup] = useState({ isOpen: false, data: null });

  const debouncedSearch = useDebounce(searchQuery);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, activeTab, selectedPilotStatus]);

  const pilotsParams = {
    page: currentPage,
    limit: 20,
    ...(activeTab === 'requests'
      ? { status: 'PENDING' }
      : selectedPilotStatus
        ? { status: selectedPilotStatus.toUpperCase() }
        : { excludeStatus: 'PENDING' }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedStatus && { vleStatus: selectedStatus }),
  };

  const { data: pilotsData, isLoading } = useGetAdminPilots(pilotsParams);

  const { mutate: startPilotMutate } = useStartAdminPilot();
  const { mutate: startTrialMutate } = useStartAdminPilotTrial();
  const { mutate: implementMutate } = useMarkAdminPilotImplemented();
  const { mutate: cancelPilotMutate } = useCancelAdminPilot();

  const pilotTableData = useMemo(() =>
    (pilotsData?.data?.pilots || []).map(p => ({
      id: p._id,
      problemId: p.problemId?._id || null,
      innovationId: p.innovationId?._id || null,
      innovation: p.innovationId?.innovationName || '—',
      vleName: p.vleId?.fullName || '—',
      vleStatus: '',
      vleId: p.vleId?._id || null,
      Problem: p.problemId?.problemTitle || '—',
      businessModel: p.hasBusinessModel ?? false,
      pilotStatus: PILOT_STATUS_MAP[p.status] || null,
    })),
    [pilotsData]
  );

  const totalPages = pilotsData?.data?.pagination?.totalPages ?? 1;
  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    onPrevious: () => setCurrentPage(p => Math.max(1, p - 1)),
    onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };

  const handleStatusChangeRequest = (id, newStatus) => {
    setConfirmPopup({ isOpen: true, data: { id, newStatus } });
  };

  const handleConfirmStatusChange = () => {
    const { id, newStatus } = confirmPopup.data;
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['adminPilots'] });
      setConfirmPopup({ isOpen: false, data: null });
    };
    if (newStatus === 'started') startPilotMutate(id, { onSuccess });
    else if (newStatus === 'trial') startTrialMutate(id, { onSuccess });
    else if (newStatus === 'implemented') implementMutate(id, { onSuccess });
    else if (newStatus === 'cancelled') cancelPilotMutate(id, { onSuccess });
    else setConfirmPopup({ isOpen: false, data: null });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPilotStatus('');
    setSelectedState('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">
          Pilots
        </h1>
        <div className="border-t mt-5 sm:mt-6 border-accent-green-dark"></div>

        <Tabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            handleClearFilters();
          }}
          tabs={[
            { id: 'requests', label: 'Requests' },
            { id: 'recently_started', label: 'Recently Started' }
          ]}
          className='w-md'
        />

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-6 sm:mt-8 border border-accent-green-dark">
          <div className="p-4 bg-white border-b border-input-border">
            <PilotFilter
              searchQuery={searchQuery}
              setSearchQuery={(val) => { setSearchQuery(val); setCurrentPage(1); }}
              selectedState={selectedState}
              setSelectedState={(val) => { setSelectedState(val); setCurrentPage(1); }}
              selectedStatus={selectedStatus}
              setSelectedStatus={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
              selectedPilotStatus={selectedPilotStatus}
              setSelectedPilotStatus={(val) => { setSelectedPilotStatus(val); setCurrentPage(1); }}
              onClearFilters={handleClearFilters}
              stateOptions={stateOptions}
              statusOptions={statusOptions}
              pilotStatusOptions={PILOT_STATUS_OPTIONS}
              showPilotStatusFilter={activeTab === 'recently_started'}
            />
          </div>

          <PilotTable
            data={pilotTableData}
            activeTab={activeTab}
            isLoading={isLoading}
            pagination={paginationProps}
            onStatusChange={handleStatusChangeRequest}
            pilotStatusOptions={PILOT_STATUS_OPTIONS}
            routePrefix="/admin"
          />
        </div>
      </div>

      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        onClose={() => setConfirmPopup({ isOpen: false, data: null })}
        onConfirm={handleConfirmStatusChange}
        title="Update Pilot Status"
        message={`Are you sure you want to change the status of this pilot to ${confirmPopup.data?.newStatus}?`}
        confirmLabel="Update"
        variant="green"
      />
    </div>
  );
};

export default Pilots;
