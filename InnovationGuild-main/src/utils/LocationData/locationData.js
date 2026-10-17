// src/utils/locationData.js
import statesData from './states.json';
import districtsData from './districts.json';


export const getStateOptions = () => {
  return statesData.states.map(state => ({
    value: state.stateCode,
    label: state.stateName,
    isUT: state.isUT
  }));
};

export const getDistrictOptions = (stateCode) => {
  if (!stateCode) return [];

  return districtsData.districts
    .filter(district => district.stateCode === stateCode)
    .map(district => ({
      value: district.districtCode,
      label: district.districtName
    }));
};

export const getStateName = (code) => {
  if (!code) return '';
  return statesData.states.find(s => s.stateCode === code)?.stateName ?? code;
};

export const getDistrictName = (districtCode, stateCode) => {
  if (!districtCode) return '';
  return districtsData.districts.find(
    d => d.districtCode === districtCode && d.stateCode === stateCode
  )?.districtName ?? districtCode;
};