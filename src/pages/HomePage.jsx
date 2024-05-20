// import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import '../App.css';
import { Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField, SvgIcon, useTheme, useMediaQuery } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HubIcon from '@mui/icons-material/Hub';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import profilePicUrl from '../assets/profile-pic.png';
import pythonIcon from '../assets/icons/python.svg';
import healthcareIcon from '../assets/icons/healthcare.png';
import gamingIcon from '../assets/icons/gaming.png';
import chatGptIcon from '../assets/icons/gpt.svg';
import metaLlamaIcon from '../assets/icons/meta.svg';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import MessageIcon from '@mui/icons-material/Message';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // This imports default styles

function CustomCard({ title, content, imageUrl }) {
  return (
    <Card sx={{ width: 250, height: 300, m: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'black', overflow: 'hidden' }} className="worker-card">
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
        <Avatar src={imageUrl} alt={title} sx={{ width: 40, height: 40 }} />
        <Typography variant="h5" component="div" gutterBottom align="center" sx={{ marginBottom: 0, marginLeft: '.5rem', fontSize: '18px', fontFamily: 'Orbitron, sans-serif', alignSelf: 'center', color: '#00B2AA' }}>
          Ivan Berdichevsky
          {/* Later retrieve the names for the cards from the DB */}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, width: '100%', pt: 0 }}>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 2, ml: '.5rem' }}>
          <DataArrayIcon sx={{ height: 30, width: 30, color: '#00CC00'}} />
          <img src={pythonIcon} alt="python-logo" width={30} height={30} className="category-icon"/>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
          <HubIcon sx={{ height: 30, width: 30, color: '#007FFF'}} />
          <Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }} className="category-icon"><span style={{ fontFamily: 'Orbitron', fontSize: '12px' }}>ML</span></Avatar>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
          <CenterFocusStrongIcon sx={{ height: 30, width: 30, color: '#7D26CD'}} />
          <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>Healthcare</span>}>
            <img src={healthcareIcon} alt="healthcare-logo" width={30} height={30} className="category-icon" />
          </Tippy>
          <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>Gaming</span>}>
            <img src={gamingIcon} alt="gaming-logo" width={30} height={30} className="category-icon" />
          </Tippy>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
          <ArchitectureIcon sx={{ height: 30, width: 30, color: '#FFD700'}} />
          <img src={chatGptIcon} alt="gpt-logo" width={30} height={30} className="category-icon"/>
          <img src={metaLlamaIcon} alt="llama-logo" width={30} height={30} className="category-icon"/>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', pt: 2, ml: '.5rem' }}>
          <div>
            <AccountBalanceWalletIcon sx={{ height: 30, width: 30, color: '#9a4400'}} />
          </div>
          <div>
            <QrCode2Icon sx={{ height: 50, width: 50, position: 'relative', top: '-10px', left: '-30px', color: '#00B2AA'}} />
          </div>
          <div style={{ marginRight: '1rem' }}>
            <MessageIcon sx={{ height: 30, width: 30, color: '#00B2AA'}} />
            <InfoIcon sx={{ height: 30, width: 30, color: '#00B2AA'}} />
            <ShareIcon sx={{ height: 30, width: 30, color: '#00B2AA'}} />
          </div>
        </Box>
      </CardContent>
    </Card>
  );
}

function HomePage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const gridColumns = matches ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr';

  const cards = Array.from({ length: 70 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    content: "Content here",
    imageUrl: profilePicUrl, // Replace with actual image paths
  }));

  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',  // Allow overflow while hiding scrollbars
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',  // for Internet Explorer and Edge
        scrollbarWidth: 'none',  // for Firefox
        background: 'black'
    }}>
      <Grid container sx={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        justifyContent: 'center',  // center the items when fewer
        padding: 2,
        gridGap: '8px',
        rowGap: '8px',
        columnGap: '8px',
        marginBottom: '80px'  // This extra margin accounts for the height of the dashboard
      }}>
        {cards.map((card) => (
          <Grid item key={card.id} sx={{ justifySelf: 'center' }}>
            <CustomCard
              title={card.title}
              content={card.content}
              imageUrl={card.imageUrl}
            />
          </Grid>
        ))}
      </Grid>
      <ControlsDashboard />
    </div>
  );
}

export default HomePage;
