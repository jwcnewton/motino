const electron = require('electron');
const fs = require('fs')

function getFileContent(event, result) {
    const data = fs.readFileSync(result.filePaths[0], 'utf8');
    event.reply('writeContent', data)
}

function returnToastError(event, err) {
    event.reply('readResponse', err)
}

function openFile(event) {
    const dialog = electron.dialog;
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    }).then(getFileContent.bind(this, event))
    .catch(returnToastError.bind(this, event));
}

function openConfig(event) {
    const dialog = electron.dialog;
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    }).then(getFileContent.bind(this, event))
    .catch(returnToastError.bind(this, event));
}

module.exports = {
    openFile: openFile,
    openConfig: openConfig
};