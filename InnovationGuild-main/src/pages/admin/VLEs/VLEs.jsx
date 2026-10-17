import React, { useState, useMemo, useEffect } from 'react';
import { getDistrictOptions, getStateOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';
import VleFilter from '../../../components/admin/Tables/VleTable/VleFilter';
import VleTable from '../../../components/admin/Tables/VleTable/VleTable';
import Tabs from '../../../components/admin/Tabs';
import NOListFilter from './_components/NOListFilter';
import useDebounce from '../../../hooks/useDebounce';
import { useGetAdminApprovedVles, useGetAdminPendingVles } from '../../../hooks/queries/admin';
import { useVillages } from '../../../hooks/queries/public';

const LIMIT = 20;

const VLEs = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedNodalOrg, setSelectedNodalOrg] = useState(null);
  const [approvedPage, setApprovedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => { setApprovedPage(1); setPendingPage(1); }, [debouncedSearch]);

  // Constants
  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(() => {
    return selectedState ? getDistrictOptions(selectedState) : [];
  }, [selectedState]);
  const { data: villageOptions = [] } = useVillages(selectedState, selectedDistrict);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const personaOptions = [
    { value: 'sales',       label: 'Sales' },
    { value: 'rental',      label: 'Rental' },
    { value: 'servicing',   label: 'Servicing' },
    { value: 'fabrication', label: 'Fabrication' },
  ];

  const statusOptions = [
    { value: 'listed', label: 'Listed' },
    { value: 'interested', label: 'Interested' },
    { value: 'active', label: 'Active' },
    { value: 'commercial', label: 'Commercial' }
  ];

  // Query params — null disables the query when tab is inactive
  const approvedParams = activeTab === 'approved' ? {
    page: approvedPage,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedGender && { gender: selectedGender }),
    ...(selectedState && { state: selectedState }),
    ...(selectedDistrict && { district: selectedDistrict }),
    ...(selectedVillage && { village: selectedVillage }),
    ...(selectedStatus && { vleStatus: selectedStatus }),
    ...(selectedPersona && { persona: selectedPersona }),
    ...(selectedNodalOrg && { nodalOrg: selectedNodalOrg }),
  } : null;

  const pendingParams = activeTab === 'pending' ? {
    page: pendingPage,
    limit: LIMIT,
    ...(selectedPersona && { persona: selectedPersona }),
  } : null;

  const { data: approvedData, isLoading: approvedLoading } = useGetAdminApprovedVles(approvedParams);
  const { data: pendingData, isLoading: pendingLoading } = useGetAdminPendingVles(pendingParams);

  // Map API data to table shape
  const approvedTableData = useMemo(() => (approvedData?.data?.vles || []).map(v => ({
    id: v._id,
    name: v.fullName || '—',
    status: v.profile?.vleStatus || 'listed',
    gender: v.profile?.gender || '',
    state: getStateName(v.profile?.state),
    district: getDistrictName(v.profile?.district, v.profile?.state),
    village: v.profile?.village || '—',
    mobile: v.profile?.mobile || v.phone || '—',
    email: v.email || '—',
    problems: v.problems || 0,
    persona: v.profile?.interestedPersonas || [],
    training: v.profile?.trainings || [],
  })), [approvedData]);

  const pendingTableData = useMemo(() => (pendingData?.data?.vles || []).map(v => ({
    id: v.userId,
    name: v.fullName || '—',
    gender: v.profile?.gender || '',
    state: getStateName(v.profile?.state),
    district: getDistrictName(v.profile?.district, v.profile?.state),
    village: v.profile?.village || '—',
    mobile: v.profile?.mobile || v.phone || '—',
    email: v.email || '—',
  })), [pendingData]);

  // Pagination
  const approvedTotalPages = approvedData?.data?.pagination?.totalPages || 1;
  const pendingTotalPages = pendingData?.data?.pagination?.totalPages || 1;

  const approvedPaginationProps = {
    currentPage: approvedPage,
    totalPages: approvedTotalPages,
    onPageChange: setApprovedPage,
    onPrevious: () => setApprovedPage(prev => Math.max(1, prev - 1)),
    onNext: () => setApprovedPage(prev => Math.min(approvedTotalPages, prev + 1)),
    canGoPrevious: approvedPage > 1,
    canGoNext: approvedPage < approvedTotalPages,
  };

  const pendingPaginationProps = {
    currentPage: pendingPage,
    totalPages: pendingTotalPages,
    onPageChange: setPendingPage,
    onPrevious: () => setPendingPage(prev => Math.max(1, prev - 1)),
    onNext: () => setPendingPage(prev => Math.min(pendingTotalPages, prev + 1)),
    canGoPrevious: pendingPage > 1,
    canGoNext: pendingPage < pendingTotalPages,
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedVillage('');
    setSelectedGender('');
    setSelectedPersona('');
    setSelectedStatus('');
    setSelectedNodalOrg(null);
    setApprovedPage(1);
    setPendingPage(1);
  };

  const activeData = activeTab === 'approved' ? approvedTableData : pendingTableData;
  const isLoading = activeTab === 'approved' ? approvedLoading : pendingLoading;
  const paginationProps = activeTab === 'approved' ? approvedPaginationProps : pendingPaginationProps;

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">VLEs</h1>
        <div className="border-t mt-5 sm:mt-6 border-accent-green-dark"></div>

        <Tabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            handleClearFilters();
          }}
          tabs={[
            { id: 'approved', label: 'Approved' },
            { id: 'pending', label: 'Pending' }
          ]}
          className='w-xs'
        />

        {activeTab === 'approved' && (
          <NOListFilter
            selectedNodalOrg={selectedNodalOrg}
            onSelect={(id) => { setSelectedNodalOrg(id); setApprovedPage(1); }}
          />
        )}

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-6 sm:mt-8 border border-accent-green-light">
          {activeTab === 'approved' && (
            <div className="p-4 bg-white border-b border-input-border">
              <VleFilter
                searchQuery={searchQuery}
                setSearchQuery={(val) => { setSearchQuery(val); setApprovedPage(1); }}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setApprovedPage(1); }}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(val) => { setSelectedDistrict(val); setApprovedPage(1); }}
                selectedVillage={selectedVillage}
                setSelectedVillage={(val) => { setSelectedVillage(val); setApprovedPage(1); }}
                selectedGender={selectedGender}
                setSelectedGender={(val) => { setSelectedGender(val); setApprovedPage(1); }}
                selectedPersona={selectedPersona}
                setSelectedPersona={(val) => { setSelectedPersona(val); setApprovedPage(1); }}
                selectedStatus={selectedStatus}
                setSelectedStatus={(val) => { setSelectedStatus(val); setApprovedPage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                districtOptions={districtOptions}
                villageOptions={villageOptions}
                genderOptions={genderOptions}
                personaOptions={personaOptions}
                statusOptions={statusOptions}
                showVillageFilter={true}
              />
            </div>
          )}

          <VleTable
            data={activeData}
            activeTab={activeTab}
            isLoading={isLoading}
            pagination={paginationProps}
          />
        </div>
      </div>
    </div>
  );
};

export default VLEs;
