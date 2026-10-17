import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageUpload from './ImageUpload';
import LocationGroup from '../../../../components/ui/LocationGroup';
import MonthYearPickerSelector from './MonthYearPickerSelector';
import { innovatorSchema } from '../../../../schemas/registrationSchema';

const InnovatorProfileForm = ({ onCancel, onSubmit, googleData }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(innovatorSchema),
    defaultValues: {
      profilePic: null,
      fullName: '',
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

  useEffect(() => {
    if (!googleData) return;
    if (googleData.fullName) setValue('fullName', googleData.fullName);
    if (googleData.profilePicture) setValue('profilePic', googleData.profilePicture);
  }, [googleData]);

  useEffect(() => {
    if (isNotRegistered) {
      setValue('enterpriseName', '', { shouldValidate: true });
      setValue('startDate', null);
    }
  }, [isNotRegistered, setValue]);

  const onFormSubmit = async (data) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <div className="pb-8 sm:pb-10 lg:pb-12 pt-6 sm:pt-8 lg:pt-10">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="bg-white rounded-2xl sm:rounded-[28px] lg:rounded-[32px] border border-accent-green-dark p-5 sm:p-6 lg:p-8 xl:p-10">
          
          <div className="border-b border-input-border pb-3 sm:pb-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Innovator</h2>
          </div>

          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
              
              <ImageUpload 
                file={profilePicFile}
                onChange={(e) => setValue('profilePic', e.target.files?.[0])}
                error={errors.profilePic}
                label="Add a profile image"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                      <label htmlFor="fullName" className="form-label">Name of the Innovator<span className="text-red-500">*</span></label>
                      <input 
                          id="fullName"
                          type="text" 
                          className={`form-input ${errors.fullName ? 'border-red-500' : ''}`} 
                          placeholder="Your Answer" 
                          {...register('fullName')}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                      <label htmlFor="enterpriseName" className="form-label">Name of your Enterprise (Click Checkbox, if not registered as an enterprise)<span className="text-red-500">*</span></label>
                      <input 
                          id="enterpriseName"
                          type="text" 
                          className={`form-input ${errors.enterpriseName ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`} 
                          placeholder="Your Answer" 
                          {...register('enterpriseName')}
                          disabled={isNotRegistered}
                      />
                      <div className="mt-2 flex items-center gap-2">
                          <input 
                              type="checkbox" 
                              id="isNotRegistered"
                              className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark"
                              {...register('isNotRegistered')}
                          />
                          <label htmlFor="isNotRegistered" className="text-sm text-gray-500 cursor-pointer">Not registered as an enterprise</label>
                      </div>
                      {errors.enterpriseName && !isNotRegistered && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.enterpriseName.message}</p>}
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                      <label className="form-label">If you have an enterprise, when was it started?{!isNotRegistered && enterpriseName && <span className="text-red-500">*</span>}</label>
                      <div className={isNotRegistered ? "opacity-50 pointer-events-none grayscale" : ""}>
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
                          className={`form-input ${errors.links ? 'border-red-500' : ''}`} 
                          placeholder="e.g. https://youtube.com/..."
                          {...register('links')}
                      />
                      {errors.links && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.links.message}</p>}
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                   <LocationGroup 
                      control={control}
                      watch={watch}
                      setValue={setValue}
                      errors={errors}
                   />
              </div>

              <div>
                  <label className="form-label">Address<span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                      <div className="flex flex-col">
                        <input 
                            type="text" 
                            className={`form-input ${errors.addressLine1 ? 'border-red-500' : ''}`} 
                            placeholder="Line 1" 
                            {...register('addressLine1')}
                        />
                        {errors.addressLine1 && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.addressLine1.message}</p>}
                      </div>
                      <div className="flex flex-col">
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Line 2 (optional)" 
                            {...register('addressLine2')}
                        />
                      </div>
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

          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 mb-6 sm:mb-8">
            <p className="text-muted text-xs sm:text-sm italic">
              You can not submit an innovation if registration of the profile is not done and approved.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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

export default InnovatorProfileForm;