import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Add, 
  Edit, 
  Delete, 
  AccessTime 
} from '@mui/icons-material';
import { formatDistanceToNow } from '../utils/dateUtils';

const TimerPage = ({ clients, timeEntries, onAddTimeEntry, onUpdateTimeEntry, onDeleteTimeEntry }) => {
  // State for timer
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  
  // State for manual time entry dialog
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('10:00');
  const [manualClient, setManualClient] = useState('');
  const [manualProject, setManualProject] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualBillable, setManualBillable] = useState(true);
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Ref for timer interval
  const timerInterval = useRef(null);
  
  // Filter today's time entries
  const todayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    const today = new Date();
    return entryDate.getDate() === today.getDate() &&
           entryDate.getMonth() === today.getMonth() &&
           entryDate.getFullYear() === today.getFullYear();
  });
  
  // Calculate total time for today
  const totalTimeToday = todayEntries.reduce((total, entry) => total + entry.duration, 0);
  
  // Listen for start timer events from main process
  useEffect(() => {
    if (window.api) {
      window.api.onStartTimer(() => {
        if (!isRunning) {
          startTimer();
        }
      });
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRunning, selectedClient, selectedProject]);
  
  // Update elapsed time when timer is running
  useEffect(() => {
    if (isRunning && startTime) {
      timerInterval.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRunning, startTime]);
  
  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Format minutes as HH:MM
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };
  
  // Start the timer
  const startTimer = () => {
    if (!selectedClient) {
      alert('Please select a client before starting the timer');
      return;
    }
    
    if (!selectedProject) {
      alert('Please select a project before starting the timer');
      return;
    }
    
    setStartTime(Date.now());
    setIsRunning(true);
    setElapsedTime(0);
  };
  
  // Stop the timer and save the time entry
  const stopTimer = async () => {
    if (!isRunning) return;
    
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 60000); // Convert to minutes
    
    const timeEntry = {
      clientId: selectedClient,
      project: selectedProject,
      description,
      startTime,
      endTime,
      duration,
      billable: isBillable
    };
    
    await onAddTimeEntry(timeEntry);
    
    // Reset timer
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setDescription('');
  };
  
  // Open manual time entry dialog
  const openManualDialog = () => {
    setManualDialogOpen(true);
  };
  
  // Close manual time entry dialog
  const closeManualDialog = () => {
    setManualDialogOpen(false);
  };
  
  // Save manual time entry
  const saveManualEntry = async () => {
    // Validate inputs
    if (!manualClient || !manualProject || !manualDate || !manualStartTime || !manualEndTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Parse date and times
    const [year, month, day] = manualDate.split('-').map(Number);
    const [startHour, startMinute] = manualStartTime.split(':').map(Number);
    const [endHour, endMinute] = manualEndTime.split(':').map(Number);
    
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    
    // Calculate duration in minutes
    const durationMs = endDateTime - startDateTime;
    if (durationMs <= 0) {
      alert('End time must be after start time');
      return;
    }
    
    const duration = Math.floor(durationMs / 60000); // Convert to minutes
    
    const timeEntry = {
      clientId: manualClient,
      project: manualProject,
      description: manualDescription,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration,
      billable: manualBillable
    };
    
    await onAddTimeEntry(timeEntry);
    
    // Reset and close dialog
    setManualClient('');
    setManualProject('');
    setManualDescription('');
    setManualBillable(true);
    closeManualDialog();
  };
  
  // Open edit dialog
  const openEditDialog = (entry) => {
    setEditingEntry(entry);
    
    // Convert timestamps to date and time strings
    const startDate = new Date(entry.startTime);
    const endDate = new Date(entry.endTime);
    
    const date = startDate.toISOString().split('T')[0];
    const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    setManualDate(date);
    setManualStartTime(startTime);
    setManualEndTime(endTime);
    setManualClient(entry.clientId);
    setManualProject(entry.project);
    setManualDescription(entry.description || '');
    setManualBillable(entry.billable);
    
    setEditDialogOpen(true);
  };
  
  // Close edit dialog
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingEntry(null);
  };
  
  // Save edited time entry
  const saveEditedEntry = async () => {
    if (!editingEntry) return;
    
    // Validate inputs
    if (!manualClient || !manualProject || !manualDate || !manualStartTime || !manualEndTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Parse date and times
    const [year, month, day] = manualDate.split('-').map(Number);
    const [startHour, startMinute] = manualStartTime.split(':').map(Number);
    const [endHour, endMinute] = manualEndTime.split(':').map(Number);
    
    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);
    
    // Calculate duration in minutes
    const durationMs = endDateTime - startDateTime;
    if (durationMs <= 0) {
      alert('End time must be after start time');
      return;
    }
    
    const duration = Math.floor(durationMs / 60000); // Convert to minutes
    
    const updatedEntry = {
      ...editingEntry,
      clientId: manualClient,
      project: manualProject,
      description: manualDescription,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration,
      billable: manualBillable
    };
    
    await onUpdateTimeEntry(updatedEntry);
    
    closeEditDialog();
  };
  
  // Delete time entry
  const deleteTimeEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      await onDeleteTimeEntry(entryId);
    }
  };
  
  // Get client name by ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  // Get projects for selected client
  const getClientProjects = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.projects : [];
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Time Tracker</Typography>
      
      {/* Timer Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="client-select-label">Client *</InputLabel>
                <Select
                  labelId="client-select-label"
                  value={selectedClient}
                  label="Client *"
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    setSelectedProject('');
                  }}
                  disabled={isRunning}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="project-select-label">Project Type *</InputLabel>
                <Select
                  labelId="project-select-label"
                  value={selectedProject}
                  label="Project Type *"
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={!selectedClient || isRunning}
                >
                  {getClientProjects(selectedClient).map((project) => (
                    <MenuItem key={project} value={project}>{project}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isRunning}
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isBillable}
                    onChange={(e) => setIsBillable(e.target.checked)}
                    disabled={isRunning}
                  />
                }
                label="Billable"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="h3" sx={{ mb: 2, fontFamily: 'monospace' }}>
                {formatElapsedTime(elapsedTime)}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {!isRunning ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrow />}
                    onClick={startTimer}
                    disabled={!selectedClient || !selectedProject}
                  >
                    Start Timer
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Stop />}
                    onClick={stopTimer}
                  >
                    Stop Timer
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={openManualDialog}
                  disabled={isRunning}
                >
                  Add Time
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Today's Time Entries */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Today's Time Entries</Typography>
          <Typography variant="h6">
            Total: {formatMinutes(totalTimeToday)}
          </Typography>
        </Box>
        
        {todayEntries.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No time entries for today
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {todayEntries.map((entry) => (
              <Grid item xs={12} sm={6} md={4} key={entry.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {getClientName(entry.clientId)}
                    </Typography>
                    <Typography variant="subtitle1" color="primary">
                      {entry.project}
                    </Typography>
                    {entry.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {entry.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatMinutes(entry.duration)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton size="small" onClick={() => openEditDialog(entry)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteTimeEntry(entry.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Manual Time Entry Dialog */}
      <Dialog open={manualDialogOpen} onClose={closeManualDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Time Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="manual-client-label">Client *</InputLabel>
                <Select
                  labelId="manual-client-label"
                  value={manualClient}
                  label="Client *"
                  onChange={(e) => {
                    setManualClient(e.target.value);
                    setManualProject('');
                  }}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="manual-project-label">Project Type *</InputLabel>
                <Select
                  labelId="manual-project-label"
                  value={manualProject}
                  label="Project Type *"
                  onChange={(e) => setManualProject(e.target.value)}
                  disabled={!manualClient}
                >
                  {getClientProjects(manualClient).map((project) => (
                    <MenuItem key={project} value={project}>{project}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={manualStartTime}
                onChange={(e) => setManualStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={manualEndTime}
                onChange={(e) => setManualEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={manualBillable}
                    onChange={(e) => setManualBillable(e.target.checked)}
                  />
                }
                label="Billable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManualDialog}>Cancel</Button>
          <Button onClick={saveManualEntry} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Time Entry Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Time Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="edit-client-label">Client *</InputLabel>
                <Select
                  labelId="edit-client-label"
                  value={manualClient}
                  label="Client *"
                  onChange={(e) => {
                    setManualClient(e.target.value);
                    setManualProject('');
                  }}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="edit-project-label">Project Type *</InputLabel>
                <Select
                  labelId="edit-project-label"
                  value={manualProject}
                  label="Project Type *"
                  onChange={(e) => setManualProject(e.target.value)}
                  disabled={!manualClient}
                >
                  {getClientProjects(manualClient).map((project) => (
                    <MenuItem key={project} value={project}>{project}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={manualStartTime}
                onChange={(e) => setManualStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={manualEndTime}
                onChange={(e) => setManualEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={manualBillable}
                    onChange={(e) => setManualBillable(e.target.checked)}
                  />
                }
                label="Billable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={saveEditedEntry} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimerPage;