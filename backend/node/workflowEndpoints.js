import pkg from 'pg';
const { Client } = pkg;
import { validateScriptHash } from './taskManager.js'

const MAXIMUM_AMOUNT_OF_DATASETS = 4;

export async function attachWorkflowEndpoints(app, sql, pool, io, connectionString) {

    const client = new Client({
        connectionString,
    });
    await client.connect();
    
    app.post('/getDatasets', async (req, res) => {
        try{
            const { workerId } = req.body;

            const getDatasetsQuery = sql.fragment`SELECT * FROM datasets WHERE worker_id = ${workerId}`;
            const getDatasetsResult = await pool.query(getDatasetsQuery);

            let data = [...getDatasetsResult.rows];

            // For everydataset we need a count() query
            for(const row of getDatasetsResult.rows){
                const getCountQuery = `SELECT count(*) FROM ${row.table_name}`;
                const getCountResult = await client.query(getCountQuery);

                const countValue = Number(getCountResult.rows[0].count);

                data = data.map(o => {
                    if(o.id === row.id){
                        return {
                            ...o,
                            count: countValue,
                        }
                    } else {
                        return {
                            ...o,
                        }
                    }
                })
            }
        
            res.json({ success: true, result: data });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /getDatasets: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/getWorkflows', async (req, res) => {
        try{
            const { workerId } = req.body;

            const getWorkflowsQuery = sql.fragment`SELECT * FROM workflows WHERE worker_id = ${workerId}`;
            const getWorkflowsResult = await pool.query(getWorkflowsQuery);
        
            res.json({ success: true, result: getWorkflowsResult.rows });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /getWorkflows: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/loadDataset', async (req, res) => {
        try{
            const { datasetId } = req.body;

            const loadDatasetInfoQuery = sql.fragment`SELECT * FROM datasets WHERE id = ${datasetId}`;
            const loadDatasetInfoResult = await pool.query(loadDatasetInfoQuery);

            const tableName = loadDatasetInfoResult.rows[0]?.table_name;

            if(!tableName){
                res.json({ success: false, message: 'Error in Endpoint' });
                return
            }

            console.log('table name is: ', tableName);

            const sanitizedTableName = tableName.replace(/[^a-z_]/g, '');

            const loadDatasetQuery = `SELECT * FROM ${sanitizedTableName}`;
            const loadDatasetResult = await client.query(loadDatasetQuery);

            const result = {
                name: loadDatasetInfoResult.rows[0].name,
                description: loadDatasetInfoResult.rows[0].description,
                rows: loadDatasetResult.rows,
                fields: loadDatasetResult.fields.map(f => ({ name: f.name }))
            }
        
            res.json({ success: true, result });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /loadDataset: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/loadWorkflow', async (req, res) => {
        try{
            const { workflowId } = req.body;

            const loadWorkflowInfoQuery = sql.fragment`SELECT * FROM workflows WHERE id = ${workflowId}`;
            const loadWorkflowInfoResult = await pool.query(loadWorkflowInfoQuery);

            const loadWorkflowTasksQuery = sql.fragment`SELECT * FROM workflow_tasks WHERE workflow_id = ${workflowId}`;
            const loadWorkflowTasksResult = await pool.query(loadWorkflowTasksQuery);

            const result = {
                id: loadWorkflowInfoResult.rows[0].id,
                name: loadWorkflowInfoResult.rows[0].name,
                tasks: loadWorkflowTasksResult.rows,
            }
        
            res.json({ success: true, result });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /loadWorkflow: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/createDataset', async (req, res) => {
        try{
            const { workerId, name, description, fields } = req.body;

            console.log('workerId: ', workerId)
            console.log('name is: ', name);
            console.log('description is: ', description);
            console.log('fields are: ', fields);

            const sanitizedName = name.replace(/[^a-z_]/g, '');

            // Validation time!
            // First we validate the amount of datasets the user already has.
            // It must be less than the maximum. If its not, we send back an error.
            const getDatasetsQuery = sql.fragment`SELECT * FROM datasets WHERE worker_id = ${workerId}`;
            const getDatasetsResult = await pool.query(getDatasetsQuery);

            if(getDatasetsResult.rows.length < MAXIMUM_AMOUNT_OF_DATASETS){

                const tableName = `dataset_table_${sanitizedName}`;

                for(const dataset of getDatasetsResult.rows){
                    if(dataset.name === sanitizedName){
                        const message = 'A dataset with this name already exists';
                        console.log(message);
                        res.json({ success: false, message})
                        return;
                    }
                }

                // Insert fields in `datasets` table
                const insertIntoDatasetsQuery = sql.fragment`
                    INSERT INTO datasets(worker_id, name, description, table_name)
                    VALUES (${workerId}, ${sanitizedName}, ${description}, ${tableName})
                    RETURNING id
                    `
                const insertIntoDatasetsResult = await pool.query(insertIntoDatasetsQuery);
                console.log(insertIntoDatasetsResult);

                // We need this result so if there's nothing we go back home
                const datasetId = insertIntoDatasetsResult.rows[0]?.id;

                if(!datasetId){
                    const message = 'Error in Endpoint';
                    console.log('No ID was retrieved from dataset creation result');
                    res.json({ success: false, message });
                    return;
                }

                // Insert fields in `dataset_fields` table
                for(const field of fields){
                    const insertIntoDatasetFieldsQuery = sql.fragment`
                    INSERT INTO dataset_fields(dataset_id, name, description, data_type)
                    VALUES (${datasetId}, ${field.name}, ${field.description}, ${field.data_type})
                    `
                    await pool.query(insertIntoDatasetFieldsQuery)
                }

                // Create table for the dataset
                // now we can finally proceed with creating the table
                let fieldsQueryPart = fields
                    .map(field => `${field.name} ${field.data_type === 'INTEGER' ? 'NUMERIC' : field.data_type}`)
                    .join(', ');
            
                const createTableQuery = `
                    CREATE TABLE ${tableName} (
                    id SERIAL PRIMARY KEY,
                    ${fieldsQueryPart}
                    )
                `;
            
                console.log('Table Creation Query: ', createTableQuery);
                await client.query(createTableQuery);

                // If all went well, that is it :) 
                res.json({ success: true, message: 'Dataset created successfully' })
                return;
            } else {
                const message = 'Cannot create more than four datasets'
                res.json({ success: false, message });
                return;
            }
        
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /createDataset: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/createWorkflow', async (req, res) => {
        try{
            const { workerId, name, tasks } = req.body;

            console.log('workerId: ', workerId)
            console.log('name is: ', name);
            console.log('tasks are: ', tasks);

            const insertWorkflowQuery = sql.fragment`INSERT INTO workflows(worker_id, name) VALUES(${workerId}, ${name}) RETURNING id`
            const insertWorkflowResult = await pool.query(insertWorkflowQuery);

            const workflowId = insertWorkflowResult.rows[0].id;

            for(const task of tasks){
                const insertTaskQuery = sql.fragment`
                INSERT INTO workflow_tasks(workflow_id, name, description, role, status, task_type, input_type, raw_data, input_dataset_id, output_amount, output_dataset_id)
                VALUES (${workflowId}, ${task.name}, ${task.description}, ${task.role}, 'pending', ${task.task_type}, ${task.input_type}, ${task.raw_data || null}, ${task.input_dataset?.id || null}, ${task.output_amount}, ${task.output_dataset?.id || null})
                `
                await pool.query(insertTaskQuery);
            }

            res.json({ success: true, message: 'Workflow was created successfully!' })
        
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /createWorkflow: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/deleteWorkflow', async (req, res) => {
        try{
            const { workerId, workflowId } = req.body;

            // First we need to delete the fields
            const deleteWorkflowTasksQuery = sql.fragment`DELETE FROM workflow_tasks WHERE workflow_id = ${workflowId}`
            const deleteWorkflowQuery = sql.fragment`DELETE FROM workflows WHERE id = ${workflowId} AND worker_id = ${workerId}`

            await pool.query(deleteWorkflowTasksQuery);
            await pool.query(deleteWorkflowQuery);
            
            // Sucess message
            res.json({ success: true, message: 'Workflow successfully deleted' });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /deleteWorkflow: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/deleteDataset', async (req, res) => {
        try{
            const { workerId, datasetId } = req.body;

            // First we need to delete the fields
            const deleteDatasetFieldsQuery = sql.fragment`DELETE FROM dataset_fields WHERE dataset_id = ${datasetId}`
            const deleteDatasetQuery = sql.fragment`DELETE FROM datasets WHERE id = ${datasetId} AND worker_id = ${workerId} RETURNING table_name`
            const deleteWorkflowTasksQuery = sql.fragment`DELETE FROM workflow_tasks WHERE output_dataset_id = ${datasetId} OR input_dataset_id = ${datasetId} RETURNING workflow_id`

            const deleteWorkflowTasksResult = await pool.query(deleteWorkflowTasksQuery);

            // Now you can use `result.rows` to delete the corresponding workflows
            const workflowIds = deleteWorkflowTasksResult.rows.map(row => row.workflow_id);

            if(workflowIds.length > 0){
                console.log('workflowIds: ', workflowIds)
                // Construct and execute the query to delete the workflows
                const deleteWorkflowsQuery = sql.fragment`
                    DELETE FROM workflows WHERE id in (${workflowIds.join(', ')})
                `;

                await pool.query(deleteWorkflowsQuery);
            }

            await pool.query(deleteDatasetFieldsQuery);
            const deleteDatasetResult = await pool.query(deleteDatasetQuery);

            // We get the result from the deletion and we drop the table with the normal client
            const tableName = deleteDatasetResult.rows[0]?.table_name;

            if(!tableName){
                res.json({ success: false, message: 'Error in endpoint' })
                return;
            }

            // We procede to drop the table
            const dropTableQuery = `DROP TABLE ${tableName}`;
            await client.query(dropTableQuery);
            
            // Sucess message
            res.json({ success: true, message: 'Dataset successfully deleted' });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /deleteDataset: `, error);
            res.json({ success: false, message });
        }
    });

    app.post('/checkForWorkflowTask', async (req, res) => {

        const scriptHash = req.body.scriptHash;

        const hashValidationResult = await validateScriptHash(sql, pool, scriptHash);

        if(!hashValidationResult){
            console.log('Script Hash is not valid. Sending back error message...')
            res.json({ success: false, message: 'Script Hash is not valid.' });
            return;
        }

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
        console.log(`Worker checking for workflow tasks: ${worker.id} | ${worker.name}`)

        // We check for 'pending' tasks.
        // If a task is found, we immediatly update the status (to active) and the worker_id
        const nextWorkflowTaskQuery = sql.fragment`
            WITH next_workflow_task AS (
                SELECT id
                FROM workflow_tasks
                WHERE status = 'pending'
                AND workflow_id in (SELECT id FROM workflows WHERE worker_id = ${worker.id} ORDER BY id asc)
                ORDER BY id ASC
                LIMIT 1
            )
            UPDATE workflow_tasks
            SET status = 'active'
            WHERE id = (SELECT id FROM next_workflow_task)
            RETURNING *;
        `;

        let nextTask = null;

        try {
            const nextWorkflowTaskResult = await pool.query(nextWorkflowTaskQuery);
            nextTask = nextWorkflowTaskResult.rows[0];
    
            if(!nextTask){
                res.json({ success: false, error_code: 'NO_MORE_TASKS' }) // There are no more tasks
                return;
            }
        } catch (error) {
            console.error('Error executing query:', error);
            res.json({ success: false, message: `Error getting the task` });
            return;
        }

        console.log('nextTask: ', nextTask);

        const outputDatasetQuery = sql.fragment`SELECT * FROM datasets WHERE id = ${nextTask.output_dataset_id}`;
        const outputDatasetFieldsQuery = sql.fragment`SELECT * FROM dataset_fields WHERE dataset_id = ${nextTask.output_dataset_id}`;

        const outputDatasetResult = await pool.query(outputDatasetQuery);
        const outputDatasetFieldsResult = await pool.query(outputDatasetFieldsQuery)

        let input_text = `Assume this role: ${nextTask.role}\n`
            + `You must perform this task: ${nextTask.name}\n`
            + `This task consists of: ${nextTask.description}\n`
            + `This is the subject for this task: ${outputDatasetResult.rows[0].name}\n`
            + `This is a brief description of the subject: ${outputDatasetResult.rows[0].description}\n`
            + 'These are the names and descriptions of the fields that conform the subject: \n'
            for(const field of outputDatasetFieldsResult.rows){
                input_text += `Field name: ${field.name} \n`;
                input_text += `Field description: ${field.description} \n`;
            }
            input_text += `This is raw data provided by the user: ${nextTask.raw_data} \n`
            input_text += `The output must be formatted as a ${nextTask.output_amount === 1 ? 'JSON Object' : `JSON Array containing exactly ${nextTask.output_amount} objects`} with the following fields: ${outputDatasetFieldsResult.rows.map(r => r.name).join(', ')} \n`
            input_text += `The output must consist only of the ${nextTask.output_amount === 1 ? 'JSON Object' : 'JSON array'} and nothing else.`

        console.log('input_text: ', input_text)

        const response = {
            task_id: nextTask.id,
            temperature: 0.7,
            input_text: input_text
        };

        res.json({ success: true, response: response });

    });

    app.post('/storeCompletedWorkflowTask', async (req, res) => {
        console.log('this is the body received -> ', req.body)

        try{
            const scriptHash = req.body.scriptHash;

            const hashValidationResult = await validateScriptHash(sql, pool, scriptHash);
    
            if(!hashValidationResult){
                console.log('Script Hash is not valid. Sending back error message...')
                res.json({ success: false, message: 'Script Hash is not valid.' });
                return;
            }
    
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
            console.log(`Worker storing a completed workflow task: ${worker.id} | ${worker.name}`)
    
            const workflowTaskId = req.body.task_id;
            const output = req.body.output;
            const outputJson = JSON.parse(output);
    
            const getWorkflowTaskInfoQuery = sql.fragment`SELECT * FROM workflow_tasks WHERE id = ${workflowTaskId}`;
            const taskInfoResult = await pool.query(getWorkflowTaskInfoQuery);
            const taskInfo = taskInfoResult.rows[0];
    
            console.log('this is taskInfo: ', taskInfo);
            console.log('this is outputJson: ', outputJson);
    
            // Now i need to get info on the output dataset
            // I need to know in which table to INSERT (in this case), the data
            const getOutputDatasetInfoQuery = sql.fragment`SELECT * FROM datasets WHERE id = ${taskInfo.output_dataset_id}`;
            const getOutputDatasetInfoResult = await pool.query(getOutputDatasetInfoQuery);
    
            const outputDatasetInfo = getOutputDatasetInfoResult.rows[0];
            console.log('outputDatasetInfo: ', outputDatasetInfo);
    
            if(outputJson.length){
                // we loop over the output array
                const outputIds = [];
                for(const object of outputJson){
                    const fields = Object.keys(object).map(key => {
                        const value = object[key];
                        return typeof value === 'number' ? value : `'${value.replace(/'/g, "''")}'`;
                    }).join(', ');
    
                    const insertDataQuery = `INSERT INTO ${outputDatasetInfo.table_name}(${Object.keys(object).join(', ')}) VALUES(${fields}) RETURNING id`
    
                    console.log(insertDataQuery);
    
                    const insertDataQueryResult = await client.query(insertDataQuery);
                    const outputId = insertDataQueryResult.rows[0].id;
                    outputIds.push(outputId);
                }
                // Now that I'm done, I insert these outputIds into the task output_dataset_record_ids column
                console.log('this is outputIds, ', outputIds);
                console.log('this is outputIds.join: ', outputIds.join(', '))
                const updateTaskMetaDataQuery = sql.fragment`UPDATE workflow_tasks SET output_dataset_record_ids = ${outputIds.join(', ')} WHERE id = ${workflowTaskId}`;
                await pool.query(updateTaskMetaDataQuery);
            } else {
                // We execute one query because we got just one object
                const fields = Object.keys(outputJson).map(key => {
                    const value = outputJson[key];
                    return typeof value === 'number' ? value : `'${value.replace(/'/g, "''")}'`;
                }).join(', ');
    
                const insertDataQuery = `INSERT INTO ${outputDatasetInfo.table_name}(${Object.keys(outputJson).join(', ')}) VALUES(${fields}) RETURNING id`
                console.log(insertDataQuery);
    
                const insertDataQueryResult = await client.query(insertDataQuery);
                const outputId = insertDataQueryResult.rows[0].id;

                const updateTaskMetaDataQuery = sql.fragment`UPDATE workflow_tasks SET output_dataset_record_ids = ${outputId} WHERE id = ${workflowTaskId}`;
                await pool.query(updateTaskMetaDataQuery);
            }

            // Update Workflow Task status
            await pool.query(sql.fragment`UPDATE workflow_tasks SET status = 'completed' WHERE id = ${workflowTaskId}`)
    
            res.json({ success: true });
        }catch(error){
            console.log(error);
            await pool.query(sql.fragment`UPDATE workflow_tasks SET status = 'pending' WHERE id = ${req.body.task_id}`)
            res.json({ success: false, message: 'Error in Endpoint' });
        }

    })

}