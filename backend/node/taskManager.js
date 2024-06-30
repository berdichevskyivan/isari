// taskManager.js
async function handleTaskType(sql, pool, taskTypeId, taskTypeName) {
    console.log(`Current Task Type: ${taskTypeName} (${taskTypeId})`);

    // Query to find the next problem for the given task type
    const nextProblemQuery = sql.fragment`
        SELECT *
        FROM problems
        WHERE id NOT IN (
            SELECT problem_id
            FROM tasks
            WHERE task_type_id = ${taskTypeId}
        )
        ORDER BY id ASC
        LIMIT 1;
    `;
    const nextProblemResult = await pool.query(nextProblemQuery);

    if (nextProblemResult.rows.length > 0) {
        const problemId = nextProblemResult.rows[0].id;
        console.log(`Creating Task with type ${taskTypeName} for problem ID ${problemId}`);

        // Insert a task for the given task type
        const insertTaskQuery = sql.fragment`
            INSERT INTO tasks (task_type_id, problem_id, status)
            VALUES (${taskTypeId}, ${problemId}, 'Pending');
        `;
        await pool.query(insertTaskQuery);

        console.log(`Task with type ${taskTypeName} created for problem ID ${problemId}`);
        return true; // Indicate that a task was created
    } else {
        console.log(`No problems found for ${taskTypeName}`);
        return false; // Indicate that no task was created
    }
}

async function checkAndAssignTasks(sql, pool) {
    
    try {
        // Check if problems table has data
        const problemsQuery = sql.fragment`SELECT 1 FROM problems LIMIT 1`;
        const problemsResult = await pool.query(problemsQuery);

        if (problemsResult.rows.length === 0) {
            console.log("No records in the problems table");
        } else {
            console.log("Records found in the problems table");

            // Query to get all task types
            const taskTypesQuery = sql.fragment`SELECT * FROM task_types`;
            const taskTypesResult = await pool.query(taskTypesQuery);

            // Store the result into a constant
            const taskTypes = taskTypesResult.rows;

            // If taskTypes is empty, return
            if(taskTypes.length === 0) return;

            // Iterating over task types
            console.log('Iterating over Task Types');
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

export async function initTaskManager(sql, pool) {
    console.log("Initializing Task Manager");

    // Run the task assignment function immediately
    await checkAndAssignTasks(sql, pool);

    // Schedule the task assignment function to run every 10 seconds
    setInterval(async () => {
        await checkAndAssignTasks(sql, pool);
    }, 10000);
}
