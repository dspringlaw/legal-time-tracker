import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

// Import pages
import TimerPage from './pages/TimerPage';
import ClientsPage from './pages/ClientsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E3B55', // Dark blue
    },
    secondary: {
      main: '#4CAF50', // Green
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h1: {
      fontSize: '2.2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if we're running in Electron
        if (window.api) {
          const clientsData = await window.api.getClients();
          const timeEntriesData = await window.api.getTimeEntries();
          
          setClients(clientsData);
          setTimeEntries(timeEntriesData);
        } else {
          // For development in browser without Electron
          console.log('Running in browser mode with mock data');
          // Load mock data
          setClients([
            { id: '1', name: 'Smith & Associates', projects: ['Bankruptcy', 'Contract Review'] },
            { id: '2', name: 'Johnson Family', projects: ['Divorce', 'Child Custody'] },
          ]);
          setTimeEntries([
            { 
              id: '1', 
              clientId: '1', 
              project: 'Bankruptcy', 
              description: 'Initial consultation', 
              startTime: new Date(2023, 4, 1, 9, 0).getTime(),
              endTime: new Date(2023, 4, 1, 10, 30).getTime(),
              duration: 90, // minutes
              billable: true
            },
            { 
              id: '2', 
              clientId: '2', 
              project: 'Divorce', 
              description: 'Document preparation', 
              startTime: new Date(2023, 4, 2, 13, 0).getTime(),
              endTime: new Date(2023, 4, 2, 15, 0).getTime(),
              duration: 120, // minutes
              billable: true
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Add client
  const handleAddClient = async (client) => {
    try {
      if (window.api) {
        const newClient = await window.api.addClient(client);
        setClients([...clients, newClient]);
        return newClient;
      } else {
        // Mock for browser development
        const newClient = { ...client, id: Date.now().toString() };
        setClients([...clients, newClient]);
        return newClient;
      }
    } catch (error) {
      console.error('Error adding client:', error);
      return null;
    }
  };

  // Update client
  const handleUpdateClient = async (client) => {
    try {
      if (window.api) {
        const updatedClient = await window.api.updateClient(client);
        if (updatedClient) {
          setClients(clients.map(c => c.id === client.id ? updatedClient : c));
        }
        return updatedClient;
      } else {
        // Mock for browser development
        setClients(clients.map(c => c.id === client.id ? client : c));
        return client;
      }
    } catch (error) {
      console.error('Error updating client:', error);
      return null;
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    try {
      if (window.api) {
        await window.api.deleteClient(clientId);
        setClients(clients.filter(c => c.id !== clientId));
        // Also filter out time entries for this client
        setTimeEntries(timeEntries.filter(entry => entry.clientId !== clientId));
      } else {
        // Mock for browser development
        setClients(clients.filter(c => c.id !== clientId));
        setTimeEntries(timeEntries.filter(entry => entry.clientId !== clientId));
      }
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  };

  // Add time entry
  const handleAddTimeEntry = async (entry) => {
    try {
      if (window.api) {
        const newEntry = await window.api.addTimeEntry(entry);
        setTimeEntries([...timeEntries, newEntry]);
        return newEntry;
      } else {
        // Mock for browser development
        const newEntry = { ...entry, id: Date.now().toString() };
        setTimeEntries([...timeEntries, newEntry]);
        return newEntry;
      }
    } catch (error) {
      console.error('Error adding time entry:', error);
      return null;
    }
  };

  // Update time entry
  const handleUpdateTimeEntry = async (entry) => {
    try {
      if (window.api) {
        const updatedEntry = await window.api.updateTimeEntry(entry);
        if (updatedEntry) {
          setTimeEntries(timeEntries.map(e => e.id === entry.id ? updatedEntry : e));
        }
        return updatedEntry;
      } else {
        // Mock for browser development
        setTimeEntries(timeEntries.map(e => e.id === entry.id ? entry : e));
        return entry;
      }
    } catch (error) {
      console.error('Error updating time entry:', error);
      return null;
    }
  };

  // Delete time entry
  const handleDeleteTimeEntry = async (entryId) => {
    try {
      if (window.api) {
        await window.api.deleteTimeEntry(entryId);
        setTimeEntries(timeEntries.filter(e => e.id !== entryId));
      } else {
        // Mock for browser development
        setTimeEntries(timeEntries.filter(e => e.id !== entryId));
      }
      return true;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      return false;
    }
  };

  // Create desktop shortcut
  const createDesktopShortcut = async () => {
    try {
      if (window.api) {
        await window.api.createDesktopShortcut();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating desktop shortcut:', error);
      return false;
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <TimerPage 
            clients={clients}
            timeEntries={timeEntries}
            onAddTimeEntry={handleAddTimeEntry}
            onUpdateTimeEntry={handleUpdateTimeEntry}
            onDeleteTimeEntry={handleDeleteTimeEntry}
          />
        );
      case 1:
        return (
          <ClientsPage 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 2:
        return (
          <ReportsPage 
            clients={clients}
            timeEntries={timeEntries}
          />
        );
      case 3:
        return (
          <SettingsPage 
            createDesktopShortcut={createDesktopShortcut}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h5">Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Legal Time Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="application tabs"
              centered
            >
              <Tab icon={<TimerIcon />} label="Timer" />
              <Tab icon={<PeopleIcon />} label="Clients" />
              <Tab icon={<AssessmentIcon />} label="Reports" />
              <Tab icon={<SettingsIcon />} label="Settings" />
            </Tabs>
          </Box>
          
          {renderTabContent()}
        </Container>
        
        <Box component="footer" sx={{ py: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Legal Time Tracker &copy; {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;