'use strict';

var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);
var routes = {};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function (file) {
        var route = require(path.join(__dirname, file));
        routes[path.parse(file).name] = route;
    });

module.exports = routes;