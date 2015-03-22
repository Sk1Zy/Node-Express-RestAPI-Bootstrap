'use strict';

function Home() {
	return {
		get: {
			path: "/api/fag",
			version: "/v1",
			method: "get",
			action: function(req, res){ console.log("action"); res.json({message: "lol" }); },
			middleware: []
		},
		all: {
			middleware: []
		}
	};
}

var home = new Home();

module.exports = home;
