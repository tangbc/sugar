import * as util from 'src/util';

beforeEach(function () {
	spyOn(util, 'warn');
	spyOn(util, 'error');
});

const testsContext = require.context(".", true, /_spec$/);
testsContext.keys().forEach(testsContext);
