import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography, Button } from '@mui/material';

function WorkflowsList({loading, workflows, openSection, deleteWorkflow, openWorkflowViewer}){
    return (
        <>
            {loading && (
                <CircularProgress size={40} />
            )}
            {!loading && workflows.length === 0 && (
                <div className='no-workflows-container'>
                    <p style={{ color: 'turquoise' }}>No workflows! How about creating one?</p>
                    <Button variant="contained" className="default-button" onClick={() => { openSection('workflows', 'createWorkflow') }}>
                        Create Workflow
                    </Button>
                </div>
            )}
            {!loading && workflows.length > 0 && (
                <>
                    <p>No workflows!</p>
                </>
            )}
        </>
    );
};

export default WorkflowsList;