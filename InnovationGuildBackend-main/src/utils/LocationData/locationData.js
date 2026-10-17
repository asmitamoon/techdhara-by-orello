const statesData = require('./states.json');
const districtsData = require('./districts.json');

const getStateOptions = () => {
  return statesData.states.map(state => ({
    value: state.stateCode,
    label: state.stateName,
    isUT: state.isUT
  }));
};

const getDistrictOptions = (stateCode) => {
  if (!stateCode) return [];

  return districtsData.districts
    .filter(district => district.stateCode === stateCode)
    .map(district => ({
      value: district.districtCode,
      label: district.districtName
    }));
};

const getStateName = (code) => {
  if (!code) return '';
  return statesData.states.find(s => s.stateCode === code)?.stateName ?? code;
};

const getDistrictName = (districtCode, stateCode) => {
  if (!districtCode) return '';
  return districtsData.districts.find(
    d => d.districtCode === districtCode && d.stateCode === stateCode
  )?.districtName ?? districtCode;
};

// Reverse lookups: match a free-text search term against state/district names → return codes
const findStateCodesByName = (term) => {
  const t = String(term || '').trim().toLowerCase();
  if (!t) return [];
  return statesData.states
    .filter(s => s.stateName.toLowerCase().includes(t))
    .map(s => s.stateCode);
};

const findDistrictCodesByName = (term) => {
  const t = String(term || '').trim().toLowerCase();
  if (!t) return [];
  return districtsData.districts
    .filter(d => d.districtName.toLowerCase().includes(t))
    .map(d => d.districtCode);
};

module.exports = {
  getStateOptions,
  getDistrictOptions,
  getStateName,
  getDistrictName,
  findStateCodesByName,
  findDistrictCodesByName,
};
