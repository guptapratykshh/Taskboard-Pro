import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { projectsAPI, tasksAPI } from '../services/api';

// This would be a more complete implementation in a real app
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [value, setValue] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    }
  }, [projectId]);
  
  const fetchProjectData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project details
      const projectResponse = await projectsAPI.getProject(id);
      setProject(projectResponse.data);
      
      // Fetch project tasks
      const tasksResponse = await tasksAPI.getProjectTasks(id);
      setTasks(tasksResponse.data);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching project data:', err);
      setError('Failed to load project data. Please try again.');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  
  // Placeholder for task board - in a real app, this would use react-beautiful-dnd
  const renderTaskBoard = () => {
    if (!project || !project.statuses) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No statuses defined for this project
          </Typography>
        </Box>
      );
    }
    
    // Group tasks by status
    const tasksByStatus: Record<string, any[]> = {};
    project.statuses.forEach((status: any) => {
      tasksByStatus[status.name] = tasks.filter(task => task.status === status.name);
    });
    
    return (
      <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
        {project.statuses.map((status: any) => (
          <Paper
            key={status.name}
            sx={{
              minWidth: 280,
              maxWidth: 280,
              mr: 2,
              height: 'fit-content',
              backgroundColor: '#f5f5f5'
            }}
            elevation={1}
          >
            <Box
              sx={{
                p: 2,
                backgroundColor: status.color || '#3498db',
                color: 'white',
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {status.name}
              </Typography>
              <Chip 
                label={tasksByStatus[status.name]?.length || 0} 
                size="small" 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} 
              />
            </Box>
            <Box sx={{ p: 1 }}>
              {tasksByStatus[status.name]?.length > 0 ? (
                tasksByStatus[status.name].map(task => (
                  <Paper
                    key={task._id}
                    sx={{
                      p: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 }
                    }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No tasks
                  </Typography>
                </Box>
              )}
              <Button
                startIcon={<AddIcon />}
                size="small"
                sx={{ mt: 1, width: '100%' }}
                onClick={() => {
                  // This would open a dialog to create a new task
                  console.log(`Add task to ${status.name}`);
                }}
              >
                Add Task
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };
  
  if (loading) {
    return (
      <MainLayout title="Project">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout title="Project">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </MainLayout>
    );
  }
  
  if (!project) {
    return (
      <MainLayout title="Project Not Found">
        <Alert severity="warning">
          Project not found or you don't have access to it.
        </Alert>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={project.title}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {project.title}
        </Typography>
        {project.description && (
          <Typography variant="body1" color="text.secondary">
            {project.description}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="project tabs">
          <Tab label="Tasks" {...a11yProps(0)} />
          <Tab label="Members" icon={<PeopleIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Automations" icon={<AutoAwesomeIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        {renderTaskBoard()}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography>Project members will be displayed here</Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Typography>Automations will be configured here</Typography>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Typography>Project settings will be managed here</Typography>
      </TabPanel>
    </MainLayout>
  );
};

export default ProjectDetails; 