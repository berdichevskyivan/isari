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
