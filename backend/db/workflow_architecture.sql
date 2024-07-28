CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    name VARCHAR(255),
    description TEXT,
    table_name VARCHAR(255),
    created_date TIMESTAMP DEFAULT clock_timestamp(),
    updated_date TIMESTAMP DEFAULT clock_timestamp()
);

CREATE TRIGGER update_datasets_updated_date
BEFORE UPDATE ON datasets
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

CREATE TABLE dataset_fields (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id),
    name TEXT,
    description TEXT,
    data_type TEXT -- TEXT, INTEGER, BOOLEAN
);

-- ABOVE IS CONFIRMED --

CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    name VARCHAR(255) NOT NULL
);

-- Establish a maximum amount of datasets and records for the datasets
-- In the logic of the code
CREATE TABLE workflow_tasks (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflows(id),
    name VARCHAR(255),
    description TEXT,
    role VARCHAR(255),
    status VARCHAR(20),
    task_type VARCHAR(20), -- CREATE, UPDATE, DELETE
    input_type VARCHAR(20),
    raw_data TEXT,
    input_dataset_id INTEGER REFERENCES datasets(id),
    output_dataset_id INTEGER REFERENCES datasets(id),
    output_dataset_record_ids TEXT,
    output_amount INTEGER,
    created_date TIMESTAMP DEFAULT clock_timestamp(),
    updated_date TIMESTAMP DEFAULT clock_timestamp()
);

CREATE TRIGGER update_workflow_tasks_updated_date
BEFORE UPDATE ON workflow_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();

ALTER TABLE workflow_tasks
ADD COLUMN input_type VARCHAR(20);