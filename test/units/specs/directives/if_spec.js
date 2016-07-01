var MVVM = require('mvvm').default;

describe("v-if >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('normal render first', function() {
		element.innerHTML = '<div id="test1" v-if="render"><b>123</b></div>';

		var vm = new MVVM(element, {
			'render': true
		});
		var data = vm.get();
		var div = element.querySelector('#test1');

		expect(div.innerHTML).toBe('<b>123</b>');

		data.render = false;
		expect(div.innerHTML).toBe('');

		data.render = true;
		expect(div.innerHTML).toBe('<b>123</b>');
	});


	it('normal no-render first', function() {
		element.innerHTML = '<div id="test2" v-if="render"><b>123</b></div>';

		var vm = new MVVM(element, {
			'render': false
		});
		var data = vm.get();
		var div = element.querySelector('#test2');

		expect(div.innerHTML).toBe('');

		data.render = true;
		expect(div.innerHTML).toBe('<b>123</b>');

		data.render = false;
		expect(div.innerHTML).toBe('');
	});


	it('render content contains directive and render first', function() {
		element.innerHTML =
			'<div id="test3" v-if="render">' +
				'<p>--{{ text }}--</p>' +
			'</div>'

		var vm = new MVVM(element, {
			'render': true,
			'text'  : 'aaa'
		});
		var data = vm.get();
		var div = element.querySelector('#test3');

		expect(div.innerHTML).toBe('<p>--aaa--</p>');

		data.text = 'bbb';
		expect(div.innerHTML).toBe('<p>--bbb--</p>');

		data.render = false;
		expect(div.innerHTML).toBe('');

		data.text = 'ccc';
		data.render = true;
		expect(div.innerHTML).toBe('<p>--ccc--</p>');

		data.text = 'ddd';
		expect(div.innerHTML).toBe('<p>--ddd--</p>');
	});


	it('render content contains directive and no-render first', function() {
		element.innerHTML =
			'<div id="test4" v-if="render">' +
				'<p>--{{ text }}--</p>' +
			'</div>'

		var vm = new MVVM(element, {
			'render': false,
			'text'  : 'aaa'
		});
		var data = vm.get();
		var div = element.querySelector('#test4');

		expect(div.innerHTML).toBe('');

		data.render = true;
		expect(div.innerHTML).toBe('<p>--aaa--</p>');

		data.text = 'bbb';
		expect(div.innerHTML).toBe('<p>--bbb--</p>');

		data.render = false;
		expect(div.innerHTML).toBe('');

		data.text = 'ccc';
		data.render = true;
		expect(div.innerHTML).toBe('<p>--ccc--</p>');

		data.text = 'ddd';
		expect(div.innerHTML).toBe('<p>--ddd--</p>');
	});


	it('with v-else block', function() {
		element.innerHTML =
			'<div id="ok" v-if="ok">' +
				'<i>OK</i>' +
			'</div>' +
			'<div id="notok" v-else>' +
				'<b>Not OK</b>' +
			'</div>'

		var vm = new MVVM(element, {
			'ok': true
		});
		var data = vm.get();
		var ok = element.querySelector('#ok');
		var notok = element.querySelector('#notok');

		expect(ok.innerHTML).toBe('<i>OK</i>');
		expect(notok.innerHTML).toBe('');

		data.ok = false;
		expect(ok.innerHTML).toBe('');
		expect(notok.innerHTML).toBe('<b>Not OK</b>');

		data.ok = true;
		expect(ok.innerHTML).toBe('<i>OK</i>');
		expect(notok.innerHTML).toBe('');
	});
});