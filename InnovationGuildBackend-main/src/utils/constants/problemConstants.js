const PROBLEM_CATEGORIES = [
  'agriculture',
  'textiles',
  'bamboo',
  'fisheries',
  'poultry',
  'dairy',
  'others'
];

const PROBLEM_CATEGORY_OPTIONS = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'fisheries', label: 'Fisheries' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'others', label: 'Other (Specify)' }
];

const PROBLEM_SUBCATEGORIES = [
  'maintenance_and_management',
  'processing',
  'production'
];

const PROBLEM_SUBCATEGORY_OPTIONS = [
  { value: 'maintenance_and_management', label: 'Maintenance and management' },
  { value: 'processing', label: 'Processing' },
  { value: 'production', label: 'Production' }
];

const UNIT_TYPES = ['Branch', 'FPO', 'SHG', 'Other'];

const UNIT_TYPE_OPTIONS = [
  { value: 'Branch', label: 'Branch' },
  { value: 'FPO', label: 'FPO' },
  { value: 'SHG', label: 'SHG' },
  { value: 'Other', label: 'Other' }
];

const OWNERSHIP_TYPES = ['Techsetu', 'FPO', 'Individual'];

const OWNERSHIP_OPTIONS = [
  { value: 'Techsetu', label: 'Techsetu' },
  { value: 'FPO', label: 'FPO' },
  { value: 'Individual', label: 'Individual' }
];

const OWNERSHIP_INDIVIDUAL = 'Individual';

module.exports = {
  PROBLEM_CATEGORIES,
  PROBLEM_CATEGORY_OPTIONS,
  PROBLEM_SUBCATEGORIES,
  PROBLEM_SUBCATEGORY_OPTIONS,
  UNIT_TYPES,
  UNIT_TYPE_OPTIONS,
  OWNERSHIP_TYPES,
  OWNERSHIP_OPTIONS,
  OWNERSHIP_INDIVIDUAL
};
