const { Notification } = require('electron')
const esp = require("espruino");
const conf = require("./espConfig");

esp.init(function () {
    Espruino.Config.BAUD_RATE = conf.getConfigValue("baudrate");
});

conf.default.onDidChange("baudrate", () => {
    esp.init(function () {
        Espruino.Config.BAUD_RATE = conf.getConfigValue("baudrate");
    });
});

function writeResponseBack(event, response) {
    event.reply('readResponse', response);
}

function sendCodeCallback(event, res) {
    if (res == undefined) {
        noResponse("Unable to connect!");
    } else {
        event.reply('termOutput', res);
    }
}

function noResponse(res) {
    const notification = {
        title: 'Esp Notification',
        body: res
    }
    new Notification(notification).show()
}

function writeToEsp(event, code) {
    esp.sendCode(conf.getConfigValue("portname"), code, sendCodeCallback.bind(this, event));
}

function clearEsp(event, code) {
    esp.sendCode(conf.getConfigValue("portname"), "E.setBootCode()", sendCodeCallback.bind(this, event));
}

function getPorts() {
    var portPaths = [];
    return new Promise((res, rej) => {
        Espruino.Core.Serial.getPorts(function cb(ports) {
            var newPorts = ports.filter(port => !portPaths.find(p => p.path == port.path));
            res(portPaths.concat(newPorts));  
        });
    });
}
module.exports = {
    writeToEsp: writeToEsp,
    clearEsp: clearEsp,
    getPorts: getPorts
};