import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3 } from 'lucide-react';
import { businessModelSchema } from '../../../schemas/businessModelSchema';
import { PERSONA_OPTIONS, ASSESSMENT_READINESS_OPTIONS } from '../../../utils/constants/businessModelConstants';

const BusinessModelForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit, onCancel }, ref) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(businessModelSchema),
    defaultValues: initialData || {
      personaInterest: [],
      assessmentReadiness: [],
      initialCost: '',
      fieldCapacity: '',
      customHiringCharges: '',
      estimatedRevenue: '',
      paybackPeriod: '',
      inventoryCosts: '',
      logisticsCosts: '',
      salesTargetYear: '',
      commissionsPlanned: '',
      estimatedRevenueSales: '',
      servicingInventoryCosts: '',
      servicingLogisticsCosts: '',
      servicingTargetYear: '',
      servicingCommissionPlanned: '',
      machinesPlanned: '',
      costFabrication: '',
      sellingPrice: '',
      estimatedRevenueAssembly: ''
    }
  });

  const personaInterest = watch('personaInterest') || [];
  const assessmentReadiness = watch('assessmentReadiness') || [];

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

  const handleCheckboxToggle = (field, value) => {
    if (!isEditMode) return;
    const currentValues = watch(field) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default px-0 font-medium text-primary' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="border-b border-input-border pb-3 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-primary font-heading">Business Model Details</h2>
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
        <div className="space-y-8 sm:space-y-10">
          
          {/* Persona Selection */}
          <div className="form-section">
            <div className="form-section-header">Persona Selection</div>
            <div className="mt-2">
              <label className="text-primary mb-4 block font-medium">
                Which persona/s is the VLE interested in?<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-6 sm:gap-10">
                {PERSONA_OPTIONS.map((persona) => (
                  <label key={persona.value} className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}>
                    <input
                      type="checkbox"
                      checked={personaInterest.includes(persona.value)}
                      onChange={() => handleCheckboxToggle('personaInterest', persona.value)}
                      disabled={!isEditMode}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green rounded-full border-gray-400 disabled:opacity-100"
                    />
                    <span className="radio-label">{persona.label}</span>
                  </label>
                ))}
              </div>
              {errors.personaInterest && <p className="text-red-500 text-xs mt-2">{errors.personaInterest.message}</p>}
            </div>
          </div>

          {/* Assessment of VLE readiness */}
          {personaInterest.length > 0 && (
            <div className="form-section">
              <div className="form-section-header">Assessment of VLE readiness</div>
              <div className="mt-4 space-y-6">
                {!isEditMode && assessmentReadiness.length === 0 ? (
                  <p className="text-muted italic">No readiness assessment provided.</p>
                ) : (
                  <div className="space-y-6">
                    {ASSESSMENT_READINESS_OPTIONS
                      .filter(category => personaInterest.includes(category.persona))
                      .map((category, idx) => (
                        <div key={idx}>
                          <h4 className="text-base sm:text-lg font-medium text-primary mb-3">{category.category}</h4>
                          <div className="space-y-2">
                            {category.options.map((option) => (
                              <label key={option.value} className={`flex items-start gap-3 ${isEditMode ? 'cursor-pointer group' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={assessmentReadiness.includes(option.value)}
                                  onChange={() => handleCheckboxToggle('assessmentReadiness', option.value)}
                                  disabled={!isEditMode}
                                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-accent-green-dark focus:ring-accent-green rounded-full border-gray-400 disabled:opacity-100"
                                />
                                <span className="text-sm sm:text-base text-muted font-normal">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Hiring Rental Section */}
          {personaInterest.includes('rental') && (
            <div className="form-section">
              <div className="form-section-header">Custom Hiring/Rental</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Initial Cost of the Machine<span className="text-red-500">*</span></label>
                  <input type="text" {...register('initialCost')} className={inputClass(errors.initialCost)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.initialCost && <p className="text-red-500 text-xs mt-1">{errors.initialCost.message}</p>}
                </div>
                <div>
                  <label className="form-label">Field Capacity, acre h-1<span className="text-red-500">*</span></label>
                  <input type="text" {...register('fieldCapacity')} className={inputClass(errors.fieldCapacity)} placeholder="e.g. 1.5" readOnly={!isEditMode} />
                  {errors.fieldCapacity && <p className="text-red-500 text-xs mt-1">{errors.fieldCapacity.message}</p>}
                </div>
                <div>
                  <label className="form-label">Custom hiring charges (without logistics)<span className="text-red-500">*</span></label>
                  <input type="text" {...register('customHiringCharges')} className={inputClass(errors.customHiringCharges)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.customHiringCharges && <p className="text-red-500 text-xs mt-1">{errors.customHiringCharges.message}</p>}
                </div>
                <div>
                  <label className="form-label">Estimated revenue per year<span className="text-red-500">*</span></label>
                  <input type="text" {...register('estimatedRevenue')} className={inputClass(errors.estimatedRevenue)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.estimatedRevenue && <p className="text-red-500 text-xs mt-1">{errors.estimatedRevenue.message}</p>}
                </div>
                <div>
                  <label className="form-label">Payback period<span className="text-red-500">*</span></label>
                  <input type="text" {...register('paybackPeriod')} className={inputClass(errors.paybackPeriod)} placeholder="e.g. 12" readOnly={!isEditMode} />
                  {errors.paybackPeriod && <p className="text-red-500 text-xs mt-1">{errors.paybackPeriod.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Sales Section */}
          {personaInterest.includes('sales') && (
            <div className="form-section">
              <div className="form-section-header">Sales</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Inventory Costs<span className="text-red-500">*</span></label>
                  <input type="text" {...register('inventoryCosts')} className={inputClass(errors.inventoryCosts)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.inventoryCosts && <p className="text-red-500 text-xs mt-1">{errors.inventoryCosts.message}</p>}
                </div>
                <div>
                  <label className="form-label">Logistics Costs<span className="text-red-500">*</span></label>
                  <input type="text" {...register('logisticsCosts')} className={inputClass(errors.logisticsCosts)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.logisticsCosts && <p className="text-red-500 text-xs mt-1">{errors.logisticsCosts.message}</p>}
                </div>
                <div>
                  <label className="form-label">Sales target per year<span className="text-red-500">*</span></label>
                  <input type="text" {...register('salesTargetYear')} className={inputClass(errors.salesTargetYear)} placeholder="e.g. 100" readOnly={!isEditMode} />
                  {errors.salesTargetYear && <p className="text-red-500 text-xs mt-1">{errors.salesTargetYear.message}</p>}
                </div>
                <div>
                  <label className="form-label">Commissions planned<span className="text-red-500">*</span></label>
                  <input type="text" {...register('commissionsPlanned')} className={inputClass(errors.commissionsPlanned)} placeholder="e.g. 5000" readOnly={!isEditMode} />
                  {errors.commissionsPlanned && <p className="text-red-500 text-xs mt-1">{errors.commissionsPlanned.message}</p>}
                </div>
                <div>
                  <label className="form-label">Estimated revenue per year<span className="text-red-500">*</span></label>
                  <input type="text" {...register('estimatedRevenueSales')} className={inputClass(errors.estimatedRevenueSales)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.estimatedRevenueSales && <p className="text-red-500 text-xs mt-1">{errors.estimatedRevenueSales.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Servicing Section */}
          {personaInterest.includes('servicing') && (
            <div className="form-section">
              <div className="form-section-header">Servicing</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Inventory Costs<span className="text-red-500">*</span></label>
                  <input type="text" {...register('servicingInventoryCosts')} className={inputClass(errors.servicingInventoryCosts)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.servicingInventoryCosts && <p className="text-red-500 text-xs mt-1">{errors.servicingInventoryCosts.message}</p>}
                </div>
                <div>
                  <label className="form-label">Logistics Costs<span className="text-red-500">*</span></label>
                  <input type="text" {...register('servicingLogisticsCosts')} className={inputClass(errors.servicingLogisticsCosts)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.servicingLogisticsCosts && <p className="text-red-500 text-xs mt-1">{errors.servicingLogisticsCosts.message}</p>}
                </div>
                <div>
                  <label className="form-label">Servicing target per year<span className="text-red-500">*</span></label>
                  <input type="text" {...register('servicingTargetYear')} className={inputClass(errors.servicingTargetYear)} placeholder="e.g. 100" readOnly={!isEditMode} />
                  {errors.servicingTargetYear && <p className="text-red-500 text-xs mt-1">{errors.servicingTargetYear.message}</p>}
                </div>
                <div>
                  <label className="form-label">Commission planned<span className="text-red-500">*</span></label>
                  <input type="text" {...register('servicingCommissionPlanned')} className={inputClass(errors.servicingCommissionPlanned)} placeholder="e.g. 5000" readOnly={!isEditMode} />
                  {errors.servicingCommissionPlanned && <p className="text-red-500 text-xs mt-1">{errors.servicingCommissionPlanned.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Fabrication/Assembly Section */}
          {personaInterest.includes('fabrication') && (
            <div className="form-section">
              <div className="form-section-header">Fabrication/Assembly</div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Number of machines planned for one year<span className="text-red-500">*</span></label>
                  <input type="text" {...register('machinesPlanned')} className={inputClass(errors.machinesPlanned)} placeholder="e.g. 100" readOnly={!isEditMode} />
                  {errors.machinesPlanned && <p className="text-red-500 text-xs mt-1">{errors.machinesPlanned.message}</p>}
                </div>
                <div>
                  <label className="form-label">Cost of fabrication per machine<span className="text-red-500">*</span></label>
                  <input type="text" {...register('costFabrication')} className={inputClass(errors.costFabrication)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.costFabrication && <p className="text-red-500 text-xs mt-1">{errors.costFabrication.message}</p>}
                </div>
                <div>
                  <label className="form-label">Selling price per machine<span className="text-red-500">*</span></label>
                  <input type="text" {...register('sellingPrice')} className={inputClass(errors.sellingPrice)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice.message}</p>}
                </div>
                <div>
                  <label className="form-label">Estimated revenue per year<span className="text-red-500">*</span></label>
                  <input type="text" {...register('estimatedRevenueAssembly')} className={inputClass(errors.estimatedRevenueAssembly)} placeholder="e.g. 50000" readOnly={!isEditMode} />
                  {errors.estimatedRevenueAssembly && <p className="text-red-500 text-xs mt-1">{errors.estimatedRevenueAssembly.message}</p>}
                </div>
              </div>
            </div>
          )}

        </div>

        {isEditMode && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading"
            >
              Submit
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
});

BusinessModelForm.displayName = 'BusinessModelForm';

export default BusinessModelForm;
