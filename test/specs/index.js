require.config({
	'paths': {
		'testem': '/testem'
	}
});

require([
	'testem',
	'jasmine/jasmine'
], function() {
	require([
		'jasmine/jasmine-html',
		'units/hello'
	], function() {
		var env = jasmine.getEnv();
		env.addReporter(new jasmine.HtmlReporter);
		env.execute();
	});
});
