var MVVM = require('mvvm').default;
var util = require('src/util').default;

describe('directive expression >', function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('valid keyword', function() {
		element.innerHTML = '<h1 v-text="parseInt(n)"></h1>';

		var vm = new MVVM(element, {
			'n': 1.23
		});
		var h1 = element.childNodes[0];

		expect(h1.textContent).toBe('1');

		vm.set('n', 2.2222);
		expect(h1.textContent).toBe('2');
	});


	it('invalid keyword', function() {
		element.innerHTML = '<h1 v-text="var a = 1"></h1>';

		var vm = new MVVM(element, {});

		expect(element.innerHTML).toBe('<h1>undefined</h1>');
		expect(util.warn).toHaveBeenCalledWith('Avoid using unallow keyword in expression [var a = 1]');
	});


	it('invalid expression', function() {
		element.innerHTML = '<h1 v-text="a + "></h1>';

		var vm = new MVVM(element, {});

		expect(element.innerHTML).toBe('<h1>undefined</h1>');
		expect(util.error).toHaveBeenCalledWith('Invalid generated expression:  scope.a + ');
	});


	it('complex expression', function() {
		element.innerHTML = '<h1 v-text="isErr ? errMsg : sucMsg"></h1>';

		var vm = new MVVM(element, {
			'isErr': false,
			'errMsg': 'error message',
			'sucMsg': 'successs message'
		});
		var data = vm.get();
		var h1 = element.childNodes[0];

		expect(h1.textContent).toBe('successs message');

		data.isErr = true;
		expect(h1.textContent).toBe('error message');

		data.sucMsg = 'that is ok';
		expect(h1.textContent).toBe('error message');

		data.isErr = false;
		expect(h1.textContent).toBe('that is ok');

		data.errMsg = 'i am sorry';
		data.isErr = true;
		expect(h1.textContent).toBe('i am sorry');
	});
});