'use strict';

var express = require('express');
var app = express();
var compression = require('compression');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var config = require('./src/config');
var http = require('http');
var routes = require('./src/routes');
var _ = require('lodash');
var path = require('path');
var pe = require('pretty-error').start();
pe.skipNodeFiles();

/**
 * This is the application startup class. When initialized this class will
 * load configuration, load the appropriate middleware and create all the routes
 * that have been specified.
 */
function Startup() {
    this.configureMiddleware();
    this.configureRoutes();
    this.startServer();
}

/**
 * Function that plugs in all the appropriate middleware. If you want to add
 * any app wide middleware here is the place to plug it in. This middleware is run
 * before any routes.
 */
Startup.prototype.configureMiddleware = function configureMiddleware() {
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressValidator({
        // Insert custom validators here.
    }));
};

/**
 * A function that registeres all the routes for the application.
 */
Startup.prototype.configureRoutes = function configureRoutes() {
    var that = this;
    that._registerRoutes();
    app.use('/docs', express.static(path.dirname(require.main.filename) + '/docs/api'));
    app.use(that.configureErrorHandlers());
};

/**
 * A function that loops through every route specified
 * in the route files and registeres them with express.
 */
Startup.prototype._registerRoutes = function registerRoutes() {
    _.forOwn(routes, function(container) {
        _.forOwn(container, function(route, key) {
            if(key !== "all") {
                app[route.method.toLowerCase()]
                (container.all.prefix + 
                    container.all.version + 
                    route.path, 
                    container.all.middleware, 
                    route.middleware, 
                    route.action);
            }
        });
    });
};

/**
 * A function that registers error handling routes with express. These
 * are used by calling next(err) inside a controller action.
 */
Startup.prototype.configureErrorHandlers = function configureErrorHandlers() {
    var devErrorHandler;
    var prodErrorHandler;

    devErrorHandler = function devErrorHandler(err, req, res) {
        res.status(err.status || 500).json({
            message: err.message,
            error: err,
            stackTrace: err.stack
        });
    };

    prodErrorHandler = function prodErrorHandler(err, req, res) {

        // When a api error occurs in production you don´t want to
        // return status code 500 or 403 due to security risks.
        // For more info: http://security.stackexchange.com/questions/5288/which-http-status-codes-are-interesting-from-a-security-point-of-view
        res.status(err.status || 404).json({
            message: "Not Found"
        });
    };

    switch(config.environment) {
        case 'development':
        return devErrorHandler;
        case 'production':
        return prodErrorHandler;
        default:
        return devErrorHandler;
    }
};

/**
 * A function that starts up the express server.
 */
Startup.prototype.startServer = function startServer() {
    var server = http.createServer(app);
    console.log("lal", config);
    server.listen(config.server.port, config.server.host, null, function() {
        // TODO: Logging
    });
};

var s = new Startup();
