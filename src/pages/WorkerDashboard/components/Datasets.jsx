import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import { Typography, Button } from '@mui/material';
import axios from 'axios';
import CreateDataset from './DatasetsComponents/CreateDataset';
import DatasetViewer from './DatasetsComponents/DatasetViewer';

const isProduction = import.meta.env.MODE === 'production';

function Datasets({ user, tabs, openSection }){

    const { openSnackbar } = useNotification();
    const navigate = useNavigate();
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{

        if(!user){
            navigate('/');
            return;
        }

        (async ()=>{
            try {
                const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/getDatasets`, { workerId: user.id }, { withCredentials: true });

                if(response.data.success === false){
                    openSnackbar(response.data.message, 'error');
                } else {
                    // We proceed to set the datasets!
                    setDatasets(response.data.result)
                    setLoading(false);
                }
            } catch (error) {
              console.log(error);
              setDatasets([]);
              openSnackbar('Error retrieving datasets', 'error');
            }
        })();

    }, [])

    return (
        <div className="datasets-container">

            {/* Datasets List */}
            { tabs['datasets'].sections.datasetsList.open && (
                <>
                    {loading && (
                        <CircularProgress size={40} />
                    )}
                    {!loading && datasets.length === 0 && (
                        <div className='no-datasets-container'>
                            <p style={{ color: 'turquoise' }}>No datasets! How about creating one?</p>
                            <Button variant="contained" className="default-button" onClick={() => { openSection('datasets', 'createDataset') }}>
                                Create Dataset
                            </Button>
                        </div>
                    )}
                    {!loading && datasets.length > 0 && (
                        <>
                            <p>No datasets!</p>
                            {/* Here we can render DatasetsList */}
                        </>
                    )}
                </>
            ) }

            {/* Datasets Viewer */}
            { tabs['datasets'].sections.datasetViewer.open && (
                <>
                    <DatasetViewer />
                </>
            ) }

            {/* Create Datasets */}
            { tabs['datasets'].sections.createDataset.open && (
                <>
                    <CreateDataset openSection={openSection} />
                </>
            ) }

        </div>
    )
}

export default Datasets;