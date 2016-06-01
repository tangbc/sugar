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
		// test specs files beigin list bellow
		'specs/main/spec_ajax',
	], function() {
		var env = jasmine.getEnv();
		env.addReporter(new jasmine.HtmlReporter);
		env.execute();
	});
});
