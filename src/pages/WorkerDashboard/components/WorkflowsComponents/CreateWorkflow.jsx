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

const isProduction = import.meta.env.MODE === 'production';

const StyledTextField = styled(TextField)({
  '& input': {
    color: 'white',
    fontFamily: 'Roboto !important',
    fontSize: '14px',
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

function CreateWorkflow({ openSection }){

    const { openSnackbar } = useNotification();
    const [workflowName, setWorkflowName] = useState('');
    const [workflowTasks, setWorkflowTasks] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {

    }

    const addTask = async () => {

        if(workflowTasks.length >= 10){
            openSnackbar('You can\'t add more than 10 tasks', 'error');
            return;
        }

        const newTask = {
            name: '',
            description: '',
            data_type: ''
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
                                <Grid item xs={12} sm={4} >
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
                                <Grid item xs={12} sm={8} >
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
                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Task Type</Typography>
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
                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Temperature</Typography>
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
                                <Grid item xs={12} sm={3} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Input Type</Typography>
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
                                <Grid item xs={12} sm={6} >
                                    <div className="input-with-label">
                                        <div className="task-label-with-info">
                                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Data Type</Typography>
                                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The data type of this task</span>} >
                                                <InfoIcon tabIndex="-1" />
                                            </Tippy>
                                        </div>
                                        <Select
                                            value={ workflowTasks.find(f => f.id === task.id).data_type }
                                            onChange={(e)=>{ handleWorkflowTaskChange(e, task.id, 'data_type') }}
                                            inputProps={{ style: { color: 'blue !important' } }}
                                            className="tasks-dropdown"
                                        >
                                            <MenuItem value={'TEXT'}>Text</MenuItem>
                                            <MenuItem value={'INTEGER'}>Number</MenuItem>
                                            <MenuItem value={'BOOLEAN'}>Boolean</MenuItem>
                                        </Select>
                                    </div>
                                </Grid>
                            </Grid>
                            <DeleteIcon sx={{ color: 'turquoise', cursor: 'pointer', position: 'absolute', top: 0, right: 0, height: '30px', width: '30px' }} onClick={()=>{ deleteTask(task.id) }} />
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
                        <>Submit</>
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