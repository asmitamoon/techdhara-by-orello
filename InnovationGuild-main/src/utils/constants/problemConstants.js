// Problem submission form constants
// Single source of truth for problem statement categories, operations, and form options

// Problem categories (used in InnovationRequestForm)
export const PROBLEM_CATEGORIES = [
  'agriculture',
  'textiles',
  'bamboo',
  'fisheries',
  'poultry',
  'dairy',
  'others'
];

export const PROBLEM_CATEGORY_OPTIONS = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'fisheries', label: 'Fisheries' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'others', label: 'Other (Specify)' }
];

// Problem subcategories (value chain stages)
export const PROBLEM_SUBCATEGORIES = [
  'maintenance_and_management',
  'processing',
  'production'
];

export const PROBLEM_SUBCATEGORY_OPTIONS = [
  { value: 'maintenance_and_management', label: 'Maintenance and management' },
  { value: 'processing', label: 'Processing' },
  { value: 'production', label: 'Production' }
];

// Service request unit types
export const UNIT_TYPES = ['Branch', 'FPO', 'SHG'];

export const UNIT_TYPE_OPTIONS = [
  { value: 'Branch', label: 'Branch' },
  { value: 'FPO', label: 'FPO' },
  { value: 'SHG', label: 'SHG' }
];

// Service request ownership options
export const OWNERSHIP_TYPES = ['Dvara', 'FPO', 'Individual'];

export const OWNERSHIP_OPTIONS = [
  { value: 'Dvara', label: 'Dvara' },
  { value: 'FPO', label: 'FPO' },
  { value: 'Individual', label: 'Individual' }
];

export const OWNERSHIP_INDIVIDUAL = 'Individual';
