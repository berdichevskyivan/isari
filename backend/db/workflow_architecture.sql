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
    role VARCHAR(255), -- What role to take when performing this task
    name VARCHAR(255), -- e.g. Generation, Subdivision, Evaluation, Analysis, Proposition
    description TEXT, -- What is the task about? Describe the name of the task. e.g. Generation: Subdivides the current input 
    workflow_id INTEGER REFERENCES workflows(id),
    "order" INTEGER, -- Order number, determines the order of the tasks to be done
    status VARCHAR(20),
    type VARCHAR(20), -- CREATE, UPDATE, DELETE
    raw_data TEXT, -- If NULL, receiving dataset records
    input_dataset_id INTEGER REFERENCES datasets(id), -- If NULL , receiving raw data. Get table_name, name and description from this
    input_dataset_field_ids INTEGER[], -- Array of fields to select. If NULL receiving raw data
    input_dataset_record_ids INTEGER[], -- If NULL, receiving raw data, if not, these are the ids of the tables of the dataset
    output_dataset_id INTEGER REFERENCES datasets(id), -- If CREATE: Specify ; If UPDATE: Specify ; If DELETE: Specify . Get table_name, name and description from this
    output_dataset_field_ids INTEGER[], -- If CREATE: the fields we want in our newly created records ; If UPDATE: the fields we want to update, If DELETE: Null because we delete the whole row
    output_dataset_record_ids INTEGER[], -- This records the IDs of the affected rows, if CREATE , it records the new ids created, if deleted, it records the ids deleted, if updated, it records the ids updated
    output_amount INTEGER, -- If CREATE: Specify ; If UPDATE: Specify ; If DELETE: Specify (Amount of rows to INSERT, UPDATE or DELETE)
    temperature INTEGER, -- What temperature to use when performing this task
    created_date TIMESTAMP DEFAULT clock_timestamp(),
    updated_date TIMESTAMP DEFAULT clock_timestamp()
);

CREATE TRIGGER update_workflow_tasks_updated_date
BEFORE UPDATE ON workflow_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();