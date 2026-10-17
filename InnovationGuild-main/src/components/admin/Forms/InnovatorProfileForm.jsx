import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3 } from 'lucide-react';
import ImageUpload from '../../../pages/common/Register/_components/ImageUpload';
import LocationGroup from '../../ui/LocationGroup';
import MonthYearPickerSelector from '../../../pages/common/Register/_components/MonthYearPickerSelector';
import { innovatorSchema } from '../../../schemas/registrationSchema';

const InnovatorProfileForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(innovatorSchema),
    defaultValues: initialData || {
      profilePic: null,
      innovatorName: '',
      enterpriseName: '',
      isNotRegistered: false,
      startDate: null,
      links: '',
      state: '',
      district: '',
      addressLine1: '',
      addressLine2: '',
      description: ''
    }
  });

  const profilePicFile = watch('profilePic');
  const isNotRegistered = watch('isNotRegistered');
  const enterpriseName = watch('enterpriseName') || '';
  const description = watch('description') || '';

  // Handle side effects for registered status
  useEffect(() => {
    if (isNotRegistered) {
      setValue('enterpriseName', '', { shouldValidate: true });
      setValue('startDate', null);
    }
  }, [isNotRegistered, setValue]);

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

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default' : ''}`;

  return (
    <div className="bg-white rounded-3xl border border-accent-green-dark p-4 sm:p-5 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="border-b border-input-border pb-3 mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary">Innovator Profile</h2>
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
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent-green-dark border border-accent-green-dark rounded-lg hover:bg-accent-green/5 transition-colors cursor-pointer"
          >
            <Edit3 size={16} />
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="space-y-4 sm:space-y-5">
          {/* Profile Pic Section */}
          <ImageUpload
            id="profilePic"
            file={profilePicFile}
            onChange={(e) => setValue('profilePic', e.target.files?.[0], { shouldValidate: true })}
            error={errors.profilePic}
            label={isEditMode ? "Add a profile image" : (profilePicFile ? "Profile Image" : "No image uploaded")}
            disabled={!isEditMode}
          />

          {/* Name & Enterprise Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="fullName" className="form-label">Name of the Innovator<span className="text-red-500">*</span></label>
              <input
                id="fullName"
                type="text"
                className={inputClass(errors.fullName)}
                placeholder="Your Answer"
                readOnly={!isEditMode}
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="enterpriseName" className="form-label">Name of your Enterprise (Click Checkbox, if not registered as an enterprise)<span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-2">
                <input
                  id="enterpriseName"
                  type="text"
                  className={`${inputClass(errors.enterpriseName)} ${isNotRegistered ? 'opacity-50' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Your Answer"
                  readOnly={!isEditMode}
                  disabled={isNotRegistered}
                  {...register('enterpriseName')}
                />
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNotRegistered"
                    className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark disabled:opacity-100"
                    {...register('isNotRegistered')}
                    disabled={!isEditMode}
                  />
                  <label htmlFor="isNotRegistered" className="text-sm text-gray-500 cursor-pointer">Not registered as an enterprise</label>
                </div>
              </div>
              {errors.enterpriseName && !isNotRegistered && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.enterpriseName.message}</p>}
            </div>
          </div>

          {/* Start Date & Links Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">If you have an enterprise, when was it started?{!isNotRegistered && enterpriseName && <span className="text-red-500">*</span>}</label>
              <div className={!isEditMode || isNotRegistered ? "opacity-75 pointer-events-none grayscale" : ""}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <MonthYearPickerSelector
                      initialDate={field.value}
                      onDateChange={field.onChange}
                    />
                  )}
                />
              </div>
              {errors.startDate && !isNotRegistered && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label htmlFor="links" className="form-label">Provide any link to showcase your work (like website or youtube etc.)<span className="text-red-500">*</span></label>
              <input
                id="links"
                type="text"
                className={inputClass(errors.links)}
                placeholder="e.g. https://youtube.com/..."
                readOnly={!isEditMode}
                {...register('links')}
              />
              {errors.links && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.links.message}</p>}
            </div>
          </div>

          {/* State & District Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <LocationGroup
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
              isDisabled={!isEditMode}
            />
          </div>

          {/* Address Section */}
          <div>
            <label className="form-label">Address<span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-1">
              <div className="flex flex-col">
                <input
                  type="text"
                  className={inputClass(errors.addressLine1)}
                  placeholder="Line 1"
                  readOnly={!isEditMode}
                  {...register('addressLine1')}
                />
                {errors.addressLine1 && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.addressLine1.message}</p>}
              </div>
              <div className="flex flex-col">
                <input
                  type="text"
                  className={inputClass(false)}
                  placeholder="Line 2 (optional)"
                  readOnly={!isEditMode}
                  {...register('addressLine2')}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <label htmlFor="description" className="form-label">A short description of your company<span className="text-red-500">*</span></label>
            <div className="relative mt-1">
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
        </div>
      </form>
    </div>
  );
});

InnovatorProfileForm.displayName = 'InnovatorProfileForm';

export default InnovatorProfileForm;
