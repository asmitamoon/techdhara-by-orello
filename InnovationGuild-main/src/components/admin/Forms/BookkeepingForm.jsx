import { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3 } from 'lucide-react';
import { createBookkeepingSchema } from '../../../schemas/bookkeepingSchema';
import DatePickerSelector from '../../../pages/common/BookkeepingDetails/_components/DatePickerSelector';
import { RENTAL_TYPE_OPTIONS } from '../../../utils/constants/businessModelConstants';

const BookkeepingForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit, selectedPersonas = ['sales', 'servicing', 'rental', 'fabrication'] }, ref) => {
  const bookkeepingSchema = useMemo(() => createBookkeepingSchema(selectedPersonas), [selectedPersonas]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(bookkeepingSchema),
    defaultValues: initialData || {
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

  // Expose submit trigger to parent
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onFormSubmit)();
    }
  }));

  // Reset form to initial data when edit mode is cancelled
  useEffect(() => {
    if (!isEditMode && initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key, initialData[key]);
      });
    }
  }, [isEditMode, initialData, setValue]);

  const onFormSubmit = (data) => {
    if (onDataChange) onDataChange(data);
    if (onSubmit) onSubmit(data);
  };

  // Sync on every change
  useEffect(() => {
    const subscription = watch((data) => {
      if (onDataChange) onDataChange(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default px-0 font-medium text-primary' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="border-b border-input-border pb-3 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-primary font-heading">Bookkeeping Details</h2>
          <Info size={16} className="text-muted" />
        </div>
        {!isEditMode && onEditToggle && (
          <button
            type="button"
            onClick={onEditToggle}
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent-green-dark border border-accent-green-dark rounded-lg hover:bg-accent-green/5 transition-colors cursor-pointer font-medium"
          >
            <Edit3 size={16} />
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="mb-6">
          <DatePickerSelector
            initialDate={watch('selectedDate')}
            onDateChange={(date) => isEditMode && setValue('selectedDate', date)}
            onPeriodChange={(period) => isEditMode && setValue('selectedPeriod', period)}
            isDisabled={!isEditMode}
          />
        </div>

        <div className="space-y-10 sm:space-y-12">
          {/* Sales */}
          {selectedPersonas.includes('sales') && (
            <div className="form-section">
              <div className="form-section-header">Sales</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">How many units sold?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('unitsSold')} className={inputClass(errors.unitsSold)} placeholder="e.g. 10" readOnly={!isEditMode} />
                  {errors.unitsSold && <p className="text-red-500 text-xs mt-1">{errors.unitsSold.message}</p>}
                </div>
                <div>
                  <label className="form-label">At what price have you sold per unit?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('pricePerUnit')} className={inputClass(errors.pricePerUnit)} placeholder="e.g. 5000" readOnly={!isEditMode} />
                  {errors.pricePerUnit && <p className="text-red-500 text-xs mt-1">{errors.pricePerUnit.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Service */}
          {selectedPersonas.includes('servicing') && (
            <div className="form-section">
              <div className="form-section-header">Service</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">How many units have you serviced?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('unitsServiced')} className={inputClass(errors.unitsServiced)} placeholder="e.g. 8" readOnly={!isEditMode} />
                  {errors.unitsServiced && <p className="text-red-500 text-xs mt-1">{errors.unitsServiced.message}</p>}
                </div>
                <div>
                  <label className="form-label">What type of servicing have you provided?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('servicingType')} className={inputClass(errors.servicingType)} placeholder="e.g. Maintenance" readOnly={!isEditMode} />
                  {errors.servicingType && <p className="text-red-500 text-xs mt-1">{errors.servicingType.message}</p>}
                </div>
                <div>
                  <label className="form-label">What are you charging on average for per service?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('avgServiceCharge')} className={inputClass(errors.avgServiceCharge)} placeholder="e.g. 2000" readOnly={!isEditMode} />
                  {errors.avgServiceCharge && <p className="text-red-500 text-xs mt-1">{errors.avgServiceCharge.message}</p>}
                </div>
                <div>
                  <label className="form-label">What spares are you mostly replacing?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('sparesReplaced')} className={inputClass(errors.sparesReplaced)} placeholder="e.g. Blades" readOnly={!isEditMode} />
                  {errors.sparesReplaced && <p className="text-red-500 text-xs mt-1">{errors.sparesReplaced.message}</p>}
                </div>
                <div>
                  <label className="form-label">How much are you earning for spare replacements?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('spareEarnings')} className={inputClass(errors.spareEarnings)} placeholder="e.g. 3000" readOnly={!isEditMode} />
                  {errors.spareEarnings && <p className="text-red-500 text-xs mt-1">{errors.spareEarnings.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Rental */}
          {selectedPersonas.includes('rental') && (
            <div className="form-section">
              <div className="form-section-header">Rental</div>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="form-label">What kind of rental are you doing?<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    {RENTAL_TYPE_OPTIONS.map((option) => (
                      <label key={option.value} className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}>
                        <input type="radio" {...register('rentalType')} value={option.value} disabled={!isEditMode} className="w-4 h-4 text-accent-green-dark focus:ring-accent-green disabled:opacity-100" />
                        <span className="radio-label font-normal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.rentalType && <p className="text-red-500 text-xs mt-1">{errors.rentalType.message}</p>}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">How many rentals have you done?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('rentalCount')} className={inputClass(errors.rentalCount)} placeholder="e.g. 15" readOnly={!isEditMode} />
                    {errors.rentalCount && <p className="text-red-500 text-xs mt-1">{errors.rentalCount.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">To how many users?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('rentalUsers')} className={inputClass(errors.rentalUsers)} placeholder="e.g. 12" readOnly={!isEditMode} />
                    {errors.rentalUsers && <p className="text-red-500 text-xs mt-1">{errors.rentalUsers.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">What are you charging per rental?<span className="text-red-500">*</span></label>
                    <input type="text" {...register('rentalCharge')} className={inputClass(errors.rentalCharge)} placeholder="e.g. 4000" readOnly={!isEditMode} />
                    {errors.rentalCharge && <p className="text-red-500 text-xs mt-1">{errors.rentalCharge.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fabrication */}
          {selectedPersonas.includes('fabrication') && (
            <div className="form-section">
              <div className="form-section-header">Fabrication</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">How many units are you fabricating?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('fabricationUnits')} className={inputClass(errors.fabricationUnits)} placeholder="e.g. 20" readOnly={!isEditMode} />
                  {errors.fabricationUnits && <p className="text-red-500 text-xs mt-1">{errors.fabricationUnits.message}</p>}
                </div>
                <div>
                  <label className="form-label">What is the cost of fabrication of each unit?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('fabricationCost')} className={inputClass(errors.fabricationCost)} placeholder="e.g. 8000" readOnly={!isEditMode} />
                  {errors.fabricationCost && <p className="text-red-500 text-xs mt-1">{errors.fabricationCost.message}</p>}
                </div>
                <div>
                  <label className="form-label">How much are you selling one unit for?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('fabricationSellingPrice')} className={inputClass(errors.fabricationSellingPrice)} placeholder="e.g. 10000" readOnly={!isEditMode} />
                  {errors.fabricationSellingPrice && <p className="text-red-500 text-xs mt-1">{errors.fabricationSellingPrice.message}</p>}
                </div>
                <div>
                  <label className="form-label">How many have you sold (for the selected period)?<span className="text-red-500">*</span></label>
                  <input type="text" {...register('fabricationSold')} className={inputClass(errors.fabricationSold)} placeholder="e.g. 15" readOnly={!isEditMode} />
                  {errors.fabricationSold && <p className="text-red-500 text-xs mt-1">{errors.fabricationSold.message}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
});

BookkeepingForm.displayName = 'BookkeepingForm';

export default BookkeepingForm;
