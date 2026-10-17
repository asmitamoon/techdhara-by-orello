import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { getStateOptions, getDistrictOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';

// Components
import Tabs from '../../../components/admin/Tabs';
import AoTable from '../../../components/admin/Tables/AoTable/AoTable';
import AoFilter from '../../../components/admin/Tables/AoTable/AoFilter';

import { useGetApprovedAos, useGetPendingAos } from '../../../hooks/queries/no';
import useDebounce from '../../../hooks/useDebounce';

const LIMIT = 20;

const NOAffiliatedOrganizations = () => {
  const navigate = useNavigate();
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

  const { data: approvedData, isLoading: approvedLoading } = useGetApprovedAos(
    activeTab === 'approved' ? approvedParams : null,
    { enabled: activeTab === 'approved' }
  );
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingAos(
    activeTab === 'pending' ? { page: currentPage, limit: LIMIT } : null,
    { enabled: activeTab === 'pending' }
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
    return (pendingData?.data?.pendingAos || []).map(ao => ({
      id: ao.userId,
      name: ao.orgName || '—',
      state: getStateName(ao.stateCode),
      district: getDistrictName(ao.districtCode, ao.stateCode),
      poc: ao.fullName || '—',
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

        <div className="flex items-center justify-between">
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
            className='w-xs mt-0'
          />

          <button
            onClick={() => navigate('/no/affiliated-organizations/register')}
            className="flex items-center gap-2 px-4 py-2 bg-accent-green-dark border border-accent-green-light text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={20} />
            Create AO
          </button>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden border border-accent-green-dark">
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
            routePrefix="/no"
          />
        </div>
      </div>
    </div>
  );
};

export default NOAffiliatedOrganizations;
