var app = require('express')();
var compression = require('compression');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var config = require('./app/config');
var http = require('http');
var routes = require('./app/config/routes');
var _ = require('lodash');

function configureMiddleware(app) {
	app.use(compression());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(expressValidator({
		// Insert custom validators here.
	}));
}

function configureRoutes(app) {

	registerRoutes(app);
	app.use(configureErrorHandlers());
}

function registerRoutes(app) {
	_.forOwn(routes, function(container) {
		_.forOwn(container, function(route, key) {
			if(key !== "all") {
				app[route.method.toLowerCase()]
				(container.all.version + 
					container.all.prefix + 
					route.path, 
					container.all.middleware, 
					route.middleware, 
					route.action);
			}
		});
	});
}

function configureErrorHandlers() {
	if(config.environment === "development") {
		return devErrorHandler;
	} else if(conig.environment === "production") {
		return prodErrorHandler;
	}

	function devErrorHandler(err, req, res, next) {
		res.status(err.status || 500).json({
			message: err.message,
			error: err,
			stackTrace: err.stack
		});
	}

	function prodErrorHandler(err, req, res, next) {

		// When a api error occurs in production you don´t want to
		// return status code 500 or 403 due to security risks.
		// For more info: http://security.stackexchange.com/questions/5288/which-http-status-codes-are-interesting-from-a-security-point-of-view
		res.status(err.status || 404).json({
			message: "Not Found"
		});
	}
}

function startServer(app) {
	var server = http.createServer(app);
	console.log("lal", config);
	server.listen(config.server.port, config.server.host, null, function() {
		// TODO: Logging
	});
}

configureMiddleware(app);
configureRoutes(app);
startServer(app);