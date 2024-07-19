import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import BackupIcon from '@mui/icons-material/Backup';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const isProduction = import.meta.env.MODE === 'production';

function Row({ issue }) {
  const [open, setOpen] = React.useState(false);
  const [proposalsOpen, setProposalsOpen] = React.useState(false);
  const [extrapolationsOpen, setExtrapolationsOpen] = React.useState(false);
  const [subdivisionsOpen, setSubdivisionsOpen] = React.useState(false);

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
        <TableCell component="th" scope="row" align="center">
          {issue.name}
        </TableCell>
        <TableCell align="left">{issue.description}</TableCell>
        <TableCell align="left">{issue.field}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0, paddingRight: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 0 }}>
              <Table>
                <TableBody>

                  { issue.proposals.length > 0 && (
                    <TableRow>
                      <TableCell style={{ paddingLeft: 0, paddingRight: 0 }} colSpan={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setProposalsOpen(!proposalsOpen)}
                          >
                            {proposalsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                          <Typography variant="h6" sx={{ marginLeft: '.5rem' }}>Proposals</Typography>
                        </Box>
                        <Collapse in={proposalsOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 0 }}>
                            <>
                              <Table size="small" aria-label="proposals">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="center">Proposal Name</TableCell>
                                    <TableCell>Proposal Description</TableCell>
                                    <TableCell>Proposal Field</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {issue.proposals.map((proposal) => (
                                    <TableRow key={proposal.id}>
                                      <TableCell component="th" scope="row" align="center">{proposal.name}</TableCell>
                                      <TableCell>{proposal.description}</TableCell>
                                      <TableCell>{proposal.field}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}

                  { issue.extrapolations.length > 0 && (
                    <TableRow>
                      <TableCell style={{ paddingLeft: 0, paddingRight: 0 }} colSpan={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setExtrapolationsOpen(!extrapolationsOpen)}
                          >
                            {extrapolationsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                          <Typography variant="h6" sx={{ marginLeft: '.5rem' }}>Extrapolations</Typography>
                        </Box>
                        <Collapse in={extrapolationsOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 0 }}>
                            <>
                              <Table size="small" aria-label="user_inputs">
                                <TableHead>
                                  <TableRow>
                                    <TableCell align="center">Extrapolation Name</TableCell>
                                    <TableCell>Extrapolation Description</TableCell>
                                    <TableCell>Extrapolation Field</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {issue.extrapolations.map((extrapolation) => (
                                    <TableRow key={extrapolation.id}>
                                      <TableCell component="th" scope="row" align="center">{extrapolation.name}</TableCell>
                                      <TableCell>{extrapolation.description}</TableCell>
                                      <TableCell>{extrapolation.field}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  ) }

                  { issue.children.length > 0 && (
                    <TableRow>
                      <TableCell style={{ paddingLeft: 0, paddingRight: 0 }} colSpan={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setSubdivisionsOpen(!subdivisionsOpen)}
                          >
                            {subdivisionsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                          <Typography variant="h6" sx={{ marginLeft: '.5rem' }}>Subdivisions</Typography>
                        </Box>
                        <Collapse in={subdivisionsOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 0 }}>
                            <>
                              <Table size="small" aria-label="user_inputs">
                                <TableHead>
                                  <TableRow>
                                    <TableCell />
                                    <TableCell align="center">Subdivision Name</TableCell>
                                    <TableCell>Subdivision Description</TableCell>
                                    <TableCell>Subdivision Field</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {issue.children.length > 0 && issue.children.map((child) => (
                                    <Row key={child.id} issue={child} />
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  ) }

                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function IssueViewerPage({ workers, workerOptions, setWorkers, issues }) {

  if (!issues) {
    return <Loading />;
  }

  if(issues.length === 0){
    if(localStorage.getItem('issues')){
      issues = JSON.parse(localStorage.getItem('issues'))
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
      }}>
        <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between', height: '800px', minHeight: '800px', width: '800px', padding: '2rem', borderRadius: '14px', zIndex: 2, background: 'black', border: '2px solid turquoise' }}>
        
          <TableContainer component={Paper} sx={{ zIndex: 2 }} className='no-scrollbar issue-viewer-table'>
            <Table stickyHeader aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: '5%' }}/>
                  <TableCell align="center" style={{ width: '20%' }}>Name</TableCell>
                  <TableCell align="center" style={{ width: '55%' }}>Description</TableCell>
                  <TableCell align="center" style={{ width: '20%' }}>Field</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.map((issue) => (
                  <Row key={issue.id} issue={issue} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: '1.5rem' }}>
            <Button variant="contained" href="/task-viewer" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <PendingActionsIcon sx={{ marginRight: '0.5rem' }} />Task Viewer
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

export default IssueViewerPage;
