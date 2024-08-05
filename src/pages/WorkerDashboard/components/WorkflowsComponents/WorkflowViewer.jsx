import React, { useState, useEffect } from 'react';
import './WorkflowViewer.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button } from '@mui/material';

function WorkflowViewer({ loadedWorkflow, openSection, loadWorkflow }){
    useEffect(()=>{
        if(!localStorage.getItem('currentWorkflowId')){
            // no currentWorkflowId, go back
            openSection('workflows', 'workflowsList');
        } else {
            const workflowId = localStorage.getItem('currentWorkflowId');
            loadWorkflow(workflowId);
        }
    }, [])

    return (
        <div className="workflow-viewer-container">
            <div className="workflow-viewer-main-section">
                { loadedWorkflow && (
                    <Typography 
                    component={Paper}
                    sx={{ 
                        width: '100%',
                        textAlign: 'center',
                        borderBottomRightRadius: 0,
                        borderBottomLeftRadius: 0,
                        fontWeight:'bold',
                        paddingTop: '.5rem',
                        paddingBottom: '.5rem'
                    }}>{loadedWorkflow.name}</Typography>
                ) }
                <TableContainer component={Paper} sx={{ zIndex: 2, borderTopRightRadius: 0, borderTopLeftRadius: 0 }} className='no-scrollbar'>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Name</TableCell>
                                <TableCell align="center">Description</TableCell>
                                <TableCell align="center">Role</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Total Iterations</TableCell>
                                <TableCell align="center">Current Iterations</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { loadedWorkflow && loadedWorkflow.tasks?.length === 0 && (
                                <>
                                    <TableRow>
                                        <TableCell>There are no records</TableCell>
                                    </TableRow>
                                </>
                            )}

                            { loadedWorkflow && loadedWorkflow.tasks?.length > 0 && (
                                <>
                                    { loadedWorkflow.tasks.map(row => (
                                        <TableRow>
                                            <TableCell align="center">{ row.name }</TableCell>
                                            <TableCell align="center">{ row.description }</TableCell>
                                            <TableCell align="center">{ row.role }</TableCell>
                                            <TableCell align="center">{ row.status }</TableCell>
                                            <TableCell align="center">{ row.total_iterations }</TableCell>
                                            <TableCell align="center">{ row.current_iterations }</TableCell>
                                        </TableRow>
                                    )) }
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div className="workflow-viewer-buttons">
                <Button variant="contained" className="default-button" onClick={() => { openSection('workflows', 'workflowsList'); }}>
                    Back
                </Button>
            </div>
        </div>
    );
}

export default WorkflowViewer;