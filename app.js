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
var winston = require('winston');
var expressWinston = require('express-winston');
var cors = require('cors');
var helmet = require('helmet');
var pe = require('pretty-error').start();
pe.skipNodeFiles();

/**
 * This is the application startup class. When initialized this class will
 * load configuration, load the appropriate middleware and create all the routes
 * that have been specified.
 */
 function Startup() {
    this.configureLoggers();
    this.configureMiddleware();
    this.configureCors(config.cors);
    this.configureRoutes();
    this.configureDatabase();
    this.startServer();
}

/**
 * Function that plugs in all the appropriate middleware. If you want to add
 * any app wide middleware here is the place to plug it in. This middleware is run
 * before any routes.
 */
 Startup.prototype.configureMiddleware = function configureMiddleware() {
    app.use(compression());
    app.use(helmet());
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
    var that = this;
    _.forOwn(routes, function(container) {
        if(!container.all) {
            container.all = {};
        }

        _.forOwn(container, function(route, key) {
            if(key !== "all") {
                if(typeof (route.action) !== 'function') {
                    throw new Error('Route action needs to be a function!');
                }

                if(app[route.method.toLowerCase()] === undefined) {
                    throw new Error("Invalid method name. See http://expressjs.com/4x/api.html#app.METHOD for valid method names.");
                }

                if(route.path.substr(0,1) !== '/') {
                    logger.warn('Route "' + route.path + '" does not start with a slash. Add one or the route wont work.');
                }

                var routePath = (route.version || container.all.version || "") + (container.all.prefix || "") + route.path;

                var routeCors;
                if(container.all.cors || route.cors) {

                    if(route.cors.preFlight || container.all.cors.preFlight) {
                        app.options(routePath, cors());
                    }

                    routeCors = that.configureCors(route.cors || container.all.cors);
                }

                var middleware = [].concat(routeCors, container.all.middleware, route.middleware).filter(function(n) { return n !== undefined; });

                app[route.method.toLowerCase()](routePath, middleware, route.action);
                logger.info('Created route "' + routePath + '".');
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

    devErrorHandler = function devErrorHandler(err, req, res, next) {
        res.status(err.status || 500).json({
            message: err.message,
            error: err,
            stackTrace: err.stack
        });
    };

    prodErrorHandler = function prodErrorHandler(err, req, res, next) {

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
 * Configures logging middleware defined in the config file.
 */
 Startup.prototype.configureLoggers = function configureLoggers() {

    for(var i = 0; i < config.loggers.length; i++) {
        var logger = config.loggers[i];
        winston.loggers.add(logger.name, {
            file: logger.file
        });

        app.use(expressWinston.logger({ winstonInstance: winston.loggers.get(logger.name)}));
        if(logger.global) {
            global[logger.name] = winston.loggers.get(logger.name);
        }
    }
};

/**
 * This function sets up global CORS middleware if
 * it is defined in the config file.
 */
 Startup.prototype.configureCors = function configureCors(corsConf) {
    if(corsConf) {
        var options = {};

        if(config.cors.whitelist) {
            options.origin = function(origin, callback) {
                var originIsWhitelisted = config.cors.whitelist.indexof(origin) !== -1;
                callback(null, originIsWhitelisted);
            };
        }

        _.forOwn(config.cors, function(val, key) {
            if(key !== "whitelist" && key !== "origin") {
                options[key] = val;
            }
        });

        return cors(options);
    }
};

/**
 * A function that starts up the express server.
 */
 Startup.prototype.startServer = function startServer() {
    var server = http.createServer(app);
    server.listen(config.server.port, config.server.host, null, function() {
        logger.info("Server Started");
    });
};

Startup.prototype.configureDatabase = function configureDatabase() {
    var database = require('src/config/database')();
    require('src/models')(database);
};

var s = new Startup();
