

function ExampleCtrl() {

}

/**
 * @api {get} /v1/api/example
 * 
 * @apiSuccess {String} message	Example message
 */
function exampleAction(req, res, next) {
	res.status(200).json({ message: "This is an example." });
}



ExampleCtrl.prototype = {
	exampleAction: exampleAction
};

var exampleCtrl = new ExampleCtrl();

module.exports = exampleCtrl;