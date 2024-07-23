import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './WorkerDashboardPage.css'
import { Typography, Button } from '@mui/material';
import ControlsDashboard from '../../components/ControlsDashboard';
import StarrySky from '../../components/StarrySky';
import Loading from '../../components/Loading';
import axios from 'axios';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import { useNotification } from '../../context/NotificationContext';
import CustomCard from './components/CustomCard';
import WorkerFeed from './components/WorkerFeed';
import Datasets from './components/Datasets';
import Workflows from './components/Workflows';

const isProduction = import.meta.env.MODE === 'production';

function WorkerDashboardPage({ workerOptions }) {
  const { loggedInUser, setLoggedInUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { openSnackbar } = useNotification();
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [workerEmail, setWorkerEmail] = useState('');
  const [workerGithubUrl, setWorkerGithubUrl] = useState('');
  const [anonymize, setAnonymize] = useState(false); 
  const [workerUsageKeys, setWorkerUsageKeys] = useState([]);

  const [tabs, setTabs] = useState({
    profile: {
      open: true,
      sections: {},
    },
    datasets: {
      open: false,
      sections: {
        datasetsList: {
          open: true,
        },
        datasetViewer: {
            open: false,
        },
        createDataset: {
            open: false,
        },
      },
    },
    workflows: {
      open: false,
      sections: {},
    }
  });

  useEffect(() => {
    if (loggedInUser) {
      setSelectedLangs(loggedInUser.programming_languages || []);
      setSelectedBranches(loggedInUser.generalized_ai_branches || []);
      setSelectedApps(loggedInUser.specialized_ai_applications || []);
      setSelectedTools(loggedInUser.ai_tools || []);
      setWorkerEmail(loggedInUser.email || '');
      setWorkerGithubUrl(loggedInUser.github_url || '');
      setAnonymize(loggedInUser.anonymize || false)
      setWorkerUsageKeys(loggedInUser.usage_keys || []);

      setTimeout(()=>{
        if(!loggedInUser){
          navigate('/')
        }
      },5000)
    }
  }, [loggedInUser]);

  if (!workerOptions) {
    return <Loading />;
  }

  const handleSelect = (item, setSelected, selected) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < 4) {
      setSelected([...selected, item]);
    }
  };

  const handleUpdate = async () => {
    // Check if at least one item is selected in each category
    if (selectedLangs.length === 0) {
      openSnackbar('Please select at least one programming language.', 'error');
      return;
    }

    if (selectedBranches.length === 0) {
      openSnackbar('Please select at least one AI branch.', 'error');
      return;
    }

    if (selectedApps.length === 0) {
      openSnackbar('Please select at least one AI specialty.', 'error');
      return;
    }

    if (selectedTools.length === 0) {
      openSnackbar('Please select at least one AI tool.', 'error');
      return;
    }

    if (workerEmail.length === 0 || (workerEmail.length > 0 && !workerEmail.includes('@'))) {
      openSnackbar('Your Email Address is Invalid', 'error');
      return;
    }

    if (workerGithubUrl.length > 0 && !workerGithubUrl.includes('github')) {
      openSnackbar('Your Github URL is Invalid', 'error');
      return;
    }

    const cleansedGithubUrl = workerGithubUrl.length === 0 ? '' : 'github' + workerGithubUrl.split('github')[1];

    try {
      const formData = new FormData();
      formData.append('workerId', loggedInUser.id);
      formData.append('programmingLanguagesIds', JSON.stringify(selectedLangs));
      formData.append('generalizedAiBranches', JSON.stringify(selectedBranches));
      formData.append('specializedAiApplicationsIds', JSON.stringify(selectedApps));
      formData.append('aiToolsIds', JSON.stringify(selectedTools));
      formData.append('workerEmail', workerEmail);
      formData.append('workerGithubUrl', cleansedGithubUrl);
      formData.append('anonymize', anonymize);

      // Send data to the backend for updating the worker profile
      const updateResponse = await axios.post(`${isProduction ? '' : 'http://localhost'}/updateWorker`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (updateResponse.data.success) {
          openSnackbar('Worker profile updated successfully!', 'success');
          setLoggedInUser(updateResponse.data.updatedUser);
      } else {
          openSnackbar('Worker profile update failed. Please check your data.', 'error');
      }
    } catch (error) {
      console.error('Error updating worker profile:', error);
      openSnackbar('Failed to update worker profile.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${isProduction ? '' : 'http://localhost'}/deleteWorker/${loggedInUser.id}`, {
        data: { name: loggedInUser.name },
        withCredentials: true
      });
      if (response.data.success) {
        openSnackbar('Account deleted successfully!', 'success');
        // Handle user logout or redirection after deletion
        setTimeout(()=>{ 
          logout();
          navigate('/');
        },1000);
      } else {
        openSnackbar('Failed to delete account.', 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      openSnackbar('Failed to delete account.', 'error');
    }
  };

  const openTab = (tabName) => {
    const newTabs = {...tabs};
    for(const tab in newTabs){
      newTabs[tab].open = tab === tabName ? true : false;
    }
    setTabs(newTabs);
  }

  const openSection = (tabName, sectionName) => {
    const newTabs = {...tabs}
    for(const tab in newTabs){
      for(const section in newTabs[tab].sections){
        if(tab === tabName && section === sectionName){
          newTabs[tab].sections[section].open = true;
        } else {
          newTabs[tab].sections[section].open = false;
        }
      }
    }
    setTabs(newTabs);
  }

  return (
    <div className="worker-dashboard-container">
      <StarrySky />
      <div className="dashboard-container">
        
        <div className="header-buttons-container">
          <Button variant="contained" className={`${tabs.profile.open ? 'header-button-open' : 'header-button'}`} onClick={() => { openTab('profile') }}>
            Profile
          </Button>
          <Button variant="contained" className={`${tabs.datasets.open ? 'header-button-open' : 'header-button'}`} onClick={() => { openTab('datasets') }}>
            Datasets
          </Button>
          <Button variant="contained" className={`${tabs.workflows.open ? 'header-button-open' : 'header-button'}`} onClick={() => { openTab('workflows') }}>
            Workflows
          </Button>
        </div>

        { tabs.profile.open && (
          <div className="profile-container no-scrollbar">
            
            <div className="worker-dashboard-header">
              {loggedInUser && (
                <CustomCard
                  worker={loggedInUser}
                  workerOptions={workerOptions}
                  workerEmail={workerEmail}
                  workerGithubUrl={workerGithubUrl}
                  anonymize={anonymize}
                  setWorkerEmail={setWorkerEmail}
                  setWorkerGithubUrl={setWorkerGithubUrl}
                  setAnonymize={setAnonymize}
                />
              )}
              <WorkerFeed
                  workerOptions={workerOptions}
                  handleSelect={handleSelect}
                  selectedLangs={selectedLangs}
                  setSelectedLangs={setSelectedLangs}
                  selectedBranches={selectedBranches}
                  setSelectedBranches={setSelectedBranches}
                  selectedApps={selectedApps}
                  setSelectedApps={setSelectedApps}
                  selectedTools={selectedTools}
                  setSelectedTools={setSelectedTools}
              />
            </div>

            <div style={{ display: 'flex', flexFlow: 'row', marginTop: '1.5rem', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', color: 'white', border: '1px solid blue', marginRight: '1.5rem' }} onClick={handleUpdate}>
                Update
              </Button>
              <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'red', color: 'white' }} onClick={() => setIsDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </div>
            <div style={{ display: 'flex', flexFlow: 'column', marginTop: '1.5rem', justifyContent: 'center', width: '100%' }}>
              <Typography sx={{textAlign: 'center', fontFamily: 'Orbitron, Roboton, sans-serif', color: 'turquoise', fontWeight: 'bold'}}>Usage Keys</Typography>
              <div className="usage-keys-container no-scrollbar">
                { workerUsageKeys.length > 0 && (
                  <>
                    { workerUsageKeys.map((usageKey) => (
                      <p key={usageKey.key}>{usageKey.key}</p>
                    )) }
                  </>
                ) }
              </div>
            </div>

          </div>
        ) }

        { tabs.datasets.open && (
          <Datasets user={loggedInUser} tabs={tabs} openSection={openSection}/>
        ) }

        { tabs.workflows.open && (
          <Workflows user={loggedInUser} tabs={tabs} openSection={openSection}/>
        ) }



      </div>

      <ControlsDashboard />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default WorkerDashboardPage;
