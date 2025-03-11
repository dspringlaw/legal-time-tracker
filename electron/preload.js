const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Client operations
    getClients: () => ipcRenderer.invoke('get-clients'),
    addClient: (client) => ipcRenderer.invoke('add-client', client),
    updateClient: (client) => ipcRenderer.invoke('update-client', client),
    deleteClient: (clientId) => ipcRenderer.invoke('delete-client', clientId),
    
    // Time entry operations
    getTimeEntries: () => ipcRenderer.invoke('get-time-entries'),
    addTimeEntry: (timeEntry) => ipcRenderer.invoke('add-time-entry', timeEntry),
    updateTimeEntry: (timeEntry) => ipcRenderer.invoke('update-time-entry', timeEntry),
    deleteTimeEntry: (entryId) => ipcRenderer.invoke('delete-time-entry', entryId),
    
    // Desktop shortcut
    createDesktopShortcut: () => ipcRenderer.invoke('create-desktop-shortcut'),
    
    // Timer events
    onStartTimer: (callback) => {
      // Remove any existing listeners to avoid duplicates
      ipcRenderer.removeAllListeners('start-timer');
      // Add the new listener
      ipcRenderer.on('start-timer', () => callback());
    }
  }
);