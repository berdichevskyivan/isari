-- RETURN BACK TO INITIAL STATE
update tasks set worker_id = NULL, status = 'pending';
delete from tasks where issue_id in (select id from issues where granularity > 1);
delete from issues where granularity > 1;
delete from insights;

-- ONLY TO TEST ANALYSIS
update tasks set status = 'completed' where task_type_id != 3;