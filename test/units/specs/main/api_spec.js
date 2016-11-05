import sugar from 'src/main/index';

describe('sugar api >', function () {
	it('extend to sugar', function () {

		function greeting (name) {
			return 'Hello, ' + name.toUpperCase();
		}

		// extend greeting to sugar
		sugar.extend({ greeting });

		expect(sugar.greeting('kobe')).toBe('Hello, KOBE');
	});


	it('extend to sugar.util', function () {

		function greeting (name) {
			return 'Hello, ' + name.toLowerCase();
		}

		// extend greeting to sugar
		sugar.util.extend({ greeting });

		expect(sugar.util.greeting('BRYANT')).toBe('Hello, bryant');
	});
});
