var errors = require('common-errors');

function ExampleCtrl() {

}

/**
 * @api {get} /api/v1/example Example Action
 * @apiName ExampleAction
 * @apiGroup ExampleGroup
 * @apiVersion 1.0.0
 * @apiDescription Example Description
 *
 * @apiSuccess {String} message	Example message
 */
function exampleAction(req, res, next) {
	throw new errors.HttpStatusError(403, "Auth needed");
	res.status(200).json({ message: "This is an example." });
}



ExampleCtrl.prototype = {
	exampleAction: exampleAction
};

var exampleCtrl = new ExampleCtrl();

module.exports = exampleCtrl;