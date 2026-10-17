import { useState } from 'react';
import PageLoader from '../../../components/ui/PageLoader';
import { Link } from 'react-router';
import ProblemCard from './_components/ProblemCard';
import SelectFilter from '../../../components/ui/SelectFilter';
import TabFilter from '../../../components/ui/TabFilter';
import { useGetMyProblems, useGetMyServiceRequests } from '../../../hooks/queries/common';

const STATUS_MAP = {
  drafts: 'DRAFT',
  submitted: 'PENDING_APPROVAL',
  approved: 'PUBLISHED',
};

const typeOptions = [
  { value: 'innovation', label: 'Innovation Request' },
  { value: 'service', label: 'Service Request' },
];

const innovationStatusOptions = [
  { value: 'drafts', label: 'Drafts' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
];

const serviceStatusOptions = [
  { value: 'drafts', label: 'Drafts' },
  { value: 'submitted', label: 'Submitted' },
];

const MyProblemStatements = () => {
  const [activeType, setActiveType] = useState('innovation');
  const [activeStatus, setActiveStatus] = useState('drafts');

  const statusOptions = activeType === 'innovation' ? innovationStatusOptions : serviceStatusOptions;
  const apiStatus = activeType === 'service' && activeStatus === 'submitted'
    ? 'PUBLISHED'
    : STATUS_MAP[activeStatus];

  const problemsQuery = useGetMyProblems(
    activeType === 'innovation' ? { status: apiStatus, limit: 100 } : null
  );
  const serviceQuery = useGetMyServiceRequests(
    activeType === 'service' ? { status: apiStatus, limit: 100 } : null
  );

  const isLoading = activeType === 'innovation' ? problemsQuery.isLoading : serviceQuery.isLoading;

  const items = activeType === 'innovation'
    ? (problemsQuery.data?.data?.problems ?? []).map(p => ({
        id: p._id,
        title: p.problemTitle,
        description: p.problemDescription,
        author: p.postedBy?.fullName || 'You',
      }))
    : (serviceQuery.data?.data?.serviceRequests ?? []).map(sr => ({
        id: sr._id,
        title: sr.techName,
        description: sr.challenges,
        author: sr.postedBy?.fullName || 'You',
      }));

  const handleTypeChange = (value) => {
    setActiveType(value);
    setActiveStatus('drafts');
  };

  const selectedStatusOption = statusOptions.find(o => o.value === activeStatus);

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">
        <div className="sm:bg-white sm:p-6 lg:p-8 sm:border border-accent-green-dark rounded-[20px] sm:rounded-[24px] lg:rounded-[32px]">

          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl text-primary mb-4 sm:mb-5 lg:mb-6">
              My Problem Statements
            </h1>

            {/* Type tabs + Status tabs + Add button — all in one row */}
            <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <TabFilter
                  options={typeOptions}
                  activeTab={activeType}
                  onChange={handleTypeChange}
                />
                <TabFilter
                  options={statusOptions}
                  activeTab={activeStatus}
                  onChange={setActiveStatus}
                />
              </div>

              <div className="sm:hidden w-full max-w-[140px]">
                <SelectFilter
                  value={selectedStatusOption}
                  onChange={(option) => setActiveStatus(option.value)}
                  options={statusOptions}
                />
              </div>

              <Link
                to="/submit-problem"
                className="inline-flex items-center justify-center gap-2 bg-button-primary hover:bg-button-primary-hover text-white text-sm sm:text-base font-medium px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Problem</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {isLoading ? (
              <div className="col-span-full">
                <PageLoader className="py-10 sm:py-12" />
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <ProblemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  author={item.author}
                  description={item.description}
                  status={activeStatus}
                  type={activeType}
                />
              ))
            ) : (
              <div className="col-span-full py-10 sm:py-12 text-center text-muted">
                No {activeType === 'innovation' ? 'innovation requests' : 'service requests'} found in {activeStatus}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProblemStatements;
