export default function getTemplates(){
    const templates = [
        // Template 1: Health - Medical Conditions
        {
            id: 0,
            name: 'medical_conditions',
            description: 'List of medical conditions affecting individuals',
            fields: [
                {
                    id: 0,
                    name: 'condition_name',
                    description: 'The specific name of the medical condition',
                    data_type: 'TEXT'
                },
                {
                    id: 1,
                    name: 'severity_level',
                    description: 'Severity of the condition on a scale of 1-10',
                    data_type: 'INTEGER'
                },
                {
                    id: 2,
                    name: 'chronic',
                    description: 'Whether the condition is chronic or not',
                    data_type: 'BOOLEAN'
                },
                {
                    id: 3,
                    name: 'treatment_required',
                    description: 'The required level of medical treatment for the condition',
                    data_type: 'TEXT'
                },
                {
                    id: 4,
                    name: 'contagious',
                    description: 'Whether the condition is contagious or not',
                    data_type: 'BOOLEAN'
                }
            ],
        },
        // Template 2: Health - Nutrition
        {
            id: 1,
            name: 'nutrition',
            description: 'Nutritional requirements for maintaining health',
            fields: [
                {
                    id: 0,
                    name: 'nutrient_name',
                    description: 'Name of the nutrient required by the body',
                    data_type: 'TEXT'
                },
                {
                    id: 1,
                    name: 'daily_value_percentage',
                    description: 'Percentage of daily value intake recommended',
                    data_type: 'INTEGER'
                },
                {
                    id: 2,
                    name: 'source',
                    description: 'Primary food source of the nutrient',
                    data_type: 'TEXT'
                },
                {
                    id: 3,
                    name: 'essential',
                    description: 'Whether the nutrient is essential for survival',
                    data_type: 'BOOLEAN'
                },
                {
                    id: 4,
                    name: 'deficiency_risks',
                    description: 'Health risks associated with nutrient deficiency',
                    data_type: 'TEXT'
                }
            ],
        },
        // Template 3: Resources - Energy Sources
        {
            id: 2,
            name: 'energy_sources',
            description: 'Various sources of energy available for consumption',
            fields: [
                {
                    id: 0,
                    name: 'source_name',
                    description: 'The name of the energy source (e.g., solar, wind)',
                    data_type: 'TEXT'
                },
                {
                    id: 1,
                    name: 'renewable',
                    description: 'Whether the energy source is renewable',
                    data_type: 'BOOLEAN'
                },
                {
                    id: 2,
                    name: 'energy_output',
                    description: 'The amount of energy produced by the source (in kWh)',
                    data_type: 'INTEGER'
                },
                {
                    id: 3,
                    name: 'environmental_impact',
                    description: 'The environmental impact of using the energy source',
                    data_type: 'TEXT'
                },
                {
                    id: 4,
                    name: 'availability',
                    description: 'The availability of the energy source (common, rare)',
                    data_type: 'TEXT'
                }
            ],
        },
        // Template 4: Resources - Food Production
        {
            id: 3,
            name: 'food_production',
            description: 'Data on food production methods and outputs',
            fields: [
                {
                    id: 0,
                    name: 'food_item',
                    description: 'Name of the food item being produced',
                    data_type: 'TEXT'
                },
                {
                    id: 1,
                    name: 'production_method',
                    description: 'Method used to produce the food (e.g., farming, aquaculture)',
                    data_type: 'TEXT'
                },
                {
                    id: 2,
                    name: 'yield_per_acre',
                    description: 'Average yield produced per acre (in tons)',
                    data_type: 'INTEGER'
                },
                {
                    id: 3,
                    name: 'sustainability',
                    description: 'Whether the production method is sustainable',
                    data_type: 'BOOLEAN'
                },
                {
                    id: 4,
                    name: 'resource_requirements',
                    description: 'Resources required for production (water, energy)',
                    data_type: 'TEXT'
                }
            ],
        },
        // Template 5: Security - Threat Assessment
        {
            id: 4,
            name: 'threat_assessment',
            description: 'Assessment of potential threats to security',
            fields: [
                {
                    id: 0,
                    name: 'threat_type',
                    description: 'Type of threat (e.g., cyber, physical, environmental)',
                    data_type: 'TEXT'
                },
                {
                    id: 1,
                    name: 'likelihood',
                    description: 'Likelihood of the threat occurring (1-10 scale)',
                    data_type: 'INTEGER'
                },
                {
                    id: 2,
                    name: 'impact_level',
                    description: 'Potential impact level of the threat (1-10 scale)',
                    data_type: 'INTEGER'
                },
                {
                    id: 3,
                    name: 'mitigation_strategy',
                    description: 'Strategy to mitigate the threat',
                    data_type: 'TEXT'
                },
                {
                    id: 4,
                    name: 'monitored',
                    description: 'Whether the threat is actively monitored',
                    data_type: 'BOOLEAN'
                }
            ],
        },
        // Template 6: Security - Emergency Response
        {
            id: 5,
            name: 'emergency_response',
            description: 'Data on emergency response plans and capabilities',
            fields: [
                {
                    id: 0,
                    name: 'emergency_type',
                    description: 'Type of emergency (e.g., natural disaster, man-made)',
                    data_type: 'TEXT'
                },
                {
                    id: 1,
                    name: 'response_time',
                    description: 'Estimated response time to the emergency (in minutes)',
                    data_type: 'INTEGER'
                },
                {
                    id: 2,
                    name: 'resources_allocated',
                    description: 'Resources allocated for emergency response',
                    data_type: 'TEXT'
                },
                {
                    id: 3,
                    name: 'effectiveness_rating',
                    description: 'Effectiveness rating of the response plan (1-10 scale)',
                    data_type: 'INTEGER'
                },
                {
                    id: 4,
                    name: 'communication_protocol',
                    description: 'Protocol for communication during an emergency',
                    data_type: 'TEXT'
                }
            ],
        }
    ]

    return templates;
}
