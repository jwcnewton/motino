const { Notification } = require('electron')
const esp = require("espruino");
const conf = require("./espConfig");
const espHacks = require('./utils/espruinoNodeHacks');

esp.init(function () {
    Espruino.Config.BAUD_RATE = conf.getConfigValue("baudrate");
    Espruino.Config.RESET_BEFORE_SEND = conf.getConfigValue("resetbeforesend");
    espHacks.setupHacks();
});

conf.default.onDidAnyChange(() => {
    Espruino.Config.BAUD_RATE = conf.getConfigValue("baudrate");
    Espruino.Config.RESET_BEFORE_SEND = conf.getConfigValue("resetbeforesend");
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

function clearEsp(event) {
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