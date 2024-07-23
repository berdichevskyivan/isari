import React from 'react';
import { Typography, Button } from '@mui/material';
import './CreateDataset.css';

function CreateDataset({ openSection }){
    return (
        <div className="create-dataset-container">
            <div className="create-dataset-main-section"></div>
            <div className="create-dataset-buttons">
                <Button variant="contained" className="default-button" onClick={() => {}}>
                    Submit
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { openSection('datasets', 'datasetsList') }}>
                    Back
                </Button>
            </div>
        </div>
    );
}

export default CreateDataset;