-- Resets tasks to their base state
-- No workers assigned, status is 'pending' 
-- Be sure to also clean the other tables that resulted from other processes
update tasks set worker_id = NULL, status = 'pending';