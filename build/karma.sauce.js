var sauce = require('../sauce.json');
var config = require('./karma.conf');

module.exports = function (karmaConfig) {
	if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
		process.env.SAUCE_USERNAME = sauce.username;
		process.env.SAUCE_ACCESS_KEY = sauce.accesskey;
	}

	karmaConfig.set(config.sauce);
}
