import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  FilterList,
  GetApp
} from '@mui/icons-material';
import { formatDate, formatDuration } from '../utils/dateUtils';

const ReportsPage = ({ clients, timeEntries }) => {
  // State for filters
  const [clientFilter, setClientFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // State for filtered entries
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [clientTotals, setClientTotals] = useState([]);
  const [projectTotals, setProjectTotals] = useState([]);
  
  // Initialize date range
  useEffect(() => {
    const now = new Date();
    
    // Set default date range to current week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + (6 - now.getDay())); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);
    
    setStartDate(weekStart.toISOString().split('T')[0]);
    setEndDate(weekEnd.toISOString().split('T')[0]);
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [clientFilter, projectFilter, dateRangeFilter, startDate, endDate, timeEntries]);
  
  // Handle date range filter change
  const handleDateRangeChange = (range) => {
    setDateRangeFilter(range);
    
    const now = new Date();
    let start, end;
    
    switch (range) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setDate(now.getDate() + (6 - now.getDay())); // End of week (Saturday)
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'year':
        start = new Date(now.getFullYear(), 0, 1); // Start of year
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31); // End of year
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'custom':
        // Keep existing custom dates
        return;
        
      default:
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };
  
  // Apply filters to time entries
  const applyFilters = () => {
    if (!timeEntries.length) {
      setFilteredEntries([]);
      setTotalHours(0);
      setClientTotals([]);
      setProjectTotals([]);
      return;
    }
    
    // Parse date range
    const startDateTime = startDate ? new Date(startDate) : new Date(0);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = endDate ? new Date(endDate) : new Date();
    endDateTime.setHours(23, 59, 59, 999);
    
    // Filter entries
    let filtered = timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      
      // Date range filter
      const isInDateRange = entryDate >= startDateTime && entryDate <= endDateTime;
      
      // Client filter
      const isClientMatch = clientFilter === 'all' || entry.clientId === clientFilter;
      
      // Project filter
      const isProjectMatch = projectFilter === 'all' || entry.project === projectFilter;
      
      return isInDateRange && isClientMatch && isProjectMatch;
    });
    
    // Sort by date (newest first)
    filtered.sort((a, b) => b.startTime - a.startTime);
    
    setFilteredEntries(filtered);
    
    // Calculate total hours
    const totalMinutes = filtered.reduce((total, entry) => total + entry.duration, 0);
    setTotalHours(totalMinutes / 60);
    
    // Calculate client totals
    const clientMap = new Map();
    filtered.forEach(entry => {
      const clientId = entry.clientId;
      const duration = entry.duration;
      
      if (clientMap.has(clientId)) {
        clientMap.set(clientId, clientMap.get(clientId) + duration);
      } else {
        clientMap.set(clientId, duration);
      }
    });
    
    const clientTotalsArray = Array.from(clientMap.entries()).map(([clientId, duration]) => ({
      clientId,
      clientName: getClientName(clientId),
      duration
    }));
    
    // Sort by duration (highest first)
    clientTotalsArray.sort((a, b) => b.duration - a.duration);
    
    setClientTotals(clientTotalsArray);
    
    // Calculate project totals
    const projectMap = new Map();
    filtered.forEach(entry => {
      const project = entry.project;
      const duration = entry.duration;
      
      if (projectMap.has(project)) {
        projectMap.set(project, projectMap.get(project) + duration);
      } else {
        projectMap.set(project, duration);
      }
    });
    
    const projectTotalsArray = Array.from(projectMap.entries()).map(([project, duration]) => ({
      project,
      duration
    }));
    
    // Sort by duration (highest first)
    projectTotalsArray.sort((a, b) => b.duration - a.duration);
    
    setProjectTotals(projectTotalsArray);
  };
  
  // Get client name by ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  // Get all projects from all clients
  const getAllProjects = () => {
    const projects = new Set();
    clients.forEach(client => {
      if (client.projects) {
        client.projects.forEach(project => projects.add(project));
      }
    });
    return Array.from(projects);
  };
  
  // Get projects for selected client
  const getClientProjects = (clientId) => {
    if (clientId === 'all') {
      return getAllProjects();
    }
    
    const client = clients.find(c => c.id === clientId);
    return client ? client.projects : [];
  };
  
  // Export report as CSV
  const exportCSV = () => {
    if (filteredEntries.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Create CSV header
    const header = ['Date', 'Client', 'Project', 'Description', 'Start Time', 'End Time', 'Duration (min)', 'Billable'];
    
    // Create CSV rows
    const rows = filteredEntries.map(entry => [
      formatDate(entry.startTime),
      getClientName(entry.clientId),
      entry.project,
      entry.description || '',
      new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      entry.duration,
      entry.billable ? 'Yes' : 'No'
    ]);
    
    // Combine header and rows
    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `time-report-${startDate}-to-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      
      {/* Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} /> Filters
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="client-filter-label">Client</InputLabel>
              <Select
                labelId="client-filter-label"
                value={clientFilter}
                label="Client"
                onChange={(e) => {
                  setClientFilter(e.target.value);
                  setProjectFilter('all');
                }}
              >
                <MenuItem value="all">All Clients</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="project-filter-label">Project Type</InputLabel>
              <Select
                labelId="project-filter-label"
                value={projectFilter}
                label="Project Type"
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {getClientProjects(clientFilter).map((project) => (
                  <MenuItem key={project} value={project}>{project}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="date-range-filter-label">Date Range</InputLabel>
              <Select
                labelId="date-range-filter-label"
                value={dateRangeFilter}
                label="Date Range"
                onChange={(e) => handleDateRangeChange(e.target.value)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={exportCSV}
              fullWidth
              disabled={filteredEntries.length === 0}
            >
              Export CSV
            </Button>
          </Grid>
          
          {dateRangeFilter === 'custom' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Hours
              </Typography>
              <Typography variant="h3" color="primary">
                {totalHours.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {filteredEntries.length} time entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Client
              </Typography>
              {clientTotals.length > 0 ? (
                <>
                  <Typography variant="h5" noWrap>
                    {clientTotals[0].clientName}
                  </Typography>
                  <Typography variant="body1" color="primary">
                    {formatDuration(clientTotals[0].duration)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Project
              </Typography>
              {projectTotals.length > 0 ? (
                <>
                  <Typography variant="h5" noWrap>
                    {projectTotals[0].project}
                  </Typography>
                  <Typography variant="body1" color="primary">
                    {formatDuration(projectTotals[0].duration)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Time Entries Table */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Time Entries
          </Typography>
          <Typography variant="subtitle1">
            {startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : ''}
          </Typography>
        </Box>
        
        <Divider />
        
        {filteredEntries.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No time entries found for the selected filters
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Billable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">
                          {formatDate(entry.startTime)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getClientName(entry.clientId)}</TableCell>
                    <TableCell>{entry.project}</TableCell>
                    <TableCell>{entry.description || '-'}</TableCell>
                    <TableCell>{formatDuration(entry.duration)}</TableCell>
                    <TableCell>
                      {entry.billable ? (
                        <Chip label="Billable" size="small" color="primary" />
                      ) : (
                        <Chip label="Non-billable" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Client Breakdown */}
      {clientTotals.length > 0 && (
        <Paper elevation={3} sx={{ mb: 4 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              Client Breakdown
            </Typography>
          </Box>
          
          <Divider />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientTotals.map((client) => (
                  <TableRow key={client.clientId}>
                    <TableCell>{client.clientName}</TableCell>
                    <TableCell>{(client.duration / 60).toFixed(1)}</TableCell>
                    <TableCell>
                      {((client.duration / (totalHours * 60)) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Project Breakdown */}
      {projectTotals.length > 0 && (
        <Paper elevation={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              Project Breakdown
            </Typography>
          </Box>
          
          <Divider />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectTotals.map((project) => (
                  <TableRow key={project.project}>
                    <TableCell>{project.project}</TableCell>
                    <TableCell>{(project.duration / 60).toFixed(1)}</TableCell>
                    <TableCell>
                      {((project.duration / (totalHours * 60)) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ReportsPage;