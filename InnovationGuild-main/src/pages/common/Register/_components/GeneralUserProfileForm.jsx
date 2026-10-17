import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ImageUpload from './ImageUpload';
import LocationGroup from '../../../../components/ui/LocationGroup';
import FormSelect from '../../../../components/ui/FormSelect';
import { generalUserSchema } from '../../../../schemas/registrationSchema';

const GeneralUserProfileForm = ({ onCancel, onSubmit, googleData }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(generalUserSchema),
    defaultValues: {
      fullName: '',
      age: '',
      gender: '',
      state: '',
      district: '',
      village: '',
      mobile: '',
      profilePic: null
    }
  });

  const profilePicFile = watch('profilePic');

  useEffect(() => {
    if (!googleData) return;
    if (googleData.fullName) setValue('fullName', googleData.fullName);
    if (googleData.profilePicture) setValue('profilePic', googleData.profilePicture);
  }, [googleData]);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const onFormSubmit = async (data) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="space-y-8 sm:space-y-10 lg:space-y-12 pt-8 sm:pt-10">

        <div className="form-section">
          <div className="form-section-header">Basic Details</div>

          <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-4 sm:mt-6">
            
            <ImageUpload 
              file={profilePicFile}
              onChange={(e) => setValue('profilePic', e.target.files?.[0])}
              error={errors.profilePic}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="fullName" className="form-label">Name of the User<span className="text-red-500">*</span></label>
                <input
                  id="fullName"
                  type="text"
                  className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                  placeholder="Full Name"
                  {...register('fullName')}
                />
                {errors.fullName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="age" className="form-label">Age<span className="text-red-500">*</span></label>
                  <input
                    id="age"
                    type="text"
                    inputMode="numeric"
                    className={`form-input ${errors.age ? 'border-red-500' : ''}`}
                    placeholder="Age"
                    {...register('age')}
                  />
                  {errors.age && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label htmlFor="gender" className="form-label">Gender<span className="text-red-500">*</span></label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={genderOptions.find(opt => opt.value === field.value) || null}
                        onChange={(val) => field.onChange(val?.value)}
                        options={genderOptions}
                        placeholder="Gender"
                        className={errors.gender ? "border-red-500 rounded" : ""}
                      />
                    )}
                  />
                  {errors.gender && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.gender.message}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 sm:gap-6">
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
                  {errors.village && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.village.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="form-label">Mobile Number<span className="text-red-500">*</span></label>
                <input
                  id="mobile"
                  type="tel"
                  className={`form-input ${errors.mobile ? 'border-red-500' : ''}`}
                  placeholder="Mobile Number"
                  {...register('mobile')}
                />
                {errors.mobile && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.mobile.message}</p>}
              </div>
            </div>
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
  );
};

export default GeneralUserProfileForm;