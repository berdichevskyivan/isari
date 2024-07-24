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
        
            res.json({ success: true, result: getDatasetsResult.rows });
        } catch (error) {
            const message = 'Error in Endpoint';
            console.log(`${message} /getDatasets: `, error);
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

            // Validation time!
            // First we validate the amount of datasets the user already has.
            // It must be less than the maximum. If its not, we send back an error.
            const getDatasetsQuery = sql.fragment`SELECT * FROM datasets WHERE worker_id = ${workerId}`;
            const getDatasetsResult = await pool.query(getDatasetsQuery);

            if(getDatasetsResult.rows.length < MAXIMUM_AMOUNT_OF_DATASETS){

                const tableName = `dataset_table_${name}`;

                for(const dataset of getDatasetsResult.rows){
                    if(dataset.name === name){
                        const message = 'A dataset with this name already exists';
                        console.log(message);
                        res.json({ success: false, message})
                        return;
                    }
                }

                // Insert fields in `datasets` table
                const insertIntoDatasetsQuery = sql.fragment`
                    INSERT INTO datasets(worker_id, name, description, table_name)
                    VALUES (${workerId}, ${name}, ${description}, ${tableName})
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