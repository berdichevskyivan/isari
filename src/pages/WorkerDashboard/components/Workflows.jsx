import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import axios from 'axios';
import './Workflows.css';
import WorkflowsList from './WorkflowsComponents/WorkflowsList';
import WorkflowViewer from './WorkflowsComponents/WorkflowViewer';
import CreateWorkflow from './WorkflowsComponents/CreateWorkflow';

const isProduction = import.meta.env.MODE === 'production';

function Workflows({ user, tabs, openSection, openTab }){

    const { openSnackbar } = useNotification();
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadedWorkflow, setLoadedWorkflow] = useState(null);

    const getWorkflows = async () => {
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/getWorkflows`, { workerId: user.id }, { withCredentials: true });
            console.log(response.data);
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                // We proceed to set the workflows!
                setWorkflows(response.data.result)
                setLoading(false);
            }
        } catch (error) {
          console.log(error);
          setWorkflows([]);
          openSnackbar('Error retrieving workflows', 'error');
        }
    }

    const openWorkflowViewer = async (workflow) => {
        const workflowId = workflow.id;
        localStorage.setItem('currentWorkflowId', workflowId);
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/loadWorkflow`, { workflowId: workflowId }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                console.log('loadWorkflow response')
                console.log(response.data.result)
                setLoadedWorkflow(response.data.result);
                openSection('workflows', 'workflowViewer');
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error loading workflow', 'error');
        }
    }

    const openEditWorkflow = async (workflow) => {
        const workflowId = workflow.id;
        localStorage.setItem('currentWorkflowId', workflowId);
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/loadWorkflow`, { workflowId: workflowId }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                console.log('loadWorkflow response')
                console.log(response.data.result)
                setLoadedWorkflow(response.data.result);
                openSection('workflows', 'createWorkflow');
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error loading workflow', 'error');
        }
    }

    const loadWorkflow = async (id) => {
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/loadWorkflow`, { workflowId: id }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                setLoadedWorkflow(response.data.result);
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error loading workflow', 'error');
        }
    }

    const deleteWorkflow = async (workflowId) => {
        try {
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/deleteWorkflow`, { workerId: user.id, workflowId: workflowId }, { withCredentials: true });
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                openSnackbar(response.data.message, 'success');
                setWorkflows(d => d.filter(d => d.id !== workflowId));
            }
        } catch (error) {
          console.log(error);
          openSnackbar('Error deleting workflows', 'error');
        }
    }

    useEffect(()=>{

        if(!user){
            navigate('/');
            return;
        }

        getWorkflows();

    }, [])

    return (
        <div className="workflows-container">
            {/* Workflows List */}
            { tabs['workflows'].sections.workflowsList.open && (
                <>
                    <WorkflowsList loading={loading} workflows={workflows} openSection={openSection} deleteWorkflow={deleteWorkflow} openWorkflowViewer={openWorkflowViewer} openEditWorkflow={openEditWorkflow} setLoadedWorkflow={setLoadedWorkflow}/>
                </>
            ) }

            {/* Workflow Viewer */}
            { tabs['workflows'].sections.workflowViewer.open && (
                <>
                    <WorkflowViewer loadedWorkflow={loadedWorkflow} openSection={openSection} loadWorkflow={loadWorkflow} />
                </>
            ) }

            {/* Create Workflow */}
            { tabs['workflows'].sections.createWorkflow.open && (
                <>
                    <CreateWorkflow openSection={openSection} axios={axios} user={user} getWorkflows={getWorkflows} openTab={openTab} loadedWorkflow={loadedWorkflow} loadWorkflow={loadWorkflow} />
                </>
            ) }
        </div>
    )
}

export default Workflows;