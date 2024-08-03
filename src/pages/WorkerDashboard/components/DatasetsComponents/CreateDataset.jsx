import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import './CreateDataset.css';
import InfoIcon from '@mui/icons-material/Info';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { useNotification } from '../../../../context/NotificationContext';

const isProduction = import.meta.env.MODE === 'production';

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

function CreateDataset({ openSection, axios, user, getDatasets, loadedDataset }){

    const [editMode, setEditMode] = useState(loadedDataset ? true : false);

    console.log('editMode is: ', editMode);

    const { openSnackbar } = useNotification();

    const [datasetName, setDatasetName] = useState('');
    const [datasetDescription, setDatasetDescription] = useState('');
    const [datasetFields, setDatasetFields] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // EDIT MODE
    const [fieldsToDelete, setFieldsToDelete] = useState([]);

    // Logic goes like this
    // Any field in fieldsToDelete will be deleted
    // If the datasetFields received, it has a databaseId, then it gets updated
    // if the datasetFields received, it DOES NOT have a databaseId, then it gets CREATED

    const handleSubmit = async () => {
        // Start validating!
        // First you need some fields!
        if (datasetFields.length < 1){
            openSnackbar('You need at least one field.', 'error');
            return;
        }

        // Dataset Name Validation
        if (datasetName.length < 3 || datasetName.length > 30) {
            openSnackbar('The dataset name must be between 3 and 30 characters long', 'error');
            return;
        } else if (!/^[a-z_]+$/.test(datasetName)) {
            openSnackbar('The dataset name can only contain lowercase letters (a-z) and the underscore _ character', 'error');
            return;
        }

        // Dataset Description Validation
        if (datasetDescription.length < 15 || datasetDescription.length > 200) {
            openSnackbar('The dataset description must be between 15 and 200 characters long', 'error');
            return;
        } else if (!/^[a-zA-Z\s-_.,()]+$/.test(datasetDescription)) {
            openSnackbar('The dataset description can only contain letters (a-z, A-Z), spaces, underscores, dashes, periods, commas and parentheses', 'error');
            return;
        }

        for(const field of datasetFields){
            // Field name validation
            if (field.name.length < 3 || field.name.length > 30) {
                openSnackbar('Every field name must be between 3 and 30 characters long', 'error');
                return;
            } else if (!/^[a-zA-Z_]+$/.test(field.name)) {
                openSnackbar('Every field name can only contain letters (a-z, A-Z) and the underscore _ character', 'error');
                return;
            }
    
            // Field description validation
            if (field.description.length < 15 || field.description.length > 200) {
                openSnackbar('Every field description must be between 15 and 200 characters long', 'error');
                return;
            } else if (!/^[a-zA-Z\s-_.,()]+$/.test(field.description)) {
                openSnackbar('Every field description can only contain letters (a-z, A-Z), spaces, underscores, dashes, periods, commas and parentheses', 'error');
                return;
            }

            // Field data type validation
            if (field.data_type.length < 2){
                openSnackbar('Every field must have a data type selected', 'error');
                return;
            }
        }

        const data = {
            workerId: user.id,
            name: datasetName,
            description: datasetDescription,
            fields: datasetFields,
            fieldsToDelete: fieldsToDelete,
        }

        // Its time to submit
        try {
            setIsSubmitting(true);
            const endpointUrl = editMode ? 'updateDataset' : 'createDataset';
            const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/${endpointUrl}`, data, { withCredentials: true });

            if(response.data.success === false){
                setIsSubmitting(false);
                openSnackbar(response.data.message, 'error');
            } else {
                setIsSubmitting(false);
                if(editMode){
                    openSnackbar('Dataset was updated successfully!')
                    setFieldsToDelete([]);
                } else {
                    getDatasets();
                    openSnackbar('Dataset was created successfully!')
                    openSection('datasets', 'datasetsList');
                }
            }
        } catch (error) {
          console.log(error);
          setIsSubmitting(false);
          openSnackbar('Error retrieving datasets', 'error');
        }

    }

    const addField = () => {

        if(datasetFields.length >= 8){
            openSnackbar('You can\'t add more than 8 fields', 'error');
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

    const deleteField = (id) => {
        let newDatasetFields = [...datasetFields].filter(field => field.id !== id);
        newDatasetFields = newDatasetFields.map((field, index) => {
            const newField = {...field};
            newField['id'] = index;
            return newField;
        })
        setDatasetFields(newDatasetFields)
        // if the field to be deleted has a databaseId, then add it to fieldsToBeDeleted
    }

    const handleDatasetNameChange = (e) => {
        const value = e.target.value;
        setDatasetName(value);
    }

    const handleDatasetDescriptionChange = (e) => {
        const value = e.target.value;
        setDatasetDescription(value);
    }

    const handleDatasetFieldChange = (e, id, field) => {
        const value = e.target.value;
        const newDatasetFields = [...datasetFields].map(datasetField => {
            if(datasetField.id === id){
                datasetField[field] = value;
            }
            return datasetField;
        })
        setDatasetFields(newDatasetFields);
    }

    useEffect(()=>{
        if(loadedDataset){
            setDatasetName(loadedDataset.name);
            setDatasetDescription(loadedDataset.description);

            const loadedFields = loadedDataset.fields.map((field, index) => {
                return {
                    id: index,
                    name: field.name,
                    description: field.description,
                    data_type: field.data_type,
                    databaseId: field.id, // The ones retrieved from DB
                }
            })

            setDatasetFields(loadedFields);
        }
    }, [])

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
                        <StyledTextField value={datasetName} onChange={handleDatasetNameChange} autoComplete='off' autoCorrect='off' spellCheck={false}/>
                    </div>
                    <div className="input-with-label">
                        <div className="label-with-info">
                            <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Dataset Description</Typography>
                            <Tippy content={<span style={{ fontFamily: 'Roboto' }}>How would you describe these objects?</span>} >
                                <InfoIcon tabIndex="-1" />
                            </Tippy>
                        </div>
                        <StyledTextField value={datasetDescription} onChange={handleDatasetDescriptionChange} sx={{ width: '500px !important' }} autoComplete='off' autoCorrect='off' spellCheck={false}/>
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
                                <StyledTextField 
                                value={ datasetFields.find(f => f.id === field.id).name }
                                onChange={(e)=>{ handleDatasetFieldChange(e, field.id, 'name') }}
                                sx={{ width: '130px !important' }} autoComplete='off' autoCorrect='off' spellCheck={false} />
                            </div>
                            <div className="input-with-label">
                                <div className="label-with-info">
                                    <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Field Description</Typography>
                                    <Tippy content={<span style={{ fontFamily: 'Roboto' }}>How would you describe this field?</span>} >
                                        <InfoIcon tabIndex="-1" />
                                    </Tippy>
                                </div>
                                <StyledTextField value={ datasetFields.find(f => f.id === field.id).description } onChange={(e)=>{ handleDatasetFieldChange(e, field.id, 'description') }}  sx={{ width: '350px !important' }} autoComplete='off' autoCorrect='off' spellCheck={false} />
                            </div>
                            <div className="input-with-label">
                                <div className="label-with-info">
                                    <Typography sx={{ fontFamily: 'Orbitron', marginBottom: '.1rem' }}>Data Type</Typography>
                                    <Tippy content={<span style={{ fontFamily: 'Roboto' }}>The data type of this field</span>} >
                                        <InfoIcon tabIndex="-1" />
                                    </Tippy>
                                </div>
                                <Select
                                    value={ datasetFields.find(f => f.id === field.id).data_type }
                                    onChange={(e)=>{ handleDatasetFieldChange(e, field.id, 'data_type') }}
                                    inputProps={{ style: { color: 'blue !important' } }}
                                    className="fields-dropdown"
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
                <Button variant="contained" className="default-button" onClick={() => { addField(); }}>
                    Add Field
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { handleSubmit(); }}>
                    { isSubmitting && (
                        <><CircularProgress size={24}/></>
                    ) }
                    { !isSubmitting && (
                        <>{editMode ? 'Update' : 'Submit'}</>
                    ) }
                </Button>
                <Button variant="contained" className="default-button" onClick={() => { openSection('datasets', 'datasetsList'); }}>
                    Back
                </Button>
            </div>
        </div>
    );
}

export default CreateDataset;