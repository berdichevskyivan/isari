import React, { useState, useEffect } from 'react';
import './DatasetViewer.css';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button } from '@mui/material';

function DatasetViewer({ loadedDataset, openSection, loadDataset }){
    useEffect(()=>{
        if(!localStorage.getItem('currentDatasetId')){
            // no currentDatasetId, go back
            openSection('datasets', 'datasetsList');
        } else {
            const datasetId = localStorage.getItem('currentDatasetId');
            loadDataset(datasetId);
        }
    }, [])

    return (
        <div className="dataset-viewer-container">
            <div className="dataset-viewer-main-section">
                { loadedDataset && (
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
                    }}>{loadedDataset.name}</Typography>
                ) }
                <TableContainer component={Paper} sx={{ zIndex: 2, borderTopRightRadius: 0, borderTopLeftRadius: 0 }} className='no-scrollbar'>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {loadedDataset && loadedDataset.fields?.length > 0 && loadedDataset.fields?.map(field => (
                                    <TableCell>{field.name}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { loadedDataset && loadedDataset.rows?.length === 0 && (
                                <>
                                    <TableRow>
                                        <TableCell>There are no records</TableCell>
                                    </TableRow>
                                </>
                            )}

                            { loadedDataset && loadedDataset.rows?.length > 0 && (
                                <>
                                    { loadedDataset.rows.map(row => (
                                        <TableRow>
                                            <TableCell>There are records yay!!</TableCell>
                                        </TableRow>
                                    )) }
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div className="dataset-viewer-buttons">
                <Button variant="contained" className="default-button" onClick={() => { openSection('datasets', 'datasetsList'); }}>
                    Back
                </Button>
            </div>
        </div>
    );
}

export default DatasetViewer;