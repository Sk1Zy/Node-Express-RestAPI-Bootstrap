var exampleCtrl = require('../../controllers/ExampleCtrl');

function Example() {
	return {
		get: {
			path: "/example",
			method: "get",
			action: exampleCtrl.exampleAction,
			middleware: []
		},
		all: {
			middleware: [],
			prefix: "/api",
			version: "/v1"
		}
	};
}

var example = new Example();

module.exports = example;