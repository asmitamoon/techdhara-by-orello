export const NO_ORG_TYPES = ['non-profit', 'for-profit', 'government', 'hybrid'];
export const NO_ORG_TYPE_OPTIONS = [
  { value: 'non-profit', label: 'Non-Profit Organization' },
  { value: 'for-profit', label: 'For Profit' },
  { value: 'government', label: 'Government' },
  { value: 'hybrid', label: 'Hybrid' }
];

export const YES_NO_PROGRESS = ['yes', 'no', 'under_progress'];
export const YES_NO_PROGRESS_OPTIONS = [
  { value: 'yes',            label: 'Yes' },
  { value: 'no',             label: 'No' },
  { value: 'under_progress', label: 'Under Progress' },
];

export const NO_CHANNELS = [
  'Own Organization Branches',
  'FPOs / FPCs',
  'Cooperatives',
  'Gram Panchayats',
  'Other formal village or block level set-ups'
];
export const NO_CHANNEL_OPTIONS = NO_CHANNELS.map(v => ({ value: v, label: v }));
