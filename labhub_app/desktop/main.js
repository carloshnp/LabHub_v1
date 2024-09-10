const { initRemix } = require("remix-electron");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater"); // Import autoUpdater
const { join } = require("node:path");
const { fetch } = require('@remix-run/node');
const path = require('node:path');
const isDev = require('electron-is-dev');
const { execFile, spawn } = require("child_process");

let apiProcess = null; // Keep a reference to the API server process

// Paths to your API server
const API_DEV_PATH = path.join(__dirname, '../labhub_server');
const API_PROD_PATH = path.join(process.resourcesPath, 'labhub_server');

// Function to start the API server
function startAPIServer() {
  if (isDev) {
    console.log('Starting API server in development mode');
    apiProcess = spawn('uvicorn', ['app:app', '--reload'], { cwd: API_DEV_PATH, shell: true });
    apiProcess.stdout.on('data', (data) => console.log(`API: ${data}`));
    apiProcess.stderr.on('data', (data) => console.error(`API Error: ${data}`));
  } else {
    console.log('Starting API server in production mode');
    // Assuming the API server can be started with an executable in production
    const apiProcess = execFile(path.join(API_PROD_PATH, 'api.exe'), { windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error starting API server: ${err}`);
        return;
      }
      console.log(`API server output: ${stdout}`);
      console.error(`API server errors: ${stderr}`);
    });
  }
}

// Function to stop the API server
function stopAPIServer() {
  if (apiProcess !== null) {
    console.log('Stopping API server');
    apiProcess.kill(); // Terminate the process
    apiProcess = null;
  }
}

// Ensure all windows are closed before quitting the app
app.once('window-all-closed', () => app.quit());

// Clean up before quitting
app.once('before-quit', () => {
  // Assuming 'win' is your BrowserWindow instance
  if (win) {
    win.removeAllListeners('close'); // Remove all close listeners from the window
  }
  stopAPIServer(); // Stop the API server
});

// Start the API server
startAPIServer();

/** @type {BrowserWindow | undefined} */
let win;

/** @param {string} url */
async function createWindow(url) {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  await win.loadURL(url);
  win.show();

  // if (process.env.NODE_ENV === "development") {
  //   win.webContents.openDevTools();
  // }
}

ipcMain.handle('api-request', async (event, requestDetails) => {
  const { url, options } = requestDetails;
  console.log('Received API request in main process:', url, options);
  try {
    const response = await fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body
    });
    const data = await response.text();
    console.log('API response:', data);
    return data; // Return the response data
  } catch (error) {
    console.error('Error in main process API request:', error);
    return { error: error.message }; // Return the error message
  }
});

app.on("ready", async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
      await installExtension(REACT_DEVELOPER_TOOLS);
    }

    const url = await initRemix({
      serverBuild: join(__dirname, "../build/index.js"),
    });
    await createWindow(url);

    autoUpdater.checkForUpdatesAndNotify(); // Added to check for updates
  } catch (error) {
    dialog.showErrorBox("Error", getErrorStack(error));
    console.error(error);
  }
});

autoUpdater.on('update-available', () => {
  if (win) {
    win.webContents.send('update_available');
  }
});

autoUpdater.on('update-downloaded', () => {
  if (win) {
    win.webContents.send('update_downloaded');
  }
});

/** @param {unknown} error */
function getErrorStack(error) {
  return error instanceof Error ? error.stack || error.message : String(error);
}

ipcMain.on('test-message', (event, arg) => {
  console.log('Received test-message:', arg);
});
