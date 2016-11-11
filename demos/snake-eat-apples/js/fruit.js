;(function (exports) {

	// return a random int number from 1 to max
	// Math.random() * (max - min + 1) + min
	function random (max) {
		return Math.round(Math.random() * max + 1);
	}

	// Fruit class
	function Fruit (rows, lines) {
		this.row = 0;
		this.line = 0;
		this.eatens = [];
		this.rows = rows - 3;
		this.lines = lines - 3;
	}

	// get a random position with row and line
	// they shoudn't be included in preserve zone
	Fruit.prototype.bear = function (zone) {
		var row = random(this.rows);
		var line = random(this.lines);
		var identity = row + ',' + line;

		if (zone.indexOf(identity) > -1) {
			return this.bear(zone);
		} else {
			this.row = row;
			this.line = line;
			return { row: row, line: line, eaten: false };
		}
	}

	// check if giving position has a fresh/lelfover fruit
	// 0 indicate fresh fruit, 1 is leftover, otherwise nothing
	Fruit.prototype.check = function (row, line) {
		if (this.row === row && this.line === line) {
			return 0;
		} else if (this.eatens.indexOf(row + ',' + line) > -1) {
			return 1;
		}
	}

	// add a eaten fruit, helping to check if snake eat again
	Fruit.prototype.addEaten = function (row, line) {
		this.eatens.push(row + ',' + line);
	}

	// reset data
	Fruit.prototype.reset = function () {
		this.row = 0;
		this.line = 0;
		this.eatens = [];
	}

	exports.AppFruit = Fruit;

})(window);
