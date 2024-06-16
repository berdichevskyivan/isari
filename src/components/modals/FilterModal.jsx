import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Avatar } from '@mui/material';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HubIcon from '@mui/icons-material/Hub';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ArchitectureIcon from '@mui/icons-material/Architecture';

function FilterModal({ open, onClose, workerOptions, setWorkers, workers }) {

    const [selectedProgrammingLanguages, setSelectedProgrammingLanguages] = useState([]);
    const [selectedAItools, setSelectedAItools] = useState([]);
    const [selectedAIApplications, setSelectedAIApplications] = useState([]);
    const [selectedAIBranches, setSelectedAIBranches] = useState([]);
    const [allWorkers, setAllWorkers] = useState([]);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if(workers.length > 0 && !isLoaded){
            setAllWorkers(workers);
            setIsLoaded(true)
        }
    }, [workers]);

    const handleSelect = (item, setSelected, selected, category) => {
        let updatedSelected;
        if (selected.includes(item)) {
            updatedSelected = selected.filter(i => i !== item);
            setSelected(updatedSelected);
        } else if (selected.length < 4) {
            updatedSelected = [...selected, item];
            setSelected(updatedSelected);
        }

        if(updatedSelected){
            console.log('allWorkers is -> ', allWorkers)
            const filteredWorkers = allWorkers.filter(worker => {
                return (
                    (category === 'programmingLanguages' ? updatedSelected.length === 0 || updatedSelected.every(lang => worker.programming_languages.includes(lang)) : selectedProgrammingLanguages.length === 0 || selectedProgrammingLanguages.every(lang => worker.programming_languages.includes(lang))) &&
                    (category === 'aiTools' ? updatedSelected.length === 0 || updatedSelected.every(tool => worker.ai_tools.includes(tool)) : selectedAItools.length === 0 || selectedAItools.every(tool => worker.ai_tools.includes(tool))) &&
                    (category === 'aiApplications' ? updatedSelected.length === 0 || updatedSelected.every(app => worker.specialized_ai_applications.includes(app)) : selectedAIApplications.length === 0 || selectedAIApplications.every(app => worker.specialized_ai_applications.includes(app))) &&
                    (category === 'aiBranches' ? updatedSelected.length === 0 || updatedSelected.every(branch => worker.generalized_ai_branches.includes(branch)) : selectedAIBranches.length === 0 || selectedAIBranches.every(branch => worker.generalized_ai_branches.includes(branch)))
                );
            });
            
            console.log('filteredWorkers is -> ', filteredWorkers)
            setWorkers(filteredWorkers);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'fit-content', maxWidth: 'fit-content', bgcolor: 'black', boxShadow: 24, p: 4, border: '2px solid #00CCAA', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Programming Languages */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 2, ml: '.5rem' }}>
                    <DataArrayIcon sx={{ height: 30, width: 30, color: '#00CC00' }} />
                    {workerOptions.programming_languages.map(pl => (
                        <Tippy key={`programming_language_${pl.id}`} content={<span style={{ fontFamily: 'Orbitron' }}>{pl.name}</span>}>
                            <img
                                src={pl.icon_url}
                                alt="programming-language-logo"
                                width={30}
                                height={30}
                                className="category-icon"
                                onClick={() => handleSelect(pl.id, setSelectedProgrammingLanguages, selectedProgrammingLanguages, 'programmingLanguages')}
                                style={{ cursor: 'pointer', border: selectedProgrammingLanguages.includes(pl.id) ? '2px solid #00CC00' : 'none' }}
                            />
                        </Tippy>
                    ))}
                </Box>

                {/* Generalized AI Branches */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
                    <HubIcon sx={{ height: 30, width: 30, color: '#007FFF' }} />
                    {workerOptions.generalized_ai_branches.map(branch => (
                        <Tippy key={`generalized_ai_branch_${branch.id}`} content={<span style={{ fontFamily: 'Orbitron' }}>{branch.name}</span>}>
                            <Avatar
                                sx={{ bgcolor: 'blue', height: 30, width: 30 }}
                                className="category-icon"
                                onClick={() => handleSelect(branch.id, setSelectedAIBranches, selectedAIBranches, 'aiBranches')}
                                style={{ cursor: 'pointer', border: selectedAIBranches.includes(branch.id) ? '2px solid #007FFF' : 'none' }}
                            >
                                <span style={{ fontFamily: 'Orbitron', fontSize: '12px' }}>{branch.name[0]}</span>
                            </Avatar>
                        </Tippy>
                    ))}
                </Box>

                {/* Specialized AI Applications */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
                    <CenterFocusStrongIcon sx={{ height: 30, width: 30, color: '#7D26CD' }} />
                    {workerOptions.specialized_ai_applications.map(application => (
                        <Tippy key={`specialized_ai_application_${application.id}`} content={<span style={{ fontFamily: 'Orbitron' }}>{application.name}</span>}>
                            <img
                                src={application.icon_url}
                                alt="specialized-ai-application-logo"
                                width={30}
                                height={30}
                                className="category-icon"
                                onClick={() => handleSelect(application.id, setSelectedAIApplications, selectedAIApplications, 'aiApplications')}
                                style={{ cursor: 'pointer', border: selectedAIApplications.includes(application.id) ? '2px solid #7D26CD' : 'none' }}
                            />
                        </Tippy>
                    ))}
                </Box>

                {/* AI Tools */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
                    <ArchitectureIcon sx={{ height: 30, width: 30, color: '#FFD700' }} />
                    {workerOptions.ai_tools.map(tool => (
                        <Tippy key={`ai_tool_${tool.id}`} content={<span style={{ fontFamily: 'Orbitron' }}>{tool.name}</span>}>
                            <img
                                src={tool.icon_url}
                                alt="ai-tool-logo"
                                width={30}
                                height={30}
                                className="category-icon"
                                onClick={() => handleSelect(tool.id, setSelectedAItools, selectedAItools, 'aiTools')}
                                style={{ cursor: 'pointer', border: selectedAItools.includes(tool.id) ? '2px solid #FFD700' : 'none' }}
                            />
                        </Tippy>
                    ))}
                </Box>
            </Box>
        </Modal>
    );
}

export default FilterModal;