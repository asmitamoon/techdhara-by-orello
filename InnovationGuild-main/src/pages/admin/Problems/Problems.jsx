import { useState, useMemo, useEffect } from 'react';
import Tabs from '../../../components/admin/Tabs';
import InnovationRequestTable from '../../../components/admin/Tables/ProblemTable/InnovationRequestTable';
import ServiceRequestTable from '../../../components/admin/Tables/ProblemTable/ServiceRequestTable';
import ProblemFilter from '../../../components/admin/Tables/ProblemTable/ProblemFilter';
import { getStateOptions, getDistrictOptions, getStateName, getDistrictName } from '../../../utils/LocationData/locationData';
import { useGetAdminProblems, useGetAdminServiceRequests } from '../../../hooks/queries/admin';
import { useOperations } from '../../../hooks/queries/public';
import { PROBLEM_CATEGORY_OPTIONS, UNIT_TYPE_OPTIONS, OWNERSHIP_OPTIONS } from '../../../utils/constants/problemConstants';
import useDebounce from '../../../hooks/useDebounce';

const LIMIT = 20;

const Problems = () => {
  const [activeTab, setActiveTab] = useState('innovation'); // innovation | service
  const [activeStatusTab, setActiveStatusTab] = useState('approved'); // approved | pending
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [selectedOwnership, setSelectedOwnership] = useState('');
  const [innovationPage, setInnovationPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery);

  useEffect(() => { setInnovationPage(1); setServicePage(1); }, [debouncedSearch]);

  // Constants
  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(() => {
    return selectedState ? getDistrictOptions(selectedState) : [];
  }, [selectedState]);

  const categoryOptions = PROBLEM_CATEGORY_OPTIONS;
  const { data: operationOptions = [] } = useOperations();

  const unitTypeOptions = UNIT_TYPE_OPTIONS;
  const ownershipOptions = OWNERSHIP_OPTIONS;

  // Query params — null when tab is inactive (disables the query)
  const innovationParams = activeTab === 'innovation' ? {
    page: innovationPage,
    limit: LIMIT,
    status: activeStatusTab === 'approved' ? 'PUBLISHED' : 'PENDING_APPROVAL',
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedOperation && { operation: selectedOperation }),
    ...(selectedState && { state: selectedState }),
    ...(selectedDistrict && { district: selectedDistrict }),
  } : null;

  const serviceParams = activeTab === 'service' ? {
    page: servicePage,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedUnitType && { unitType: selectedUnitType }),
    ...(selectedOwnership && { ownership: selectedOwnership }),
  } : null;

  const { data: innovationData, isLoading: innovationLoading } = useGetAdminProblems(innovationParams);
  const { data: serviceData, isLoading: serviceLoading } = useGetAdminServiceRequests(serviceParams);

  // Map API data to table shape
  const innovationTableData = useMemo(() => (innovationData?.data?.problems || []).map(p => ({
    id: p.id,
    posterType: p.posterType || 'VLE',
    profileId: p.profileId || null,
    title: p.title || '—',
    vle: p.vle || '—',
    category: p.category || null,
    subCategory: p.subCategory?.length ? p.subCategory : null,
    operations: p.operations?.length ? p.operations : null,
    state: getStateName(p.state),
    district: getDistrictName(p.district, p.state),
    nodalOrg: p.nodalOrg || '—',
    affiliatedOrg: p.affiliatedOrg || '—',
  })), [innovationData]);

  const serviceTableData = useMemo(() => (serviceData?.data?.serviceRequests || []).map(sr => ({
    id: sr.id,
    posterType: sr.posterType || 'VLE',
    profileId: sr.profileId || null,
    techName: sr.techName || '—',
    vle: sr.vle || '—',
    techCompany: sr.techCompany || '—',
    unitType: sr.unitType || '—',
    ownership: sr.ownership || '—',
    nodalOrg: sr.nodalOrg || '—',
    affiliatedOrg: sr.affiliatedOrg || '—',
  })), [serviceData]);

  // Pagination
  const innovationPagination = innovationData?.data?.pagination;
  const servicePagination = serviceData?.data?.pagination;

  const innovationTotalPages = innovationPagination?.totalPages || 1;
  const serviceTotalPages = servicePagination?.totalPages || 1;

  const innovationPaginationProps = {
    currentPage: innovationPage,
    totalPages: innovationTotalPages,
    onPageChange: setInnovationPage,
    onPrevious: () => setInnovationPage(prev => Math.max(1, prev - 1)),
    onNext: () => setInnovationPage(prev => Math.min(innovationTotalPages, prev + 1)),
    canGoPrevious: innovationPage > 1,
    canGoNext: innovationPage < innovationTotalPages,
  };

  const servicePaginationProps = {
    currentPage: servicePage,
    totalPages: serviceTotalPages,
    onPageChange: setServicePage,
    onPrevious: () => setServicePage(prev => Math.max(1, prev - 1)),
    onNext: () => setServicePage(prev => Math.min(serviceTotalPages, prev + 1)),
    canGoPrevious: servicePage > 1,
    canGoNext: servicePage < serviceTotalPages,
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCategory('');
    setSelectedOperation('');
    setSelectedUnitType('');
    setSelectedOwnership('');
    setInnovationPage(1);
    setServicePage(1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <h1 className="text-6xl font-regular mb-6">
          Problem Statements
        </h1>
        <div className="border-t mt-5 sm:mt-6 border-accent-green-dark"></div>

        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row gap-4">
            <Tabs
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setActiveStatusTab('approved');
                handleClearFilters();
              }}
              tabs={[
                { id: 'innovation', label: 'Innovation Requests' },
                { id: 'service', label: 'Service Requests' }
              ]}
              className="w-full sm:w-md"
            />

            {activeTab === 'innovation' && (
              <Tabs
                activeTab={activeStatusTab}
                onChange={(tab) => {
                  setActiveStatusTab(tab);
                  handleClearFilters();
                }}
                tabs={[
                  { id: 'approved', label: 'Approved' },
                  { id: 'pending', label: 'Pending' }
                ]}
                className="w-full sm:w-xs"
              />
            )}
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] shadow-lg overflow-hidden border border-accent-green-light">
            <div className="p-4 bg-white border-b border-input-border">
              <ProblemFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedState={selectedState}
                setSelectedState={(val) => { setSelectedState(val); setInnovationPage(1); }}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={(val) => { setSelectedDistrict(val); setInnovationPage(1); }}
                selectedCategory={selectedCategory}
                setSelectedCategory={(val) => { setSelectedCategory(val); setInnovationPage(1); }}
                selectedOperation={selectedOperation}
                setSelectedOperation={(val) => { setSelectedOperation(val); setInnovationPage(1); }}
                selectedUnitType={selectedUnitType}
                setSelectedUnitType={(val) => { setSelectedUnitType(val); setServicePage(1); }}
                selectedOwnership={selectedOwnership}
                setSelectedOwnership={(val) => { setSelectedOwnership(val); setServicePage(1); }}
                onClearFilters={handleClearFilters}
                stateOptions={stateOptions}
                districtOptions={districtOptions}
                categoryOptions={categoryOptions}
                operationOptions={operationOptions}
                unitTypeOptions={unitTypeOptions}
                ownershipOptions={ownershipOptions}
                showCategoryFilters={activeTab === 'innovation'}
              />
            </div>

            {activeTab === 'innovation' ? (
              <InnovationRequestTable
                data={innovationTableData}
                isLoading={innovationLoading}
                pagination={innovationPaginationProps}
                showVleColumn={true}
                routePrefix='/admin'
              />
            ) : (
              <ServiceRequestTable
                data={serviceTableData}
                isLoading={serviceLoading}
                pagination={servicePaginationProps}
                showVleColumn={true}
                routePrefix='/admin'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;
