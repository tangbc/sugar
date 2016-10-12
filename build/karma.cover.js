var config = require('./karma.conf');

module.exports = function (karmaConfig) {
	karmaConfig.set(config.cover);
}
