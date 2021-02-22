const ipc = require('electron').ipcMain;
const uiAdaptor = require('./uiAdaptor');
const espTool = require('./espTool');
const espConfig = require('./espConfig');
this.mainWindow = null;

function registerListeners() {
    ipc.on('settings', (event, messages) => {
        espConfig.setConfig(messages);
    });

    ipc.on('open', uiAdaptor.openFile);
    ipc.on('run', espTool.writeToEsp);
    ipc.on('clear', espTool.clearEsp);

    ipc.on('download', (event, messages) => {
        console.log(messages);
    });

    ipc.on('getSettings', (event, msg) => {
        event.reply('writeSettings', espConfig.getConfig());
    });

    espTool.pipeEspruino();
}

function emitStartup(mainWindow) {
    this.mainWindow = mainWindow;
}

module.exports = {
    registerListeners: registerListeners,
    emitStartup: emitStartup
};