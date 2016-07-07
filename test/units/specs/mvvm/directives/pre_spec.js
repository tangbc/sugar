var MVVM = require('mvvm').default;

describe("v-pre >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('normal', function() {
		element.innerHTML =
			'<div id="test1" v-pre>' +
				'<b v-show="show"></b>' +
				'<i>{{ text }}</i>' +
			'</div>'

		var vm = new MVVM(element, {});
		var div = element.querySelector('#test1');

		expect(div.innerHTML).toBe('<b v-show="show"></b><i>{{ text }}</i>');
	});


	it('in v-for', function() {
		element.innerHTML =
			'<ul id="test2">' +
				'<li v-for="item in items">' +
					'<span v-pre>{{ item.text }}</span>' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [{}, {}, {}]
		});
		var ul = element.querySelector('#test2');

		expect(ul.textContent).toBe('{{ item.text }}{{ item.text }}{{ item.text }}');
	});
});