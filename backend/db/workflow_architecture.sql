
CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    name VARCHAR(255) NOT NULL
);

-- Establish a maximum amount of datasets and records for the datasets
-- In the logic of the code
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    name VARCHAR(255), -- e.g. issues
    description TEXT, -- e.g. Problems users can have
    table_name VARCHAR(255) -- Name of the table in the database , e.g. workflow_dataset_issues_[worker_id]
);

CREATE TABLE dataset_fields (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id),
    name TEXT,
    description TEXT,
    data_type TEXT, -- TEXT, INTEGER, BOOLEAN
);

CREATE TABLE workflow_tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    workflow_id INTEGER REFERENCES workflows(id),
    task_order INTEGER,
    status VARCHAR(20),
    type VARCHAR(20), -- CREATE, UPDATE, DELETE
    raw_data TEXT, -- If NULL, receiving dataset records
    input_dataset_id INTEGER REFERENCES datasets(id), -- If NULL , receiving raw data. Get table_name, name and description from this
    input_dataset_record_ids INTEGER[], -- If NULL, receiving raw data, if not, these are the ids of the tables of the dataset
    input_dataset_field_ids INTEGER[], -- Array of fields to select. If NULL receiving raw data
    output_dataset_id INTEGER REFERENCES datasets(id), -- If CREATE: Specify ; If UPDATE: Specify ; If DELETE: Specify . Get table_name, name and description from this
    output_dataset_field_ids INTEGER[], -- If CREATE: the fields we want in our newly created records ; If UPDATE: the fields we want to update, If DELETE: Null because we delete the whole row
    output_amount INTEGER, -- If CREATE: Specify ; If UPDATE: Specify ; If DELETE: Specify (Amount of rows to INSERT, UPDATE or DELETE)
    role VARCHAR(255), -- What role to take when performing this task
    temperature INTEGER, -- What temperature to use when performing this task
    created_date TIMESTAMP DEFAULT clock_timestamp(),
    updated_date TIMESTAMP DEFAULT clock_timestamp()
);