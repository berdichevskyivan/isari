import React from 'react';
import { Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function CreateWorkflow({ openSection }){
    return (
        <>
                <Button variant="contained" className="default-button" onClick={() => { openSection('workflows', 'workflowsList'); }}>
                    Back
                </Button>
        </>
    );
};

export default CreateWorkflow;