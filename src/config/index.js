'use strict';

/**
 * @description Parses configuration files according to the environment
 * the project is being run in.
 * @module Configuration
 */

 var argv = require('minimist')(process.argv.slice(2));

/**
 * @class Config
 . */
 function Config() {
    this.config = {};
}

function loadConfig() {
    switch(argv.env) {
        case "dev":
        case "development":
        this.config.environment = "development";
        break;
        case "prod":
        case "production":
        this.config.environment = "production";
        break;
        default:
        this.config.environment = "development";
    }

    var configFile;

    switch(this.config.environment) {
        case "prod":
        case "production":
        configFile = require('./config.prod.json');
        break;
        case "dev":
        case "development":
        configFile = require('./config.dev.json');
        break;
        default:
        configFile = require('./config.' + this.config.environment + '.json');
    }

    this.config.server = {
        host: argv.host ? argv.host : configFile.serverConfig.host,
        port: argv.port ? argv.port : configFile.serverConfig.port
    };

    this.config.database = {
        name: configFile.databaseConfig.name,
        host: configFile.databaseConfig.host,
        port: configFile.databaseConfig.port,
        dialect: configFile.databaseConfig.dialect
    };

    this.config.loggers = configFile.loggers;
    this.config.cors = configFile.cors;

    if(configFile.custom.length > 0) {
        for(var i = 0; i < configFile.custom.length; i++) {
            var custom = configFile.custom[i];

            this.config[custom.name] = this.config.value;
        }
    }

    return this.config;
}

function getConfig() {
    return this.config;
}

Config.prototype = {
    loadConfig: loadConfig,
    getConfig: getConfig
};

var config = new Config();
config.loadConfig();

module.exports = config.getConfig();
