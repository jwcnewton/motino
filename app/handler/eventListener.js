const ipc = require('electron').ipcMain;
const uiAdaptor = require('./uiAdaptor');
const espTool = require('./espTool');
const espConfig = require('./espConfig');

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
}

function emitStartup(mainWindow) {
    //TODO: Main window startup
}

module.exports = {
    registerListeners: registerListeners,
    emitStartup: emitStartup
};