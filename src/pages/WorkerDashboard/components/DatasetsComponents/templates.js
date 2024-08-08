export default function getExtremeTemplates() {
    const templates = [
        // Template 1: Reality Distortion Index
        {
            id: 0,
            name: 'reality_distortion_index',
            description: 'Tracking how media, technology, and social influences warp public perception of reality.',
            fields: [
                { id: 0, name: 'event_name', description: 'Name of the event or topic being reported', data_type: 'TEXT' },
                { id: 1, name: 'media_outlet', description: 'Media outlet or platform that reported the event', data_type: 'TEXT' },
                { id: 2, name: 'public_perception_score', description: 'Public perception of the event on a scale of 1-10', data_type: 'INTEGER' },
                { id: 3, name: 'factual_accuracy', description: 'Factual accuracy of the event as verified by independent sources (1-10)', data_type: 'INTEGER' },
                { id: 4, name: 'social_amplification', description: 'Degree of amplification through social media (1-10)', data_type: 'INTEGER' },
                { id: 5, name: 'narrative_shift', description: 'Shift in the narrative or interpretation of the event over time', data_type: 'BOOLEAN' }
            ],
        },
        // Template 2: Chaos Mapping Protocol
        {
            id: 1,
            name: 'chaos_mapping_protocol',
            description: 'Tracking unpredictable, chaotic forces that impact long-term stability.',
            fields: [
                { id: 0, name: 'chaotic_event', description: 'Description of the chaotic event or phenomenon', data_type: 'TEXT' },
                { id: 1, name: 'trigger_factor', description: 'Primary factor triggering the chaotic event', data_type: 'TEXT' },
                { id: 2, name: 'impact_radius', description: 'Geographical or social radius affected by the event', data_type: 'TEXT' },
                { id: 3, name: 'predictability_score', description: 'Score indicating how predictable the event was (1-10)', data_type: 'INTEGER' },
                { id: 4, name: 'mitigation_attempt', description: 'Whether any mitigation attempt was made', data_type: 'BOOLEAN' },
                { id: 5, name: 'long_term_effects', description: 'Assessment of the long-term effects of the chaotic event', data_type: 'TEXT' }
            ],
        },
        // Template 3: Human Desperation Metrics
        {
            id: 2,
            name: 'human_desperation_metrics',
            description: 'Capturing conditions that drive individuals or groups to desperation.',
            fields: [
                { id: 0, name: 'desperation_trigger', description: 'Event or condition triggering desperation', data_type: 'TEXT' },
                { id: 1, name: 'severity', description: 'Severity of the condition on a scale of 1-10', data_type: 'INTEGER' },
                { id: 2, name: 'response_type', description: 'Type of response (e.g., migration, violence, protest)', data_type: 'TEXT' },
                { id: 3, name: 'affected_population', description: 'Number of people affected', data_type: 'INTEGER' },
                { id: 4, name: 'geographical_area', description: 'Geographical area impacted', data_type: 'TEXT' },
                { id: 5, name: 'support_intervention', description: 'Existence of support or intervention attempts', data_type: 'BOOLEAN' }
            ],
        },
        // Template 4: Inconvenient Truths Repository
        {
            id: 3,
            name: 'inconvenient_truths_repository',
            description: 'A collection of data exposing uncomfortable truths about society.',
            fields: [
                { id: 0, name: 'truth_statement', description: 'The uncomfortable truth being presented', data_type: 'TEXT' },
                { id: 1, name: 'public_awareness', description: 'Level of public awareness (1-10)', data_type: 'INTEGER' },
                { id: 2, name: 'evidence_strength', description: 'Strength of the evidence supporting the truth (1-10)', data_type: 'INTEGER' },
                { id: 3, name: 'denial_rate', description: 'Percentage of population in denial or disagreement', data_type: 'INTEGER' },
                { id: 4, name: 'societal_impact', description: 'Impact of the truth on society', data_type: 'TEXT' },
                { id: 5, name: 'suppression_attempts', description: 'Whether there have been attempts to suppress this truth', data_type: 'BOOLEAN' }
            ],
        },
        // Template 5: Extinction Countdown
        {
            id: 4,
            name: 'extinction_countdown',
            description: 'Tracking the decline of species, ecosystems, or cultures on the brink of extinction.',
            fields: [
                { id: 0, name: 'entity_name', description: 'Name of the species, ecosystem, or culture at risk', data_type: 'TEXT' },
                { id: 1, name: 'population_decline_rate', description: 'Rate of decline over the past decade (%)', data_type: 'INTEGER' },
                { id: 2, name: 'extinction_date_estimate', description: 'Estimated date of extinction', data_type: 'TEXT' },
                { id: 3, name: 'conservation_efforts', description: 'Whether conservation efforts are in place', data_type: 'BOOLEAN' },
                { id: 4, name: 'human_impact', description: 'Degree of human impact on the extinction process', data_type: 'TEXT' },
                { id: 5, name: 'cultural_significance', description: 'Cultural or ecological significance of the entity', data_type: 'TEXT' }
            ],
        },
        // Template 6: Digital Dystopia Indicators
        {
            id: 5,
            name: 'digital_dystopia_indicators',
            description: 'Tracking the rise of dystopian elements in the digital world.',
            fields: [
                { id: 0, name: 'dystopian_trend', description: 'Description of the dystopian trend or element', data_type: 'TEXT' },
                { id: 1, name: 'affected_population', description: 'Population segment most affected', data_type: 'TEXT' },
                { id: 2, name: 'privacy_erosion_score', description: 'Score indicating the degree of privacy erosion (1-10)', data_type: 'INTEGER' },
                { id: 3, name: 'control_mechanism', description: 'Type of control mechanism used (e.g., surveillance, censorship)', data_type: 'TEXT' },
                { id: 4, name: 'resistance_level', description: 'Level of resistance against the trend (1-10)', data_type: 'INTEGER' },
                { id: 5, name: 'long_term_implications', description: 'Long-term implications of the dystopian trend', data_type: 'TEXT' }
            ],
        },
        // Template 7: Paradox of Progress Index
        {
            id: 6,
            name: 'paradox_of_progress_index',
            description: 'Exploring how progress in some areas leads to regression in others.',
            fields: [
                { id: 0, name: 'progress_area', description: 'Area where progress is being made (e.g., technology, economy)', data_type: 'TEXT' },
                { id: 1, name: 'regression_area', description: 'Area experiencing regression as a result', data_type: 'TEXT' },
                { id: 2, name: 'regression_impact', description: 'Impact of the regression on society (1-10)', data_type: 'INTEGER' },
                { id: 3, name: 'progress_beneficiaries', description: 'Groups benefiting from the progress', data_type: 'TEXT' },
                { id: 4, name: 'regression_victims', description: 'Groups suffering due to the regression', data_type: 'TEXT' },
                { id: 5, name: 'net_gain_loss', description: 'Net societal gain or loss from the progress-regression tradeoff', data_type: 'TEXT' }
            ],
        },
        // Template 8: Human De-evolution Tracker
        {
            id: 7,
            name: 'human_de_evolution_tracker',
            description: 'Tracking signs that humanity might be regressing in certain areas.',
            fields: [
                { id: 0, name: 'regression_sign', description: 'Sign of human de-evolution or regression', data_type: 'TEXT' },
                { id: 1, name: 'affected_demographics', description: 'Demographic most affected by the regression', data_type: 'TEXT' },
                { id: 2, name: 'severity_level', description: 'Severity of the regression on a scale of 1-10', data_type: 'INTEGER' },
                { id: 3, name: 'potential_causes', description: 'Potential causes of the regression', data_type: 'TEXT' },
                { id: 4, name: 'long_term_consequences', description: 'Long-term consequences if the regression continues', data_type: 'TEXT' },
                { id: 5, name: 'reversibility_potential', description: 'Potential for reversing the regression', data_type: 'BOOLEAN' }
            ],
        },
        // Template 9: Freedom Erosion Map
        {
            id: 8,
            name: 'freedom_erosion_map',
            description: 'Mapping the erosion of personal freedoms across different societies.',
            fields: [
                { id: 0, name: 'freedom_type', description: 'Type of freedom being eroded (e.g., speech, privacy)', data_type: 'TEXT' },
                { id: 1, name: 'affected_population', description: 'Population segment most affected', data_type: 'TEXT' },
                { id: 2, name: 'erosion_rate', description: 'Rate of erosion over time (1-10)', data_type: 'INTEGER' },
                { id: 3, name: 'government_role', description: 'Role of the government in the erosion process', data_type: 'TEXT' },
                { id: 4, name: 'public_awareness', description: 'Level of public awareness of the erosion', data_type: 'INTEGER' },
                { id: 5, name: 'resistance_movements', description: 'Existence of resistance movements', data_type: 'BOOLEAN' }
            ],
        },
        // Template 10: Mass Delusion Scale
        {
            id: 9,
            name: 'mass_delusion_scale',
            description: 'Measuring the impact of widespread false beliefs on society.',
            fields: [
                { id: 0, name: 'delusion_topic', description: 'Topic or belief that is widely held but false', data_type: 'TEXT' },
                { id: 1, name: 'belief_strength', description: 'Strength of belief among the population (1-10)', data_type: 'INTEGER' },
                { id: 2, name: 'affected_population', description: 'Size of the population holding the belief', data_type: 'INTEGER' },
                { id: 3, name: 'social_impact', description: 'Impact of the delusion on society', data_type: 'TEXT' },
                { id: 4, name: 'correction_attempts', description: 'Attempts made to correct the delusion', data_type: 'BOOLEAN' },
                { id: 5, name: 'resistance_to_correction', description: 'Level of resistance to correction efforts (1-10)', data_type: 'INTEGER' }
            ],
        }
    ];

    return templates;
}
