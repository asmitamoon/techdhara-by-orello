const INNOVATION_CATEGORIES = [
  'agriculture',
  'textiles',
  'fisheries',
  'bamboo',
  'poultry',
  'dairy',
  'others'
];

const INNOVATION_SUBCATEGORIES = [
  'maintenance_and_management',
  'processing',
  'production',
  'others'
];

const INNOVATION_CATEGORY_OPTIONS = [
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'fisheries', label: 'Fisheries' },
  { value: 'bamboo', label: 'Bamboo' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'others', label: 'Others' }
];

const INNOVATION_SUBCATEGORY_OPTIONS = [
  { value: 'maintenance_and_management', label: 'Maintenance and management' },
  { value: 'processing', label: 'Processing' },
  { value: 'production', label: 'Production' },
  { value: 'others', label: 'Others' }
];

const INNOVATION_STAGES = ['idea', 'mvp', 'poc', 'sales'];

const INNOVATION_STAGE_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'mvp', label: 'MVP' },
  { value: 'poc', label: 'POC' },
  { value: 'sales', label: 'Sales' }
];

const POWER_SOURCES = ['manual', 'bullock', 'petrol_diesel', 'electrical', 'renewable'];

const POWER_SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'bullock', label: 'Bullock Drawn' },
  { value: 'petrol_diesel', label: 'Petrol/Diesel' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'renewable', label: 'Renewable' }
];

const RENEWABLE_ENERGY_TYPES = ['solar', 'wind', 'biomass', 'hydro', 'geothermal', 'others'];

const RENEWABLE_ENERGY_OPTIONS = [
  { value: 'solar', label: 'Solar' },
  { value: 'wind', label: 'Wind' },
  { value: 'biomass', label: 'Biomass' },
  { value: 'hydro', label: 'Hydro' },
  { value: 'geothermal', label: 'Geothermal' },
  { value: 'others', label: 'Others' }
];

const YES_NO = ['yes', 'no'];

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const DISTRIBUTOR_NETWORK = ['yes', 'only_few', 'not_any'];

const DISTRIBUTOR_NETWORK_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'only_few', label: 'Only a few' },
  { value: 'not_any', label: 'Not any' }
];

const SUPPORT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_needed', label: 'Not Needed' }
];

const SUPPORT_WITH_EXPLORE_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'open_to_explore', label: 'Open to Explore' },
  { value: 'not_needed', label: 'Not Needed' }
];

const AGRICULTURAL_OPERATIONS = [
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
const MANUAL_POWER = ['manual', 'bullock'];      // requires pullCapacity
const ENGINE_POWER = ['petrol_diesel'];           // requires engineCapacity
const MOTOR_POWER = ['electrical', 'renewable']; // requires motorCapacity
const RENEWABLE_POWER = ['renewable'];            // requires renewableType

const AGRICULTURAL_OPERATIONS_OPTIONS = [
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

module.exports = {
  INNOVATION_CATEGORIES,
  INNOVATION_SUBCATEGORIES,
  INNOVATION_CATEGORY_OPTIONS,
  INNOVATION_SUBCATEGORY_OPTIONS,
  INNOVATION_STAGES,
  INNOVATION_STAGE_OPTIONS,
  POWER_SOURCES,
  POWER_SOURCE_OPTIONS,
  RENEWABLE_ENERGY_TYPES,
  RENEWABLE_ENERGY_OPTIONS,
  YES_NO,
  YES_NO_OPTIONS,
  DISTRIBUTOR_NETWORK,
  DISTRIBUTOR_NETWORK_OPTIONS,
  SUPPORT_OPTIONS,
  SUPPORT_WITH_EXPLORE_OPTIONS,
  AGRICULTURAL_OPERATIONS,
  AGRICULTURAL_OPERATIONS_OPTIONS,
  MANUAL_POWER,
  ENGINE_POWER,
  MOTOR_POWER,
  RENEWABLE_POWER
};
