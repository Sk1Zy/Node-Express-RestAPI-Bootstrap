'use strict';

var exampleCtrl = require('../controllers/ExampleCtrl');

/**
 * Home module
 */

function Home() {
	return {
		get: {
			path: "api/fag",
			method: "get",
			action: exampleCtrl.exampleAction
		}
	};
}

var home = new Home();

module.exports = home;
