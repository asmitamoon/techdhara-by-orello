import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import FormSelect from '../../../../components/ui/FormSelect';
import ImageUpload from './ImageUpload';
import LocationGroup from '../../../../components/ui/LocationGroup';
import { getStateOptions } from '../../../../utils/LocationData/locationData';
import { nodalOrgSchema } from '../../../../schemas/registrationSchema';
import { NO_ORG_TYPE_OPTIONS, YES_NO_PROGRESS_OPTIONS, NO_CHANNEL_OPTIONS } from '../../../../utils/constants/nodalOrgConstants';

const NodalOrgProfileForm = ({ onCancel, onSubmit, googleData }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(nodalOrgSchema),
    defaultValues: {
      logo: null,
      orgName: '',
      website: '',
      orgType: '',
      hqState: '',
      operationalStates: [],
      description: '',
      hasRuralPrograms: '',
      hasTechIntegration: '',
      channels: [],
      potentialAoCount: ''
    }
  });

  const logoFile = watch('logo');
  const description = watch('description') || '';
  const stateOptions = getStateOptions();

  useEffect(() => {
    if (googleData?.profilePicture) setValue('logo', googleData.profilePicture);
  }, [googleData]);

  const onFormSubmit = async (data) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <div className="pb-8 sm:pb-10 lg:pb-12 mt-6 sm:mt-8 lg:mt-10">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] border border-accent-green-dark p-5 sm:p-6 lg:p-8 xl:p-10">
          
          <div className="border-b border-input-border pb-3 sm:pb-4 mb-6 sm:mb-8 flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Nodal Organization</h2>
              <Info size={16} className="text-muted" />
          </div>

          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              
              <ImageUpload 
                id="logo"
                file={logoFile}
                onChange={(e) => setValue('logo', e.target.files?.[0])}
                error={errors.logo}
                label="Add your logo"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                      <label htmlFor="orgName" className="form-label">Organization Name<span className="text-red-500">*</span></label>
                      <input 
                          id="orgName"
                          type="text" 
                          className={`form-input ${errors.orgName ? 'border-red-500' : ''}`} 
                          placeholder="Your Answer" 
                          {...register('orgName')}
                      />
                      {errors.orgName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgName.message}</p>}
                  </div>
                  <div>
                      <label htmlFor="website" className="form-label">Website<span className="text-red-500">*</span></label>
                      <input 
                          id="website"
                          type="text" 
                          className={`form-input ${errors.website ? 'border-red-500' : ''}`} 
                          placeholder="Your Answer" 
                          {...register('website')}
                      />
                      {errors.website && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.website.message}</p>}
                  </div>
              </div>

              <div>
                  <label className="form-label">Type of Organization<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3 lg:mt-4">
                      {NO_ORG_TYPE_OPTIONS.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                              <input
                                  type="radio"
                                  value={opt.value}
                                  {...register('orgType')}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                              />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
                  {errors.orgType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgType.message}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <LocationGroup 
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    stateName="hqState"
                    stateLabel="Headquarter State"
                    showDistrict={false}
                  />
                  <div>
                      <label htmlFor="operationalStates" className="form-label">Operational States<span className="text-red-500">*</span></label>
                      <Controller
                        name="operationalStates"
                        control={control}
                        render={({ field }) => (
                          <FormSelect
                              {...field}
                              value={stateOptions.filter(opt => field.value.includes(opt.value))}
                              onChange={(options) => field.onChange(options ? options.map(opt => opt.value) : [])}
                              options={stateOptions}
                              placeholder="Select States"
                              isMulti={true}
                              isSearchable={true}
                              className={errors.operationalStates ? 'border-red-500 rounded' : ''}
                          />
                        )}
                      />
                      {errors.operationalStates && <p className="text-red-500 text-xs lg:text-sm mt-1">Operational states are required</p>}
                  </div>
              </div>

              <div>
                  <label htmlFor="description" className="form-label">A short description of your company<span className="text-red-500">*</span></label>
                  <div className="relative">
                      <textarea 
                          id="description"
                          rows={4}
                          className={`form-input resize-none ${errors.description ? 'border-red-500' : ''}`}
                          placeholder="Your Answer"
                          maxLength={1000}
                          {...register('description')}
                      />
                      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs sm:text-sm text-placeholder">
                          {description.length}/1000
                      </div>
                  </div>
                  {errors.description && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                      <label className="form-label">Do you have any rural livelihood programs / initiatives running right now?<span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3">
                          {YES_NO_PROGRESS_OPTIONS.map((opt) => (
                              <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                                  <input
                                      type="radio"
                                      value={opt.value}
                                      {...register('hasRuralPrograms')}
                                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                                  />
                                  <span className="radio-label">{opt.label}</span>
                              </label>
                          ))}
                      </div>
                      {errors.hasRuralPrograms && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.hasRuralPrograms.message}</p>}
                  </div>
                  <div>
                      <label className="form-label">Are you doing any technology integration programs in your operational regions?<span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3">
                          {YES_NO_PROGRESS_OPTIONS.map((opt) => (
                              <label key={`tech-${opt.value}`} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                                  <input
                                      type="radio"
                                      value={opt.value}
                                      {...register('hasTechIntegration')}
                                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                                  />
                                  <span className="radio-label">{opt.label}</span>
                              </label>
                          ))}
                      </div>
                      {errors.hasTechIntegration && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.hasTechIntegration.message}</p>}
                  </div>
              </div>

              <div>
                  <label className="form-label">Through what channels are you presented in different villages?<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-3 sm:gap-y-4 mt-2 sm:mt-3">
                      {NO_CHANNEL_OPTIONS.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                              <input
                                  type="checkbox"
                                  value={opt.value}
                                  {...register('channels')}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                              />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
                  {errors.channels && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.channels.message}</p>}
              </div>

              <div>
                  <label htmlFor="potentialAoCount" className="form-label">
                      Number of potential Affiliated Organizations (Organization branches / FPOs / Gram Panchayats or any other formal village or block level set-ups of the organization)
                  </label>
                  <input 
                      id="potentialAoCount"
                      type="text" 
                      className={`form-input ${errors.potentialAoCount ? 'border-red-500' : ''}`} 
                      placeholder="Your Answer" 
                      {...register('potentialAoCount')}
                  />
                  {errors.potentialAoCount && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.potentialAoCount.message}</p>}
              </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-button-dark text-white text-base sm:text-lg border border-accent-green rounded-xl hover:bg-primary transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-muted text-base sm:text-lg border border-input-border rounded-xl hover:bg-header transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodalOrgProfileForm;