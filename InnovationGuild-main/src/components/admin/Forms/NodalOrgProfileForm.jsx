import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3 } from 'lucide-react';
import FormSelect from '../../ui/FormSelect';
import ImageUpload from '../../../pages/common/Register/_components/ImageUpload';
import LocationGroup from '../../ui/LocationGroup';
import { getStateOptions } from '../../../utils/LocationData/locationData';
import { nodalOrgSchema } from '../../../schemas/registrationSchema';
import { NO_ORG_TYPE_OPTIONS, YES_NO_PROGRESS_OPTIONS, NO_CHANNEL_OPTIONS } from '../../../utils/constants/nodalOrgConstants';

const NodalOrgProfileForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(nodalOrgSchema),
    defaultValues: initialData || {
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

  const stateOptions = getStateOptions();
  const description = watch('description') || '';

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

  // Sync current form data upward so the sticky bar's Submit can read it
  const onFormSubmit = (data) => {
    // Update parent with validated data
    if (onDataChange) {
      onDataChange(data);
    }
    // Call parent's submit handler (only called if validation passes)
    if (onSubmit) {
      onSubmit(data);
    }
  };

  // Also sync on every change
  useEffect(() => {
    const subscription = watch((data) => {
      if (onDataChange) onDataChange(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-light p-4 sm:p-5 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="border-b border-accent-green-light pb-3 mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary">Nodal Organization</h2>
            <Info size={16} className="text-muted" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1">
            {initialData?.submittedDate && (
              <div className="text-sm text-muted flex items-center gap-1.5">
                <span className="font-medium">Submitted Date:</span>
                <span className="text-primary font-semibold">{initialData.submittedDate}</span>
              </div>
            )}
            {initialData?.status === 'approved' && initialData?.approvedDate && (
              <div className="text-sm text-muted flex items-center gap-1.5">
                <span className="font-medium">Approved Date:</span>
                <span className="text-primary font-semibold">{initialData.approvedDate}</span>
              </div>
            )}
          </div>
        </div>
        {!isEditMode && onEditToggle && (
          <button
            type="button"
            onClick={onEditToggle}
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent-green-dark border border-accent-green-light rounded-lg hover:bg-accent-green/5 transition-colors cursor-pointer"
          >
            <Edit3 size={16} />
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="space-y-3 sm:space-y-4 lg:space-y-5">

          {/* Logo */}
          <ImageUpload
            id="logo"
            file={watch('logo') || initialData?.profilePicture}
            onChange={(e) => setValue('logo', e.target.files?.[0])}
            error={errors.logo}
            label={isEditMode ? "Add your logo" : ((watch('logo') || initialData?.profilePicture) ? "Organization Logo" : "No logo uploaded")}
            disabled={!isEditMode}
          />

          {/* Org Name & Website */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="orgName" className="form-label">Organization Name<span className="text-red-500">*</span></label>
              <input
                id="orgName"
                type="text"
                className={inputClass(errors.orgName)}
                placeholder="Your Answer"
                readOnly={!isEditMode}
                {...register('orgName')}
              />
              {errors.orgName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgName.message}</p>}
            </div>
            <div>
              <label htmlFor="website" className="form-label">Website<span className="text-red-500">*</span></label>
              <input
                id="website"
                type="text"
                className={inputClass(errors.website)}
                placeholder="Your Answer"
                readOnly={!isEditMode}
                {...register('website')}
              />
              {errors.website && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.website.message}</p>}
            </div>
          </div>

          {/* Type of Organization */}
          <div>
            <label className="form-label">Type of Organization<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3">
              {NO_ORG_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('orgType')}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark  text-accent-green-dark focus:ring-accent-green disabled:opacity-100"
                    disabled={!isEditMode}
                  />
                  <span className="radio-label">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.orgType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgType.message}</p>}
          </div>

          {/* HQ State */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <LocationGroup 
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
              stateName="hqState"
              stateLabel="Headquarter State"
              showDistrict={false}
              isDisabled={!isEditMode}
            />

            {/* Operational States */}
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
                    isDisabled={!isEditMode}
                    className={errors.operationalStates ? 'border-accent-green-light rounded' : ''}
                  />
                )}
              />
              {errors.operationalStates && <p className="text-red-500 text-xs lg:text-sm mt-1">Operational states are required</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label">A short description of your company<span className="text-red-500">*</span></label>
            <div className="relative">
              <textarea
                id="description"
                rows={4}
                className={`${inputClass(errors.description)} resize-none`}
                placeholder="Your Answer"
                maxLength={1000}
                readOnly={!isEditMode}
                {...register('description')}
              />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs sm:text-sm text-placeholder">
                {description.length}/1000
              </div>
            </div>
            {errors.description && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Rural Programs & Tech Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">Do you have any rural livelihood programs / initiatives running right now?<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3">
                {YES_NO_PROGRESS_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('hasRuralPrograms')}
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                      disabled={!isEditMode}
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
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                      disabled={!isEditMode}
                    />
                    <span className="radio-label">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.hasTechIntegration && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.hasTechIntegration.message}</p>}
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="form-label">Through what channels are you presented in different villages?<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-3 sm:gap-y-4 mt-2 sm:mt-3">
              {NO_CHANNEL_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={opt.value}
                    {...register('channels')}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                    disabled={!isEditMode}
                  />
                  <span className="radio-label">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.channels && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.channels.message}</p>}
          </div>

          {/* Potential AO Count */}
          <div>
            <label htmlFor="potentialAoCount" className="form-label">
              Number of potential Affiliated Organizations (Organization branches / FPOs / Gram Panchayats or any other formal village or block level set-ups of the organization)
            </label>
            <input
              id="potentialAoCount"
              type="text"
              className={inputClass(errors.potentialAoCount)}
              placeholder="Your Answer"
              readOnly={!isEditMode}
              {...register('potentialAoCount')}
            />
            {errors.potentialAoCount && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.potentialAoCount.message}</p>}
          </div>

        </div>
      </form>
    </div>
  );
});

NodalOrgProfileForm.displayName = 'NodalOrgProfileForm';

export default NodalOrgProfileForm;
