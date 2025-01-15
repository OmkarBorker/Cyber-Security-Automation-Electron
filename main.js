const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const windowStateKeeper = require('electron-window-state');
const { Buffer } = require('buffer');
const DocType = require('./contants');
const { api, API_POINT } = require('./api');
const keytar = require('keytar');

let mainWindow;
let isLicenseWindowOpen = false;  // Track if the license key input window is already open

const SERVICE_NAME = "report-generator";  // Identifier for keytar

// Function to get the license key
async function getLicenseKey() {
    let storedKey = await keytar.getPassword(SERVICE_NAME, "license_key");
    console.log({ storedKey });

    if (!storedKey) {
        // Check if the license key window is already open to avoid multiple instances
        if (!isLicenseWindowOpen) {
            isLicenseWindowOpen = true;  // Mark that the license window is open

            const mainWindowState = windowStateKeeper({
                defaultHeight: 600,
                defaultWidth: 800
            });

            // Create the input window for license key
            const inputWindow = new BrowserWindow({
                x: mainWindowState.x,
                y: mainWindowState.y,
                width: mainWindowState.defaultWidth,
                height: mainWindowState.defaultHeight,
              autoHideMenuBar: true,
        resizable: true,
                modal: true,
                show: false, // Don't show it yet
                parent: mainWindow, // Ensure the input window is modal to the main window
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });

            // Load the License Key HTML
            inputWindow.loadFile('LicenseKey.html');  // Ensure LicenseKey.html is available
            inputWindow.webContents.openDevTools();


            // Show the input dialog window when ready
            inputWindow.once('ready-to-show', () => {
                inputWindow.show();
            });

            // Wait for the user to submit the license key via IPC
            const licenseKey = await new Promise((resolve, reject) => {
                ipcMain.once('license-key-submitted', (event, key) => {
                    inputWindow.close(); // Close the input window
                    isLicenseWindowOpen = false; // Reset the flag
                    console.log({ key })

                    if (!key) {
                        reject(new Error('No license key provided'));
                        return;
                    }
                    resolve(key);
                });
            });

            console.log({ licenseKey });
            storedKey = licenseKey;
            await keytar.setPassword(SERVICE_NAME, "license_key", storedKey);
        } else {
            // If the license window is already open, wait until it is closed
            console.log("License key window is already open.");
        }
    }

    return storedKey;
}

// Create the main window
async function createMainWindow() {
    if (mainWindow) {
        return; // Avoid creating a new window if one already exists
    }

    const mainWindowState = windowStateKeeper({
        defaultHeight: 600,
        defaultWidth: 800
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.defaultWidth,
        height: mainWindowState.defaultHeight,
        backgroundColor: "white",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        resizable: true,
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
    mainWindowState.manage(mainWindow);

    globalShortcut.register('ctrl+q', () => {
        app.quit();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Handle the process-upload IPC event
ipcMain.handle('process-upload', async (event, data) => {
    const LICENSE_KEY = await getLicenseKey();  // Retrieve stored license key
    console.log({ LICENSE_KEY }, { data });

    const { input_docx, uploadedFile, name, application_version ,platform} = data;
    const formData = new FormData();
    formData.append('input_docx', input_docx);
    formData.append('platform', platform);
    formData.append("uploadedZip", new Blob([uploadedFile], { type: "application/zip" }), name);
    formData.append('font_type', DocType[`${input_docx}`]);
    formData.append('application_version', application_version);

    try {
        // Send file to your API for processing
        const response = await api.post(API_POINT.GENERATE_REPORT, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-License-Key': LICENSE_KEY
            },
            responseType: 'arraybuffer'  // Ensure binary data is received
        });

    console.log({response})

        // Check if the response is a valid .docx file
        if (response.status === 200 && response.data) {
            const fileName = `${name}.docx`;  // Change file name if needed

            // Return the file content as binary
            return {
                success: true,
                file: Buffer.from(response.data),  // Binary content of the file
                fileName: fileName  // Name of the processed file
            };
        } else {
            throw new Error('Error processing file. No file returned.');
        }
    } catch (error) {
        console.error('Error while uploading or processing the file:', error);
        throw new Error('Error while uploading or processing the file: ' + error.message);
    }
});

// App ready event
app.whenReady().then(async () => {
    try {
        // Ensure the license key is retrieved or input before launching the app
        const key = await getLicenseKey(); // Blocks app launch until license is retrieved
        console.log({ key })
        // Create the main window after the license key is validated or entered
        if (key) { await createMainWindow(); }

    } catch (error) {
        console.error('License Key Error:', error);
        app.quit(); // Exit the app if there's an issue with the license key
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
