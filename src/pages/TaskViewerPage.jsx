import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import CycloneIcon from '@mui/icons-material/Cyclone';
import BackupIcon from '@mui/icons-material/Backup';

const isProduction = import.meta.env.MODE === 'production';

const formattedDate = (date) => {
  const formattedText = new Date(date).toLocaleDateString()
  return formattedText;
}

function Row({ task }) {
  console.log('task is -> ', task)
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
        <TableCell component="th" scope="row">
          {task.task_id}
        </TableCell>
        <TableCell align="right">{task.task_type_name}</TableCell>
        <TableCell align="right">{task.task_status}</TableCell>
        <TableCell align="right">{formattedDate(task.task_created_date)}</TableCell>
        <TableCell align="right">{formattedDate(task.task_updated_date)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} align='right'>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* Task is related to a user_input */}
              { task.task_user_input_id && (
                <>
                  <Table size="small" aria-label="user_inputs">
                    <TableHead>
                      <TableRow>
                        <TableCell>Issue Title</TableCell>
                        <TableCell>Issue Context</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={task.task_user_input_id}>
                        <TableCell component="th" scope="row">
                          {task.task_user_input_issue_title}
                        </TableCell>
                        <TableCell>{task.task_user_input_issue_context}</TableCell>
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
                        <TableCell>Issue Name</TableCell>
                        <TableCell>Issue Description</TableCell>
                        <TableCell>Issue Field</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow key={task.task_issue_id}>
                        <TableCell component="th" scope="row">
                          {task.task_issue_name}
                        </TableCell>
                        <TableCell>{task.task_issue_description}</TableCell>
                        <TableCell>{task.task_issue_field}</TableCell>
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
      }}>
        <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between', height: '800px', minHeight: '800px', width: '800px', padding: '2rem', borderRadius: '14px', zIndex: 2, background: 'white' }}>
        
          <TableContainer component={Paper} sx={{ zIndex: 2 }}>
            <Table stickyHeader aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Task ID</TableCell>
                  <TableCell align="right">Task Type</TableCell>
                  <TableCell align="right">Task Status</TableCell>
                  <TableCell align="right">Created on</TableCell>
                  <TableCell align="right">Updated on</TableCell>
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
