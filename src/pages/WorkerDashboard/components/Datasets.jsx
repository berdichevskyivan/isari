import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import axios from 'axios';
import CreateDataset from './DatasetsComponents/CreateDataset';
import DatasetViewer from './DatasetsComponents/DatasetViewer';
import DatasetsList from './DatasetsComponents/DatasetsList';

const isProduction = import.meta.env.MODE === 'production';

function Datasets({ user, tabs, openSection }){
    const { openSnackbar } = useNotification();
    const navigate = useNavigate();
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadedDataset, setLoadedDataset] = useState(null);

    const getDatasets = async () => {
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/getDatasets`, { workerId: user.id }, { withCredentials: true });
            console.log(response.data);
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
    }

    const deleteDataset = async (datasetId) => {
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/deleteDataset`, { workerId: user.id, datasetId: datasetId }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                openSnackbar(response.data.message, 'success');
                setDatasets(d => d.filter(d => d.id !== datasetId));
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error deleting datasets', 'error');
        }
    }

    const openDatasetViewer = async (dataset) => {
        const datasetId = dataset.id;
        localStorage.setItem('currentDatasetId', datasetId);
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/loadDataset`, { datasetId: datasetId }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                console.log('loadDataset response')
                console.log(response.data.result)
                setLoadedDataset(response.data.result);
                openSection('datasets', 'datasetViewer');
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error loading dataset', 'error');
        }
    }

    const openEditDataset = async (dataset) => {
        const datasetId = dataset.id;
        localStorage.setItem('currentDatasetId', datasetId);
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/loadDataset`, { datasetId: datasetId, includeRows: false }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                console.log('loadDataset response')
                console.log(response.data.result)
                setLoadedDataset(response.data.result);
                openSection('datasets', 'createDataset');
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error loading dataset', 'error');
        }
    }

    const loadDataset = async (id, includeRows = null) => {
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/loadDataset`, { datasetId: id, includeRows }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                setLoadedDataset(response.data.result);
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error loading dataset', 'error');
        }
    }

    useEffect(()=>{

        if(!user){
            navigate('/');
            return;
        }

        getDatasets();

    }, [])

    return (
        <div className="datasets-container">

            {/* Datasets List */}
            { tabs['datasets'].sections.datasetsList.open && (
                <>
                    <DatasetsList
                    loading={loading}
                    datasets={datasets}
                    openSection={openSection}
                    deleteDataset={deleteDataset}
                    openDatasetViewer={openDatasetViewer}
                    openEditDataset={openEditDataset}
                    setLoadedDataset={setLoadedDataset} />
                </>
            ) }

            {/* Datasets Viewer */}
            { tabs['datasets'].sections.datasetViewer.open && (
                <>
                    <DatasetViewer loadedDataset={loadedDataset} openSection={openSection} loadDataset={loadDataset} />
                </>
            ) }

            {/* Create Datasets */}
            { tabs['datasets'].sections.createDataset.open && (
                <>
                    <CreateDataset openSection={openSection} axios={axios} user={user} getDatasets={getDatasets} loadedDataset={loadedDataset} loadDataset={loadDataset} />
                </>
            ) }

        </div>
    )
}

export default Datasets;