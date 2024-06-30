-- Create the task_types table
CREATE TABLE task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

-- Insert data into the task_types table
INSERT INTO task_types (id, name, description) VALUES
    (1, 'subdivision', 'Generates sub-problems with increased granularity relative to the parent, if there is one.'),
    (2, 'analysis', 'Performs Root Cause Analysis (RCA) and stores results for use as context by Evaluators.'),
    (3, 'evaluation', 'Applies scores based on metrics and contextual information to assess the problem.');

-- Create the problems table
CREATE TABLE problems (
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

-- Insert data into the problems table
-- Insert problems into the problems table
INSERT INTO problems (parent_id, granularity, name, description, field, complexity_score, scope_score, rca_done)
VALUES
(NULL, 1, 'Unemployment', 'The condition where individuals who are capable of working and are actively seeking work are unable to find any employment.', 'Economics', 100, 100, FALSE),
(NULL, 1, 'Tinnitus', 'A condition characterized by the perception of noise or ringing in the ears, which can be caused by age-related hearing loss, ear injury, or a circulatory system disorder.', 'Healthcare', 100, 100, FALSE),
(NULL, 1, 'Increased Power Consumption', 'The rise in the amount of electricity used by residential, commercial, and industrial sectors, leading to higher energy costs and environmental impact.', 'Energy', 100, 100, FALSE),
(NULL, 1, 'Lack of progress towards true Artificial General Intelligence', 'The slow advancement in developing AI systems that possess the ability to understand, learn, and apply knowledge across a wide range of tasks at a human-like level.', 'Artificial Intelligence', 100, 100, FALSE);


-- Create the tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_type_id INTEGER REFERENCES task_types(id),
    problem_id INTEGER REFERENCES problems(id),
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
    problem_id INTEGER REFERENCES problems(id),
    name VARCHAR(255),
    description TEXT
);

-- Defines the metrics by which we evaluate and score problems
-- Each metric has its own set of criterias
-- These are used to UNDERSTAND the metric and to best apply it
CREATE TABLE problem_metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

INSERT INTO problem_metrics (id, name, description) VALUES
    (1, 'complexity', 'The measure of how intricate or convoluted a problem is, often determined by the number of variables, dependencies, and steps required for its resolution.'),
    (2, 'scope', 'The extent and range of influence or impact that a problem has, typically involving the number of stakeholders affected and the breadth of its consequences.');

CREATE TABLE problem_metrics_criteria (
    id SERIAL PRIMARY KEY,
    problem_metric_id INTEGER REFERENCES problem_metrics(id),
    name VARCHAR(255),
    description TEXT
);

-- Criteria for complexity (1)
INSERT INTO problem_metrics_criteria (problem_metric_id, name, description) VALUES
    (1, 'variables_number', 'The quantity of factors, variables, or parameters influencing the problem''s complexity.'),
    (1, 'dependencies', 'The extent to which the problem''s resolution depends on other systems, processes, or conditions.'),
    (1, 'technical_depth', 'The level of specialized knowledge or expertise required to understand and address the problem.'),
    (1, 'interconnectedness', 'The degree to which the problem is interconnected with other systems or processes.'),
    (1, 'predictability', 'The level of certainty or predictability in outcomes when addressing the problem.');

-- Criteria for scope (2)
INSERT INTO problem_metrics_criteria (problem_metric_id, name, description) VALUES
    (2, 'geographical_impact', 'The extent to which the problem affects different geographical regions or locations.'),
    (2, 'stakeholder_involvement', 'The number and diversity of stakeholders impacted by the problem.'),
    (2, 'duration', 'The time span over which the problem''s effects or implications are expected to last.'),
    (2, 'strategic_importance', 'The criticality of the problem in relation to organizational goals and strategic priorities.'),
    (2, 'economic_impact', 'The financial implications and economic consequences of the problem.');
