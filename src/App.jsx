import React from 'react';
import './App.css';
import { Card, CardContent, Typography, Avatar, Box, Grid } from '@mui/material';

function CustomCard({ title, content, imageUrl }) {
  return (
    <Card sx={{ width: 250, height: 300, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

function App() {
  return (
    <div style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Grid container sx={{ height: '100%' }}>
        {/* Spotlight Section, dynamic number of cards based on width, centered */}
        <Grid item xs={4} sx={{ height: '100%', overflowY: 'auto', display: 'flex' }} className="no-scrollbar">
          <Grid container justifyContent="center" spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item key={item} sx={{ maxWidth: 250 }}>
                <CustomCard
                  title={`Spotlight Card ${item}`}
                  content="Spotlight Content"
                  imageUrl="path_to_image.jpg" // Path to image
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* General Section, dynamic number of cards based on width, aligned left to right */}
        <Grid item xs={8} sx={{ height: '100%', overflowY: 'auto', display: 'flex' }} className="no-scrollbar">
          <Grid container spacing={2} sx={{ flexGrow: 1, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((item) => (
              <Grid item key={item} sx={{ maxWidth: 250 }}>
                <CustomCard
                  title={`General Card ${item}`}
                  content="General Content"
                  imageUrl="path_to_image.jpg" // Path to image
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
