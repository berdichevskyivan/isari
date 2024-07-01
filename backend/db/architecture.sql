-- INSTEAD OF issueS AND SOLUTIONS, WE WILL HAVE ISSUES AND ACTIONS

-- Create the task_types table
CREATE TABLE task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    role VARCHAR(255)
);

-- Insert data into the task_types table
INSERT INTO task_types (id, name, description, role) VALUES
    (1, 'subdivision', 'Generates sub-issues with increased granularity relative to the parent, if there is one.', 'divider'),
    (2, 'analysis', 'Performs Root Cause Analysis (RCA) and stores results for use as context by Evaluators.', 'analyzer'),
    (3, 'evaluation', 'Applies scores based on metrics and contextual information to assess the issue.', 'evaluator');

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
(2, '', 'output'),
(3, '', 'output');

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
    rca_done BOOLEAN -- root cause analysis
);

-- Insert data into the issues table
-- Insert issues into the issues table
INSERT INTO issues (parent_id, granularity, name, description, field, complexity_score, scope_score, rca_done)
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

-- Create the trigger to call the function before each row update
CREATE TRIGGER update_tasks_updated_date
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();


-- After performing RCA, we store the results here
CREATE TABLE causes (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id),
    name VARCHAR(255),
    description TEXT
);

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




-- Instead of `solutions` table we will have an `actions` table