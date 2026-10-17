const NO_ORG_TYPES = ['non-profit', 'for-profit', 'government', 'hybrid'];
const NO_ORG_TYPE_OPTIONS = [
  { value: 'non-profit', label: 'Non-Profit Organization' },
  { value: 'for-profit', label: 'For Profit' },
  { value: 'government', label: 'Government' },
  { value: 'hybrid', label: 'Hybrid' }
];

const YES_NO_PROGRESS = ['yes', 'no', 'under_progress'];
const YES_NO_PROGRESS_OPTIONS = [
  { value: 'yes',            label: 'Yes' },
  { value: 'no',             label: 'No' },
  { value: 'under_progress', label: 'Under Progress' },
];

const NO_CHANNELS = [
  'Own Organization Branches',
  'FPOs / FPCs',
  'Cooperatives',
  'Gram Panchayats',
  'Other formal village or block level set-ups'
];
const NO_CHANNEL_OPTIONS = NO_CHANNELS.map(v => ({ value: v, label: v }));

module.exports = {
  NO_ORG_TYPES,
  NO_ORG_TYPE_OPTIONS,
  YES_NO_PROGRESS,
  YES_NO_PROGRESS_OPTIONS,
  NO_CHANNELS,
  NO_CHANNEL_OPTIONS
};
