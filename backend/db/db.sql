-- Create the workers table with the new wallet_address column
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    github_url VARCHAR(255),
    profile_picture_url VARCHAR(255),
    wallet_address VARCHAR(255),
    salt VARCHAR(255),
    task_counter INTEGER DEFAULT 0,
    CONSTRAINT unique_name UNIQUE (name),
    CONSTRAINT unique_email UNIQUE (email)
);

-- Create the programming_languages table
CREATE TABLE programming_languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255)
);

-- Create the generalized_ai_branches table
CREATE TABLE generalized_ai_branches (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- Create the specialized_ai_applications table
CREATE TABLE specialized_ai_applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_url VARCHAR(255)
);

-- Create the ai_tools table
CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_url VARCHAR(255)
);

-- Relationship Tables

-- Create the worker_programming_languages table
CREATE TABLE worker_programming_languages (
    worker_id INT NOT NULL,
    programming_language_id INT NOT NULL,
    PRIMARY KEY (worker_id, programming_language_id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (programming_language_id) REFERENCES programming_languages(id)
);

-- Create the worker_generalized_ai_branches table
CREATE TABLE worker_generalized_ai_branches (
    worker_id INT NOT NULL,
    ai_branch_id INT NOT NULL,
    PRIMARY KEY (worker_id, ai_branch_id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (ai_branch_id) REFERENCES generalized_ai_branches(id)
);

-- Create the worker_specialized_ai_applications table
CREATE TABLE worker_specialized_ai_applications (
    worker_id INT NOT NULL,
    ai_application_id INT NOT NULL,
    PRIMARY KEY (worker_id, ai_application_id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (ai_application_id) REFERENCES specialized_ai_applications(id)
);

-- Create the worker_ai_tools table
CREATE TABLE worker_ai_tools (
    worker_id INT NOT NULL,
    ai_tool_id INT NOT NULL,
    PRIMARY KEY (worker_id, ai_tool_id),
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (ai_tool_id) REFERENCES ai_tools(id)
);
