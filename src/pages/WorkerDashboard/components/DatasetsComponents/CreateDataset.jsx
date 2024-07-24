import React, { useState } from 'react';
import { Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import './CreateDataset.css';
import InfoIcon from '@mui/icons-material/Info';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotification } from '../../../../context/NotificationContext';

const StyledTextField = styled(TextField)({
  '& input': {
    color: 'white',
    fontFamily: 'Roboto !important',
    fontSize: '14px',
    height: '30px',
    padding: '0 8px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    '&::placeholder': {
      fontFamily: 'Orbitron',
      color: 'white',
      fontSize: '14px',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'turquoise',
    },
    '&:hover fieldset': {
      borderColor: 'turquoise',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'turquoise',
    },
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    '& textarea': {
      '&::placeholder': {
        fontFamily: 'Orbitron, sans-serif',
      },
    },
  },
  '.MuiFormLabel-root': {
    display: 'none',
  },
});

function CreateDataset({ openSection }){
    const { openSnackbar } = useNotification();

    const [datasetName, setDatasetName] = useState('');
    const [datasetDescription, setDatasetDescription] = useState('');
    const [datasetFields, setDatasetFields] = useState([]);

    const addField = () => {

        if(datasetFields.length >= 4){
            openSnackbar('You can\'t add more than 4 fields', 'error');
            return;
        }

        const newField = {
            name: '',
            description: '',
            data_type: ''
        }
        let newDatasetFields = [...datasetFields];
        newDatasetFields.push(newField);
        newDatasetFields = newDatasetFields.map((field, index) => {
            const newField = {...field};
            newField['id'] = index;
            return newField;
        })

        setDatasetFields(newDatasetFields);
    }

    const handleFieldDataTypeChange = (e) => {
        const value = e.target.value;
        console.log(value);
    }

    const deleteField = (id) => {
        let newDatasetFields = [...datasetFields].filter(field => field.id !== id);
        newDatasetFields = newDatasetFields.map((field, index) => {
            const newField = {...field};
            newField['id'] = index;
            return newField;
        })
        setDatasetFields(newDatasetFields)
    }

    return (
        <div className="create-dataset-container">
            <div className="create-dataset-main-section">
                <div className="create-dataset-main-section-header">
                    <div className="input-with-label">
                        <div className="label-with-info">
                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Dataset Name</Typography>
                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>What are the objects this dataset is holding?</span>} >
                                <InfoIcon tabIndex="-1" />
                            </Tippy>
                        </div>
                        <StyledTextField autoComplete='off' autoCorrect='off' />
                    </div>
                    <div className="input-with-label">
                        <div className="label-with-info">
                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Dataset Description</Typography>
                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>How would you describe these objects?</span>} >
                                <InfoIcon tabIndex="-1" />
                            </Tippy>
                        </div>
                        <StyledTextField sx={{ width: '500px !important' }}autoComplete='off' autoCorrect='off' />
                    </div>
                </div>
                <div className="create-dataset-main-section-body no-scrollbar">
                    { datasetFields.length === 0 && (
                        <div className="no-dataset-fields-container">
                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Datasets need fields!</Typography>
                            <Button variant="contained" className="default-button" onClick={() => { addField(); }}>
                                Add Field
                            </Button>
                        </div>
                    ) }
                    { datasetFields.length > 0 && datasetFields.map((field, index) => (
                        <div className="dataset-field-container" key={`dataset-${index}`}>
                            <div className="input-with-label">
                                <div className="label-with-info">
                                    <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Field Name</Typography>
                                    <Tippy content={<span style={{ fontFamily: 'Roboto' }}>What is the name of this field?</span>} >
                                        <InfoIcon tabIndex="-1" />
                                    </Tippy>
                                </div>
                                <StyledTextField sx={{ width: '100px !important' }} autoComplete='off' autoCorrect='off' />
                            </div>
                            <div className="input-with-label">
                                <div className="label-with-info">
                                    <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Field Description</Typography>
                                    <Tippy content={<span style={{ fontFamily: 'Roboto' }}>How would you describe this field?</span>} >
                                        <InfoIcon tabIndex="-1" />
                                    </Tippy>
                                </div>
                                <StyledTextField sx={{ width: '350px !important' }} autoComplete='off' autoCorrect='off' />
                            </div>
                            <div className="input-with-label">
                                <div className="label-with-info">
                                    <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Data Type</Typography>
                                    <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The data type of this field</span>} >
                                        <InfoIcon tabIndex="-1" />
                                    </Tippy>
                                </div>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value="TEXT"
                                    onChange={handleFieldDataTypeChange}
                                    inputProps={{ style: { color: 'blue !important' } }}
                                >
                                    <MenuItem value={'TEXT'}>Text</MenuItem>
                                    <MenuItem value={'INTEGER'}>Number</MenuItem>
                                    <MenuItem value={'BOOLEAN'}>Boolean</MenuItem>
                                </Select>
                            </div>
                            <DeleteIcon sx={{ color: 'turquoise', cursor: 'pointer', height: '35px', width: '35px' }} onClick={()=>{ deleteField(field.id) }} />
                        </div>
                    )) }
                </div>
            </div>
            <div className="create-dataset-buttons">
                <Button variant="contained" className="default-button" onClick={() => {}}>
                    Submit
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { addField(); }}>
                    Add Field
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { openSection('datasets', 'datasetsList'); }}>
                    Back
                </Button>
            </div>
        </div>
    );
}

export default CreateDataset;