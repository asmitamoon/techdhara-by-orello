import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormSelect from '../../../../components/ui/FormSelect';
import ImageUpload from './ImageUpload';
import LocationGroup from '../../../../components/ui/LocationGroup';
import InputTags from '../../../../components/ui/InputTags';
import { vleSchema } from '../../../../schemas/registrationSchema';
import { VLE_CATEGORIES, VLE_CATEGORY_OTHER } from '../../../../utils/constants/vleConstants';
import { useApprovedAos } from '../../../../hooks/queries/public';

const VleProfileForm = ({ onCancel, onSubmit, googleData }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(vleSchema),
    defaultValues: {
      profilePic: null,
      fullName: '',
      age: '',
      gender: '',
      state: '',
      district: '',
      village: '',
      mobile: '',
      affiliatedOrg: '',
      isNotAffiliated: false,
      mainLivelihood: '',
      livelihoodExperience: '',
      otherLivelihoods: [],
      yearlyRevenue: '',
      qualification: '',
      languages: [],
      hasMachineExp: null,
      trainingsTaken: '',
      machineExpYears: '',
      machinesWorkedWith: [],
      vleCategory: '',
      vleCategoryOther: '',
      supportAssessment: []
    }
  });

  const profilePicFile = watch('profilePic');
  const hasMachineExp = watch('hasMachineExp');
  const vleCategory = watch('vleCategory');
  const supportAssessment = watch('supportAssessment');
  const isNotAffiliated = watch('isNotAffiliated');

  useEffect(() => {
    if (!googleData) return;
    if (googleData.fullName) setValue('fullName', googleData.fullName);
    if (googleData.profilePicture) setValue('profilePic', googleData.profilePicture);
  }, [googleData]);

  useEffect(() => {
    if (isNotAffiliated) {
      setValue('affiliatedOrg', '');
    }
  }, [isNotAffiliated, setValue]);

  useEffect(() => {
    if (vleCategory !== VLE_CATEGORY_OTHER) {
      setValue('vleCategoryOther', '');
    }
  }, [vleCategory, setValue]);

  const handleCheckboxToggle = (value) => {
    const currentValues = [...supportAssessment];
    if (currentValues.includes(value)) {
      setValue('supportAssessment', currentValues.filter(v => v !== value));
    } else {
      setValue('supportAssessment', [...currentValues, value]);
    }
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const { data: affiliatedOrgOptions = [], isLoading: aosLoading } = useApprovedAos();

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'assamese', label: 'Assamese (অসমীয়া)' },
    { value: 'bengali', label: 'Bengali (বাংলা)' },
    { value: 'bodo', label: 'Bodo (बड़ो)' },
    { value: 'dogri', label: 'Dogri (ডোগরি)' },
    { value: 'gujarati', label: 'Gujarati (ગુજરાતી)' },
    { value: 'hindi', label: 'Hindi (हिंदी)' },
    { value: 'kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'kashmiri', label: 'Kashmiri (কश्मीरी)' },
    { value: 'konkani', label: 'Konkani (कोंकणी)' },
    { value: 'maithili', label: 'Maithili (मैथिली)' },
    { value: 'malayalam', label: 'Malayalam (മലയാളം)' },
    { value: 'manipuri', label: 'Manipuri (মৈতৈলোন্)' },
    { value: 'marathi', label: 'Marathi (মরাঠি)' },
    { value: 'nepali', label: 'Nepali (नेपाली)' },
    { value: 'odia', label: 'Odia (ଓড়ିଆ)' },
    { value: 'punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'sanskrit', label: 'Sanskrit (संस्कृतम्)' },
    { value: 'santali', label: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },
    { value: 'sindhi', label: 'Sindhi (सिंधी)' },
    { value: 'tamil', label: 'Tamil (தமிழ்)' },
    { value: 'telugu', label: 'Telugu (తెలుగు)' },
    { value: 'urdu', label: 'Urdu (اردو)' },
  ];

  const supportAssessmentOptions = [
    { value: 'open_to_innovations', label: 'The VLE is open to learn about new innovations' },
    { value: 'willing_to_travel', label: 'The VLE is willing to travel for exposure and learning opportunities' },
    { value: 'open_to_investments', label: 'The VLE is open to make investments to build this livelihood option' },
    { value: 'has_smartphone', label: 'The VLE Has access to a smartphone and internet' },
    { value: 'village_groups', label: 'The VLE is actively engaged with village groups and community initiatives' },
    { value: 'literate_local_language', label: 'The VLE is literate in the local language (reading & writing)' },
    { value: 'identify_tech_gaps', label: 'The VLE can identify local technology gaps in different livelihoods of his/her village' },
    { value: 'business_experience', label: 'The VLE has basic entrepreneurial or business experience (formal or informal)' },
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
                <label htmlFor="fullName" className="form-label">Name of the VLE <span className="text-red-500">*</span></label>
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
                  <label htmlFor="age" className="form-label">Age <span className="text-red-500">*</span></label>
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
                  <label htmlFor="gender" className="form-label">Gender <span className="text-red-500">*</span></label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={genderOptions.find(opt => opt.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value)}
                        options={genderOptions}
                        placeholder="Gender"
                        className={errors.gender ? 'border-red-500 rounded' : ''}
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
                  <label htmlFor="village" className="form-label">Village/City <span className="text-red-500">*</span></label>
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
                <label htmlFor="mobile" className="form-label">Mobile Number <span className="text-red-500">*</span></label>
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

            <div>
              <label htmlFor="affiliatedOrg" className="form-label">
                Affiliated Organization (Click Checkbox, if not affiliated with any organization)
              </label>
              <Controller
                name="affiliatedOrg"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    value={affiliatedOrgOptions.find(opt => opt.value === field.value) || null}
                    onChange={(option) => field.onChange(option?.value)}
                    options={affiliatedOrgOptions}
                    placeholder={aosLoading ? 'Loading...' : 'Select Organization'}
                    isSearchable={true}
                    isDisabled={isNotAffiliated || aosLoading}
                    className={isNotAffiliated ? 'opacity-50' : ''}
                  />
                )}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isNotAffiliated"
                  className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark"
                  {...register('isNotAffiliated')}
                />
                <label htmlFor="isNotAffiliated" className="text-sm text-gray-500 cursor-pointer">
                  Not affiliated with any organization
                </label>
              </div>
              {errors.affiliatedOrg && !isNotAffiliated && <p className="text-red-500 text-xs lg:text-sm mt-1">Please select an affiliated organization or check the checkbox above</p>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">Livelihood</div>

          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="mainLivelihood" className="form-label">Main Livelihood <span className="text-red-500">*</span></label>
                <input
                  id="mainLivelihood"
                  type="text"
                  className={`form-input ${errors.mainLivelihood ? 'border-red-500' : ''}`}
                  placeholder="Your Answer"
                  {...register('mainLivelihood')}
                />
                {errors.mainLivelihood && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.mainLivelihood.message}</p>}
              </div>
              <div>
                <label htmlFor="livelihoodExperience" className="form-label">Years of experience in this livelihood activity <span className="text-red-500">*</span></label>
                <input
                  id="livelihoodExperience"
                  type="text"
                  className={`form-input ${errors.livelihoodExperience ? 'border-red-500' : ''}`}
                  placeholder="Your Answer"
                  {...register('livelihoodExperience')}
                />
                {errors.livelihoodExperience && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.livelihoodExperience.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="otherLivelihoods" className="form-label">Other Livelihoods</label>
                <Controller
                  name="otherLivelihoods"
                  control={control}
                  render={({ field }) => (
                    <InputTags
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Type a livelihood and press Enter"
                    />
                  )}
                />
              </div>
              <div>
                <label htmlFor="yearlyRevenue" className="form-label">Yearly Revenue (This information will not be showcased on the website) <span className="text-red-500">*</span></label>
                <input
                  id="yearlyRevenue"
                  type="text"
                  className={`form-input ${errors.yearlyRevenue ? 'border-red-500' : ''}`}
                  placeholder="Your Answer"
                  {...register('yearlyRevenue')}
                />
                {errors.yearlyRevenue && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.yearlyRevenue.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">Skills</div>

          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="qualification" className="form-label">Highest Qualification <span className="text-red-500">*</span></label>
                <input
                  id="qualification"
                  type="text"
                  className={`form-input ${errors.qualification ? 'border-red-500' : ''}`}
                  placeholder="Enter your qualification"
                  {...register('qualification')}
                />
                {errors.qualification && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.qualification.message}</p>}
              </div>
              <div>
                <label htmlFor="languages" className="form-label">Languages Known <span className="text-red-500">*</span></label>
                <Controller
                  name="languages"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      value={languageOptions.filter(opt => field.value.includes(opt.value))}
                      onChange={(options) => field.onChange(options ? options.map(opt => opt.value) : [])}
                      options={languageOptions}
                      placeholder="Select Languages"
                      isSearchable={true}
                      isMulti={true}
                      className={errors.languages ? 'border-red-500 rounded' : ''}
                    />
                  )}
                />
                {errors.languages && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.languages.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="form-label">Does the VLE have experience in working with machines and equipment?</label>
                <div className="flex gap-4 sm:gap-6 mt-2 sm:mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="yes"
                      {...register('hasMachineExp')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                    />
                    <span className="radio-label">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="no"
                      {...register('hasMachineExp')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                    />
                    <span className="radio-label">No</span>
                  </label>
                </div>
                {errors.hasMachineExp && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.hasMachineExp.message}</p>}
              </div>
              <div>
                <label htmlFor="trainingsTaken" className={`form-label ${hasMachineExp !== 'yes' ? 'opacity-50' : ''}`}>If yes, mention the trainings taken <span className="text-red-500">*</span></label>
                <input
                  id="trainingsTaken"
                  type="text"
                  className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your Answer"
                  {...register('trainingsTaken')}
                  disabled={hasMachineExp !== 'yes'}
                />
                {errors.trainingsTaken && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.trainingsTaken.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="machineExpYears" className={`form-label ${hasMachineExp !== 'yes' ? 'opacity-50' : ''}`}>How many years of experience in working with machines and equipment? <span className="text-red-500">*</span></label>
                <input
                  id="machineExpYears"
                  type="text"
                  className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your Answer"
                  {...register('machineExpYears')}
                  disabled={hasMachineExp !== 'yes'}
                />
                {errors.machineExpYears && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machineExpYears.message}</p>}
              </div>
              <div>
                <label htmlFor="machinesWorkedWith" className={`form-label ${hasMachineExp !== 'yes' ? 'opacity-50' : ''}`}>What kind of machines and equipment has the VLE worked with? <span className="text-red-500">*</span></label>
                <Controller
                  name="machinesWorkedWith"
                  control={control}
                  render={({ field }) => (
                    <InputTags
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Type a machine and press Enter"
                      className={hasMachineExp !== 'yes' ? 'opacity-50 pointer-events-none' : ''}
                      disabled={hasMachineExp !== 'yes'}
                    />
                  )}
                />
                {errors.machinesWorkedWith && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machinesWorkedWith.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">What is the category of the VLE?<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 sm:mt-3">
                {VLE_CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={cat}
                      {...register('vleCategory')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                    />
                    <span className="radio-label">{cat}</span>
                  </label>
                ))}
              </div>
              {errors.vleCategory && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.vleCategory.message}</p>}
              
              {vleCategory === VLE_CATEGORY_OTHER && (
                <div className="mt-3 sm:mt-4">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Please specify"
                    {...register('vleCategoryOther')}
                  />
                  {errors.vleCategoryOther && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.vleCategoryOther.message}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-header">VLE Support Assessment</div>
          
          <p className="text-sm text-muted mb-4">
            Note: This is just to analyze the readiness of the VLE and understand the support that might be required.
          </p>

          <div className="space-y-3 sm:space-y-4">
            {supportAssessmentOptions.map((option) => (
              <label key={option.value} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={supportAssessment.includes(option.value)}
                  onChange={() => handleCheckboxToggle(option.value)}
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-accent-green-dark focus:ring-accent-green rounded border-input-border cursor-pointer"
                />
                <span className="text-sm sm:text-base text-muted group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.supportAssessment && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.supportAssessment.message}</p>}
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

export default VleProfileForm;