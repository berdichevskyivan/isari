// taskManager.js
async function handleTaskType(sql, pool, taskTypeId, taskTypeName) {
    // console.log(`Current Task Type: ${taskTypeName} (${taskTypeId})`);

    // Query to find the next issue for the given task type
    const nextIssueQuery = sql.fragment`
        SELECT *
        FROM issues
        WHERE id NOT IN (
            SELECT issue_id
            FROM tasks
            WHERE task_type_id = ${taskTypeId}
        )
        AND granularity <= 4
        ORDER BY id ASC
        LIMIT 1;
    `;
    const nextIssueResult = await pool.query(nextIssueQuery);

    if (nextIssueResult.rows.length > 0) {
        const issueId = nextIssueResult.rows[0].id;
        console.log(`Creating Task with type ${taskTypeName} for issue ID ${issueId}`);

        // Insert a task for the given task type
        const insertTaskQuery = sql.fragment`
            INSERT INTO tasks (task_type_id, issue_id, worker_id, status)
            VALUES (${taskTypeId}, ${issueId}, NULL, 'pending');
        `;
        await pool.query(insertTaskQuery);

        console.log(`Task with type ${taskTypeName} created for issue ID ${issueId}`);
        return true; // Indicate that a task was created
    } else {
        // console.log(`No issues found for ${taskTypeName}`);
        return false; // Indicate that no task was created
    }
}

async function checkAndAssignTasks(sql, pool) {
    
    try {
        // Check if issues table has data
        const issuesQuery = sql.fragment`SELECT 1 FROM issues LIMIT 1`;
        const issuesResult = await pool.query(issuesQuery);

        if (issuesResult.rows.length === 0) {
            console.log("No records in the issues table");
        } else {
            console.log("Records found in the issues table. Will iterate over task types.");

            // Query to get all task types
            const taskTypesQuery = sql.fragment`SELECT * FROM task_types`;
            const taskTypesResult = await pool.query(taskTypesQuery);

            // Store the result into a constant
            const taskTypes = taskTypesResult.rows;

            // If taskTypes is empty, return
            if(taskTypes.length === 0) return;

            // Iterating over task types
            for (let i = 0; i < taskTypes.length; i++) {
                const { id, name } = taskTypes[i];
                const taskCreated = await handleTaskType(sql, pool, id, name);
                if (taskCreated) {
                    break; // Stop execution after creating a task
                }
            }
        }

    } catch (error) {
        console.error('Error executing query:', error);
    }
}

export async function initTaskManager(app, sql, pool) {
    console.log("Initializing Task Manager");

    app.post('/checkForTask', async (req, res) => {
        const workerId = req.body.workerId;
        // Right now we won't do any auth, but it IS a must before the release.
        // This is the worker to be added to the worker_id column in tasks table
        // We assume the worker was approved. We need to now look for pending tasks

        // First, we check if the worker requesting the task already has an ACTIVE task assigned to him.
        // If it has a COMPLETE task assigned to him. We let him get another task
        const checkWorkerQuery = sql.fragment`SELECT id FROM tasks WHERE status = 'active' and worker_id = ${workerId}`;

        const checkWorkerResult = await pool.query(checkWorkerQuery);

        if(checkWorkerResult.rows.length > 0){
            console.log(`Worker ${workerId} already has a task assigned`);
            res.json({ success: false, message: `Worker ${workerId} already has a task assigned`, error_code: 'ACTIVE_TASK', task_id: checkWorkerResult.rows[0].id });
            return;
        }

        // We check for 'pending' tasks.
        // If a task is found, we immediatly update the status (to active) and the worker_id
        const nextTaskQuery = sql.fragment`
            WITH next_task AS (
                SELECT id
                FROM tasks
                WHERE status = 'pending'
                ORDER BY id ASC
                LIMIT 1
            )
            UPDATE tasks
            SET status = 'active', worker_id = ${workerId}
            WHERE id = (SELECT id FROM next_task)
            RETURNING *;
        `;

        try {

        } catch (error) {
            console.error('Error executing query:', error);
            res.json({ success: false, message: `There are no tasks available` });
            return;
        }

        const nextTaskResult = await pool.query(nextTaskQuery);
        const nextTask = nextTaskResult.rows[0];

        const issueQuery = sql.fragment`SELECT * FROM issues WHERE id = ${nextTask.issue_id}`
        const taskTypeQuery = sql.fragment`SELECT * FROM task_types WHERE id = ${nextTask.task_type_id}`
        const instructionsQuery = sql.fragment`SELECT * FROM instructions WHERE task_type_id = ${nextTask.task_type_id}`

        const [issue, taskType, instructions] = await Promise.all([
            pool.query(issueQuery),
            pool.query(taskTypeQuery),
            pool.query(instructionsQuery),
        ]);

        const response = {
            task: nextTask,
            issue: issue.rows[0],
            taskType: taskType.rows[0],
            instructions: instructions.rows,
        }

        console.log(response);
        // Depending on the task, other things may have to be retrieved (causes or other info table when doing evaluation, for example, but for now, lets focus on subdivision)

        // Is there are no pending tasks, we tell that to the client
        res.json({ success: true, result: response });
    });
    
    app.post('/storeCompletedTask', async (req, res) => {
        console.log('this is the body received -> ', req.body)

        const workerId = req.body.worker_id;
        const taskId = req.body.task_id;
        const output = req.body.output;

        const getTaskInfoQuery = sql.fragment`SELECT * FROM tasks WHERE id = ${taskId} AND worker_id = ${workerId}`;
        const taskInfoResult = await pool.query(getTaskInfoQuery);
        const taskInfo = taskInfoResult.rows[0];

        if (!taskInfo) {
            res.status(404).json({ success: false, message: 'Task not found' });
            return;
        }
    
        const taskTypeId = taskInfo.task_type_id;

        switch (taskTypeId) {
            // SUBDIVISION
            case 1:
                console.log("Received output from Subdivision task")
                try {
                    const outputJson = JSON.parse(output);
    
                    for (const item of outputJson) {
                        const insertIssueQuery = sql.fragment`
                            INSERT INTO issues (parent_id, granularity, name, description, field, complexity_score, scope_score, analysis_done)
                            VALUES (
                                ${taskInfo.issue_id},
                                (SELECT granularity + 1 FROM issues WHERE id = ${taskInfo.issue_id}),
                                ${item.name},
                                ${item.description},
                                ${item.field},
                                0, 0, false
                            );
                        `;
                        await pool.query(insertIssueQuery);
                    }

                    // Update the task status to 'completed'
                    const updateTaskQuery = sql.fragment`
                    UPDATE tasks
                    SET status = 'completed'
                    WHERE id = ${taskId};
                    `;
                    await pool.query(updateTaskQuery);
                    
                    console.log("Inserted output successfully")
                    res.json({ success: true });
                } catch (error) {
                    console.error('Error parsing output JSON or inserting issues:', error);
                    // If there is an error, we update the task back to pending
                    const updateTaskQuery = sql.fragment`
                    UPDATE tasks
                    SET status = 'pending', worker_id = NULL
                    WHERE id = ${taskId};
                    `;
                    await pool.query(updateTaskQuery);
                    res.status(500).json({ success: false, message: 'Error processing task' });
                }
                break;
            case 2:
                console.log("Received output from Analysis task")
                try {
                    const outputJson = JSON.parse(output);
            
                    for (const item of outputJson) {
                        const insertInsightQuery = sql.fragment`
                            INSERT INTO insights (issue_id, description, field)
                            VALUES (
                                ${taskInfo.issue_id},
                                ${item.description},
                                ${item.field}
                            );
                        `;
                        await pool.query(insertInsightQuery);
                    }
            
                    // Update the task status to 'completed'
                    const updateTaskQuery = sql.fragment`
                    UPDATE tasks
                    SET status = 'completed'
                    WHERE id = ${taskId};
                    `;
                    await pool.query(updateTaskQuery);

                    // Need to update the issues' column analysis_done to true
                    
                    console.log("Inserted insights successfully")
                    res.json({ success: true });
                } catch (error) {
                    console.error('Error parsing output JSON or inserting insights:', error);
                    // If there is an error, we update the task back to pending
                    const updateTaskQuery = sql.fragment`
                    UPDATE tasks
                    SET status = 'pending', worker_id = NULL
                    WHERE id = ${taskId};
                    `;
                    await pool.query(updateTaskQuery);
                    res.status(500).json({ success: false, message: 'Error processing task' });
                }
                break;
            default:
                console.log('Unknown or Unhandled task type:', taskTypeId);
                res.status(400).json({ success: false, message: 'Unknown or Unhandled task type' });
                return;
        }
    })

    // Run the task assignment function immediately
    await checkAndAssignTasks(sql, pool);

    // Schedule the task assignment function to run every 10 seconds
    setInterval(async () => {
        await checkAndAssignTasks(sql, pool);
    }, 10000);
}
