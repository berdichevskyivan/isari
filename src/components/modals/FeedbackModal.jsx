import React, { useState } from 'react';
import '../../App.css';
import { Modal, Typography, Box, Button, IconButton, TextField } from '@mui/material';

function FeedbackModal({ open, onClose }) {
    const [feedback, setFeedback] = useState("");

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>
                Feedback
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    variant="outlined"
                    placeholder="Your feedback..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />
                <Button variant="contained" color="primary" onClick={() => submitFeedback(feedback)}>
                    Submit
                </Button>
            </Box>
        </Modal>
    );
}

export default FeedbackModal;