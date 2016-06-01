require.config({
	'paths': {
		'testem': '/testem'
	}
});

require([
	'jasmine/jasmine'
], function() {
	require([
		'testem',
		'jasmine/jasmine-html',
		// test specs list beigin this line
		'units/hello',
	], function() {
		var env = jasmine.getEnv();
		env.addReporter(new jasmine.HtmlReporter);
		env.execute();
	});
});
