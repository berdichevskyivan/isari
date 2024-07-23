import React from 'react';
import { Grid, Avatar, Chip } from '@mui/material';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { styled } from '@mui/system';

const StyledChip = styled(Chip)(({ selected, shadowcolor }) => ({
  margin: '4px',
  boxShadow: selected ? `0 0 15px ${shadowcolor}` : 'none',
  borderColor: selected ? shadowcolor : '#ccc',
  borderRadius: '50%',
  borderWidth: '2px',
  width: 60,
  height: 60,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '.MuiChip-label': {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

function getInitials(input) {
  return input.split(' ').map(word => word[0]).join('');
}

function WorkerFeed({ 
    workerOptions,
    handleSelect,
    selectedLangs,
    setSelectedLangs,
    selectedBranches,
    setSelectedBranches,
    selectedApps,
    setSelectedApps,
    selectedTools,
    setSelectedTools
}){

    return (
    <div className="worker-feed">
        <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px' }}>
        {workerOptions.programming_languages.map(lang => (
            <Grid item key={lang.id}>
            <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}</span>}>
                <StyledChip
                label={<img src={lang.icon_url} alt={lang.name} style={{ width: 24, height: 24 }} />}
                variant="outlined"
                clickable
                selected={selectedLangs.includes(lang.id)}
                onClick={() => handleSelect(lang.id, setSelectedLangs, selectedLangs)}
                shadowcolor="#00ff00"
                sx={{ borderColor: '#00ff00', height: 50, width: 50 }}
                />
            </Tippy>
            </Grid>
        ))}
        </Grid>
        <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px', marginTop: 1 }}>
        {workerOptions.generalized_ai_branches.map(branch => (
            <Grid item key={branch.id}>
            <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{branch.name}</span>}>
                <StyledChip
                label={<Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }}><span style={{ fontFamily: 'Orbitron', fontSize: '12px'}}>{getInitials(branch.name)}</span></Avatar>}
                variant="outlined"
                clickable
                selected={selectedBranches.includes(branch.id)}
                onClick={() => handleSelect(branch.id, setSelectedBranches, selectedBranches)}
                shadowcolor="#007bff"
                sx={{ borderColor: '#007bff', height: 50, width: 50 }}
                />
            </Tippy>
            </Grid>
        ))}
        </Grid>
        <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px', marginTop: 1 }}>
        {workerOptions.specialized_ai_applications.map(app => (
            <Grid item key={app.id}>
            <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{app.name}</span>}>
                <StyledChip
                label={<img src={app.icon_url} alt={app.name} style={{ width: 30, height: 30 }} />}
                variant="outlined"
                clickable
                selected={selectedApps.includes(app.id)}
                onClick={() => handleSelect(app.id, setSelectedApps, selectedApps)}
                shadowcolor="#8e44ad"
                sx={{ borderColor: '#8e44ad', height: 50, width: 50, pr: 0, pl: 0 }}
                />
            </Tippy>
            </Grid>
        ))}
        </Grid>
        <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px', marginTop: 1 }}>
        {workerOptions.ai_tools.map(tool => (
            <Grid item key={tool.id}>
            <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{tool.name}</span>}>
                <StyledChip
                label={<img src={tool.icon_url} alt={tool.name} style={{ width: 24, height: 24 }} />}
                variant="outlined"
                clickable
                selected={selectedTools.includes(tool.id)}
                onClick={() => handleSelect(tool.id, setSelectedTools, selectedTools)}
                shadowcolor="#f39c12"
                sx={{ borderColor: '#f39c12', height: 50, width: 50 }}
                />
            </Tippy>
            </Grid>
        ))}
        </Grid>
    </div>
    );
  }

export default WorkerFeed;