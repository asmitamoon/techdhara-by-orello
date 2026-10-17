// Innovation category and subcategory constants
// Single source of truth for innovation categories used in both schema validation and form options

export const INNOVATION_CATEGORIES = [
  'agriculture',
  'textiles',
  'fisheries',
  'bamboo',
  'poultry',
  'dairy',
  'others'
];

export const INNOVATION_SUBCATEGORIES = [
  'maintenance_and_management',
  'processing',
  'production',
  'others'
];

export const INNOVATION_CATEGORY_OPTIONS = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'fisheries', label: 'Fisheries' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'others', label: 'Others' },
];

export const INNOVATION_SUBCATEGORY_OPTIONS = [
  { value: 'production', label: 'Production' },
  { value: 'processing', label: 'Processing' },
  { value: 'maintenance_and_management', label: 'Management' },
  { value: 'others', label: 'Others' },
];

export const INNOVATION_OPERATIONS_OPTIONS = [
  { value: 'bed_making', label: 'Bed Making' },
  { value: 'drying', label: 'Drying' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'interculture', label: 'Interculture' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'oil_extraction', label: 'Oil Extraction' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'quality_testing', label: 'Quality Testing' },
  { value: 'raking', label: 'Raking' },
  { value: 'shelling', label: 'Shelling' },
  { value: 'sowing', label: 'Sowing' },
  { value: 'spraying', label: 'Spraying' },
  { value: 'threshing', label: 'Threshing' },
  { value: 'tillage', label: 'Tillage' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'winnowing', label: 'Winnowing' },
];

// Innovation stage constants
export const INNOVATION_STAGES = [
  'idea',
  'mvp',
  'poc',
  'sales'
];

export const INNOVATION_STAGE_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'mvp', label: 'MVP' },
  { value: 'poc', label: 'POC' },
  { value: 'sales', label: 'Sales' },
];

// Power source constants (shared with problem forms)
export const POWER_SOURCES = [
  'manual',
  'bullock',
  'petrol_diesel',
  'electrical',
  'renewable'
];

export const POWER_SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'bullock', label: 'Bullock Drawn' },
  { value: 'petrol_diesel', label: 'Petrol/Diesel' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'renewable', label: 'Renewable' },
];

// Renewable energy type constants (shared with problem forms)
export const RENEWABLE_ENERGY_TYPES = [
  'solar',
  'wind',
  'biomass',
  'hydro',
  'geothermal',
  'others'
];

export const RENEWABLE_ENERGY_OPTIONS = [
  { value: 'solar', label: 'Solar' },
  { value: 'wind', label: 'Wind' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'hydro', label: 'Hydro' },
  { value: 'geothermal', label: 'Geothermal' },
  { value: 'others', label: 'Others' },
];

// Yes/No variant constants for innovation forms
export const YES_NO = ['yes', 'no'];

export const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const DISTRIBUTOR_NETWORK = ['yes', 'only_few', 'not_any'];

export const DISTRIBUTOR_NETWORK_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'only_few', label: 'Only a few' },
  { value: 'not_any', label: 'Not any' },
];

export const SUPPORT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_needed', label: 'Not Needed' },
];

export const SUPPORT_WITH_EXPLORE_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'open_to_explore', label: 'Open to Explore' },
  { value: 'not_needed', label: 'Not Needed' },
];

// Agricultural operations (shared by innovation and problem submission forms)
// Users can add custom operations beyond these base options
export const AGRICULTURAL_OPERATIONS = [
  'bed_making',
  'drying',
  'harvesting',
  'interculture',
  'irrigation',
  'oil_extraction',
  'packaging',
  'quality_testing',
  'raking',
  'shelling',
  'sowing',
  'spraying',
  'threshing',
  'tillage',
  'transportation',
  'weeding',
  'winnowing'
];

// Power source groupings for conditional field validation in schemas
export const MANUAL_POWER = ['manual', 'bullock'];      // requires pullCapacity
export const ENGINE_POWER = ['petrol_diesel'];           // requires engineCapacity
export const MOTOR_POWER = ['electrical', 'renewable']; // requires motorCapacity
export const RENEWABLE_POWER = ['renewable'];            // requires renewableType

export const AGRICULTURAL_OPERATIONS_OPTIONS = [
  { value: 'bed_making', label: 'Bed Making' },
  { value: 'drying', label: 'Drying' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'interculture', label: 'Interculture' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'oil_extraction', label: 'Oil Extraction' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'quality_testing', label: 'Quality Testing' },
  { value: 'raking', label: 'Raking' },
  { value: 'shelling', label: 'Shelling' },
  { value: 'sowing', label: 'Sowing' },
  { value: 'spraying', label: 'Spraying' },
  { value: 'threshing', label: 'Threshing' },
  { value: 'tillage', label: 'Tillage' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'weeding', label: 'Weeding' },
  { value: 'winnowing', label: 'Winnowing' }
];
