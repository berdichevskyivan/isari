-- RETURN BACK TO INITIAL STATE
update tasks set worker_id = NULL, status = 'pending';
delete from tasks where issue_id in (select id from issues where granularity > 1);
delete from issues where granularity > 1;
update issues set complexity_score = 100, scope_score = 100, analysis_done = false where parent_id is NULL;
-- DELETE INSIGHTS AND RESET ID SEQUENCE
delete from insights;
ALTER SEQUENCE insights_id_seq RESTART WITH 1;

-- ONLY TO TEST ANALYSIS
update tasks set status = 'completed', worker_id = NULL where task_type_id != 3;
update tasks set status = 'pending', worker_id = NULL where task_type_id = 3;
update issues set complexity_score = 100, scope_score = 100 where parent_id is NULL;

-- DELETE ALL TASKS IN ORDER TO GENERATE THEM AGAIN AND RESET THE ID SEQUENCE
-- TO GENERATE TASKS, THE CODE WILL LOOK INTO THE ISSUES TABLE AND THE TASKS TABLE
DELETE FROM tasks;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;

-- START THE ID SEQUENCE IN ISSUES FROM 5 (LENGTH OF ROOT PROBLEMS (4) + 1)
ALTER SEQUENCE issues_id_seq RESTART WITH 5;

-- In case you need to append to instructions or any other text field
UPDATE instructions
SET instruction = instruction || ' Ensure the JSON array contains ONLY up to four JSON objects.'
WHERE task_type_id = 1;

-- IN case you need to add a column
ALTER TABLE issues
ADD COLUMN context TEXT;

-- Set task_type skip column to true to not do those tasks temporarily (analysis and evaluation)
UPDATE task_types SET skip = true where id = 3 OR id = 4;

-- In case you need to rename a column
ALTER TABLE user_inputs
RENAME COLUMN issue_title TO new_issue_title;

-- Makes a master key
UPDATE usage_keys set type = 'master' where id = 2;

-- ADDS A COLUMN
ALTER TABLE tasks
ADD COLUMN user_input_id INTEGER REFERENCES user_inputs(id);

-- INSERT THE CLIENT SCRIPT HASH
insert into client_script_hash(hash) values ('1f8cf7e99493917803abd1bae070862f3b14e6e75df0da0c4a981e25546da12a');
-- UPDATE THE HASH
update client_script_hash set hash = 'a099390adf734931b4a4897ecb4e999e9f95b2909388a8abf0399af795cf2a95'