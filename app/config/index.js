var os = require('os');
var argv = require('minimist')(process.argv.slice(2));
var app = require('express')();

function Config() {
	return initialize({});
}

function initialize(config) {
	return loadConfig(config);
}

function loadConfig(config) {
	if(argv.env) {
		switch(argv.env) {
			case "dev":
			case "development":
				config.environment = "development";
				break;
			case "prod":
			case "production":
				config.environment = "production";
				break;
			default:
				config.environment = "development";
		}
	}

	var configFile;

	switch(config.environment) {
		case "prod":
		case "production":
			configFile = require('./config.prod.json');
			break;
		case "dev":
		case "development":
			configFile = require('./config.dev.json');
			break;
		default:
			configFile = require('./config.' + config.environment + '.json');
	}

	config.server = {
		host: argv.host ? argv.host : configFile.serverConfig.host,
		port: argv.port ? argv.port : configFile.serverConfig.port
	};

	config.database = {
		name: configFile.databaseConfig.name,
		host: configFile.databaseConfig.host,
		port: configFile.databaseConfig.port,
		dialect: configFile.databaseConfig.dialect
	};

	if(configFile.custom.length > 0) {
		for(var i = 0; i < configFile.custom.length; i++) {
			var custom = configFile.custom[i];

			config[custom.name] = config.value;
		}
	}

	return config;
}

var config = new Config();

module.exports = config;