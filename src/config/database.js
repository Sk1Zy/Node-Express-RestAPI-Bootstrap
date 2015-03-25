'use strict';

var Sequelize = require("sequelize");
var config = require('../config');

function configureDatabase() {

    var sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
        dialect: config.database.dialect,
        host: config.database.host,
        port: config.database.port,
        sync: config.database.sync
    });

    sequelize
        .authenticate()
        .complete(function (err) {
            if (err) {
                logger.error("Unable to connect to database '%s' at '%s:%s'", config.database.name, config.database.host, config.database.port);
                logger.error("Error:", err);
            } else {
                logger.info('Connected to database.');
            }
        });

    return sequelize;
}

module.exports = configureDatabase;
