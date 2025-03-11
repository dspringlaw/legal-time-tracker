import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import {
  Settings,
  Shortcut,
  Info,
  Storage,
  Backup,
  GetApp,
  Delete
} from '@mui/icons-material';

const SettingsPage = ({ createDesktopShortcut }) => {
  // State for settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Handle desktop shortcut creation
  const handleCreateShortcut = async () => {
    try {
      // Check if we're running in Electron
      if (window.api) {
        const success = await createDesktopShortcut();
        
        if (success) {
          showSnackbar('Desktop shortcut created successfully', 'success');
        } else {
          showSnackbar('Failed to create desktop shortcut', 'error');
        }
      } else {
        // For development in browser
        showSnackbar('Desktop shortcut creation is only available in the desktop app', 'info');
      }
    } catch (error) {
      console.error('Error creating shortcut:', error);
      showSnackbar('Error creating desktop shortcut', 'error');
    }
  };
  
  // Handle data export
  const handleExportData = () => {
    // This would be implemented to export all data as JSON
    showSnackbar('Data export feature will be available in the next version', 'info');
  };
  
  // Handle data import
  const handleImportData = () => {
    // This would be implemented to import data from JSON
    showSnackbar('Data import feature will be available in the next version', 'info');
  };
  
  // Handle data reset
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      // This would be implemented to reset all data
      showSnackbar('Data reset feature will be available in the next version', 'info');
    }
  };
  
  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      {/* Application Settings */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText 
              primary="Application Settings" 
              secondary="Configure application behavior"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Dark Mode" 
              secondary="Use dark theme for the application"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={darkMode}
                onChange={(e) => {
                  setDarkMode(e.target.checked);
                  showSnackbar('Dark mode will be available in the next version', 'info');
                }}
                disabled={true}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Desktop Notifications" 
              secondary="Show notifications for timer events"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Start with Windows" 
              secondary="Launch application when Windows starts"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={autoStart}
                onChange={(e) => {
                  setAutoStart(e.target.checked);
                  showSnackbar('Auto-start feature will be available in the next version', 'info');
                }}
                disabled={true}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      {/* Desktop Integration */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Shortcut />
            </ListItemIcon>
            <ListItemText 
              primary="Desktop Integration" 
              secondary="Configure desktop integration options"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Create Desktop Shortcut" 
              secondary="Create a shortcut on your desktop for quick access"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCreateShortcut}
                size="small"
              >
                Create
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      {/* Data Management */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Storage />
            </ListItemIcon>
            <ListItemText 
              primary="Data Management" 
              secondary="Manage your time tracking data"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText 
              primary="Export Data" 
              secondary="Export all your data as a JSON file"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<GetApp />}
                onClick={handleExportData}
                size="small"
              >
                Export
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Import Data" 
              secondary="Import data from a JSON file"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Backup />}
                onClick={handleImportData}
                size="small"
              >
                Import
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="Reset Data" 
              secondary="Delete all data and start fresh (cannot be undone)"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleResetData}
                size="small"
              >
                Reset
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      {/* About */}
      <Paper elevation={3}>
        <List>
          <ListItem>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText 
              primary="About" 
              secondary="Application information"
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Legal Time Tracker
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Version 1.0.0
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2">
                  A time tracking application designed specifically for legal professionals.
                  Track time by client and project, generate reports, and manage your billable hours efficiently.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  &copy; {new Date().getFullYear()} Legal Time Tracker
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        </List>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;