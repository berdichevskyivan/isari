-- Resets tasks to their base state
-- No workers assigned, status is 'pending' 
-- Be sure to also clean the other tables that resulted from other processes
update tasks set worker_id = NULL, status = 'pending';

-- When you want to go back to initial state
delete from tasks where issue_id in (select id from issues where granularity > 1);
delete from issues where granularity > 1;