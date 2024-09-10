const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  makeApiRequest: async (url, options) => {
    console.log('makeApiRequest called in preload with:', url, options);
    try {
      console.log("options: ", options);
      const response = await ipcRenderer.invoke('api-request', { url, options });
      return response; // Return the response directly
    } catch (error) {
      // Handle errors appropriately - you might want more robust error reporting
      console.error('Error in preload API request:', error);
      throw error; // Re-throw to allow component to handle
    }
  },
  sendTestMessage: () => ipcRenderer.send('test-message', 'Hello from renderer'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
});
