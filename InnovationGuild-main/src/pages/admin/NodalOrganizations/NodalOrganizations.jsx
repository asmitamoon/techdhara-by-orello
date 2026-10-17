import React, { useState, useMemo, useEffect } from 'react';
import { getStateOptions, getStateName } from '../../../utils/LocationData/locationData';

// Components
import NoTable from './_components/NoTable';
import NoFilters from './_components/NoFilters';
import Tabs from '../../../components/admin/Tabs';

import { useGetAdminNos } from '../../../hooks/queries/admin';
import useDebounce from '../../../hooks/useDebounce';
import { NO_ORG_TYPE_OPTIONS } from '../../../utils/constants/nodalOrgConstants';

const LIMIT = 20;

const NodalOrganizations = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const typeOptions = NO_ORG_TYPE_OPTIONS;

  const approvedParams = {
    page: currentPage,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedType && { type: selectedType }),
  };

  const { data: approvedData, isLoading: approvedLoading } = useGetAdminNos(
    activeTab === 'approved' ? approvedParams : null
  );
  const { data: pendingData, isLoading: pendingLoading } = useGetAdminNos(
    activeTab === 'pending' ? { status: 'PENDING', page: currentPage, limit: LIMIT } : null
  );

  const isLoading = activeTab === 'approved' ? approvedLoading : pendingLoading;

  const tableData = useMemo(() => {
    const rawList = activeTab === 'approved'
      ? (approvedData?.data?.nodalOrgs || [])
      : (pendingData?.data?.nodalOrgs || []);

    return rawList.map(no => ({
      id: no.userId,
      noList: no.orgName || '—',
      aos: activeTab === 'approved' ? String(no.numberOfRegisteredAOs ?? 0) : undefined,
      type: no.orgType || '—',
      hqState: getStateName(no.hqState) || '—',
      operationalStates: (no.operationalStates || []).map(code => getStateName(code)).filter(Boolean).join(', ') || '—',
      website: no.website || null,
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
    setSelectedType(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">
          Nodal organizations
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
              <NoFilters
                searchQuery={searchQuery}
                setSearchQuery={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                selectedState={selectedState}
                setSelectedState={(val) => {
                  setSelectedState(val);
                  setCurrentPage(1);
                }}
                selectedType={selectedType}
                setSelectedType={(val) => {
                  setSelectedType(val);
                  setCurrentPage(1);
                }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                typeOptions={typeOptions}
              />
            </div>
          )}

          <NoTable
            data={tableData}
            activeTab={activeTab}
            isLoading={isLoading}
            pagination={paginationProps}
          />
        </div>
      </div>
    </div>
  );
}

export default NodalOrganizations
