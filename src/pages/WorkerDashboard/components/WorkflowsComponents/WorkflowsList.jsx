import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography, Button, Grid, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './WorkflowsList.css';
import DeleteWorkflowModal from '../../../../components/modals/DeleteWorkflowModal';

function WorkflowsList({loading, workflows, openSection, deleteWorkflow, openWorkflowViewer, openEditWorkflow, setLoadedWorkflow}){

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);

    const handleOpenModal = (workflow) => {
        setSelectedWorkflow(workflow);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkflow(null);
    };

    const handleConfirmDelete = () => {
        deleteWorkflow(selectedWorkflow.id);
        handleCloseModal();
    };

    return (
        <>
            {loading && (
                <CircularProgress size={40} />
            )}
            {!loading && workflows.length === 0 && (
                <div className='no-workflows-container'>
                    <p style={{ color: 'turquoise' }}>No workflows! How about creating one?</p>
                    <Button variant="contained" className="default-button" onClick={() => { openSection('workflows', 'createWorkflow'); setLoadedWorkflow(null); }}>
                        Create Workflow
                    </Button>
                </div>
            )}
            {!loading && workflows.length > 0 && (
                <>
                    <div className="workflows-list-container">
                        <div className="workflows-list-main-section no-scrollbar">
                            {/* Workflows will be here, each workflow is a card */}
                            <Grid container spacing={2}>
                                {workflows.map((workflow) => (
                                    <Grid item xs={12} sm={6} key={workflow.id} display="flex" justifyContent="center" alignItems="center" sx={{ height: '100px' }}>
                                        <Paper className="workflow-card" onClick={()=>{ openWorkflowViewer(workflow) }}>
                                            <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', flexFlow: 'row', justifyContent: 'center', alignContent: 'center' }}>
                                                <DeleteIcon sx={{ color: 'black', height: '25px', width: '25px' }} onClick={(e)=>{ e.stopPropagation(); handleOpenModal(workflow) }} />
                                                <EditIcon sx={{ color: 'black', height: '25px', width: '25px' }} onClick={(e)=>{ e.stopPropagation(); openEditWorkflow(workflow) }} />
                                            </div>

                                            <Typography sx={{ fontSize: '20px' }}>
                                                {workflow.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '14px', textAlign: 'center' }}>
                                                {workflow.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                        <div className="workflows-list-buttons">
                            { workflows.length < 4 && (
                                <Button variant="contained" className="default-button" onClick={() => { openSection('workflows', 'createWorkflow'); setLoadedWorkflow(null); }}>
                                    Create Workflow
                                </Button>
                            ) }
                        </div>
                    </div>
                </>
            )}
            <DeleteWorkflowModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default WorkflowsList;