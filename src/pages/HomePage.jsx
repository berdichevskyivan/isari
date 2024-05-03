import React, { useState } from 'react';
import '../App.css';
import { Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField, useTheme, useMediaQuery } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
// import { Link } from 'react-router-dom';

function CustomCard({ title, content, imageUrl }) {
  return (
    <Card sx={{ width: 250, height: 300, m: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Avatar src={imageUrl} alt={title} sx={{ width: 60, height: 60 }} />
      </Box>
      <CardContent sx={{ flexGrow: 1, width: '100%' }}>
        <Typography variant="h5" component="div" gutterBottom align="center">
          {title}
        </Typography>
        <Typography variant="body2" align="center">
          {content}
        </Typography>
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
    imageUrl: "path_to_image.jpg" // Replace with actual image paths
  }));

  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',  // Allow overflow while hiding scrollbars
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',  // for Internet Explorer and Edge
        scrollbarWidth: 'none',  // for Firefox
    }}>
      <Grid container sx={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        justifyContent: 'center',  // center the items when fewer
        padding: 2,
        gridGap: '8px',
        rowGap: '4px',
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
