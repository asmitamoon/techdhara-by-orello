import React, { useEffect } from 'react';
import { VLE_CATEGORIES, VLE_CATEGORY_OTHER } from '../../../../utils/constants/vleConstants';
import { Controller } from 'react-hook-form';
import FormSelect from '../../../../components/ui/FormSelect';
import ImageUpload from '../../../common/Register/_components/ImageUpload';
import InputTags from '../../../../components/ui/InputTags';
import { getStateOptions, getDistrictOptions } from '../../../../utils/LocationData/locationData';

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

const VLERegistrationProfileFields = ({ register, control, watch, setValue, errors }) => {
  const stateOptions = getStateOptions();
  const selectedState = watch('state');
  const districtOptions = selectedState ? getDistrictOptions(selectedState) : [];

  const hasMachineExp = watch('hasMachineExp');
  const vleCategory = watch('vleCategory');
  const supportAssessment = watch('supportAssessment') || [];

  // Clear vleCategoryOther when vleCategory changes away from 'Other'
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

  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''}`;

  return (
    <div className="space-y-10 sm:space-y-12">

      {/* Basic Details Section */}
      <div className="form-section">
        <div className="form-section-header">Basic Details</div>

        <div className="space-y-5 sm:space-y-6 lg:space-y-8">

          <ImageUpload
            file={watch('profilePic')}
            onChange={(e) => setValue('profilePic', e.target.files?.[0])}
            error={errors.profilePic}
            label="Add a profile image"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">Name of the VLE<span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputClass(errors.fullName)}
                placeholder="Full Name"
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
                      className={errors.gender ? 'border-red-500 rounded' : ''}
                    />
                  )}
                />
                {errors.gender && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.gender.message}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="form-label">State<span className="text-red-500">*</span></label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    value={stateOptions.find(opt => opt.value === field.value)}
                    onChange={(option) => {
                      field.onChange(option?.value || '');
                      setValue('district', '');
                    }}
                    options={stateOptions}
                    placeholder="Select State"
                    isSearchable={true}
                    className={errors.state ? 'border-red-500 rounded' : ''}
                  />
                )}
              />
              {errors.state && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="form-label">District<span className="text-red-500">*</span></label>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    value={districtOptions.find(opt => opt.value === field.value)}
                    onChange={(option) => field.onChange(option?.value || '')}
                    options={districtOptions}
                    placeholder="Select District"
                    isSearchable={true}
                    isDisabled={!selectedState}
                    className={errors.district ? 'border-red-500 rounded' : ''}
                  />
                )}
              />
              {errors.district && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.district.message}</p>}
            </div>
            <div>
              <label className="form-label">Village/City<span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputClass(errors.village)}
                placeholder="Village/City"
                {...register('village')}
              />
              {errors.village && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.village.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Mobile Number<span className="text-red-500">*</span></label>
            <input
              type="tel"
              className={inputClass(errors.mobile)}
              placeholder="Mobile Number"
              {...register('mobile')}
            />
            {errors.mobile && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.mobile.message}</p>}
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
                {...register('livelihoodExperience')}
              />
              {errors.livelihoodExperience && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.livelihoodExperience.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">Other Livelihoods</label>
              <Controller
                name="otherLivelihoods"
                control={control}
                render={({ field }) => (
                  <InputTags
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Type a livelihood and press Enter"
                  />
                )}
              />
            </div>
            <div>
              <label className="form-label">Yearly Revenue (This information will not be showcased on the website)<span className="text-red-500">*</span></label>
              <input
                type="text"
                className={inputClass(errors.yearlyRevenue)}
                placeholder="Your Answer"
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
                    className={errors.languages ? 'border-red-500 rounded' : ''}
                  />
                )}
              />
              {errors.languages && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.languages.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">Does the VLE have experience in working with machines and equipment?</label>
              <div className="flex gap-4 sm:gap-6 mt-2">
                {['Yes', 'No'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={opt.toLowerCase()}
                      {...register('hasMachineExp')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
                    />
                    <span className="radio-label">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.hasMachineExp && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.hasMachineExp.message}</p>}
            </div>
            <div>
              <label className={`form-label ${hasMachineExp !== 'yes' ? 'opacity-50' : ''}`}>If yes, mention the trainings taken<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Your Answer"
                disabled={hasMachineExp !== 'yes'}
                {...register('trainingsTaken')}
              />
              {errors.trainingsTaken && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.trainingsTaken.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className={`form-label ${hasMachineExp !== 'yes' ? 'opacity-50' : ''}`}>How many years of experience in working with machines and equipment?<span className="text-red-500">*</span></label>
              <input
                type="text"
                className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Your Answer"
                disabled={hasMachineExp !== 'yes'}
                {...register('machineExpYears')}
              />
              {errors.machineExpYears && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.machineExpYears.message}</p>}
            </div>
            <div>
              <label className={`form-label ${hasMachineExp !== 'yes' ? 'opacity-50' : ''}`}>What kind of machines and equipment has the VLE worked with?<span className="text-red-500">*</span></label>
              <Controller
                name="machinesWorkedWith"
                control={control}
                render={({ field }) => (
                  <InputTags
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Type a machine and press Enter"
                    className={hasMachineExp !== 'yes' ? 'opacity-50 pointer-events-none' : ''}
                    disabled={hasMachineExp !== 'yes'}
                  />
                )}
              />
              {errors.machinesWorkedWith && hasMachineExp === 'yes' && <p className="text-red-500 text-xs lg:text-sm mt-1">This field is required</p>}
            </div>
          </div>

          <div>
            <label className="form-label">What is the category of the VLE?<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-2">
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
              <div className="mt-3">
                <input
                  type="text"
                  className={inputClass(errors.vleCategoryOther)}
                  placeholder="Please specify"
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
              <label key={option.value} className="flex items-start gap-3 group cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportAssessment.includes(option.value)}
                  onChange={() => handleCheckboxToggle(option.value)}
                  className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-accent-green-dark focus:ring-accent-green rounded border-input-border"
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
    </div>
  );
};

export default VLERegistrationProfileFields;
