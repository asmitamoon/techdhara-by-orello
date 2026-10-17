import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import FormSelect from '../../../../components/ui/FormSelect';
import ImageUpload from '../../../common/Register/_components/ImageUpload';
import { getStateOptions, getDistrictOptions } from '../../../../utils/LocationData/locationData';

const streamOptions = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'skill_building', label: 'Skill Building' },
  { value: 'livelihoods', label: 'Livelihoods' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'arts_crafts', label: 'Arts and Crafts' },
  { value: 'climate_change', label: 'Climate Change' },
];

const AORegistrationProfileFields = ({ register, control, watch, setValue, errors }) => {
  // Watch values for conditional rendering
  const selectedState = watch('state');
  const orgType = watch('orgType');
  const streamOfWork = watch('streamOfWork') || [];

  // Clear orgTypeOther when orgType changes away from 'other'
  useEffect(() => {
    if (orgType !== 'other') {
      setValue('orgTypeOther', '');
    }
  }, [orgType, setValue]);

  // Location options
  const stateOptions = getStateOptions();
  const districtOptions = selectedState ? getDistrictOptions(selectedState) : [];

  // Helper for input classes
  const inputClass = (fieldError) =>
    `form-input ${fieldError ? 'border-red-500' : ''}`;

  return (
    <div className="space-y-10 sm:space-y-12">
      <div className="form-section-header">Organization Details</div>

      {/* Logo Upload */}
      <div>
        <label className="form-label">Organization Logo<span className="text-red-500">*</span></label>
        <ImageUpload
          id="logo"
          file={watch('logo')}
          onChange={(e) => setValue('logo', e.target.files?.[0])}
          error={errors.logo}
        />
      </div>

      {/* Organization Name */}
      <div>
        <label className="form-label">Organization Name<span className="text-red-500">*</span></label>
        <input
          type="text"
          className={inputClass(errors.orgName)}
          placeholder="Organization Name"
          {...register('orgName')}
        />
        {errors.orgName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgName.message}</p>}
      </div>

      {/* Organization Type (Radio buttons) */}
      <div>
        <label className="form-label">Organization Type<span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-4 mt-2">
          {['fpc', 'shg', 'ngo', 'other'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={type}
                {...register('orgType')}
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green"
              />
              <span className="radio-label">{type.toUpperCase()}</span>
            </label>
          ))}
        </div>
        {errors.orgType && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgType.message}</p>}

        {/* Show "Other" text input if selected */}
        {orgType === 'other' && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Please specify organization type"
              className={inputClass(errors.orgTypeOther)}
              {...register('orgTypeOther')}
            />
            {errors.orgTypeOther && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.orgTypeOther.message}</p>}
          </div>
        )}
      </div>

      {/* Stream of Work (Checkboxes) */}
      <div>
        <label className="form-label">Stream of Work<span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-4 mt-2">
          {streamOptions.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={value}
                checked={streamOfWork.includes(value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...streamOfWork, value]
                    : streamOfWork.filter(s => s !== value);
                  setValue('streamOfWork', newValue);
                }}
                className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green rounded"
              />
              <span className="radio-label">{label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              value="other"
              checked={streamOfWork.includes('other')}
              onChange={(e) => {
                const newValue = e.target.checked
                  ? [...streamOfWork, 'other']
                  : streamOfWork.filter(s => s !== 'other');
                if (!e.target.checked) setValue('streamOfWorkOther', '');
                setValue('streamOfWork', newValue);
              }}
              className="w-4 h-4 sm:w-5 sm:h-5 text-accent-green-dark focus:ring-accent-green rounded"
            />
            <span className="radio-label">Other</span>
          </label>
        </div>
        {errors.streamOfWork && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.streamOfWork.message}</p>}

        {/* Show "Other" text input if selected */}
        {streamOfWork.includes('other') && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Please specify stream of work"
              className={inputClass(errors.streamOfWorkOther)}
              {...register('streamOfWorkOther')}
            />
            {errors.streamOfWorkOther && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.streamOfWorkOther.message}</p>}
          </div>
        )}
      </div>

      {/* POC, State, District */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div>
          <label className="form-label">POC Name<span className="text-red-500">*</span></label>
          <input
            type="text"
            className={inputClass(errors.pocName)}
            placeholder="Point of Contact Name"
            {...register('pocName')}
          />
          {errors.pocName && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.pocName.message}</p>}
        </div>

        <div>
          <label className="form-label">State<span className="text-red-500">*</span></label>
          <Controller
            name="state"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormSelect
                value={stateOptions.find(opt => opt.value === value) || null}
                onChange={(option) => {
                  onChange(option?.value ?? '');
                  setValue('district', ''); // Reset district when state changes
                }}
                options={stateOptions}
                placeholder="Select State"
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
            render={({ field: { onChange, value } }) => (
              <FormSelect
                value={districtOptions.find(opt => opt.value === value) || null}
                onChange={(option) => onChange(option?.value ?? '')}
                options={districtOptions}
                placeholder="Select District"
                isDisabled={!selectedState}
              />
            )}
          />
          {errors.district && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.district.message}</p>}
        </div>
      </div>

      {/* Village & Website */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
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

        <div>
          <label className="form-label">Website</label>
          <input
            type="url"
            className={inputClass(errors.website)}
            placeholder="https://example.com"
            {...register('website')}
          />
          {errors.website && <p className="text-red-500 text-xs lg:text-sm mt-1">{errors.website.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AORegistrationProfileFields;
