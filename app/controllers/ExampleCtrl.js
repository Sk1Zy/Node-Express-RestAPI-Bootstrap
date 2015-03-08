

function ExampleCtrl() {

}

function exampleAction(req, res, next) {
	res.status(200).json({ message: "This is an example." })
}



ExampleCtrl.prototype = {
	exampleAction: exampleAction
};

var exampleCtrl = new ExampleCtrl();

module.exports = exampleCtrl;