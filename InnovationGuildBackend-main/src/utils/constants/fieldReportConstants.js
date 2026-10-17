const BUSINESS_MODELS_ADOPTED = [
  'custom_billing_rental',
  'service',
  'sales',
  'fabrication_assembly'
];

const TECHNOLOGY_TYPES = [
  'farm_machinery',
  'post_harvest_processing',
  'quality_testing',
  'service_tool'
];

const TRAINING_STATUS = ['yes_full', 'yes_basic', 'no_training'];

const PERFORMANCE_RATINGS = ['very_good', 'good', 'average', 'poor'];

const EASE_RATINGS = ['very_easy', 'easy', 'moderate', 'difficult'];

const RELIABILITY_RATINGS = [
  'no_breakdowns',
  'minor_issues',
  'frequent_breakdowns',
  'not_functional'
];

const SPARES_AVAILABILITY = [
  'easily_available',
  'available_with_delay',
  'only_from_manufacturer',
  'not_available'
];

const OPERATIONAL_CHALLENGES = [
  'fuel_battery',
  'labour',
  'transport',
  'spare_parts',
  'customer_coordination',
  'none'
];

const DOWNTIME_OPTIONS = ['none', '1_4_days', '5_15_days', '16_plus_days'];

const SUPPORT_OPTIONS = [
  'technical',
  'business_planning',
  'market_linkages',
  'finance',
  'training_fishermen',
  'none'
];

const RECOMMEND_OPTIONS = ['yes', 'maybe', 'no'];

module.exports = {
  BUSINESS_MODELS_ADOPTED,
  TECHNOLOGY_TYPES,
  TRAINING_STATUS,
  PERFORMANCE_RATINGS,
  EASE_RATINGS,
  RELIABILITY_RATINGS,
  SPARES_AVAILABILITY,
  OPERATIONAL_CHALLENGES,
  DOWNTIME_OPTIONS,
  SUPPORT_OPTIONS,
  RECOMMEND_OPTIONS
};
