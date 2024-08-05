import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { styled } from '@mui/system';
import './CreateWorkflow.css';
import InfoIcon from '@mui/icons-material/Info';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { useNotification } from '../../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const isProduction = import.meta.env.MODE === 'production';

const StyledTextField = styled(TextField)({
  '& input': {
    color: 'white',
    fontFamily: 'Roboto !important',
    fontSize: '12px',
    height: '30px',
    padding: '0 8px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    '&::placeholder': {
      fontFamily: 'Orbitron',
      color: 'white',
      fontSize: '14px',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'turquoise',
    },
    '&:hover fieldset': {
      borderColor: 'turquoise',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'turquoise',
    },
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    '& textarea': {
      '&::placeholder': {
        fontFamily: 'Orbitron, sans-serif',
      },
    },
  },
  '.MuiFormLabel-root': {
    display: 'none',
  },
});

function CreateWorkflow({ openSection, axios, user, openTab, getWorkflows, loadedWorkflow, loadWorkflow }){

    const [editMode, setEditMode] = useState(loadedWorkflow ? true : false);

    console.log('CreateWorkflow editMode is: ', editMode);

    const { openSnackbar } = useNotification();
    const navigate = useNavigate();
    const [workflowName, setWorkflowName] = useState('');
    const [workflowTasks, setWorkflowTasks] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(false);

    const getDatasets = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/getDatasets`, { workerId: user.id }, { withCredentials: true });
            console.log(response.data);
            if(response.data.success === false){
                openSnackbar(response.data.message, 'error');
            } else {
                // We cant create workflows without a dataset
                // so send the user back to datasets
                if(response.data.result.length === 0){
                    openSnackbar('You need to create a dataset first', 'error')
                    openTab('datasets')
                } else {
                    setDatasets(response.data.result)
                    setLoading(false);
                }

            }
        } catch (error) {
          console.log(error);
          setDatasets([]);
          openSnackbar('Error retrieving datasets', 'error');
        }
    }

    const handleSubmit = async () => {
        // Temporary block for edit mode
        if(editMode){
            console.log('We are in Edit Mode. Not submitting yet.');
            return;
        }

        // Start validating!
        // First you need some fields!
        if (workflowTasks.length < 1){
            openSnackbar('You need at least one task.', 'error');
            return;
        }

        // Dataset Name Validation
        if (workflowName.length < 3 || workflowName.length > 30) {
            openSnackbar('The dataset name must be between 3 and 30 characters long', 'error');
            return;
        } else if (!/^[a-z_]+$/.test(workflowName)) {
            openSnackbar('The dataset name can only contain lowercase letters (a-z) and the underscore _ character', 'error');
            return;
        }

        for(const task of workflowTasks){
            if(task.name.length < 4){
                openSnackbar('Each task name at least 4 characters long', 'error');
                return;
            }

            if(task.description.length < 10){
                openSnackbar('Each task description must be at least 10 characters long', 'error');
                return;
            }

            if(task.role.length < 5){
                openSnackbar('Each task role must be at least 5 characters long', 'error');
                return;
            }

            if(task.task_type === ''){
                openSnackbar('Each task role must have a task type selected', 'error');
                return;
            }

            if(task.input_type === ''){
                openSnackbar('Each task role have a task type selected', 'error');
                return;
            }

            if(task.input_type === 'raw' && task.raw_data === ''){
                openSnackbar('You must fill in the Raw Data field', 'error');
                return;
            }

            if(task.input_type === 'dataset' && task.input_dataset === null){
                openSnackbar('You must select an input dataset', 'error');
                return;
            }

            if(task.output_dataset === null){
                openSnackbar('You must select an input dataset', 'error');
                return;
            }

            if(task.output_amount < 1 || task.output_amount > 4){
                openSnackbar('The output amount must be between 1 and 4', 'error');
                return;
            }
        }

        const data = {
            workerId: user.id,
            name: workflowName,
            tasks: workflowTasks,
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/createWorkflow`, data, { withCredentials: true });

            if(response.data.success === false){
                setIsSubmitting(false);
                openSnackbar(response.data.message, 'error');
            } else {
                setIsSubmitting(false);
                getWorkflows();
                openSnackbar(response.data.message)
                openSection('workflows', 'workflowsList');
            }
        } catch (error) {
          console.log(error);
          setIsSubmitting(false);
          openSnackbar('Error retrieving workflows', 'error');
        }

    }

    const addTask = async () => {

        if(workflowTasks.length >= 10){
            openSnackbar('You can\'t add more than 10 tasks', 'error');
            return;
        }

        const newTask = {
            name: '',
            description: '',
            role: '',
            task_type: '',
            input_type: '',
            raw_data: '',
            input_dataset: null,
            output_dataset: null,
            output_amount: 1,
        }

        let newWorkflowTasks = [...workflowTasks];
        newWorkflowTasks.push(newTask);
        newWorkflowTasks = newWorkflowTasks.map((field, index) => {
            const newTask = {...field};
            newTask['id'] = index;
            return newTask;
        })

        setWorkflowTasks(newWorkflowTasks);
    }

    const deleteTask = (id) => {
        let newWorkflowTasks = [...workflowTasks].filter(task => task.id !== id);
        newWorkflowTasks = newWorkflowTasks.map((task, index) => {
            const newTask = {...task};
            newTask['id'] = index;
            return newTask;
        })
        setWorkflowTasks(newWorkflowTasks)
    }

    const handleWorkflowNameChange = (e) => {
        const value = e.target.value;
        setWorkflowName(value);
    }

    const handleWorkflowTaskChange = (e, id, field) => {
        const value = e.target.value;
        const newWorkflowTasks = [...workflowTasks].map(task => {
            if(task.id === id){
                task[field] = value;
            }
            return task;
        })
        setWorkflowTasks(newWorkflowTasks);
    }

    useEffect(()=>{

        if(!user){
            navigate('/');
            return;
        }

        getDatasets();

    }, [])

    return (
        <div className="create-workflow-container">
            <div className="create-workflow-main-section">
                <div className="create-workflow-main-section-header">
                    <div className="input-with-label">
                        <div className="label-with-info">
                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Workflow Name</Typography>
                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The name for this workflow</span>} >
                                <InfoIcon tabIndex="-1" />
                            </Tippy>
                        </div>
                        <StyledTextField value={workflowName} onChange={handleWorkflowNameChange} autoComplete='off' autoCorrect='off' spellCheck={false}/>
                    </div>
                </div>
                <div className="create-workflow-main-section-body no-scrollbar">
                    { workflowTasks.length === 0 && (
                        <div className="no-workflow-tasks-container">
                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Workflows need tasks!</Typography>
                            <Button variant="contained" className="default-button" onClick={() => { addTask(); }}>
                                Add Task
                            </Button>
                        </div>
                    ) }
                    { workflowTasks.length > 0 && workflowTasks.map((task, index) => (
                        <div className="workflow-task-container" key={`workflow-${index}`}>
                            <Grid container>
                                <Grid item xs={12} sm={2} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Task Name</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>What is the name of this task?</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <StyledTextField 
                                        value={ workflowTasks.find(f => f.id === task.id).name }
                                        onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'name') }}
                                        autoComplete='off' autoCorrect='off' spellCheck={false} />
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={5} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Task Description</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>How would you describe this task?</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <StyledTextField value={ workflowTasks.find(f => f.id === task.id).description } onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'description') }} autoComplete='off' autoCorrect='off' spellCheck={false} />
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Role</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>What role should the agent take on this task?</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <StyledTextField 
                                        value={ workflowTasks.find(f => f.id === task.id).role }
                                        onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'role') }}
                                        autoComplete='off' autoCorrect='off' spellCheck={false} />
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={2} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Task Type</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The type of operation to be carried out after completion of the task</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <Select
                                            value={ workflowTasks.find(f => f.id === task.id).task_type }
                                            onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'task_type') }}
                                            inputProps={{ style: { color: 'blue !important' } }}
                                            className="tasks-dropdown"
                                        >
                                            <MenuItem value={'create'}>Create</MenuItem>
                                            { datasets.find(d => d.count > 0) && <MenuItem value={'update'}>Update</MenuItem> }
                                            { datasets.find(d => d.count > 0) && <MenuItem value={'delete'}>Delete</MenuItem> }
                                        </Select>
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Input Type</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The data type of this task</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <Select
                                            value={ workflowTasks.find(f => f.id === task.id).input_type }
                                            onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'input_type') }}
                                            inputProps={{ style: { color: 'blue !important' } }}
                                            className="tasks-dropdown"
                                        >
                                            <MenuItem value={'raw'}>Raw Data</MenuItem>
                                            { datasets.find(d => d.count > 0) && <MenuItem value={'dataset'}>Dataset</MenuItem> }
                                            { task.id !== 0 && (<MenuItem value={'previous_output'}>Previous Output</MenuItem>)}
                                        </Select>
                                    </div>
                                </Grid>
                                { workflowTasks.find(f => f.id === task.id).input_type === 'dataset' && (
                                    <Grid item xs={12} sm={3} >
                                        <div className="input-with-label">
                                            <div className="task-label-with-info">
                                                <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Input Dataset</Typography>
                                                <Tippy content={<span style={{ fontFamily: 'Roboto' }}>Dataset used for the input</span>} >
                                                    <InfoIcon tabIndex="-1" />
                                                </Tippy>
                                            </div>
                                            <Select
                                                value={ workflowTasks.find(f => f.id === task.id).input_dataset || ''}
                                                onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'input_dataset') }}
                                                inputProps={{ style: { color: 'blue !important' } }}
                                                className="tasks-dropdown"
                                            >
                                                { datasets.length > 0 && datasets.map(dataset => (
                                                    <MenuItem key={dataset.id} value={dataset}>{ dataset.name }</MenuItem>
                                                ))}
                                            </Select>
                                        </div>
                                    </Grid>
                                ) }

                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Output Dataset</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>Dataset where the output will be stored or used</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <Select
                                            value={ workflowTasks.find(f => f.id === task.id).output_dataset || ''}
                                            onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'output_dataset') }}
                                            inputProps={{ style: { color: 'blue !important' } }}
                                            className="tasks-dropdown"
                                        >
                                            { datasets.length > 0 && datasets.map(dataset => (
                                                <MenuItem key={dataset.id} value={dataset}>{ dataset.name }</MenuItem>
                                            ))}
                                        </Select>
                                    </div>
                                </Grid>
                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Output Amount</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>Amount of objects produced by the output</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <StyledTextField 
                                            type="number"
                                            value={ workflowTasks.find(f => f.id === task.id).output_amount }
                                            onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'output_amount') }}
                                            min="1"
                                            max="4"
                                            onInput={(e) => {
                                                const value = parseInt(e.target.value, 10);
                                                if (value < 1) e.target.value = 1;
                                                if (value > 4) e.target.value = 4;
                                            }}
                                            autoComplete='off'
                                            autoCorrect='off'
                                            spellCheck={false}
                                        />
                                    </div>
                                </Grid>
                                { workflowTasks.find(f => f.id === task.id).input_type === 'raw' && (
                                    <Grid item xs={12} sm={12} >
                                        <div className="input-with-label">
                                            <div className="task-label-with-info">
                                                <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Raw Data</Typography>
                                                <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The raw data to be sent to the model</span>} >
                                                    <InfoIcon tabIndex="-1" />
                                                </Tippy>
                                            </div>
                                            <StyledTextField 
                                            value={ workflowTasks.find(f => f.id === task.id).raw_data }
                                            onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'raw_data') }}
                                            autoComplete='off' autoCorrect='off' spellCheck={false} />
                                        </div>
                                    </Grid>
                                ) }
                            </Grid>
                            <DeleteIcon sx={{ color: 'turquoise', cursor: 'pointer', position: 'absolute', top: 0, right: 0, height: '20px', width: '20px' }} onClick={()=>{ deleteTask(task.id) }} />
                            <Typography sx={{ fontSize: '14px', position: 'absolute', top: 0, left: 4 }}>{task.id+1}</Typography>
                        </div>
                    )) }
                </div>
            </div>
            <div className="create-workflow-buttons">
                <Button variant="contained" className="default-button" onClick={() => { addTask(); }}>
                    Add Task
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { handleSubmit(); }}>
                    { isSubmitting && (
                        <><CircularProgress size={24}/></>
                    ) }
                    { !isSubmitting && (
                        <>{editMode ? 'Update' : 'Submit'}</>
                    ) }
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { openSection('workflows', 'workflowsList'); }}>
                    Back
                </Button>
            </div>
        </div>
    );
};

export default CreateWorkflow;