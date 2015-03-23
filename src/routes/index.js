'use strict';

var fs = require('fs');
var path = require('path');

/**
 * Routes module
 */

 function Routes() {
    var basename = path.basename(module.filename);
    this.routes = {};

    fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function (file) {
        var route = require(path.join(__dirname, file));
        this.routes[path.parse(file).name] = route;
    });
}

function getRoutes() {
    return this.routes;
}

Routes.prototype = {
    getRoutes: getRoutes
};

var routes = new Routes();
module.exports = routes.getRoutes();
