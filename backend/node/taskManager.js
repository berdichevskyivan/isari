const GLOBAL_GRANULARITY = 3;
const TASKS_FOR_SINGLE_USE_KEY = 5;

async function increaseTaskCounter(sql, pool, workerId){
    console.log(`Task completed by worker ID ${workerId}. Increasing his task counter by one...`)
    try {
        const getWorkerTaskCounterQuery = sql.fragment`SELECT task_counter FROM workers WHERE id = ${workerId}`
        const getWorkerTaskCounterResult = await pool.query(getWorkerTaskCounterQuery);
        
        const taskCounter = getWorkerTaskCounterResult.rows[0].task_counter;
        const newTaskCounter = taskCounter + 1;

        if(newTaskCounter >= TASKS_FOR_SINGLE_USE_KEY){
            console.log('Awarding worker a single-use key.')
            // Congrats! We award the worker a single-use key
            // And update the task_counter back to zero
            const updateTaskCounterQuery = sql.fragment`UPDATE workers SET task_counter = 0 WHERE id = ${workerId}`
            const insertSingleUseKey = sql.fragment`
            INSERT INTO usage_keys (worker_id, key, type) VALUES (${workerId},generate_random_string(16), 'single_use')`;

            await pool.query(updateTaskCounterQuery);
            await pool.query(insertSingleUseKey);
        }else{
            // We just increase the task_counter field
            console.log('Increasing task counter for worker.')
            const updateTaskCounterQuery = sql.fragment`UPDATE workers SET task_counter = ${newTaskCounter} WHERE id = ${workerId}`
            await pool.query(updateTaskCounterQuery);
        }

    } catch (error) {
        console.error('Error executing query:', error);
    }
}

export async function retrieveAndEmitTasks(sql, pool, io) {
    console.log('Retrieving all tasks with associated information and emitting...')
    try {
        const tasksQuery = sql.fragment`
        SELECT 
            a.id as task_id,
            b.name as task_type_name,
            a.status as task_status,
            a.created_date as task_created_date,
            a.updated_date as task_updated_date,
            a.issue_id as task_issue_id,
            a.user_input_id as task_user_input_id,
            c.parent_id as task_issue_parent_id,
            c.granularity as task_issue_granularity,
            c.name as task_issue_name,
            c.description as task_issue_description,
            c.field as task_issue_field,
            d.issue_title as task_user_input_issue_title,
            d.issue_context as task_user_input_issue_context
        FROM 
            tasks a 
        LEFT JOIN 
            task_types b ON a.task_type_id = b.id 
        LEFT JOIN 
            issues c ON a.issue_id = c.id 
        LEFT JOIN 
            user_inputs d ON a.user_input_id = d.id
        ORDER BY a.id asc;
        `
        const tasksResult = await pool.query(tasksQuery);
        
        const tasks = tasksResult.rows;

        io.emit('updateTasks', tasks);
    } catch (error) {
        console.error('Error executing query:', error);
    }
}

export async function retrieveAndEmitIssues(sql, pool, io) {
    console.log('Retrieving all issues with associated information and emitting...')
    try {
        const issuesQuery = sql.fragment`SELECT * FROM issues;`
        const proposalsQuery = sql.fragment`SELECT * FROM proposals;`
        const extrapolationsQuery = sql.fragment`SELECT * FROM extrapolations;`

        const [issuesResult, proposalsResult, extrapolationsResult] = await Promise.all([
            pool.query(issuesQuery),
            pool.query(proposalsQuery),
            pool.query(extrapolationsQuery),
        ]);
        
        const issues = issuesResult.rows;
        const proposals = proposalsResult.rows;
        const extrapolations = extrapolationsResult.rows;

        const issuesToEmit = []

        const rootIssues = issues.filter(i => i.parent_id === null);

        for (const rootIssue of rootIssues) {
            let obj = {
                ...rootIssue,
                proposals: proposals.filter(p => p.issue_id === rootIssue.id),
                extrapolations: extrapolations.filter(e => e.issue_id === rootIssue.id),
                children: issues.filter(i => i.parent_id === rootIssue.id)
            };
        
            // Loop through children of root issues if any.
            if (obj.children.length > 0) {
                obj.children = obj.children.map(child => {
                    let childObj = {
                        ...child,
                        proposals: proposals.filter(p => p.issue_id === child.id),
                        extrapolations: extrapolations.filter(e => e.issue_id === child.id),
                        children: issues.filter(i => i.parent_id === child.id)
                    };
        
                    // Loop through children of child issues if any.
                    if (childObj.children.length > 0) {
                        childObj.children = childObj.children.map(grandchild => {
                            let grandchildObj = {
                                ...grandchild,
                                proposals: proposals.filter(p => p.issue_id === grandchild.id),
                                extrapolations: extrapolations.filter(e => e.issue_id === grandchild.id),
                                children: issues.filter(i => i.parent_id === grandchild.id)
                            };
        
                            return grandchildObj;
                        });
                    }
        
                    return childObj;
                });
            }
        
            issuesToEmit.push(obj);
        }

        io.emit('updateIssues', issuesToEmit);
    } catch (error) {
        console.error('Error executing query:', error);
    }
}

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

async function generateTasks(sql, pool, io) {
    
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
                    retrieveAndEmitTasks(sql, pool, io);
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

export async function initTaskManager(app, sql, pool, io) {
    console.log("Initializing Task Manager");

    app.post('/checkForTask', async (req, res) => {
        const workerKey = req.body.workerKey;
        const checkWorkerKeyQuery = sql.fragment`SELECT id, name FROM workers WHERE id IN (select worker_id from worker_keys where key = ${workerKey})`;
        const checkWorkerKeyResult = await pool.query(checkWorkerKeyQuery);

        let workerId = null

        if(checkWorkerKeyResult.rows.length === 0){
            // We did not find a key, thus, we send an error message to the user.
            console.log('Worker key is not valid. Sending back error message...')
            res.json({ success: false, message: 'Worker Key is not valid.' });
            return;
        }else{
            workerId = checkWorkerKeyResult.rows[0].id
            // We also asynchronously update the worker_keys table to reflect last time of usage
            const updateWorkerKeyQuery = sql.fragment`UPDATE worker_keys SET used = true WHERE key = ${workerKey}`;
            pool.query(updateWorkerKeyQuery);
        }

        const worker = checkWorkerKeyResult.rows[0]
        console.log(`Worker checking for tasks: ${worker.id} | ${worker.name}`)
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

        let nextTask = null;

        try {
            const nextTaskResult = await pool.query(nextTaskQuery);
            nextTask = nextTaskResult.rows[0];
    
            if(!nextTask){
                res.json({ success: false, error_code: 'NO_MORE_TASKS' }) // There are no more tasks
                return;
            }
        } catch (error) {
            console.error('Error executing query:', error);
            res.json({ success: false, message: `Error getting the task` });
            return;
        }

        // We updated a task so we emit this information
        retrieveAndEmitTasks(sql, pool, io);

        const taskTypeId = nextTask.task_type_id;

        // GENERATION of a root issue from a user input
        if(taskTypeId === 1){
            const userInputQuery = sql.fragment`SELECT * FROM user_inputs WHERE id = ${nextTask.user_input_id}`
            const taskTypeQuery = sql.fragment`SELECT * FROM task_types WHERE id = ${taskTypeId}`
            const instructionsQuery = sql.fragment`SELECT * FROM instructions WHERE task_type_id = ${taskTypeId}`
    
            const [userInput, taskType, instructions] = await Promise.all([
                pool.query(userInputQuery),
                pool.query(taskTypeQuery),
                pool.query(instructionsQuery),
            ]);

            const response = {
                task: nextTask,
                userInput: userInput.rows[0],
                taskType: taskType.rows[0],
                instructions: instructions.rows
            }
    
            console.log(response);
            res.json({ success: true, result: response });

            return;
        } else {
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
                const issueMetricsQuery = sql.fragment`SELECT * FROM issue_metrics`
                const issueMetricsCriteriaQuery = sql.fragment`SELECT * FROM issue_metrics_criteria`
    
                const [issueMetrics, issueMetricsCriteria] = await Promise.all([
                    pool.query(issueMetricsQuery),
                    pool.query(issueMetricsCriteriaQuery),
                ]);
    
                for(const row of issueMetrics.rows){
                    const metric = {
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        criteria: issueMetricsCriteria.rows.filter(criteriaRow => criteriaRow.issue_metric_id === row.id)
                    };
                    metrics.push(metric);
                }

                console.log('these are the metrics: ', JSON.stringify(metrics, null, 2));
            }
    
            const response = {
                task: nextTask,
                issue: issue.rows[0],
                taskType: taskType.rows[0],
                instructions: instructions.rows,
                metrics: metrics, // EVALUATION
            }
    
            console.log(response);
            res.json({ success: true, result: response });
        }

    });
    
    app.post('/storeCompletedTask', async (req, res) => {
        console.log('this is the body received -> ', req.body)

        const workerKey = req.body.workerKey;
        const checkWorkerKeyQuery = sql.fragment`SELECT id, name FROM workers WHERE id IN (select worker_id from worker_keys where key = ${workerKey})`;
        const checkWorkerKeyResult = await pool.query(checkWorkerKeyQuery);

        let workerId = null

        if(checkWorkerKeyResult.rows.length === 0){
            // We did not find a key, thus, we send an error message to the user.
            console.log('Worker key is not valid. Sending back error message...')
            res.json({ success: false, message: 'Worker Key is not valid. CANNOT insert a completed task.' });
            return;
        }else{
            workerId = checkWorkerKeyResult.rows[0].id
            // We also asynchronously update the worker_keys table to reflect last time of usage
            const updateWorkerKeyQuery = sql.fragment`UPDATE worker_keys SET used = true WHERE key = ${workerKey}`;
            pool.query(updateWorkerKeyQuery);
        }

        const worker = checkWorkerKeyResult.rows[0]
        console.log(`Worker storing a completed task: ${worker.id} | ${worker.name}`)

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
            // GENERATION
            case 1:
                console.log("Received output from Generation task")
                try {
                    const outputJson = JSON.parse(output);
    
                    const insertIssueQuery = sql.fragment`
                        INSERT INTO issues (parent_id, granularity, name, description, field, context, complexity_score, scope_score, analysis_done)
                        VALUES (
                            NULL,
                            1,
                            ${outputJson.name},
                            ${outputJson.description},
                            ${outputJson.field},
                            ${outputJson.context},
                            100, 100, false
                        );
                    `;
                    await pool.query(insertIssueQuery);

                    // Update the task status to 'completed'
                    const updateTaskQuery = sql.fragment`
                    UPDATE tasks
                    SET status = 'completed'
                    WHERE id = ${taskId};
                    `;
                    await pool.query(updateTaskQuery);
                    
                    console.log("Inserted output successfully")

                    // If everything was inserted successfully
                    // We generate the first task related to this newly created issue
                    await generateTasks(sql, pool, io);
                    retrieveAndEmitIssues(sql, pool, io);
                    increaseTaskCounter(sql, pool, workerId);
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
            // SUBDIVISION
            case 2:
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
                    retrieveAndEmitIssues(sql, pool, io);
                    increaseTaskCounter(sql, pool, workerId);
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
            case 3:
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
                    retrieveAndEmitIssues(sql, pool, io);
                    increaseTaskCounter(sql, pool, workerId);
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
            case 4:
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
                    
                    retrieveAndEmitIssues(sql, pool, io);
                    increaseTaskCounter(sql, pool, workerId);
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
            case 5:
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
                    retrieveAndEmitIssues(sql, pool, io);
                    increaseTaskCounter(sql, pool, workerId);
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
            case 6:
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
                    retrieveAndEmitIssues(sql, pool, io);
                    increaseTaskCounter(sql, pool, workerId);
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
    await generateTasks(sql, pool, io);

    // Run the tasks retrieval function immediately
    retrieveAndEmitTasks(sql, pool, io);
    retrieveAndEmitIssues(sql, pool, io);

    // Schedule the task assignment function to run every 10 seconds
    setInterval(async () => {
        await generateTasks(sql, pool, io);
        retrieveAndEmitTasks(sql, pool, io);
        retrieveAndEmitIssues(sql, pool, io);
    }, 10000);
}
