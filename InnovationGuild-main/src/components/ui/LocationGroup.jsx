import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import FormSelect from './FormSelect';
import { getDistrictOptions, getStateOptions } from '../../utils/LocationData/locationData';

const LocationGroup = ({
  control,
  watch,
  setValue,
  errors,
  stateName = "state",
  districtName = "district",
  stateLabel = "State",
  districtLabel = "District",
  showDistrict = true,
  showLabels = true,
  isDisabled = false
}) => {
  const selectedState = watch(stateName);
  const stateOptions = getStateOptions();
  const districtOptions = selectedState ? getDistrictOptions(selectedState) : [];

  useEffect(() => {
    // Only reset district if the state actually changed and it's not the initial load or a forced value
    // However, to keep it simple and consistent with current implementation:
    // we only reset if setValue is present and showDistrict is true
  }, [selectedState, setValue, districtName, showDistrict]);

  return (
    <>
      <div>
        {showLabels && <label htmlFor={stateName} className="form-label">{stateLabel}<span className="text-red-500">*</span></label>}
        <Controller
          name={stateName}
          control={control}
          render={({ field }) => (
            <FormSelect
              {...field}
              value={stateOptions.find(opt => opt.value === field.value) || null}
              onChange={(option) => {
                field.onChange(option?.value);
                if (showDistrict && setValue) setValue(districtName, '', { shouldValidate: true });
              }}
              options={stateOptions}
              placeholder={`Select ${stateLabel}`}
              isSearchable={true}
              isDisabled={isDisabled}
              className={errors[stateName] ? 'border-red-500 rounded' : ''}
            />
          )}
        />
        {errors[stateName] && <p className="text-red-500 text-xs lg:text-sm mt-1">{stateLabel} is required</p>}
      </div>

      {showDistrict && (
        <div>
          {showLabels && <label htmlFor={districtName} className="form-label">{districtLabel}<span className="text-red-500">*</span></label>}
          <Controller
            name={districtName}
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                value={districtOptions.find(opt => opt.value === field.value) || null}
                onChange={(option) => {
                  field.onChange(option?.value);
                  if (setValue) setValue(districtName, option?.value ?? '', { shouldValidate: true });
                }}
                options={districtOptions}
                placeholder={`Select ${districtLabel}`}
                isSearchable={true}
                isDisabled={isDisabled || !selectedState}
                className={errors[districtName] ? 'border-red-500 rounded' : ''}
              />
            )}
          />
          {errors[districtName] && <p className="text-red-500 text-xs lg:text-sm mt-1">{districtLabel} is required</p>}
        </div>
      )}
    </>
  );
};

export default LocationGroup;
