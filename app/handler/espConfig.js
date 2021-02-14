const Store = require('electron-store');

const espConfigSchema = {
	baudrate: {
	},
	portname: {
    },
    resetbeforesend: {
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
    return espConfig.store;
}

function getConfigValue(property) {
    return espConfig.get(property);
}

function setConfig(config) {
    return espConfig.set(config);
}

module.exports = {
    setConfig: setConfig,
    getConfig: getConfig,
    getConfigValue: getConfigValue,
    default: espConfig
};