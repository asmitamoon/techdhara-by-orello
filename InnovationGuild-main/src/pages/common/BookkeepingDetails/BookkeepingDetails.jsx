import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createBookkeepingSchema } from '../../../schemas/bookkeepingSchema';
import DatePickerSelector from './_components/DatePickerSelector';
import { BUSINESS_MODEL_PERSONAS, RENTAL_TYPE_OPTIONS } from '../../../utils/constants/businessModelConstants';
import { useGetBookkeepingContext } from '../../../hooks/queries/vle';
import { useCreateBookkeepingEntry } from '../../../hooks/mutations/vle';

const BookkeepingDetails = () => {
  const { id: pilotId } = useParams();
  const navigate = useNavigate();

  const { data: contextData, isLoading: contextLoading } = useGetBookkeepingContext(pilotId);
  const selectedPersonas = contextData?.data?.personaInterest || [];
  const innovationName = contextData?.data?.innovationName || '';
  const pilotMinDate = contextData?.data?.minDate ? new Date(contextData.data.minDate) : undefined;

  const { mutateAsync: createEntry, isPending } = useCreateBookkeepingEntry();

  const bookkeepingSchema = useMemo(() => createBookkeepingSchema(selectedPersonas), [selectedPersonas]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookkeepingSchema),
    defaultValues: {
      selectedDate: new Date(),
      selectedPeriod: 'Daily',
      unitsSold: '',
      pricePerUnit: '',
      unitsServiced: '',
      servicingType: '',
      avgServiceCharge: '',
      sparesReplaced: '',
      spareEarnings: '',
      rentalType: null,
      rentalCount: '',
      rentalUsers: '',
      rentalCharge: '',
      fabricationUnits: '',
      fabricationCost: '',
      fabricationSellingPrice: '',
      fabricationSold: '',
    }
  });

  const onFormSubmit = async (data) => {
    const d = data.selectedDate;
    const selectedDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const payload = {
      pilotId,
      selectedDate: selectedDateStr,
      selectedPeriod: data.selectedPeriod,
    };

    // Only include non-null numeric fields
    ['unitsSold', 'pricePerUnit', 'unitsServiced', 'avgServiceCharge', 'spareEarnings',
     'rentalCount', 'rentalUsers', 'rentalCharge', 'fabricationUnits', 'fabricationCost',
     'fabricationSellingPrice', 'fabricationSold'].forEach(f => {
      if (data[f] !== null) payload[f] = data[f];
    });
    if (data.servicingType) payload.servicingType = data.servicingType;
    if (data.sparesReplaced) payload.sparesReplaced = data.sparesReplaced;
    if (data.rentalType) payload.rentalType = data.rentalType;

    try {
      await createEntry(payload);
      toast.success('Bookkeeping entry submitted successfully!');
      navigate(`/bookkeeping/${pilotId}`);
    } catch {
      // onError in hook shows toast
    }
  };

  return (
    <div className="min-h-screen bg-light pt-navbar pb-20">
      <div className="container">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="bg-white border border-accent-green-dark rounded-[24px] md:rounded-[32px] p-4 md:p-8">

            <h1 className="text-2xl md:text-4xl font-normal text-primary mb-3 sm:mb-6">
              {contextLoading ? 'Loading...' : innovationName}
            </h1>

            <DatePickerSelector
              initialDate={new Date()}
              onDateChange={(date) => setValue('selectedDate', date)}
              onPeriodChange={(period) => setValue('selectedPeriod', period)}
              minDate={pilotMinDate}
            />

            <div className="space-y-10 sm:space-y-12">

              {/* Sales */}
              {selectedPersonas.includes(BUSINESS_MODEL_PERSONAS[0]) && (
              <div className="form-section">
                <div className="form-section-header">Sales</div>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="form-label">How many units sold?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('unitsSold')} className={`form-input ${errors.unitsSold ? 'border-red-500' : ''}`} placeholder="e.g. 10" />
                    {errors.unitsSold && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.unitsSold.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">At what price have you sold per unit?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('pricePerUnit')} className={`form-input ${errors.pricePerUnit ? 'border-red-500' : ''}`} placeholder="e.g. 5000" />
                    {errors.pricePerUnit && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.pricePerUnit.message}</p>}
                  </div>
                </div>
              </div>
              )}

              {/* Service */}
              {selectedPersonas.includes(BUSINESS_MODEL_PERSONAS[2]) && (
              <div className="form-section">
                <div className="form-section-header">Service</div>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="form-label">How many units have you serviced?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('unitsServiced')} className={`form-input ${errors.unitsServiced ? 'border-red-500' : ''}`} placeholder="e.g. 8" />
                    {errors.unitsServiced && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.unitsServiced.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">What type of servicing have you provided?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('servicingType')} className={`form-input ${errors.servicingType ? 'border-red-500' : ''}`} placeholder="e.g. Maintenance" />
                    {errors.servicingType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.servicingType.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">What are you charging on average for per service?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('avgServiceCharge')} className={`form-input ${errors.avgServiceCharge ? 'border-red-500' : ''}`} placeholder="e.g. 2000" />
                    {errors.avgServiceCharge && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.avgServiceCharge.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">What spares are you mostly replacing?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('sparesReplaced')} className={`form-input ${errors.sparesReplaced ? 'border-red-500' : ''}`} placeholder="e.g. Blades" />
                    {errors.sparesReplaced && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.sparesReplaced.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">How much are you earning for spare replacements?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('spareEarnings')} className={`form-input ${errors.spareEarnings ? 'border-red-500' : ''}`} placeholder="e.g. 3000" />
                    {errors.spareEarnings && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.spareEarnings.message}</p>}
                  </div>
                </div>
              </div>
              )}

              {/* Rental */}
              {selectedPersonas.includes(BUSINESS_MODEL_PERSONAS[1]) && (
              <div className="form-section">
                <div className="form-section-header">Rental</div>
                <div className="mt-4 space-y-6 sm:space-y-8">
                  <div>
                    <label className="form-label">What kind of rental are you doing?<span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-6 sm:gap-10 mt-3">
                      {RENTAL_TYPE_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            {...register('rentalType')}
                            value={option.value}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green cursor-pointer"
                          />
                          <span className="text-muted font-normal">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.rentalType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.rentalType.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                    <div>
                      <label className="form-label">How many rentals have you done?<span className="text-red-500">*</span></label>
                      <input type="text" {...register('rentalCount')} className={`form-input ${errors.rentalCount ? 'border-red-500' : ''}`} placeholder="e.g. 15" />
                      {errors.rentalCount && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.rentalCount.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">To how many users?<span className="text-red-500">*</span></label>
                      <input type="text" {...register('rentalUsers')} className={`form-input ${errors.rentalUsers ? 'border-red-500' : ''}`} placeholder="e.g. 12" />
                      {errors.rentalUsers && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.rentalUsers.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">What are you charging per rental?<span className="text-red-500">*</span></label>
                      <input type="text" {...register('rentalCharge')} className={`form-input ${errors.rentalCharge ? 'border-red-500' : ''}`} placeholder="e.g. 4000" />
                      {errors.rentalCharge && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.rentalCharge.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Fabrication */}
              {selectedPersonas.includes(BUSINESS_MODEL_PERSONAS[3]) && (
              <div className="form-section">
                <div className="form-section-header">Fabrication</div>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="form-label">How many units are you fabricating?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('fabricationUnits')} className={`form-input ${errors.fabricationUnits ? 'border-red-500' : ''}`} placeholder="e.g. 20" />
                    {errors.fabricationUnits && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fabricationUnits.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">What is the cost of fabrication of each unit?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('fabricationCost')} className={`form-input ${errors.fabricationCost ? 'border-red-500' : ''}`} placeholder="e.g. 8000" />
                    {errors.fabricationCost && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fabricationCost.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">How much are you selling one unit for?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('fabricationSellingPrice')} className={`form-input ${errors.fabricationSellingPrice ? 'border-red-500' : ''}`} placeholder="e.g. 10000" />
                    {errors.fabricationSellingPrice && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fabricationSellingPrice.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">How many have you sold (for the selected period)?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('fabricationSold')} className={`form-input ${errors.fabricationSold ? 'border-red-500' : ''}`} placeholder="e.g. 15" />
                    {errors.fabricationSold && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fabricationSold.message}</p>}
                  </div>
                </div>
              </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 lg:mt-12">
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/bookkeeping/${pilotId}`)}
                className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading"
              >
                Cancel
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default BookkeepingDetails;
