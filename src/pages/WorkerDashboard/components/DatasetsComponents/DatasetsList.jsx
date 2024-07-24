import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography, Button, Grid, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './DatasetsList.css';
import DeleteDatasetModal from '../../../../components/modals/DeleteDatasetModal';

function DatasetsList({ loading, datasets, openSection, deleteDataset }){

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState(null);

    const handleOpenModal = (dataset) => {
        setSelectedDataset(dataset);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDataset(null);
    };

    const handleConfirmDelete = () => {
        deleteDataset(selectedDataset.id);
        handleCloseModal();
    };


    return (
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
                    <div className="datasets-list-container">
                        <div className="datasets-list-main-section no-scrollbar">
                            {/* Datasets will be here, each dataset is a card */}
                            <Grid container spacing={2}>
                                {datasets.map((dataset) => (
                                    <Grid item xs={12} sm={6} key={dataset.id} display="flex" justifyContent="center" alignItems="center" sx={{ height: '100px' }}>
                                        <Paper className="dataset-card" >
                                            <DeleteIcon sx={{ color: 'black', height: '25px', width: '25px', position: 'absolute', top: 2, right: 2 }} onClick={()=>{ handleOpenModal(dataset) }} />
                                            <Typography sx={{ fontSize: '20px' }}>
                                                {dataset.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '14px', textAlign: 'center' }}>
                                                {dataset.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                        <div className="datasets-list-buttons">
                            { datasets.length < 4 && (
                                <Button variant="contained" className="default-button" onClick={() => { openSection('datasets', 'createDataset') }}>
                                    Create Dataset
                                </Button>
                            ) }
                        </div>
                    </div>
                </>
            )}
            <DeleteDatasetModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default DatasetsList;