const { initRemix } = require("remix-electron")
const { app, BrowserWindow, dialog, ipcMain } = require("electron")
const { join } = require("node:path")
const { fetch } = require('@remix-run/node');
const path = require('node:path');
const isDev = require('electron-is-dev');
const execFile = require("child_process").execFile

const API_DEV_PATH = path.join(__dirname, '../py_scripts/monochromator/monochromator.py')
const API_PROD_PATH = path.join(__dirname, 'api.exe')

// if (isDev) {
//   console.log('Running in development mode')
//   try {
//     require('electron-reloader')(module)
//   } catch (_) {}

//   const {
//     PythonShell
//   } = require('python-shell')

//   PythonShell.run(API_DEV_PATH, function (err, results) {
//     if (err) console.log(err)
//   })
// } else {
//   execFile(API_PROD_PATH, {
//     windowsHide: true,
//   })
// }

/** @type {BrowserWindow | undefined} */
let win

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
      preload: path.join(__dirname, 'preload.js')
    }
  })
  await win.loadURL(url)
  win.show()

  // if (process.env.NODE_ENV === "development") {
  //   win.webContents.openDevTools()
  // }
}

ipcMain.handle('api-request', async (event, requestDetails) => {
  console.log('check')
  try {
    console.log('Received API request in main process:', requestDetails);
    const response = await fetch(requestDetails.url, { method: requestDetails.method });
    const data = await response.text();
    console.log('API response:', data);
    event.sender.send('api-response', data);
  } catch (error) {
    console.error('Error in main process API request:', error);
    event.sender.send('api-response', { error: error.message }); // Use error.message
  }
});

app.on("ready", async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require("electron-devtools-installer")

      await installExtension(REACT_DEVELOPER_TOOLS)
    }

    const url = await initRemix({
      serverBuild: join(__dirname, "../build/index.js"),
    })
    await createWindow(url)
  } catch (error) {
    dialog.showErrorBox("Error", getErrorStack(error))
    console.error(error)
  }
})

/** @param {unknown} error */
function getErrorStack(error) {
  return error instanceof Error ? error.stack || error.message : String(error)
}

ipcMain.on('test-message', (event, arg) => {
  console.log('Received test-message:', arg);
});
