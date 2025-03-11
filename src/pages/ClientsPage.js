import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  Person
} from '@mui/icons-material';

const ClientsPage = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  // State for client dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientType, setClientType] = useState('business'); // 'business' or 'individual'
  const [projectInput, setProjectInput] = useState('');
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  
  // Open dialog to add a new client
  const openAddDialog = () => {
    setIsEditing(false);
    setCurrentClient(null);
    setClientName('');
    setClientType('business');
    setProjects([]);
    setProjectInput('');
    setError('');
    setDialogOpen(true);
  };
  
  // Open dialog to edit an existing client
  const openEditDialog = (client) => {
    setIsEditing(true);
    setCurrentClient(client);
    setClientName(client.name);
    setClientType(client.type || 'business');
    setProjects(client.projects || []);
    setProjectInput('');
    setError('');
    setDialogOpen(true);
  };
  
  // Close the dialog
  const closeDialog = () => {
    setDialogOpen(false);
  };
  
  // Add a project to the list
  const addProject = () => {
    if (!projectInput.trim()) {
      return;
    }
    
    if (projects.includes(projectInput.trim())) {
      setError('Project type already exists');
      return;
    }
    
    setProjects([...projects, projectInput.trim()]);
    setProjectInput('');
    setError('');
  };
  
  // Remove a project from the list
  const removeProject = (projectToRemove) => {
    setProjects(projects.filter(project => project !== projectToRemove));
  };
  
  // Handle key press in project input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProject();
    }
  };
  
  // Save client
  const saveClient = async () => {
    if (!clientName.trim()) {
      setError('Client name is required');
      return;
    }
    
    if (projects.length === 0) {
      setError('At least one project type is required');
      return;
    }
    
    const clientData = {
      name: clientName.trim(),
      type: clientType,
      projects
    };
    
    if (isEditing && currentClient) {
      // Update existing client
      const updatedClient = {
        ...currentClient,
        ...clientData
      };
      
      await onUpdateClient(updatedClient);
    } else {
      // Add new client
      await onAddClient(clientData);
    }
    
    closeDialog();
  };
  
  // Delete client
  const deleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? All time entries for this client will also be deleted.')) {
      await onDeleteClient(clientId);
    }
  };
  
  // Group clients by type
  const businessClients = clients.filter(client => client.type !== 'individual');
  const individualClients = clients.filter(client => client.type === 'individual');
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={openAddDialog}
        >
          Add Client
        </Button>
      </Box>
      
      {clients.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No clients yet
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Add your first client to start tracking time
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Add />}
            onClick={openAddDialog}
          >
            Add Client
          </Button>
        </Paper>
      ) : (
        <Box>
          {/* Business Clients */}
          {businessClients.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Business sx={{ mr: 1 }} /> Business Clients
              </Typography>
              <Grid container spacing={2}>
                {businessClients.map(client => (
                  <Grid item xs={12} sm={6} md={4} key={client.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {client.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Project Types:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {client.projects && client.projects.map(project => (
                            <Chip
                              key={project}
                              label={project}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <IconButton size="small" onClick={() => openEditDialog(client)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteClient(client.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Individual Clients */}
          {individualClients.length > 0 && (
            <Box>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1 }} /> Individual Clients
              </Typography>
              <Grid container spacing={2}>
                {individualClients.map(client => (
                  <Grid item xs={12} sm={6} md={4} key={client.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {client.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Project Types:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {client.projects && client.projects.map(project => (
                            <Chip
                              key={project}
                              label={project}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <IconButton size="small" onClick={() => openEditDialog(client)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteClient(client.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}
      
      {/* Client Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            fullWidth
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Client Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={clientType === 'business' ? 'contained' : 'outlined'}
                startIcon={<Business />}
                onClick={() => setClientType('business')}
              >
                Business
              </Button>
              <Button
                variant={clientType === 'individual' ? 'contained' : 'outlined'}
                startIcon={<Person />}
                onClick={() => setClientType('individual')}
              >
                Individual
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Project Types
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              label="Add Project Type"
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addProject}
              sx={{ ml: 1 }}
            >
              Add
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {projects.map(project => (
              <Chip
                key={project}
                label={project}
                onDelete={() => removeProject(project)}
                color="primary"
              />
            ))}
          </Box>
          
          {projects.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Add at least one project type
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={saveClient} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsPage;