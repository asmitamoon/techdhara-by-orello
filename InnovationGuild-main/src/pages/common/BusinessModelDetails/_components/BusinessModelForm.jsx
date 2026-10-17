import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { businessModelSchema } from '../../../../schemas/businessModelSchema';
import { PERSONA_OPTIONS, ASSESSMENT_READINESS_OPTIONS } from '../../../../utils/constants/businessModelConstants';

const BusinessModelForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(businessModelSchema),
    defaultValues: {
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

  const onFormSubmit = (data) => {
    if (onSubmit) onSubmit(data);
  };

  const handleCheckboxToggle = (field, value) => {
    const currentValues = watch(field) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  return (
    <form id="business-model-form" onSubmit={handleSubmit(onFormSubmit)}>
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
                <label key={persona.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={personaInterest.includes(persona.value)}
                    onChange={() => handleCheckboxToggle('personaInterest', persona.value)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green rounded-full border-gray-400"
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
              <div className="space-y-6">
                {ASSESSMENT_READINESS_OPTIONS
                  .filter(category => personaInterest.includes(category.persona))
                  .map((category, idx) => (
                    <div key={idx}>
                      <h4 className="text-base sm:text-lg font-medium text-primary mb-3">{category.category}</h4>
                      <div className="space-y-2">
                        {category.options.map((option) => (
                          <label key={option.value} className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={assessmentReadiness.includes(option.value)}
                              onChange={() => handleCheckboxToggle('assessmentReadiness', option.value)}
                              className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-accent-green-dark focus:ring-accent-green rounded-full border-gray-400"
                            />
                            <span className="text-sm sm:text-base text-muted font-normal">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Hiring/Rental Section */}
        {personaInterest.includes('rental') && (
          <div className="form-section">
            <div className="form-section-header">Custom Hiring/Rental</div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">Initial Cost of the Machine<span className="text-red-500">*</span></label>
                <input type="text" {...register('initialCost')} className={`form-input ${errors.initialCost ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.initialCost && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.initialCost.message}</p>}
              </div>
              <div>
                <label className="form-label">Field Capacity, acre h-1<span className="text-red-500">*</span></label>
                <input type="text" {...register('fieldCapacity')} className={`form-input ${errors.fieldCapacity ? 'border-red-500' : ''}`} placeholder="e.g. 1.5" />
                {errors.fieldCapacity && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fieldCapacity.message}</p>}
              </div>
              <div>
                <label className="form-label">Custom hiring charges (without logistics)<span className="text-red-500">*</span></label>
                <input type="text" {...register('customHiringCharges')} className={`form-input ${errors.customHiringCharges ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.customHiringCharges && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.customHiringCharges.message}</p>}
              </div>
              <div>
                <label className="form-label">Estimated revenue per year<span className="text-red-500">*</span></label>
                <input type="text" {...register('estimatedRevenue')} className={`form-input ${errors.estimatedRevenue ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.estimatedRevenue && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.estimatedRevenue.message}</p>}
              </div>
              <div>
                <label className="form-label">Payback period<span className="text-red-500">*</span></label>
                <input type="text" {...register('paybackPeriod')} className={`form-input ${errors.paybackPeriod ? 'border-red-500' : ''}`} placeholder="e.g. 12" />
                {errors.paybackPeriod && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.paybackPeriod.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Sales Section */}
        {personaInterest.includes('sales') && (
          <div className="form-section">
            <div className="form-section-header">Sales</div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">Inventory Costs<span className="text-red-500">*</span></label>
                <input type="text" {...register('inventoryCosts')} className={`form-input ${errors.inventoryCosts ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.inventoryCosts && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.inventoryCosts.message}</p>}
              </div>
              <div>
                <label className="form-label">Logistics Costs<span className="text-red-500">*</span></label>
                <input type="text" {...register('logisticsCosts')} className={`form-input ${errors.logisticsCosts ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.logisticsCosts && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.logisticsCosts.message}</p>}
              </div>
              <div>
                <label className="form-label">Sales target per year<span className="text-red-500">*</span></label>
                <input type="text" {...register('salesTargetYear')} className={`form-input ${errors.salesTargetYear ? 'border-red-500' : ''}`} placeholder="e.g. 100" />
                {errors.salesTargetYear && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.salesTargetYear.message}</p>}
              </div>
              <div>
                <label className="form-label">Commissions planned<span className="text-red-500">*</span></label>
                <input type="text" {...register('commissionsPlanned')} className={`form-input ${errors.commissionsPlanned ? 'border-red-500' : ''}`} placeholder="e.g. 5000" />
                {errors.commissionsPlanned && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.commissionsPlanned.message}</p>}
              </div>
              <div>
                <label className="form-label">Estimated revenue per year<span className="text-red-500">*</span></label>
                <input type="text" {...register('estimatedRevenueSales')} className={`form-input ${errors.estimatedRevenueSales ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.estimatedRevenueSales && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.estimatedRevenueSales.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Servicing Section */}
        {personaInterest.includes('servicing') && (
          <div className="form-section">
            <div className="form-section-header">Servicing</div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">Inventory Costs<span className="text-red-500">*</span></label>
                <input type="text" {...register('servicingInventoryCosts')} className={`form-input ${errors.servicingInventoryCosts ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.servicingInventoryCosts && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.servicingInventoryCosts.message}</p>}
              </div>
              <div>
                <label className="form-label">Logistics Costs<span className="text-red-500">*</span></label>
                <input type="text" {...register('servicingLogisticsCosts')} className={`form-input ${errors.servicingLogisticsCosts ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.servicingLogisticsCosts && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.servicingLogisticsCosts.message}</p>}
              </div>
              <div>
                <label className="form-label">Servicing target per year<span className="text-red-500">*</span></label>
                <input type="text" {...register('servicingTargetYear')} className={`form-input ${errors.servicingTargetYear ? 'border-red-500' : ''}`} placeholder="e.g. 100" />
                {errors.servicingTargetYear && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.servicingTargetYear.message}</p>}
              </div>
              <div>
                <label className="form-label">Commission planned<span className="text-red-500">*</span></label>
                <input type="text" {...register('servicingCommissionPlanned')} className={`form-input ${errors.servicingCommissionPlanned ? 'border-red-500' : ''}`} placeholder="e.g. 5000" />
                {errors.servicingCommissionPlanned && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.servicingCommissionPlanned.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Fabrication/Assembly Section */}
        {personaInterest.includes('fabrication') && (
          <div className="form-section">
            <div className="form-section-header">Fabrication/Assembly</div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
              <div>
                <label className="form-label">Number of machines planned for one year<span className="text-red-500">*</span></label>
                <input type="text" {...register('machinesPlanned')} className={`form-input ${errors.machinesPlanned ? 'border-red-500' : ''}`} placeholder="e.g. 100" />
                {errors.machinesPlanned && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machinesPlanned.message}</p>}
              </div>
              <div>
                <label className="form-label">Cost of fabrication per machine<span className="text-red-500">*</span></label>
                <input type="text" {...register('costFabrication')} className={`form-input ${errors.costFabrication ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.costFabrication && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.costFabrication.message}</p>}
              </div>
              <div>
                <label className="form-label">Selling price per machine<span className="text-red-500">*</span></label>
                <input type="text" {...register('sellingPrice')} className={`form-input ${errors.sellingPrice ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.sellingPrice && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.sellingPrice.message}</p>}
              </div>
              <div>
                <label className="form-label">Estimated revenue per year<span className="text-red-500">*</span></label>
                <input type="text" {...register('estimatedRevenueAssembly')} className={`form-input ${errors.estimatedRevenueAssembly ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                {errors.estimatedRevenueAssembly && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.estimatedRevenueAssembly.message}</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </form>
  );
};

export default BusinessModelForm;
