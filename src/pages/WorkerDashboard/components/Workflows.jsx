import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import { Typography, Button } from '@mui/material';
import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';

function Workflows({ user, tabs, openSection }){

    const { openSnackbar } = useNotification();
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{

        if(!user){
            navigate('/');
            return;
        }

        (async ()=>{
            try {
                const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/getWorkflows`, { workerId: user.id }, { withCredentials: true });

                if(response.data.success === false){
                    openSnackbar(response.data.message, 'error');
                } else {
                    // We proceed to set the workflows!
                    setWorkflows(response.data.result)
                    setLoading(false);
                }
            } catch (error) {
              console.log(error);
              setWorkflows([]);
              openSnackbar('Error retrieving workflows', 'error');
            }
        })();

    }, [])

    return (
        <div className="workflows-container">
            {loading && (
                <CircularProgress size={40} />
            )}
            {!loading && workflows.length === 0 && (
                <div className='no-workflows-container'>
                    <p style={{ color: 'turquoise' }}>No workflows! How about creating one?</p>
                    <Button variant="contained" className="default-button" onClick={() => {}}>
                        Create Workflow
                    </Button>
                </div>
            )}
            {!loading && workflows.length > 0 && (
                <>
                    <p>No workflows!</p>
                </>
            )}
        </div>
    )
}

export default Workflows;