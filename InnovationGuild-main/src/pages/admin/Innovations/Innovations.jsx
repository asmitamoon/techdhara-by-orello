import { useState, useMemo, useEffect } from 'react';
import Tabs from '../../../components/admin/Tabs';
import InnovationTable from '../../../components/admin/Tables/InnovationTable/InnovationTable';
import InnovationFilter from '../../../components/admin/Tables/InnovationTable/InnovationFilter';
import { getStateOptions } from '../../../utils/LocationData/locationData';
import useDebounce from '../../../hooks/useDebounce';
import {
  useGetAdminApprovedInnovations,
  useGetAdminPendingInnovations,
} from '../../../hooks/queries/admin';
import { INNOVATION_CATEGORY_OPTIONS, INNOVATION_SUBCATEGORY_OPTIONS } from '../../../utils/constants/innovationConstants';

const Innovations = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const categoryOptions = INNOVATION_CATEGORY_OPTIONS;
  const subCategoryOptions = INNOVATION_SUBCATEGORY_OPTIONS;

  const debouncedSearch = useDebounce(searchQuery);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, activeTab, selectedState, selectedCategory, selectedSubCategory]);

  const approvedParams = activeTab === 'approved' ? {
    page: currentPage,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedState && { state: selectedState }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedSubCategory && { subCategory: selectedSubCategory }),
  } : null;

  const pendingParams = activeTab === 'pending' ? { page: currentPage, limit: 10 } : null;

  const { data: approvedData, isLoading: approvedLoading } = useGetAdminApprovedInnovations(approvedParams);
  const { data: pendingData, isLoading: pendingLoading } = useGetAdminPendingInnovations(pendingParams);

  const isLoading = approvedLoading || pendingLoading;

  const tableData = useMemo(() => {
    if (activeTab === 'approved') {
      return (approvedData?.data?.innovations || []).map(i => ({
        id: i._id,
        innovationName: i.innovationName || '—',
        innovatorName: (i.innovatorId?.enterpriseName && i.innovatorId.enterpriseName !== 'NA') ? i.innovatorId.enterpriseName : (i.innovatorId?.fullName || '—'),
        innovatorId: i.innovatorId?._id,
        category: i.category || [],
        subCategory: i.subcategory || [],
        headquarters: i.salesLocation || [],
        noImplemented: i.noImplemented ?? 0,
      }));
    }
    return (pendingData?.data?.innovations || []).map(i => ({
      id: i._id,
      innovationName: i.innovationName || '—',
      innovatorName: (i.innovatorId?.enterpriseName && i.innovatorId.enterpriseName !== 'NA') ? i.innovatorId.enterpriseName : (i.innovatorId?.fullName || '—'),
      innovatorId: i.innovatorId?._id,
      category: i.category || [],
      subCategory: i.subcategory || [],
      headquarters: i.salesLocation || [],
    }));
  }, [activeTab, approvedData, pendingData]);

  const activeData = activeTab === 'approved' ? approvedData : pendingData;
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
    setSelectedCategory('');
    setSelectedSubCategory('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">Innovations</h1>
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

        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden mt-6 sm:mt-8 border border-accent-green-light">
          {activeTab === 'approved' && (
            <div className="p-4 bg-white border-b border-input-border">
              <InnovationFilter
                searchQuery={searchQuery}
                setSearchQuery={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setCurrentPage(1); }}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={(val) => { setSelectedSubCategory(val); setCurrentPage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                categoryOptions={categoryOptions}
                subCategoryOptions={subCategoryOptions}
              />
            </div>
          )}

          <InnovationTable
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

export default Innovations;
