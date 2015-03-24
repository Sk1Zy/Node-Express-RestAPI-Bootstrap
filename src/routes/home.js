'use strict';

var exampleCtrl = require('../controllers/ExampleCtrl');

/**
 * Home module
 */

function Home() {
	return {
		get: {
			path: "/api/example",
			method: "get",
			action: exampleCtrl.exampleAction
		}
	};
}

var home = new Home();

module.exports = home;
