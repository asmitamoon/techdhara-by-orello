import { useState, useMemo, useEffect } from 'react';
import { getStateOptions, getDistrictOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';

// Components
import Tabs from '../../../components/admin/Tabs';
import InnovatorTable from './_components/InnovatorTable';
import InnovatorFilters from './_components/InnovatorFilters';
import AddInnovator from './_components/AddInnovator';

// Hooks
import useDebounce from '../../../hooks/useDebounce';
import {
  useGetAdminApprovedInnovators,
  useGetAdminPendingInnovators,
  useGetAdminPipelineInnovators,
  useCreateAdminPipelineInnovator,
  useUpdateAdminPipelineInnovator,
} from '../../../hooks/queries/admin';

const igStatusOptions = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Under Process', label: 'Under Process' },
];

const Innovators = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedIgStatus, setSelectedIgStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddInnovator, setShowAddInnovator] = useState(false);
  const [selectedInnovator, setSelectedInnovator] = useState(null);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(() => {
    return selectedState ? getDistrictOptions(selectedState) : [];
  }, [selectedState]);

  const debouncedSearch = useDebounce(searchQuery);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, activeTab, selectedState, selectedDistrict, selectedIgStatus]);

  const approvedParams = activeTab === 'approved' ? {
    page: currentPage,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedDistrict && { district: selectedDistrict }),
    ...(selectedIgStatus && { igImplementation: selectedIgStatus }),
  } : null;

  const pendingParams = activeTab === 'pending' ? { page: currentPage, limit: 10 } : null;

  const pipelineParams = activeTab === 'pipeline' ? { page: currentPage, limit: 10 } : null;

  const { data: approvedData, isLoading: approvedLoading } = useGetAdminApprovedInnovators(approvedParams);
  const { data: pendingData, isLoading: pendingLoading } = useGetAdminPendingInnovators(pendingParams);
  const { data: pipelineData, isLoading: pipelineLoading } = useGetAdminPipelineInnovators(pipelineParams);

  const isLoading = approvedLoading || pendingLoading || pipelineLoading;

  const { mutate: createPipeline } = useCreateAdminPipelineInnovator();
  const { mutate: updatePipeline } = useUpdateAdminPipelineInnovator();

  const tableData = useMemo(() => {
    if (activeTab === 'approved') {
      return (approvedData?.data?.innovators || []).map(u => ({
        id: u._id,
        name: u.fullName || '—',
        enterprise: u.profile?.enterpriseName || '—',
        state: getStateName(u.profile?.state),
        district: getDistrictName(u.profile?.district, u.profile?.state),
        mobile: u.phone || '—',
        emailId: u.email || '—',
        igImplementation: u.profile?.igImplementation || null,
      }));
    }
    if (activeTab === 'pending') {
      return (pendingData?.data?.innovators || []).map(u => ({
        id: u._id,
        name: u.fullName || '—',
        enterprise: u.profile?.enterpriseName || '—',
        state: getStateName(u.profile?.state),
        district: getDistrictName(u.profile?.district, u.profile?.state),
        mobile: u.phone || '—',
        emailId: u.email || '—',
      }));
    }
    return (pipelineData?.data?.innovators || []).map(p => ({
      id: p._id,
      name: p.name || '—',
      enterprise: p.enterprise || '—',
      state: getStateName(p.state),
      district: getDistrictName(p.district, p.state),
      mobile: p.mobile || '—',
      emailId: p.emailId || '—',
      _stateCode: p.state || '',
      _districtCode: p.district || '',
      _link: p.link || '',
    }));
  }, [activeTab, approvedData, pendingData, pipelineData]);

  const activeData = activeTab === 'approved' ? approvedData : activeTab === 'pending' ? pendingData : pipelineData;
  const totalPages = activeData?.data?.pagination?.totalPages ?? 1;

  const paginationProps = {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    onPrevious: () => setCurrentPage(p => Math.max(1, p - 1)),
    onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedIgStatus('');
    setCurrentPage(1);
  };

  const handleAddInnovator = () => {
    setSelectedInnovator(null);
    setShowAddInnovator(true);
  };

  const handleEditInnovator = (rowData) => {
    setSelectedInnovator({
      ...rowData,
      state: rowData._stateCode,
      district: rowData._districtCode,
      link: rowData._link,
    });
    setShowAddInnovator(true);
  };

  const handleSave = (data) => {
    if (selectedInnovator) {
      updatePipeline(
        { innovatorId: selectedInnovator._id || selectedInnovator.id, data },
        { onSuccess: () => { setShowAddInnovator(false); setSelectedInnovator(null); } }
      );
    } else {
      createPipeline(data, { onSuccess: () => setShowAddInnovator(false) });
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">Innovators</h1>
        <div className="border-t mt-5 sm:mt-6 border-accent-green-dark"></div>

        <Tabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
            handleClearFilters();
          }}
          tabs={[
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Pending' },
            { id: 'pipeline', label: 'Pipeline' }
          ]}
          className='w-sm'
        />

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-6 sm:mt-8 border border-accent-green-light">
          {activeTab === 'approved' ? (
            <div className="p-4 bg-white border-b border-input-border">
              <InnovatorFilters
                searchQuery={searchQuery}
                setSearchQuery={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setCurrentPage(1); }}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(val) => { setSelectedDistrict(val); setCurrentPage(1); }}
                selectedIgStatus={selectedIgStatus}
                setSelectedIgStatus={(val) => { setSelectedIgStatus(val); setCurrentPage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                districtOptions={districtOptions}
                igStatusOptions={igStatusOptions}
              />
            </div>
          ) : activeTab === 'pipeline' ? (
            <div className="p-4 bg-white border-b border-input-border flex justify-end">
              <button
                onClick={handleAddInnovator}
                className="px-4 py-2.5 bg-[#6B8E23] hover:bg-[#5a7a1f] text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span className="text-lg leading-none">+</span>
                Add Innovator
              </button>
            </div>
          ) : null}

          <InnovatorTable
            data={tableData}
            activeTab={activeTab}
            isLoading={isLoading}
            pagination={paginationProps}
            onEdit={handleEditInnovator}
          />
        </div>
      </div>

      <AddInnovator
        open={showAddInnovator}
        initialData={selectedInnovator}
        onClose={() => {
          setShowAddInnovator(false);
          setSelectedInnovator(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Innovators;
