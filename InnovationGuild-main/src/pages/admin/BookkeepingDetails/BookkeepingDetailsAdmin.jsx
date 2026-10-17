import { useParams, useNavigate, useLocation } from 'react-router';
import BookkeepingForm from '../../../components/admin/Forms/BookkeepingForm';
import { useGetAdminBookkeepingById } from '../../../hooks/queries/admin';

const toFormData = (e) => ({
  selectedDate: new Date(e.periodDate),
  selectedPeriod: e.reportingPeriod,
  unitsSold: e.unitsSold ?? '',
  pricePerUnit: e.pricePerUnit ?? '',
  unitsServiced: e.unitsServiced ?? '',
  servicingType: e.servicingType ?? '',
  avgServiceCharge: e.avgServiceCharge ?? '',
  sparesReplaced: e.sparesReplaced ?? '',
  spareEarnings: e.spareEarnings ?? '',
  rentalType: e.rentalType ?? null,
  rentalCount: e.rentalCount ?? '',
  rentalUsers: e.rentalUsers ?? '',
  rentalCharge: e.rentalCharge ?? '',
  fabricationUnits: e.fabricationUnits ?? '',
  fabricationCost: e.fabricationCost ?? '',
  fabricationSellingPrice: e.fabricationSellingPrice ?? '',
  fabricationSold: e.fabricationSold ?? '',
});

const getPersonas = (e) => {
  if (!e) return ['sales', 'servicing', 'rental', 'fabrication'];
  const personas = [];
  if (e.unitsSold != null || e.pricePerUnit != null) personas.push('sales');
  if (e.unitsServiced != null) personas.push('servicing');
  if (e.rentalCount != null) personas.push('rental');
  if (e.fabricationUnits != null) personas.push('fabrication');
  return personas.length > 0 ? personas : ['sales', 'servicing', 'rental', 'fabrication'];
};

const BookkeepingDetailsAdmin = () => {
  const { vleId, bookkeepingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useGetAdminBookkeepingById(bookkeepingId);
  const entry = data?.data?.entry;

  const handleBack = () => {
    if (location.state?.returnTab && vleId) {
      const params = new URLSearchParams();
      params.set('tab', location.state.returnTab);
      if (location.state.returnSubTab) {
        params.set('subtab', location.state.returnSubTab);
      }
      navigate(`/admin/vles/${vleId}?${params.toString()}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <div>
        <div className="flex flex-col gap-8">
          <div className="shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <button
                onClick={handleBack}
                className="shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
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
                Bookkeeping
              </h1>
            </div>
            <div className="border-t mt-6 border-accent-green-dark"></div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the Innovation:</span>
                <span className="text-xl font-semibold text-accent-green-dark">
                  {isLoading ? '...' : entry?.pilotId?.innovationId?.innovationName ?? '—'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium text-muted">Name of the VLE:</span>
                <span className="text-xl font-semibold text-accent-green-dark">
                  {isLoading ? '...' : entry?.pilotId?.vleId?.fullName ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted">Loading...</div>
          ) : entry ? (
            <BookkeepingForm
              initialData={toFormData(entry)}
              selectedPersonas={getPersonas(entry)}
              isEditMode={false}
            />
          ) : (
            <div className="text-center py-12 text-muted">Bookkeeping entry not found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookkeepingDetailsAdmin;
