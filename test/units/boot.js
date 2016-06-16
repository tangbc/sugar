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
		// test specs files list begain
		'specs/observer_spec',
		'specs/directives/el_spec',
		'specs/directives/text_spec',
		'specs/directives/html_spec',
		'specs/directives/show_spec',
		'specs/directives/if_spec',
		'specs/directives/pre_spec',
		'specs/directives/for_spec',
	], function() {
		var env = jasmine.getEnv();
		env.addReporter(new jasmine.HtmlReporter);
		env.execute();
	});
});
