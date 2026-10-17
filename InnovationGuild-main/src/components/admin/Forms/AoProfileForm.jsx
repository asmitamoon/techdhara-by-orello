import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3, Plus } from 'lucide-react';
import ImageUpload from '../../../pages/common/Register/_components/ImageUpload';
import LocationGroup from '../../ui/LocationGroup';
import { affiliatedOrgByNOSchema } from '../../../schemas/registrationSchema';

const AoProfileForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(affiliatedOrgByNOSchema),
    defaultValues: initialData || {
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

  const orgType = watch('orgType');
  const streamOfWork = watch('streamOfWork') || [];

  const streamOptions = [
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'skill_building', label: 'Skill Building' },
    { value: 'livelihoods', label: 'Livelihoods' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'arts_crafts', label: 'Arts and Crafts' },
    { value: 'climate_change', label: 'Climate change and Environment' },
  ];

  // Expose submit trigger to parent
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onFormSubmit)();
    }
  }));

  useEffect(() => {
    if (orgType !== 'other') {
      setValue('orgTypeOther', '', { shouldValidate: true });
    }
  }, [orgType, setValue]);

  // Reset form to initial data when edit mode is cancelled
  useEffect(() => {
    if (!isEditMode && initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key, initialData[key]);
      });
    }
  }, [isEditMode, initialData, setValue]);

  // Sync current form data upward
  const onFormSubmit = (data) => {
    if (onDataChange) {
      onDataChange(data);
    }
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

  const handleCheckboxToggle = (value) => {
    if (!isEditMode) return;
    const currentValues = [...streamOfWork];
    if (currentValues.includes(value)) {
      if (value === 'other') setValue('streamOfWorkOther', '', { shouldValidate: true });
      setValue('streamOfWork', currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue('streamOfWork', [...currentValues, value], { shouldValidate: true });
    }
  };

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="border-b border-accent-green-dark pb-3 mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary">Affiliated Organization</h2>
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
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent-green-dark border border-accent-green-dark rounded-lg hover:bg-accent-green/5 transition-colors cursor-pointer font-medium"
          >
            <Edit3 size={16} />
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="space-y-3 sm:space-y-4 lg:space-y-5">
          
          {/* Logo */}
          {isEditMode ? (
            <ImageUpload
              id="logo"
              file={watch('logo') || initialData?.profilePicture}
              onChange={(e) => setValue('logo', e.target.files?.[0], { shouldValidate: true })}
              error={errors.logo}
              label="Add your logo"
            />
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-accent-green-dark overflow-hidden bg-[#fef2eb] flex items-center justify-center">
                {initialData?.profilePicture ? (
                  <img
                    src={initialData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-green-dark rounded-full flex items-center justify-center text-white">
                    <Plus size={32} />
                  </div>
                )}
              </div>
              <p className="text-primary text-sm sm:text-base font-medium">
                {initialData?.profilePicture ? 'Profile Picture' : 'No picture'}
              </p>
            </div>
          )}

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
              <label className="form-label">Which Nodal Organisation do you fall under?</label>
              <input
                type="text"
                value={initialData?.nodalOrgName || '—'}
                readOnly
                className={inputClass(null)}
              />
            </div>
          </div>

          {/* Type of Organization */}
          <div>
            <label className="form-label">Type of Organization<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3 items-center">
              {[
                { label: 'Farmer Producer Company', value: 'fpc' },
                { label: 'Self Help Groups', value: 'shg' },
                { label: 'Non-Government Organisations', value: 'ngo' }
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center gap-2 sm:gap-3 ${isEditMode ? 'cursor-pointer' : ''}`}>
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('orgType')}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                    disabled={!isEditMode}
                  />
                  <span className="radio-label">{opt.label}</span>
                </label>
              ))}

              <div className="flex items-center gap-2 sm:gap-3">
                <label className={`flex items-center gap-2 sm:gap-3 ${isEditMode ? 'cursor-pointer' : ''}`}>
                  <input
                    type="radio"
                    value="other"
                    {...register('orgType')}
                    className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                    disabled={!isEditMode}
                  />
                  <span className="radio-label">Other (Specify)</span>
                </label>
                <input
                  type="text"
                  className="border-b border-input-border focus:border-accent-green-dark outline-none text-sm sm:text-base lg:text-lg text-primary w-32 sm:w-40 bg-transparent"
                  disabled={!isEditMode || orgType !== 'other'}
                  {...register('orgTypeOther')}
                />
              </div>
            </div>
            {errors.orgType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgType.message}</p>}
            {errors.orgTypeOther && orgType === 'other' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgTypeOther.message}</p>}
          </div>

          {/* Stream of Work */}
          <div>
            <label className="form-label">Stream of Work (select all that is applicable)<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-3">
              {streamOptions.map((opt) => (
                <label key={opt.value} className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}>
                  <input
                    type="checkbox"
                    checked={streamOfWork.includes(opt.value)}
                    onChange={() => handleCheckboxToggle(opt.value)}
                    disabled={!isEditMode}
                    className="w-4 h-4 accent-accent-green-dark disabled:opacity-100"
                  />
                  <span className="radio-label">{opt.label}</span>
                </label>
              ))}
              <div className="flex items-center gap-2">
                <label className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}>
                  <input
                    type="checkbox"
                    checked={streamOfWork.includes('other')}
                    onChange={() => handleCheckboxToggle('other')}
                    disabled={!isEditMode}
                    className="w-4 h-4 text-accent-green-dark focus:ring-accent-green rounded disabled:opacity-100"
                  />
                  <span className="radio-label">Other (Specify)</span>
                </label>
                <input
                  type="text"
                  className="border-b border-input-border focus:border-accent-green-dark outline-none text-sm sm:text-base lg:text-lg text-primary w-32 sm:w-40 bg-transparent"
                  disabled={!isEditMode || !streamOfWork.includes('other')}
                  {...register('streamOfWorkOther')}
                />
              </div>
            </div>
            {errors.streamOfWork && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.streamOfWork.message}</p>}
            {errors.streamOfWorkOther && streamOfWork.includes('other') && <p className="text-red-500 text-xs lg:text-sm mt-1">Please specify stream</p>}
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="pocName" className="form-label">POC of the Affiliated Organisation<span className="text-red-500">*</span></label>
              <input
                id="pocName"
                type="text"
                className={inputClass(errors.pocName)}
                placeholder="Your Answer"
                readOnly={!isEditMode}
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
                isDisabled={!isEditMode}
              />

              {/* Village */}
              <div>
                <label htmlFor="village" className="form-label">Village/City<span className="text-red-500">*</span></label>
                <input
                  id="village"
                  type="text"
                  className={inputClass(errors.village)}
                  placeholder="Village/City"
                  readOnly={!isEditMode}
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
              className={inputClass(errors.website)}
              placeholder="www.abc.com"
              readOnly={!isEditMode}
              {...register('website')}
            />
            {errors.website && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.website.message}</p>}
          </div>

        </div>
      </form>
    </div>
  );
});

AoProfileForm.displayName = 'AoProfileForm';

export default AoProfileForm;

