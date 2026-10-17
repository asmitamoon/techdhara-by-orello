// Business model persona constants
// Used for VLE business model selection and conditional field validation

export const BUSINESS_MODEL_PERSONAS = ['sales', 'rental', 'servicing', 'fabrication'];

export const PERSONA_OPTIONS = [
  { value: 'sales', label: 'Sales' },
  { value: 'rental', label: 'Rental' },
  { value: 'servicing', label: 'Servicing' },
  { value: 'fabrication', label: 'Fabrication/Assembly' }
];

// VLE readiness assessment criteria by persona
// Nested structure: category → persona → options
export const ASSESSMENT_READINESS_OPTIONS = [
  {
    category: 'Sales (addition to basic skills)',
    persona: 'sales',
    options: [
      { value: 'sales_familiar', label: 'Familiar with local tools, machines, and technologies' },
      { value: 'sales_space', label: 'Has or can access space for machines / tools inventory' }
    ]
  },
  {
    category: 'Servicing (in addition to basic and sales)',
    persona: 'servicing',
    options: [
      { value: 'servicing_bg', label: 'Has ITI/Diploma/Polytechnic background in machines or technology' },
      { value: 'servicing_exp', label: 'Has experience in servicing and maintaining some day-to-day machineries' },
      { value: 'servicing_space', label: 'Has or can arrange space for setting up a small workshop' },
      { value: 'servicing_training', label: 'Willing to undergo technical training/s for identified servicing gaps' }
    ]
  },
  {
    category: 'Rental (in addition to basic and sales skills)',
    persona: 'rental',
    options: [
      { value: 'rental_training', label: 'Willing to take any operational training required' },
      { value: 'rental_space', label: 'Has space to keep and operate the machine (in case of processing machines)' }
    ]
  },
  {
    category: 'Fabrication/Assembly (in addition to the rental and servicing skills)',
    persona: 'fabrication',
    options: [
      { value: 'fab_exp', label: 'Has experience of building or fabricating machines' },
      { value: 'fab_tools', label: 'Has access to or willing to invest in specific fabrication and assembly tools and machinery' }
    ]
  }
];

// Rental type options for bookkeeping
export const RENTAL_TYPES = ['machine_rental', 'machine_rental_with_service'];

export const RENTAL_TYPE_OPTIONS = [
  { value: 'machine_rental', label: 'Just machine rental' },
  { value: 'machine_rental_with_service', label: 'Machine rental with end to end operation service' }
];
