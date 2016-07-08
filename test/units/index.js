var util = require('src/util').default;

beforeEach(function() {
	spyOn(util, 'warn');
	spyOn(util, 'error');
});

var testsContext = require.context(".", true, /_spec$/);
testsContext.keys().forEach(testsContext);