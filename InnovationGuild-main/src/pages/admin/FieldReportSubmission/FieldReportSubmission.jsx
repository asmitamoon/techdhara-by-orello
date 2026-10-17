import React from 'react';
import { useNavigate, useParams } from 'react-router';
import FieldReportForm from '../../../components/admin/Forms/FieldReportForm';

const FieldReportSubmission = () => {
  const navigate = useNavigate();
  const { vleId } = useParams();

  const onSubmit = (data) => {
    console.log('Field Report Submitted:', data);
    // TODO: API call to submit field report
    // Navigate back to field reports list after successful submission
    if (vleId) {
      navigate(`/admin/vles/${vleId}/field-reports`);
    } else {
      navigate('/admin/field-reports');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <div className="flex flex-col gap-8">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
                aria-label="Go back"
              >
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-muted group-hover:text-dark transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-regular text-black">
                Submit Field Report
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the Innovation:</span>
                <span className="text-xl font-semibold text-accent-green-dark">Multi Crop Weeder</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the VLE:</span>
                <span className="text-xl font-semibold text-accent-green-dark">Pattika Ganesh</span>
              </div>
            </div>
          </div>

          <FieldReportForm onSubmit={onSubmit} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default FieldReportSubmission;
