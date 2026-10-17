import { useState } from 'react'
import { useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import SlidingTabSwitch from './_components/SlidingTabSwitch.jsx'
import InnovationRequestForm from './_components/InnovationRequestForm.jsx'
import ServiceRequestForm from './_components/ServiceRequestForm.jsx'

const ProblemSubmissionPage = () => {
  const { type, id } = useParams();
  const isEditMode = !!id;
  const [activeTab, setActiveTab] = useState(isEditMode ? type : 'innovation');

  const tabs = [
    { label: 'Innovation Request', value: 'innovation' },
    { label: 'Service Request', value: 'service' }
  ];

  return (
    <div className="min-h-screen bg-light">
      <PageHeader variant="innovations" title={isEditMode ? 'Edit Problem Statement' : 'Problem Statement'} />

      <div className="container py-8 sm:py-10 lg:py-12">

        {!isEditMode && (
          <SlidingTabSwitch
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'innovation' ? <InnovationRequestForm id={id} /> : <ServiceRequestForm id={id} />}
        </div>

      </div>
    </div>
  )
}

export default ProblemSubmissionPage;