import React, { useState, useMemo, useEffect } from 'react';
import { getStateOptions, getDistrictOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';

// Components
import Tabs from '../../../components/admin/Tabs';
import AoTable from '../../../components/admin/Tables/AoTable/AoTable';
import AoFilter from '../../../components/admin/Tables/AoTable/AoFilter';

import { useGetAdminAos } from '../../../hooks/queries/admin';
import useDebounce from '../../../hooks/useDebounce';

const LIMIT = 20;

const AffiliatedOrganizations = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(() => {
    return selectedState ? getDistrictOptions(selectedState) : [];
  }, [selectedState]);

  const approvedParams = {
    page: currentPage,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedDistrict && { district: selectedDistrict }),
  };

  const { data: approvedData, isLoading: approvedLoading } = useGetAdminAos(
    activeTab === 'approved' ? approvedParams : null
  );
  const { data: pendingData, isLoading: pendingLoading } = useGetAdminAos(
    activeTab === 'pending' ? { status: 'PENDING', page: currentPage, limit: LIMIT } : null
  );

  const isLoading = activeTab === 'approved' ? approvedLoading : pendingLoading;

  const tableData = useMemo(() => {
    if (activeTab === 'approved') {
      return (approvedData?.data?.aos || []).map(ao => ({
        id: ao._id,
        name: ao.profile?.orgName || '—',
        state: getStateName(ao.profile?.state),
        district: getDistrictName(ao.profile?.district, ao.profile?.state),
        poc: ao.profile?.pocName || '—',
        vles: String(ao.vleCount ?? 0),
        prob: String(ao.probCount ?? 0),
        probVle: String(ao.probVleCount ?? 0),
      }));
    }
    return (pendingData?.data?.aos || []).map(ao => ({
      id: ao._id,
      name: ao.profile?.orgName || '—',
      state: getStateName(ao.profile?.state),
      district: getDistrictName(ao.profile?.district, ao.profile?.state),
      poc: ao.profile?.pocName || '—',
    }));
  }, [activeTab, approvedData, pendingData]);

  const paginationProps = useMemo(() => {
    const raw = activeTab === 'approved'
      ? approvedData?.data?.pagination
      : pendingData?.data?.pagination;
    const totalPages = raw?.totalPages ?? 1;
    return {
      currentPage,
      totalPages,
      onPageChange: setCurrentPage,
      onPrevious: () => setCurrentPage(p => Math.max(1, p - 1)),
      onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
      canGoPrevious: currentPage > 1,
      canGoNext: currentPage < totalPages,
    };
  }, [activeTab, approvedData, pendingData, currentPage]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">
          Affiliated organizations
        </h1>
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
            { id: 'pending', label: 'Pending' }
          ]}
          className='w-xs'
        />

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-6 sm:mt-8 border border-accent-green-light">
          {activeTab === 'approved' && (
            <div className="p-4 bg-white border-b border-input-border">
              <AoFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setSelectedDistrict(''); setCurrentPage(1); }}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(val) => { setSelectedDistrict(val); setCurrentPage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                districtOptions={districtOptions}
                showNOFilter={false}
              />
            </div>
          )}

          <AoTable
            data={tableData}
            activeTab={activeTab}
            isLoading={isLoading}
            pagination={paginationProps}
          />
        </div>
      </div>
    </div>
  );
};

export default AffiliatedOrganizations;
