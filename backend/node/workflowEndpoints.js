import pkg from 'pg';
const { Client } = pkg;

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
                data = data.map(o => {
                    return {
                        ...o,
                        count: Number(getCountResult.rows[0].count),
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
                    .map(field => `${field.name} ${field.data_type}`)
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
            console.log(`${message} /createDataset: `, error);
            res.json({ success: false, message });
        }
    });

}