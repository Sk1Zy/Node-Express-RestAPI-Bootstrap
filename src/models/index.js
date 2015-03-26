'use strict';

function Database() {
    this.models = {};
}

Database.prototype.init = function init(sequelize) {
    var that = this;
    if(!sequelize) {
        logger.error("Required argument Sequelize wasn't given.");
    }
    var fs = require("fs");
    var path = require("path");
    var basename = path.basename(module.filename);
    var models = {};
    models.sequelize = sequelize;

    fs
        .readdirSync(__dirname)
        .filter(function(file) {
            return (file.indexOf(".") !== 0) && (file !== basename);
        })
        .forEach(function(file) {
            var model = sequelize.import(path.join(__dirname, file));
            models[model.name] = model;
        });

    Object.keys(models).forEach(function(modelName) {
        if ("associate" in models[modelName]) {
            models[modelName].associate(models);
        }
    });

    models.sequelize = sequelize;
    that.models = models;
    return models;
};

Database.prototype.getModels = function getModels() {
    return this.models;
};

module.exports = new Database();
