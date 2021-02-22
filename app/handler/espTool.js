const { Notification } = require('electron')
const esp = require("espruino");
const conf = require("./espConfig");
const espHacks = require('./utils/espruinoNodeHacks');
const espTermHacks = require('./utils/espruinoTerminalHacks');

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
        var formatedResult = espTermHacks.outputDataHandler(res);
        event.reply('termOutput', formatedResult);
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

function pipeEspruino() {
    var response;
    var rawResArr = [];

    const prevReader = Espruino.Core.Serial.startListening(function (data) {
        data = new Uint8Array(data);
        rawResArr.push(data)
        for (var i = 0; i < data.length; i++) {
            response += String.fromCharCode(data[i]);
        }
        prevReader(data);

        console.log(response);
    });

}

module.exports = {
    writeToEsp: writeToEsp,
    clearEsp: clearEsp,
    getPorts: getPorts,
    pipeEspruino: pipeEspruino
};