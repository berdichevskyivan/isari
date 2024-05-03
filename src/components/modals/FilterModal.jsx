import React, { useState } from 'react';
import '../../App.css';
import { Modal, Box, Button } from '@mui/material';

function FilterModal({ open, onClose }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                {/* Filter options here */}
                <Button onClick={onClose}>Apply Filters</Button>
            </Box>
        </Modal>
    );
}

export default FilterModal;