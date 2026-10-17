import { z } from 'zod';

export const fieldReportSchema = z.object({
  // Date field
  selectedDate: z.date().refine(d => d <= new Date(), { message: "Date cannot be in the future" }),

  // Basic Information
  businessModelAdopted: z.enum(['custom_billing_rental', 'service', 'sales', 'fabrication_assembly'], {
    required_error: "Please select a business model"
  }),
  typeOfTechnology: z.enum(['farm_machinery', 'post_harvest_processing', 'quality_testing', 'service_tool'], {
    required_error: "Please select a type of technology"
  }),

  // Training & Technical Performance
  receivedTraining: z.enum(['yes_full', 'yes_basic', 'no_training'], {
    required_error: "Please select training status"
  }),
  machinePerformance: z.enum(['very_good', 'good', 'average', 'poor'], {
    required_error: "Please rate machine performance"
  }),
  easeOfOperation: z.enum(['very_easy', 'easy', 'moderate', 'difficult'], {
    required_error: "Please rate ease of operation"
  }),
  machineReliability: z.enum(['no_breakdowns', 'minor_issues', 'frequent_breakdowns', 'not_functional'], {
    required_error: "Please rate machine reliability"
  }),
  availabilityOfSpares: z.enum(['easily_available', 'available_with_delay', 'only_from_manufacturer', 'not_available'], {
    required_error: "Please select spares availability"
  }),

  // Operations & Maintenance
  easeOfMaintenance: z.enum(['very_easy', 'easy', 'moderate', 'difficult'], {
    required_error: "Please rate ease of maintenance"
  }),
  operationalChallenges: z.array(z.enum(['fuel_battery', 'labour', 'transport', 'spare_parts', 'customer_coordination', 'none'])).min(1, "Please select at least one challenge"),
  downtimeExperience: z.enum(['none', '1_4_days', '5_15_days', '16_plus_days'], {
    required_error: "Please select downtime experience"
  }),
  additionalComments: z.string().max(500, "Comments must be 500 characters or less").optional(),

  // Support & Ecosystem
  supportReceived: z.enum(['technical', 'business_planning', 'market_linkages', 'finance', 'training_fishermen', 'none'], {
    required_error: "Please select support received"
  }),
  supportNeeded: z.enum(['technical', 'business_planning', 'market_linkages', 'finance', 'training_fishermen', 'none'], {
    required_error: "Please select support needed"
  }),

  // Future Outlook
  recommendToOthers: z.enum(['yes', 'maybe', 'no'], {
    required_error: "Please select recommendation status"
  }),
  improvementSuggestions: z.string().max(500, "Suggestions must be 500 characters or less").optional()
});