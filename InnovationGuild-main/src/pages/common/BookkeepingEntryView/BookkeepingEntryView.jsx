import { useParams, useNavigate } from 'react-router';
import BookkeepingForm from '../../../components/admin/Forms/BookkeepingForm';
import { useGetMyBookkeepingEntry } from '../../../hooks/queries/vle';

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

const BookkeepingEntryView = () => {
  const { id: pilotId, entryId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useGetMyBookkeepingEntry(entryId);
  const entry = data?.data?.entry;

  const innovationName = entry?.pilotId?.innovationId?.innovationName;

  return (
    <div className="bg-light pt-navbar min-h-screen">
      <div className="container pb-4 sm:pb-8">

        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <button
            onClick={() => navigate(`/bookkeeping/${pilotId}`)}
            className="flex-shrink-0 p-2 hover:bg-light rounded-lg transition-colors group cursor-pointer"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-muted group-hover:text-dark transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-primary">Bookkeeping Entry</h1>
            {!isLoading && innovationName && (
              <p className="text-sm sm:text-base text-accent-green-dark font-medium mt-0.5">{innovationName}</p>
            )}
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
  );
};

export default BookkeepingEntryView;
