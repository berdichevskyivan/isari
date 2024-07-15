const GLOBAL_GRANULARITY = 3;

async function handleTaskType(sql, pool, taskTypeId, taskTypeName) {

    const nextIssueQuery = taskTypeId !== 3 ? sql.fragment`
        SELECT *
        FROM issues
        WHERE id NOT IN (
            SELECT issue_id
            FROM tasks
            WHERE task_type_id = ${taskTypeId}
        )
        AND granularity <= ${GLOBAL_GRANULARITY}
        ORDER BY id ASC
        LIMIT 1;
    ` : sql.fragment`
        SELECT *
        FROM issues
        WHERE id NOT IN (
            SELECT issue_id
            FROM tasks
            WHERE task_type_id = ${taskTypeId}
        )
        AND granularity > 1
        AND granularity <= ${GLOBAL_GRANULARITY}
        ORDER BY id ASC
        LIMIT 1;
    `
    const nextIssueResult = await pool.query(nextIssueQuery);

    if (nextIssueResult.rows.length > 0) {
        const issueId = nextIssueResult.rows[0].id;
        const granularity = nextIssueResult.rows[0].granularity;

        // We do NOT generate SUBDIVISION tasks on issues with granularity >= GLOBAL_GRANULARITY
        if(granularity >= GLOBAL_GRANULARITY && taskTypeId === 1){
            return false;
        }

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

async function generateTasks(sql, pool) {
    
    try {
        // We check first if user_inputs have ANY data
        // if `generated` field is true, we do not generate any task for this user_input
        // When we generate tasks for the user_inputs, these will be of `generation` task_type
        // We don't need to generate them one by one. If there are 2 or 3 user_inputs, we already generate 2 or 3 `generation` tasks (type 1)
        const userInputsQuery = sql.fragment`
            WITH user_inputs_to_generate AS (
                SELECT id, issue_title, issue_context
                FROM user_inputs
                WHERE generated = false
            ), insert_tasks AS (
                INSERT INTO tasks (task_type_id, issue_id, user_input_id, worker_id, status)
                SELECT 1, NULL, id, NULL, 'pending'
                FROM user_inputs_to_generate
                RETURNING id
            )
            UPDATE user_inputs
            SET generated = true
            WHERE id IN (SELECT id FROM user_inputs_to_generate)
            RETURNING *;
        `;

        const userInputsResult = await pool.query(userInputsQuery);

        if (userInputsResult.rows.length > 0) {
            console.log("Tasks were generated from user inputs.");
            console.log(`Number of tasks generated from user inputs: ${userInputsResult.rows.length}`);
            return;
        } else {
            console.log('No user inputs to process.');
        }

        // Check if issues table has data
        // Right now we're checking only for issues
        // But eventually we will also check for actions
        const issuesQuery = sql.fragment`SELECT 1 FROM issues LIMIT 1`;
        const issuesResult = await pool.query(issuesQuery);

        if (issuesResult.rows.length === 0) {
            console.log("No records in the issues table");
        } else {
            // Query to get all task types but the generation task_type (which relates to user_inputs and not to issues)
            const taskTypesQuery = sql.fragment`SELECT * FROM task_types WHERE skip = false and id != 1 ORDER BY id asc`;
            const taskTypesResult = await pool.query(taskTypesQuery);

            // Store the result into a constant
            const taskTypes = taskTypesResult.rows;

            // If taskTypes is empty, return
            if(taskTypes.length === 0) return;

            let taskCreated = null;

            // Iterating over task types
            for (let i = 0; i < taskTypes.length; i++) {
                const { id, name } = taskTypes[i];
                taskCreated = await handleTaskType(sql, pool, id, name);
                if (taskCreated) {
                    break; // Stop execution after creating a task
                }
            }

            if(!taskCreated){
                console.log('No tasks were created on this run.')
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
        // If it has a COMPLETED task assigned to him. We let him get another task
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
            res.json({ success: false, message: `Error getting the task` });
            return;
        }

        const nextTaskResult = await pool.query(nextTaskQuery);
        const nextTask = nextTaskResult.rows[0];

        if(!nextTask){
            res.json({ success: false, error_code: 'NO_MORE_TASKS' }) // There are no more tasks
            return;
        }

        const taskTypeId = nextTask.task_type_id;

        if(taskType === 1){
            // We perform specific queries
            // and send a specific response
            // so all of that will be done in this code, and then a `return` at the code to stop code execution
            return;
        }

        const issueQuery = sql.fragment`SELECT * FROM issues WHERE id = ${nextTask.issue_id}`
        const taskTypeQuery = sql.fragment`SELECT * FROM task_types WHERE id = ${taskTypeId}`
        const instructionsQuery = sql.fragment`SELECT * FROM instructions WHERE task_type_id = ${taskTypeId}`

        const [issue, taskType, instructions] = await Promise.all([
            pool.query(issueQuery),
            pool.query(taskTypeQuery),
            pool.query(instructionsQuery),
        ]);

        let metrics = [];

        if(taskTypeId === 3){
            // Get the data and assign to metrics
            // in this format { complexity: [criteria, criteria, criteria], scope: [criteria, criteria, criteria] }
            // the metrics (complexity, scope) are in the issue metrics table
            // the criteria are in the issue_metrics_criteria table issue_metrics_criteria
            // We may not only need the criteria, but also, parent and grandparent issues for more context
            // Will probably have to gather the score for the parent_id issue and the insights previously gathered.
            // This is up for debate.
            const issueMetricsQuery = sql.fragment`SELECT * FROM issue_metrics`
            const issueMetricsCriteriaQuery = sql.fragment`SELECT * FROM issue_metrics_criteria`

            const [issueMetrics, issueMetricsCriteria] = await Promise.all([
                pool.query(issueMetricsQuery),
                pool.query(issueMetricsCriteriaQuery),
            ]);

            // Now i need to insert all the data into the metrics object
            // Let's first start by iterating over the rows from the metrics (The amount of children objects within the parent object)
            for(const row of issueMetrics.rows){
                const metric = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    criteria: issueMetricsCriteria.rows.filter(criteriaRow => criteriaRow.issue_metric_id === row.id)
                };
                metrics.push(metric);
            }
        }

        console.log('these are the metrics: ', JSON.stringify(metrics, null, 2));

        const response = {
            task: nextTask,
            issue: issue.rows[0],
            taskType: taskType.rows[0],
            instructions: instructions.rows,
            metrics: metrics, // EVALUATION
        }

        console.log(response);
        res.json({ success: true, result: response });
        // res.json({success: false}) // FOR TESTING
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
            // ANALYSIS
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

                    // Update analysis_done field
                    const updateIssueQuery = sql.fragment`
                    UPDATE issues
                    SET analysis_done = TRUE
                    WHERE id = ${taskInfo.issue_id};
                    `;
                    await pool.query(updateIssueQuery);
                    
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
            // EVALUATION
            case 3:
                console.log("Received output from Evaluation task")
                try {
                    const outputJson = JSON.parse(output);

                    // Update complexity score and scope score field
                    const updateIssueQuery = sql.fragment`
                    UPDATE issues
                    SET complexity_score = ${outputJson.complexity}, scope_score = ${outputJson.scope}
                    WHERE id = ${taskInfo.issue_id};
                    `;
                    await pool.query(updateIssueQuery);
            
                    // Update the task status to 'completed'
                    const updateTaskQuery = sql.fragment`
                    UPDATE tasks
                    SET status = 'completed'
                    WHERE id = ${taskId};
                    `;
                    await pool.query(updateTaskQuery);
                    
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
            // PROPOSITION
            case 4:
                console.log("Received output from Proposition task")
                try {
                    const outputJson = JSON.parse(output);
    
                    for (const item of outputJson) {
                        const insertProposalQuery = sql.fragment`
                            INSERT INTO proposals (issue_id, name, description, field)
                            VALUES (
                                ${taskInfo.issue_id},
                                ${item.name},
                                ${item.description},
                                ${item.field}
                            );
                        `;
                        await pool.query(insertProposalQuery);
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
            // EXTRAPOLATION
            case 5:
                console.log("Received output from Extrapolation task")
                try {
                    const outputJson = JSON.parse(output);
    
                    for (const item of outputJson) {
                        const insertExtrapolationQuery = sql.fragment`
                            INSERT INTO extrapolations (issue_id, name, description, field)
                            VALUES (
                                ${taskInfo.issue_id},
                                ${item.name},
                                ${item.description},
                                ${item.field}
                            );
                        `;
                        await pool.query(insertExtrapolationQuery);
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
            default:
                console.log('Unknown or Unhandled task type:', taskTypeId);
                res.status(400).json({ success: false, message: 'Unknown or Unhandled task type' });
                return;
        }
    })

    // Run the task assignment function immediately
    await generateTasks(sql, pool);

    // Schedule the task assignment function to run every 10 seconds
    setInterval(async () => {
        await generateTasks(sql, pool);
    }, 10000);
}
