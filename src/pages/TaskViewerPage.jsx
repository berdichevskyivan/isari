import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import CycloneIcon from '@mui/icons-material/Cyclone';
import BackupIcon from '@mui/icons-material/Backup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import './TaskViewerPage.css';

const isProduction = import.meta.env.MODE === 'production';

const formattedDate = (date) => {
  const formattedText = new Date(date).toLocaleDateString()
  return formattedText;
}

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const statusIcon = (status) => {
  switch(status){
    case 'pending':
      return (
        <>
          <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>Pending</span>}>
            <AssignmentIcon sx={{ color: 'red' }}/>
          </Tippy>
        </>
      );
    case 'active':
      return (
        <>
          <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>Active</span>}>
          <BackupIcon sx={{ color: 'orange' }}/>
          </Tippy>
        </>
      );
    case 'completed':
      return (
        <>
          <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>Completed</span>}>
            <CheckCircleIcon sx={{ color: 'green' }}/>
          </Tippy>
        </>
      );
    default:
      return status;
  }
}

function Row({ task }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" align="center" sx={{ fontFamily: 'monospace' }}>
          {task.task_id}
        </TableCell>
        <TableCell align="center">{capitalizeFirstLetter(task.task_type_name)}</TableCell>
        <TableCell align="center">{capitalizeFirstLetter(task.task_role)}</TableCell>
        <TableCell align="center">{statusIcon(task.task_status)}</TableCell>
        <TableCell align="center">{formattedDate(task.task_created_date)}</TableCell>
        <TableCell align="center">{formattedDate(task.task_updated_date)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }} colSpan={12} align='right'>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 0 }}>
              {/* Task is related to a user_input */}
              { task.task_user_input_id && (
                <>
                  <Table size="small" aria-label="user_inputs">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" width="20%">Issue Title</TableCell>
                        <TableCell align="left" width="80%">Issue Context</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={task.task_user_input_id}>
                        <TableCell component="th" scope="row" align='center'>
                          {task.task_user_input_issue_title}
                        </TableCell>
                        <TableCell component="th" align='left'>{task.task_user_input_issue_context}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </>
              ) }
              {/* Task is related to an issue */}
              { task.task_issue_id && (
                <>
                  <Table size="small" aria-label="issues">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" width="20%">Issue Name</TableCell>
                        <TableCell align="left" width="80%">Issue Description</TableCell>
                        {/* <TableCell>Issue Field</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={task.task_issue_id}>
                        <TableCell component="th" scope="row" align="center">
                          {task.task_issue_name}
                        </TableCell>
                        <TableCell component="th" align="left">{task.task_issue_description}</TableCell>
                        {/* <TableCell component="th">{task.task_issue_field}</TableCell> */}
                      </TableRow>
                    </TableBody>
                  </Table>
                </>
              ) }
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function TaskViewerPage({ workers, workerOptions, setWorkers, tasks }) {

  if (!tasks) {
    return <Loading />;
  }

  if(tasks.length === 0){
    if(localStorage.getItem('tasks')){
      tasks = JSON.parse(localStorage.getItem('tasks'))
    }
  }

  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        background: 'black'
    }}>
      <StarrySky />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        zIndex: 2,
        marginBottom: '6rem',
      }}>
        <div className="task-viewer-container">
        
          <TableContainer component={Paper} sx={{ zIndex: 2 }} className='no-scrollbar task-viewer-table'>
            <Table stickyHeader aria-label="collapsible table">
              <TableHead>
                <TableRow className="tasks-header-row">
                  <TableCell style={{ width: '5%' }} align="center"/>
                  <TableCell style={{ width: '15%' }} align="center">Task ID</TableCell>
                  <TableCell style={{ width: '15%' }} align="center">Task Type</TableCell>
                  <TableCell style={{ width: '10%' }} align="center">Role</TableCell>
                  <TableCell style={{ width: '20%' }} align="center">Task Status</TableCell>
                  <TableCell style={{ width: '15%' }} align="center">Created on</TableCell>
                  <TableCell style={{ width: '20%' }} align="center">Updated on</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <Row key={task.task_id} task={task} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: '1.5rem' }}>
            <Button variant="contained" href="/issue-viewer" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <CycloneIcon sx={{ marginRight: '0.5rem' }} />Issue Viewer
            </Button>
            <Button variant="contained" href="/submit-issue" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <BackupIcon sx={{ marginRight: '0.5rem' }} />Submit Issue
            </Button>
          </div>
        </div>

      </div>
      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
    </div>
  );
}

export default TaskViewerPage;
