import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Edit3,Plus } from 'lucide-react';
import FormSelect from '../../ui/FormSelect';
import ImageUpload from '../../../pages/common/Register/_components/ImageUpload';
import InputTags from '../../ui/InputTags';
import LocationGroup from '../../ui/LocationGroup';
import { adminVleSchema } from '../../../schemas/adminSchema';
import { VLE_CATEGORIES, VLE_CATEGORY_OTHER } from '../../../utils/constants/vleConstants';
import { useApprovedAos } from '../../../hooks/queries/public';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];


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

const trainingOptions = [
  { value: 'basic', label: 'Basic training', centerField: 'basicTrainingCenter' },
  { value: 'innovation', label: 'Innovation Based training', centerField: 'innovationTrainingCenter' },
  { value: 'advanced', label: 'Advanced training', centerField: 'advancedTrainingCenter' },
  { value: 'other', label: 'Other training', centerField: 'otherTrainingCenter' },
];

const normalizeVleData = (data) => {
  if (!data) return null;
  const toStr = (val) => (val !== null && val !== undefined) ? String(val) : '';
  return {
    ...data,
    age: toStr(data.age),
    livelihoodExperience: toStr(data.livelihoodExperience),
    yearlyRevenue: toStr(data.yearlyRevenue),
    machineExpYears: toStr(data.machineExpYears),
    affiliatedOrg: '',
    isNotAffiliated: true,
  };
};

const VLEProfileForm = forwardRef(({ initialData, isEditMode, onEditToggle, onDataChange, onSubmit, trainingReadOnly = false }, ref) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(adminVleSchema),
    defaultValues: normalizeVleData(initialData) || {
      profilePic: null,
      fullName: '',
      age: '',
      gender: '',
      state: '',
      district: '',
      village: '',
      mobile: '',
      affiliatedOrg: '',
      isNotAffiliated: true,
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
      supportAssessment: [],
      trainings: [],
      basicTrainingCenter: '',
      innovationTrainingCenter: '',
      advancedTrainingCenter: '',
      otherTrainingCenter: '',
    }
  });

  const hasMachineExp = watch('hasMachineExp');
  const vleCategory = watch('vleCategory');
  const supportAssessment = watch('supportAssessment') || [];
  const trainings = watch('trainings') || [];

  const { data: affiliatedOrgOptions = [] } = useApprovedAos();

  useEffect(() => {
    if (vleCategory !== VLE_CATEGORY_OTHER) {
      setValue('vleCategoryOther', '');
    }
  }, [vleCategory, setValue]);

  // Expose submit trigger to parent
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onFormSubmit)();
    }
  }));

  // Reset form to initial data when edit mode is cancelled
  useEffect(() => {
    if (!isEditMode && initialData) {
      const normalized = normalizeVleData(initialData);
      Object.keys(normalized).forEach(key => {
        setValue(key, normalized[key]);
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

  const handleCheckboxToggle = (field, value) => {
    if (!isEditMode) return;
    const currentValues = [...(watch(field) || [])];
    if (currentValues.includes(value)) {
      setValue(field, currentValues.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...currentValues, value], { shouldValidate: true });
    }
  };

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''} ${!isEditMode ? 'bg-transparent border-transparent focus:border-transparent cursor-default' : ''}`;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="space-y-10 sm:space-y-12">
        
        {/* Basic Details Section */}
        <div className="form-section">
          <div className="form-section-header">Basic Details</div>
          
          <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-input-border pb-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-primary">VLE Profile</h2>
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

          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            
            {isEditMode ? (
              <ImageUpload
                file={watch('profilePic') || initialData?.profilePic}
                onChange={(e) => setValue('profilePic', e.target.files?.[0], { shouldValidate: true })}
                error={errors.profilePic}
                label="Add a profile image"
              />
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-accent-green-dark overflow-hidden bg-[#fef2eb] flex items-center justify-center">
                  {initialData?.profilePic ? (
                    <img
                      src={initialData.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-accent-green-dark/50">
                      <Plus size={24} />
                    </div>
                  )}
                </div>
                <p className="text-primary text-sm sm:text-base font-medium">
                  {initialData?.profilePic ? 'Profile Picture' : 'No picture'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="form-label">Name of the VLE<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.fullName)}
                  placeholder="Full Name"
                  readOnly={!isEditMode}
                  {...register('fullName')}
                />
                {errors.fullName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.fullName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="form-label">Age<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={inputClass(errors.age)}
                    placeholder="Age"
                    readOnly={!isEditMode}
                    {...register('age')}
                  />
                  {errors.age && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label className="form-label">Gender<span className="text-red-500">*</span></label>
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
                        isDisabled={!isEditMode}
                        className={errors.gender ? 'border-red-500 rounded' : ''}
                      />
                    )}
                  />
                  {errors.gender && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.gender.message}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              <LocationGroup
                control={control}
                watch={watch}
                setValue={setValue}
                errors={errors}
                isDisabled={!isEditMode}
              />
              <div>
                <label className="form-label">Village/City<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.village)}
                  placeholder="Village/City"
                  readOnly={!isEditMode}
                  {...register('village')}
                />
                {errors.village && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.village.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="form-label">Mobile Number<span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  className={inputClass(errors.mobile)}
                  placeholder="Mobile Number"
                  readOnly={!isEditMode}
                  {...register('mobile')}
                />
                {errors.mobile && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.mobile.message}</p>}
              </div>
              <div>
                <label className="form-label">Affiliated Organization</label>
                {initialData?.affiliatedOrgName ? (
                  <input
                    type="text"
                    value={initialData.affiliatedOrgName}
                    readOnly
                    className={inputClass(null)}
                  />
                ) : (
                  <Controller
                    name="affiliatedOrg"
                    control={control}
                    render={({ field }) => (
                      <FormSelect
                        {...field}
                        value={affiliatedOrgOptions.find(opt => opt.value === field.value) || null}
                        onChange={(option) => {
                          field.onChange(option?.value ?? '');
                          setValue('isNotAffiliated', !option);
                        }}
                        options={affiliatedOrgOptions}
                        placeholder="Select Organization"
                        isSearchable={true}
                        isDisabled={!isEditMode}
                        isClearable={true}
                      />
                    )}
                  />
                )}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isNotAffiliated-admin"
                    checked={!initialData?.affiliatedOrgName}
                    readOnly
                    disabled
                    className="w-4 h-4 rounded border-gray-300 text-accent-green-dark focus:ring-accent-green-dark"
                  />
                  <label htmlFor="isNotAffiliated-admin" className="text-sm text-gray-500">
                    Not affiliated with any organization
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Livelihood Section */}
        <div className="form-section">
          <div className="form-section-header">Livelihood</div>
          
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="form-label">Main Livelihood<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.mainLivelihood)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode}
                  {...register('mainLivelihood')}
                />
                {errors.mainLivelihood && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.mainLivelihood.message}</p>}
              </div>
              <div>
                <label className="form-label">Years of experience in this livelihood activity<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.livelihoodExperience)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode}
                  {...register('livelihoodExperience')}
                />
                {errors.livelihoodExperience && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.livelihoodExperience.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="form-label">Other Livelihoods</label>
                <div className={!isEditMode ? "pointer-events-none" : ""}>
                  <Controller
                    name="otherLivelihoods"
                    control={control}
                    render={({ field }) => (
                      <InputTags
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder={isEditMode ? "Type a livelihood and press Enter" : ""}
                        readOnly={!isEditMode}
                      />
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Yearly Revenue (This information will not be showcased on the website)<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.yearlyRevenue)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode}
                  {...register('yearlyRevenue')}
                />
                {errors.yearlyRevenue && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.yearlyRevenue.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="form-section">
          <div className="form-section-header">Skills</div>
          
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="form-label">Highest Qualification<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.qualification)}
                  placeholder="Enter your qualification"
                  readOnly={!isEditMode}
                  {...register('qualification')}
                />
                {errors.qualification && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.qualification.message}</p>}
              </div>
              <div>
                <label className="form-label">Languages Known<span className="text-red-500">*</span></label>
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
                      isDisabled={!isEditMode}
                      className={errors.languages ? 'border-red-500 rounded' : ''}
                    />
                  )}
                />
                {errors.languages && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.languages.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-2">
              <div>
                <label className="form-label">Does the VLE have experience in working with machines and equipment?</label>
                <div className="flex gap-4 sm:gap-6 mt-2">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}>
                      <input
                        type="radio"
                        value={opt.toLowerCase()}
                        {...register('hasMachineExp')}
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                        disabled={!isEditMode}
                      />
                      <span className="radio-label">{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.hasMachineExp && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.hasMachineExp.message}</p>}
              </div>
              <div className={hasMachineExp !== 'yes' ? "opacity-50" : ""}>
                <label className="form-label">If yes, mention the trainings taken<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.trainingsTaken)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode || hasMachineExp !== 'yes'}
                  {...register('trainingsTaken')}
                />
                {errors.trainingsTaken && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.trainingsTaken.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div className={hasMachineExp !== 'yes' ? "opacity-50" : ""}>
                <label className="form-label">How many years of experience in working with machines and equipment?<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass(errors.machineExpYears)}
                  placeholder="Your Answer"
                  readOnly={!isEditMode || hasMachineExp !== 'yes'}
                  {...register('machineExpYears')}
                />
                {errors.machineExpYears && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machineExpYears.message}</p>}
              </div>
              <div className={hasMachineExp !== 'yes' ? "opacity-50" : ""}>
                <label className="form-label">What kind of machines and equipment has the VLE worked with?<span className="text-red-500">*</span></label>
                <div className={!isEditMode || hasMachineExp !== 'yes' ? "pointer-events-none" : ""}>
                  <Controller
                    name="machinesWorkedWith"
                    control={control}
                    render={({ field }) => (
                      <InputTags
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder={isEditMode && hasMachineExp === 'yes' ? "Type a machine and press Enter" : ""}
                        readOnly={!isEditMode}
                      />
                    )}
                  />
                </div>
                {errors.machinesWorkedWith && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">This field is required</p>}
              </div>
            </div>

            <div>
              <label className="form-label">What is the category of the VLE?<span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-2">
                {VLE_CATEGORIES.map((cat) => (
                  <label key={cat} className={`flex items-center gap-2 ${isEditMode ? 'cursor-pointer' : ''}`}>
                    <input
                      type="radio"
                      value={cat}
                      {...register('vleCategory')}
                      className="w-4 h-4 sm:w-5 sm:h-5 accent-accent-green-dark disabled:opacity-100"
                      disabled={!isEditMode}
                    />
                    <span className="radio-label">{cat}</span>
                  </label>
                ))}
              </div>
              {errors.vleCategory && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.vleCategory.message}</p>}
              
              {vleCategory === VLE_CATEGORY_OTHER && (
                <div className="mt-3">
                  <input
                    type="text"
                    className={inputClass(errors.vleCategoryOther)}
                    placeholder="Please specify"
                    readOnly={!isEditMode}
                    {...register('vleCategoryOther')}
                  />
                  {errors.vleCategoryOther && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.vleCategoryOther.message}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Support Assessment Section */}
        <div className="form-section">
          <div className="form-section-header">VLE Support Assessment</div>
          
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <p className="text-sm text-muted">Note: This is just to analyze the readiness of the VLE and understand the support that might be required.<span className="text-red-500">*</span></p>
            
            <div className="space-y-3 sm:space-y-4">
              {supportAssessmentOptions.map((option) => (
                <label key={option.value} className={`flex items-start gap-3 group ${isEditMode ? 'cursor-pointer' : ''}`}>
                  <input
                    type="checkbox"
                    checked={supportAssessment.includes(option.value)}
                    onChange={() => handleCheckboxToggle('supportAssessment', option.value)}
                    disabled={!isEditMode}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 accent-accent-green-dark disabled:opacity-100 rounded border-input-border"
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

        {/* Training Details Section - Only for approved VLEs */}
        {initialData?.status === 'approved' && (
          <div className="form-section">
            <div className="form-section-header">Training Details</div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                {trainingOptions.map((option) => (
                  <div key={option.value} className="space-y-3">
                    <label className={`flex items-start gap-3 group ${isEditMode && !trainingReadOnly ? 'cursor-pointer' : ''}`}>
                      <input
                        type="checkbox"
                        checked={trainings.includes(option.value)}
                        onChange={() => handleCheckboxToggle('trainings', option.value)}
                        disabled={!isEditMode || trainingReadOnly}
                        className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 accent-accent-green-dark disabled:opacity-100 rounded border-input-border "
                      />
                      <span className="text-sm sm:text-base text-muted group-hover:text-primary transition-colors">
                        {option.label}
                      </span>
                    </label>

                    {trainings.includes(option.value) && (
                      <div className="ml-7 sm:ml-8">
                        <label className="form-label">Training Center<span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          className={inputClass(errors[option.centerField])}
                          placeholder="Mention Training Center"
                          readOnly={!isEditMode || trainingReadOnly}
                          {...register(option.centerField)}
                        />
                        {errors[option.centerField] && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors[option.centerField].message}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
});

VLEProfileForm.displayName = 'VLEProfileForm';

export default VLEProfileForm;
