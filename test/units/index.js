var util = require('src/util').default;

beforeEach(function() {
	spyOn(util, 'warn');
});

var testsContext = require.context(".", true, /_spec$/);
testsContext.keys().forEach(testsContext);