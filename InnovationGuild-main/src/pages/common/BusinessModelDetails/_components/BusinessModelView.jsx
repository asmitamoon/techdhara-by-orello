import { PERSONA_OPTIONS, ASSESSMENT_READINESS_OPTIONS } from '../../../../utils/constants/businessModelConstants';

const RENTAL_FIELDS = [
  { key: 'initialCost', label: 'Initial Cost of the Machine' },
  { key: 'fieldCapacity', label: 'Field Capacity (acre h⁻¹)' },
  { key: 'customHiringCharges', label: 'Custom hiring charges' },
  { key: 'estimatedRevenue', label: 'Estimated revenue per year' },
  { key: 'paybackPeriod', label: 'Payback period' },
];

const SALES_FIELDS = [
  { key: 'inventoryCosts', label: 'Inventory Costs' },
  { key: 'logisticsCosts', label: 'Logistics Costs' },
  { key: 'salesTargetYear', label: 'Sales target per year' },
  { key: 'commissionsPlanned', label: 'Commissions planned' },
  { key: 'estimatedRevenueSales', label: 'Estimated revenue per year' },
];

const SERVICING_FIELDS = [
  { key: 'servicingInventoryCosts', label: 'Inventory Costs' },
  { key: 'servicingLogisticsCosts', label: 'Logistics Costs' },
  { key: 'servicingTargetYear', label: 'Servicing target per year' },
  { key: 'servicingCommissionPlanned', label: 'Commission planned' },
];

const FABRICATION_FIELDS = [
  { key: 'machinesPlanned', label: 'Machines planned for one year' },
  { key: 'costFabrication', label: 'Cost of fabrication per machine' },
  { key: 'sellingPrice', label: 'Selling price per machine' },
  { key: 'estimatedRevenueAssembly', label: 'Estimated revenue per year' },
];

const FieldRow = ({ label, value }) => (
  <div>
    <p className="form-label">{label}</p>
    <p className="form-input bg-input-bg text-primary">{value ?? '—'}</p>
  </div>
);

const NumericSection = ({ title, fields, model }) => (
  <div className="form-section">
    <div className="form-section-header">{title}</div>
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
      {fields.map(({ key, label }) => (
        <FieldRow key={key} label={label} value={model[key]} />
      ))}
    </div>
  </div>
);

const BusinessModelView = ({ model, onBack }) => {
  const personaInterest = model.personaInterest ?? [];
  const assessmentReadiness = model.assessmentReadiness ?? [];

  return (
    <div className="space-y-8 sm:space-y-10">

      {/* Personas selected */}
      <div className="form-section">
        <div className="form-section-header">Persona Selection</div>
        <div className="mt-2">
          <p className="text-primary mb-4 font-medium">Selected personas</p>
          <div className="flex flex-wrap gap-3">
            {PERSONA_OPTIONS.map((persona) => (
              personaInterest.includes(persona.value) && (
                <span
                  key={persona.value}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-accent-green text-white"
                >
                  {persona.label}
                </span>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Assessment of VLE readiness */}
      {personaInterest.length > 0 && (
        <div className="form-section">
          <div className="form-section-header">Assessment of VLE readiness</div>
          <div className="mt-4 space-y-6">
            {ASSESSMENT_READINESS_OPTIONS
              .filter(category => personaInterest.includes(category.persona))
              .map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-base sm:text-lg font-medium text-primary mb-3">{category.category}</h4>
                  <div className="space-y-2">
                    {category.options.map((option) => {
                      const checked = assessmentReadiness.includes(option.value);
                      return (
                        <div key={option.value} className="flex items-start gap-3">
                          <span className={`mt-0.5 text-base font-bold ${checked ? 'text-accent-green' : 'text-muted'}`}>
                            {checked ? '✓' : '✗'}
                          </span>
                          <span className="text-sm sm:text-base text-muted">{option.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {personaInterest.includes('rental') && (
        <NumericSection title="Custom Hiring/Rental" fields={RENTAL_FIELDS} model={model} />
      )}

      {personaInterest.includes('sales') && (
        <NumericSection title="Sales" fields={SALES_FIELDS} model={model} />
      )}

      {personaInterest.includes('servicing') && (
        <NumericSection title="Servicing" fields={SERVICING_FIELDS} model={model} />
      )}

      {personaInterest.includes('fabrication') && (
        <NumericSection title="Fabrication/Assembly" fields={FABRICATION_FIELDS} model={model} />
      )}

      <div>
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer font-heading"
        >
          Back
        </button>
      </div>

    </div>
  );
};

export default BusinessModelView;
