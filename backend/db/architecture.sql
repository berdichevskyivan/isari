-- Create the task_types table
CREATE TABLE task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    role VARCHAR(255),
    temperature FLOAT DEFAULT 0
);

-- Insert data into the task_types table
INSERT INTO task_types (id, name, description, role, temperature) VALUES
    (1, 'subdivision', 'Generates sub-issues with increased granularity relative to the parent, if there is one.', 'divider', 0.1),
    (2, 'analysis', 'Performs a detailed analysis of the issue. Extract relevant data points (insights) related to the issue from various fields.', 'analyzer', 0.1),
    (3, 'evaluation', 'Applies scores based on metrics and contextual information to assess the issue.', 'evaluator', 0.1),
    (4, 'proposition', 'Generates proposed actions or solutions to address the issue.', 'proposer', 0.1),
    (5, 'extrapolation', 'Involves taking solutions or proposals that have been effective in one field and applying them to issues in a different field. '
    'This process relies on identifying parallels between the two fields, allowing insights or methods that work well in one context to address challenges in another. '
    'This cross-disciplinary approach aims to leverage successful strategies from various domains to find innovative solutions for problems that might not have been addressed using traditional methods within the specific field.', 'extrapolator', 0.7);

-- Create the instructions table
CREATE TABLE instructions (
    id SERIAL PRIMARY KEY,
    task_type_id INTEGER REFERENCES task_types(id),
    instruction TEXT NOT NULL,
    instruction_type VARCHAR(50) NOT NULL
);

-- Insert base instructions
INSERT INTO instructions (task_type_id, instruction, instruction_type)
VALUES 
(1, 
 'The output must be formatted as a JSON array containing up to four objects with the following fields: name, description, and field. '
 'The name must be the title for the sub-issue, the description must provide descriptive information about the sub-issue, '
 'and the field must be at most two words long and is defined as the field under which the sub-issue is categorized, '
 'like Healthcare, Economics, Technology, Artificial Intelligence, Physics and Mathematics among other examples.'
 'The descriptions must describe the name field, and not propose a solution or actions.'
 'The output must consist only of the JSON array and nothing else.',
 'output'),
(2,
 'The output must be formatted as a JSON array containing up to four objects with the following fields: description and field. '
 'The description field must contain the insight derived from the specific issue. Which must be concise, informative and insightful. '
 'The field must be at most two words long and is defined as the field under which the insight is categorized based on relevant themes or areas of impact. Ensure each insight is clearly described. '
 'The output must consist only of the JSON array and nothing else.',
 'output'),
(3,
 'The output must be formatted as a JSON object containing fields called after the name of the metrics that will be described next. '
 'Each metric must be evaluated as a single integer value ranging from 1 to 99, based on the criteria described below. '
 'Do not provide values for individual criteria. ',
 'output'),
 (4, 
 'The output must be formatted as a JSON array containing up to four objects with the following fields: name, description, and field. '
 'The name must be the title for the proposed action or solution, the description must provide detailed information about the proposed action or solution, '
 'and the field must be at most two words long and is defined as the field under which the proposed action is categorized, '
 'like Healthcare, Economics, Technology, Artificial Intelligence, Physics and Mathematics among other examples. '
 'The descriptions must describe the name field, focusing on the proposed action or solution without evaluating or implementing it. '
 'The output must consist only of the JSON array and nothing else.',
 'output'),
  (5, 
 'The output must be formatted as a JSON array containing up to four objects with the following fields: name, description, and field. '
 'The name is the title of the proposed action or solution. The description provides detailed information about the proposal, staying brief but informative. '
 'The field indicates the category of the originating idea and must be at most two words long, such as Neuroscience, Economics, Technology, or Physics. '
 'The solutions should be derived by applying concepts, methods, or ideas from one field to another, focusing on innovative, cross-disciplinary approaches from STEM fields. '
 'Avoid phrases like "Taking cues from" or "Inspired by the principles of" or "Borrowing from" or "Drawing from" and directly state the concept. '
 'The output must consist only of the JSON array and nothing else.',
 'output');

-- Create the issues table
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER,
    granularity INTEGER,
    name VARCHAR(255),
    description TEXT,
    field VARCHAR(255),
    complexity_score INTEGER,
    scope_score INTEGER,
    analysis_done BOOLEAN
);

-- Insert data into the issues table
-- Insert issues into the issues table
INSERT INTO issues (parent_id, granularity, name, description, field, complexity_score, scope_score, analysis_done)
VALUES
(NULL, 1, 'Unemployment', 'The condition where individuals who are capable of working and are actively seeking work are unable to find any employment.', 'Economics', 100, 100, FALSE),
(NULL, 1, 'Tinnitus', 'A condition characterized by the perception of noise or ringing in the ears, which can be caused by age-related hearing loss, ear injury, or a circulatory system disorder.', 'Healthcare', 100, 100, FALSE),
(NULL, 1, 'Increased Power Consumption', 'The rise in the amount of electricity used by residential, commercial, and industrial sectors, leading to higher energy costs and environmental impact.', 'Energy', 100, 100, FALSE),
(NULL, 1, 'Lack of progress towards true Artificial General Intelligence', 'The slow advancement in developing AI systems that possess the ability to understand, learn, and apply knowledge across a wide range of tasks at a human-like level.', 'Artificial Intelligence', 100, 100, FALSE);


-- Create the tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_type_id INTEGER REFERENCES task_types(id),
    issue_id INTEGER REFERENCES issues(id),
    worker_id INTEGER REFERENCES workers(id),
    status VARCHAR(20),
    created_date TIMESTAMP DEFAULT clock_timestamp(),
    updated_date TIMESTAMP DEFAULT clock_timestamp()
);

-- Create a trigger function to update the updated_date column using clock_timestamp()
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger and assign to tasks table
CREATE TRIGGER update_tasks_updated_date
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();


-- After performing analysis, we store the results here
CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id),
    description TEXT,
    field VARCHAR(255),
    created_date TIMESTAMP DEFAULT clock_timestamp(),
    updated_date TIMESTAMP DEFAULT clock_timestamp()
);

-- Create the trigger and assign to insights table
CREATE TRIGGER update_insights_updated_date
BEFORE UPDATE ON insights
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

-- Defines the metrics by which we evaluate and score issues
-- Each metric has its own set of criterias
-- These are used to UNDERSTAND the metric and to best apply it
CREATE TABLE issue_metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

INSERT INTO issue_metrics (id, name, description) VALUES
    (1, 'complexity', 'The measure of how intricate or convoluted a issue is, often determined by the number of variables, dependencies, and steps required for its resolution.'),
    (2, 'scope', 'The extent and range of influence or impact that a issue has, typically involving the number of stakeholders affected and the breadth of its consequences.');

CREATE TABLE issue_metrics_criteria (
    id SERIAL PRIMARY KEY,
    issue_metric_id INTEGER REFERENCES issue_metrics(id),
    name VARCHAR(255),
    description TEXT
);

-- Criteria for complexity (1)
INSERT INTO issue_metrics_criteria (issue_metric_id, name, description) VALUES
    (1, 'variables_number', 'The quantity of factors, variables, or parameters influencing the issue''s complexity.'),
    (1, 'dependencies', 'The extent to which the issue''s resolution depends on other systems, processes, or conditions.'),
    (1, 'technical_depth', 'The level of specialized knowledge or expertise required to understand and address the issue.'),
    (1, 'interconnectedness', 'The degree to which the issue is interconnected with other systems or processes.'),
    (1, 'predictability', 'The level of certainty or predictability in outcomes when addressing the issue.');

-- Criteria for scope (2)
INSERT INTO issue_metrics_criteria (issue_metric_id, name, description) VALUES
    (2, 'geographical_impact', 'The extent to which the issue affects different geographical regions or locations.'),
    (2, 'stakeholder_involvement', 'The number and diversity of stakeholders impacted by the issue.'),
    (2, 'duration', 'The time span over which the issue''s effects or implications are expected to last.'),
    (2, 'strategic_importance', 'The criticality of the issue in relation to organizational goals and strategic priorities.'),
    (2, 'economic_impact', 'The financial implications and economic consequences of the issue.');

-- Create the proposals table
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id),
    name VARCHAR(255),
    description TEXT,
    field VARCHAR(255),
    practicality_score INTEGER DEFAULT 0,
    efficiency_score INTEGER DEFAULT 0,
    depth_of_solution_score INTEGER DEFAULT 0,
    innovativeness_score INTEGER DEFAULT 0,
    cost_effectiveness_score INTEGER DEFAULT 0,
    safety_and_risk_score INTEGER DEFAULT 0,
    scalability_score INTEGER DEFAULT 0
);

-- Create the proposal_metrics table
CREATE TABLE proposal_metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

-- Insert data into the proposal_metrics table
INSERT INTO proposal_metrics (id, name, description) VALUES
    (1, 'practicality', 'The measure of how practical and feasible the proposed action is in real-world scenarios.'),
    (2, 'efficiency', 'The evaluation of how efficiently the proposed action utilizes resources and time.'),
    (3, 'depth_of_solution', 'The assessment of how thoroughly the proposed action addresses the issue at hand.'),
    (4, 'innovativeness', 'The measure of how innovative and creative the proposed action is in solving the issue.'),
    (5, 'cost_effectiveness', 'The evaluation of the cost-effectiveness of the proposed action in terms of benefits versus costs.'),
    (6, 'safety_and_risk', 'The assessment of the safety and associated risks of implementing the proposed action.'),
    (7, 'scalability', 'The measure of how scalable the proposed action is, considering its potential to be expanded or replicated.');

-- Create the extrapolations table
CREATE TABLE extrapolations (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id),
    name VARCHAR(255),
    description TEXT,
    field VARCHAR(255),
    practicality_score INTEGER DEFAULT 0,
    efficiency_score INTEGER DEFAULT 0,
    depth_of_solution_score INTEGER DEFAULT 0,
    innovativeness_score INTEGER DEFAULT 0,
    cost_effectiveness_score INTEGER DEFAULT 0,
    safety_and_risk_score INTEGER DEFAULT 0,
    scalability_score INTEGER DEFAULT 0
);