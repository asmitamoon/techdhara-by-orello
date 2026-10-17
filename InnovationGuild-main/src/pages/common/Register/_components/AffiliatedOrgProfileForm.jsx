import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import FormSelect from '../../../../components/ui/FormSelect';
import { useNodalOrgs } from '../../../../hooks/queries/public';
import ImageUpload from './ImageUpload';
import LocationGroup from '../../../../components/ui/LocationGroup';
import { affiliatedOrgSchema } from '../../../../schemas/registrationSchema';

const AffiliatedOrgProfileForm = ({ onCancel, onSubmit, googleData }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(affiliatedOrgSchema),
    defaultValues: {
      logo: null,
      orgName: '',
      orgType: '',
      orgTypeOther: '',
      streamOfWork: [],
      streamOfWorkOther: '',
      nodalOrg: '',
      pocName: '',
      state: '',
      district: '',
      village: '',
      website: ''
    }
  });

  const logoFile = watch('logo');
  const orgType = watch('orgType');
  const streamOfWork = watch('streamOfWork');

  useEffect(() => {
    if (googleData?.profilePicture) setValue('logo', googleData.profilePicture);
  }, [googleData]);

  useEffect(() => {
    if (orgType !== 'other') {
      setValue('orgTypeOther', '');
    }
  }, [orgType, setValue]);

  const handleCheckboxToggle = (value) => {
    const currentValues = [...streamOfWork];
    if (currentValues.includes(value)) {
      if (value === 'other') setValue('streamOfWorkOther', '');
      setValue('streamOfWork', currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue('streamOfWork', [...currentValues, value], { shouldValidate: true });
    }
  };

  const streamOptions = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'skill_building', label: 'Skill Building' },
    { value: 'livelihoods', label: 'Livelihoods' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'arts_crafts', label: 'Arts and Crafts' },
    { value: 'climate_change', label: 'Climate change and Environment' },
  ];

  const { data: nodalOrgOptions = [], isLoading: nodalOrgsLoading } = useNodalOrgs();

  const onFormSubmit = async (data) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <div className="pb-8 sm:pb-10 lg:pb-12 mt-6 sm:mt-8 lg:mt-10">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] border border-accent-green-dark p-5 sm:p-6 lg:p-8 xl:p-10">
          
          <div className="border-b border-input-border pb-3 sm:pb-4 mb-6 sm:mb-8 flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Affiliated Organization</h2>
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
                      <label htmlFor="nodalOrg" className="form-label">Which Nodal Organisation do you fall under?<span className="text-red-500">*</span></label>
                      <Controller
                        name="nodalOrg"
                        control={control}
                        render={({ field }) => (
                          <FormSelect
                              {...field}
                              value={nodalOrgOptions.find(opt => opt.value === field.value) || null}
                              onChange={(option) => field.onChange(option?.value)}
                              options={nodalOrgOptions}
                              placeholder={nodalOrgsLoading ? 'Loading...' : 'Select Nodal Organisation'}
                              isDisabled={nodalOrgsLoading}
                              className={errors.nodalOrg ? 'border-red-500 rounded' : ''}
                          />
                        )}
                      />
                      {errors.nodalOrg && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.nodalOrg.message}</p>}
                  </div>
              </div>

              <div>
                  <label className="form-label">Type of Organization<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-3 sm:gap-y-4 mt-2 sm:mt-3 items-center">
                      {[
                          { label: 'Farmer Producer Company', value: 'fpc' },
                          { label: 'Self Help Groups', value: 'shg' },
                          { label: 'Non-Government Organisations', value: 'ngo' }
                      ].map((opt) => (
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

                      <div className="flex items-center gap-2 sm:gap-3">
                          <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                              <input 
                                  type="radio" 
                                  value="other"
                                  {...register('orgType')}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                              />
                              <span className="radio-label">Other (Specify)</span>
                          </label>
                          <input 
                              type="text" 
                              className="border-b border-input-border focus:border-accent-green-dark outline-none text-sm sm:text-base lg:text-lg text-primary w-32 sm:w-40 bg-transparent"
                              disabled={orgType !== 'other'}
                              {...register('orgTypeOther')}
                          />
                      </div>
                  </div>
                  {errors.orgType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgType.message}</p>}
                  {errors.orgTypeOther && orgType === 'other' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgTypeOther.message}</p>}
              </div>

              <div>
                  <label className="form-label">Stream of Work (select all that is applicable)<span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 mt-3">
                      {streamOptions.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="checkbox"
                                  checked={streamOfWork.includes(opt.value)}
                                  onChange={() => handleCheckboxToggle(opt.value)}
                                  className="w-4 h-4 text-accent-green-dark focus:ring-accent-green rounded"
                              />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                      <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="checkbox"
                                  checked={streamOfWork.includes('other')}
                                  onChange={() => handleCheckboxToggle('other')}
                                  className="w-4 h-4 text-accent-green-dark focus:ring-accent-green rounded"
                              />
                              <span className="radio-label">Other (Specify)</span>
                          </label>
                          <input 
                              type="text" 
                              className="border-b border-input-border focus:border-accent-green-dark outline-none text-sm sm:text-base lg:text-lg text-primary w-32 sm:w-40 bg-transparent"
                              disabled={!streamOfWork.includes('other')}
                              {...register('streamOfWorkOther')}
                          />
                      </div>
                  </div>
                  {errors.streamOfWork && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.streamOfWork.message}</p>}
                  {errors.streamOfWorkOther && streamOfWork.includes('other') && <p className="text-red-500 text-xs lg:text-sm mt-1">Please specify stream</p>}
              </div>

              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                  <div>
                      <label htmlFor="pocName" className="form-label">POC of the Affiliated Organisation<span className="text-red-500">*</span></label>
                      <input 
                          id="pocName"
                          type="text" 
                          className={`form-input ${errors.pocName ? 'border-red-500' : ''}`} 
                          placeholder="Your Answer" 
                          {...register('pocName')}
                      />
                      {errors.pocName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.pocName.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <LocationGroup 
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                      />
                      <div>
                          <label htmlFor="village" className="form-label">Village/City<span className="text-red-500">*</span></label>
                          <input 
                              id="village"
                              type="text" 
                              className={`form-input ${errors.village ? 'border-red-500' : ''}`} 
                              placeholder="Village/City" 
                              {...register('village')}
                          />
                          {errors.village && <p className="text-red-500 text-xs lg:text-sm mt-1">Required</p>}
                      </div>
                  </div>
              </div>

              <div>
                  <label htmlFor="website" className="form-label">Website</label>
                  <input 
                      id="website"
                      type="text" 
                      className={`form-input ${errors.website ? 'border-red-500' : ''}`} 
                      placeholder="www.abc.com" 
                      {...register('website')}
                  />
                  {errors.website && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.website.message}</p>}
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

export default AffiliatedOrgProfileForm;