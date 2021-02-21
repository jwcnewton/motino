const Store = require('electron-store');

const espConfigSchema = {
    baudrate: {
        type: 'number'
    },
    portname: {
    },
    resetbeforesend: {
        type: 'boolean'
    }
};

const espConfigDefaults = {
    baudrate: 115200,
    portname: "/dev/tty.SLAB_USBtoUART",
    resetbeforesend: false
}

const espConfig = new Store({
    schema: espConfigSchema,
    defaults: espConfigDefaults
});

function getConfig() {
    var config = espConfig.store
    for (let setting in config) {
        const val = config[setting];
        config[setting] = tryParse(val);
    }
    return config;
}

function getConfigValue(property) {
    return tryParse(espConfig.get(property));
}

function setConfig(config) {
    for (let setting in config) {
        const val = config[setting];
        config[setting] = tryParse(val);
    }
    return espConfig.set(config);
}

function tryParse(val) {
    try {
        return JSON.parse(val);
    } catch (e) {
        return val;
    }
}

module.exports = {
    setConfig: setConfig,
    getConfig: getConfig,
    getConfigValue: getConfigValue,
    default: espConfig
};