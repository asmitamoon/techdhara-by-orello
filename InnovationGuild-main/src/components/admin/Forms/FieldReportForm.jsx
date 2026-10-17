import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { fieldReportSchema } from '../../../schemas/fieldReportSchema';
import DatePickerSelector from '../../../pages/common/BookkeepingDetails/_components/DatePickerSelector';

const FieldReportForm = ({ onSubmit, onCancel, initialData = {}, isEditMode = true, minDate }) => {
  const {
    register,
    watch,
    setValue,
    handleSubmit: handleFormSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(fieldReportSchema),
    defaultValues: {
      selectedDate: new Date(),
      businessModelAdopted: '',
      typeOfTechnology: '',
      receivedTraining: '',
      machinePerformance: '',
      easeOfOperation: '',
      machineReliability: '',
      availabilityOfSpares: '',
      easeOfMaintenance: '',
      operationalChallenges: [],
      downtimeExperience: '',
      additionalComments: '',
      supportReceived: '',
      supportNeeded: '',
      recommendToOthers: '',
      improvementSuggestions: '',
      ...initialData
    }
  });

  // Handle checkbox array toggling
  const handleCheckboxToggle = (field, value) => {
    if (!isEditMode) return;
    const currentValues = watch(field) || [];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  const inputClass = `form-input w-full resize-none ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent px-0 font-medium text-primary cursor-default' : ''}`;
  const radioClass = "w-4 h-4 text-accent-green-dark focus:ring-accent-green";
  const checkboxClass = "w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green rounded border-gray-400";

  return (
    <form onSubmit={handleFormSubmit(onSubmit)}>
      <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="border-b border-input-border pb-3 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary font-heading">Field Report Details</h2>
            <Info size={16} className="text-muted" />
          </div>
        </div>

        <div>
          <div className="mb-6">
            <DatePickerSelector
              initialDate={watch('selectedDate')}
              onDateChange={(date) => isEditMode && setValue('selectedDate', date)}
              onPeriodChange={() => {}}
              hidePeriod={true}
              isDisabled={!isEditMode}
              minDate={minDate}
            />
          </div>

          <div className="space-y-10 sm:space-y-12">
            {/* Section 1: Basic Information */}
            <div className="form-section">
              <div className="form-section-header">Basic Information</div>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="form-label">Business Model Adopted<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('businessModelAdopted')} value="custom_billing_rental" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Custom billing / Rental</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('businessModelAdopted')} value="service" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Service</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('businessModelAdopted')} value="sales" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Sales</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('businessModelAdopted')} value="fabrication_assembly" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Fabrication / Assembly</span>
                    </label>
                  </div>
                  {errors.businessModelAdopted && <p className="text-red-500 text-xs mt-1">{errors.businessModelAdopted.message}</p>}
                </div>

                <div>
                  <label className="form-label">Type of Technology<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('typeOfTechnology')} value="farm_machinery" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Farm Machinery</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('typeOfTechnology')} value="post_harvest_processing" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Post-harvest / Processing</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('typeOfTechnology')} value="quality_testing" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Quality testing</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('typeOfTechnology')} value="service_tool" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Service Tool</span>
                    </label>
                  </div>
                  {errors.typeOfTechnology && <p className="text-red-500 text-xs mt-1">{errors.typeOfTechnology.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Training & Technical Performance */}
            <div className="form-section">
              <div className="form-section-header">Training & Technical Performance</div>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="form-label">Did you receive training before using the machine?<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('receivedTraining')} value="yes_full" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Yes (full training)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('receivedTraining')} value="yes_basic" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Yes (basic training)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('receivedTraining')} value="no_training" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">No training</span>
                    </label>
                  </div>
                  {errors.receivedTraining && <p className="text-red-500 text-xs mt-1">{errors.receivedTraining.message}</p>}
                </div>

                <div>
                  <label className="form-label">Machine performance so far<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machinePerformance')} value="very_good" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Very good</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machinePerformance')} value="good" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Good</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machinePerformance')} value="average" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Average</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machinePerformance')} value="poor" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Poor</span>
                    </label>
                  </div>
                  {errors.machinePerformance && <p className="text-red-500 text-xs mt-1">{errors.machinePerformance.message}</p>}
                </div>

                <div>
                  <label className="form-label">Ease of operation<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfOperation')} value="very_easy" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Very easy</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfOperation')} value="easy" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Easy</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfOperation')} value="moderate" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Moderate</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfOperation')} value="difficult" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Difficult</span>
                    </label>
                  </div>
                  {errors.easeOfOperation && <p className="text-red-500 text-xs mt-1">{errors.easeOfOperation.message}</p>}
                </div>

                <div>
                  <label className="form-label">Machine reliability<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machineReliability')} value="no_breakdowns" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">No breakdowns</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machineReliability')} value="minor_issues" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Minor issues</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machineReliability')} value="frequent_breakdowns" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Frequent breakdowns</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('machineReliability')} value="not_functional" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Not functional</span>
                    </label>
                  </div>
                  {errors.machineReliability && <p className="text-red-500 text-xs mt-1">{errors.machineReliability.message}</p>}
                </div>

                <div>
                  <label className="form-label">Availability of spares and service<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('availabilityOfSpares')} value="easily_available" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Easily available locally</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('availabilityOfSpares')} value="available_with_delay" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Available with delay</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('availabilityOfSpares')} value="only_from_manufacturer" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Only from manufacturer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('availabilityOfSpares')} value="not_available" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Not Available</span>
                    </label>
                  </div>
                  {errors.availabilityOfSpares && <p className="text-red-500 text-xs mt-1">{errors.availabilityOfSpares.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Operations & Maintenance */}
            <div className="form-section">
              <div className="form-section-header">Operations & Maintenance</div>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="form-label">Ease of maintenance<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfMaintenance')} value="very_easy" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Very easy</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfMaintenance')} value="easy" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Easy</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfMaintenance')} value="moderate" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Moderate</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('easeOfMaintenance')} value="difficult" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Difficult</span>
                    </label>
                  </div>
                  {errors.easeOfMaintenance && <p className="text-red-500 text-xs mt-1">{errors.easeOfMaintenance.message}</p>}
                </div>

                <div>
                  <label className="form-label">Daily/regular operational challenges<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(watch('operationalChallenges') || []).includes('fuel_battery')}
                        onChange={() => handleCheckboxToggle('operationalChallenges', 'fuel_battery')}
                        disabled={!isEditMode} className={checkboxClass}
                      />
                      <span className="radio-label font-normal">Fuel / battery</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(watch('operationalChallenges') || []).includes('labour')}
                        onChange={() => handleCheckboxToggle('operationalChallenges', 'labour')}
                        disabled={!isEditMode} className={checkboxClass}
                      />
                      <span className="radio-label font-normal">Labour</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(watch('operationalChallenges') || []).includes('transport')}
                        onChange={() => handleCheckboxToggle('operationalChallenges', 'transport')}
                        disabled={!isEditMode} className={checkboxClass}
                      />
                      <span className="radio-label font-normal">Transport</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(watch('operationalChallenges') || []).includes('spare_parts')}
                        onChange={() => handleCheckboxToggle('operationalChallenges', 'spare_parts')}
                        disabled={!isEditMode} className={checkboxClass}
                      />
                      <span className="radio-label font-normal">Spare parts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(watch('operationalChallenges') || []).includes('customer_coordination')}
                        onChange={() => handleCheckboxToggle('operationalChallenges', 'customer_coordination')}
                        disabled={!isEditMode} className={checkboxClass}
                      />
                      <span className="radio-label font-normal">Customer coordination</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(watch('operationalChallenges') || []).includes('none')}
                        onChange={() => handleCheckboxToggle('operationalChallenges', 'none')}
                        disabled={!isEditMode} className={checkboxClass}
                      />
                      <span className="radio-label font-normal">None</span>
                    </label>
                  </div>
                  {errors.operationalChallenges && <p className="text-red-500 text-xs mt-1">{errors.operationalChallenges.message}</p>}
                </div>

                <div>
                  <label className="form-label">Downtime experience<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('downtimeExperience')} value="none" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">None</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('downtimeExperience')} value="1_4_days" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">1-4 days</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('downtimeExperience')} value="5_15_days" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">5-15 days</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('downtimeExperience')} value="16_plus_days" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">16+ days</span>
                    </label>
                  </div>
                  {errors.downtimeExperience && <p className="text-red-500 text-xs mt-1">{errors.downtimeExperience.message}</p>}
                </div>

                <div>
                  <label className="form-label">Additional Comments (Optional)</label>
                  <textarea
                    {...register('additionalComments')}
                    className={inputClass}
                    placeholder="Your Answer"
                    rows="4"
                    readOnly={!isEditMode}
                  />
                  {errors.additionalComments && <p className="text-red-500 text-xs mt-1">{errors.additionalComments.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 4: Support & Ecosystem */}
            <div className="form-section">
              <div className="form-section-header">Support & Ecosystem</div>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="form-label">Support received from Technicians / Partner<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportReceived')} value="technical" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Technical</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportReceived')} value="business_planning" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Business planning</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportReceived')} value="market_linkages" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Market linkages</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportReceived')} value="finance" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Finance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportReceived')} value="training_fishermen" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Training fishermen</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportReceived')} value="none" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">None</span>
                    </label>
                  </div>
                  {errors.supportReceived && <p className="text-red-500 text-xs mt-1">{errors.supportReceived.message}</p>}
                </div>

                <div>
                  <label className="form-label">Support needed going forward<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportNeeded')} value="technical" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Technical</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportNeeded')} value="business_planning" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Business planning</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportNeeded')} value="market_linkages" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Market linkages</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportNeeded')} value="finance" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Finance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportNeeded')} value="training_fishermen" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Training fishermen</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('supportNeeded')} value="none" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">None</span>
                    </label>
                  </div>
                  {errors.supportNeeded && <p className="text-red-500 text-xs mt-1">{errors.supportNeeded.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 5: Future Outlook */}
            <div className="form-section">
              <div className="form-section-header">Future Outlook</div>
              <div className="mt-4 space-y-6">
                <div>
                  <label className="form-label">Would you recommend this machine to others?<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('recommendToOthers')} value="yes" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('recommendToOthers')} value="maybe" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">Maybe</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...register('recommendToOthers')} value="no" disabled={!isEditMode} className={radioClass} />
                      <span className="radio-label font-normal">No</span>
                    </label>
                  </div>
                  {errors.recommendToOthers && <p className="text-red-500 text-xs mt-1">{errors.recommendToOthers.message}</p>}
                </div>

                <div>
                  <label className="form-label">What changes would improve this technology? (Optional)</label>
                  <textarea
                    {...register('improvementSuggestions')}
                    className={inputClass}
                    placeholder="Your Answer"
                    rows="4"
                    readOnly={!isEditMode}
                  />
                  {errors.improvementSuggestions && <p className="text-red-500 text-xs mt-1">{errors.improvementSuggestions.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        {isEditMode && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer font-heading"
            >
              Submit Report
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
      </div>
    </form>
  );
};

export default FieldReportForm;
