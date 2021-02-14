const electron = require('electron');
const path = require('path');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const eventListener = require('./app/handler/eventListener');

eventListener.registerListeners();

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 1000,
		webPreferences: {
			nodeIntegration: true
		},
		title: 'MOTINO'
	});
	mainWindow.loadURL(`file://${__dirname}/app/editor/views/editor.html`);
	mainWindow.webContents.openDevTools();

	mainWindow.on('closed', function () {
		mainWindow = null;
	});


	eventListener.emitStartup(mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});
