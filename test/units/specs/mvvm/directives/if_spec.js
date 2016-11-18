import MVVM from 'mvvm';

describe('v-if >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('normal render first', function () {
		element.innerHTML = '<div id="test1" v-if="render"><b>123</b></div>';

		let vm = new MVVM({
			view: element,
			model: {
				render: true
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test1');

		expect(div.innerHTML).toBe('<b>123</b>');

		data.render = false;
		expect(div.innerHTML).toBe('');

		data.render = true;
		expect(div.innerHTML).toBe('<b>123</b>');
	});


	it('normal no-render first', function () {
		element.innerHTML = '<div id="test2" v-if="render"><b>123</b></div>';

		let vm = new MVVM({
			view: element,
			model: {
				render: false
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test2');

		expect(div.innerHTML).toBe('');

		data.render = true;
		expect(div.innerHTML).toBe('<b>123</b>');

		data.render = false;
		expect(div.innerHTML).toBe('');
	});


	it('render content contains directive and render first', function () {
		element.innerHTML =
			'<div id="test3" v-if="render">' +
				'<p>--{{ text }}--</p>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				render: true,
				text: 'aaa'
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test3');

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


	it('render content contains directive and no-render first', function () {
		element.innerHTML =
			'<div id="test4" v-if="render">' +
				'<p>--{{ text }}--</p>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				render: false,
				text: 'aaa'
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test4');

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


	it('with v-else block', function () {
		element.innerHTML =
			'<div id="ok" v-if="ok">' +
				'<i>OK</i>' +
			'</div>' +
			'<div id="notok" v-else>' +
				'<b>Not OK</b>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				ok: true
			}
		});
		let data = vm.$data;
		let ok = element.querySelector('#ok');
		let notok = element.querySelector('#notok');

		expect(ok.innerHTML).toBe('<i>OK</i>');
		expect(notok.innerHTML).toBe('');

		data.ok = false;
		expect(ok.innerHTML).toBe('');
		expect(notok.innerHTML).toBe('<b>Not OK</b>');

		data.ok = true;
		expect(ok.innerHTML).toBe('<i>OK</i>');
		expect(notok.innerHTML).toBe('');
	});


	it('nest v-if render all first', function () {
		element.innerHTML =
			'<div v-if="out">' +
				'<a v-if="inA">{{ a }}</a>' +
				'<b v-if="inB">{{ b }}</b>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				out: true,
				inA: true,
				inB: true,
				a: 'aaa',
				b: 'bbb'
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		// initial render result
		expect(div.textContent).toBe('aaabbb');

		// clear out
		data.out = false;
		expect(div.textContent).toBe('');

		// render out
		data.out = true;
		expect(div.textContent).toBe('aaabbb');

		// clear a
		data.inA = false;
		expect(div.textContent).toBe('bbb');
		// change b to test data reactive
		data.b = 'BBB';
		expect(div.textContent).toBe('BBB');

		// ignore a and clear out
		data.out = false;
		expect(div.textContent).toBe('');

		// render out, and a still be no-render
		data.out = true;
		expect(div.textContent).toBe('BBB');

		// now, change a and b, then render a
		data.a = 'AAA';
		data.b = '3B';
		data.inA = true;
		expect(div.textContent).toBe('AAA3B');

		// clear all of them
		data.inA = false;
		data.inB = false;
		data.out = false;
		expect(div.textContent).toBe('');

		// although render a and b, but out not render
		data.inA = true;
		data.inB = true;
		expect(div.textContent).toBe('');

		// until out is true only a & b should be rendered
		data.out = true;
		expect(div.textContent).toBe('AAA3B');
	});


	it('nest v-if no-render all first', function () {
		element.innerHTML =
			'<div v-if="out">' +
				'<a v-if="inA">{{ a }}</a>' +
				'<b v-if="inB">{{ b }}</b>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				out: false,
				inA: false,
				inB: false,
				a: 'aaa',
				b: 'bbb'
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		// initial render result
		expect(div.textContent).toBe('');

		// render out
		data.out = true;
		expect(div.textContent).toBe('');

		// render a
		data.inA = true;
		expect(div.textContent).toBe('aaa');
		// change a to test data reactive
		data.a = 'AAA';
		expect(div.textContent).toBe('AAA');

		// ignore b and clear out
		data.out = false;
		expect(div.textContent).toBe('');

		// render out, and b still be no-render
		data.out = true;
		expect(div.textContent).toBe('AAA');

		// now, change a and b, then render a
		data.a = 'aaa';
		data.b = 'BBB';
		data.inA = false;
		data.inB = true;
		expect(div.textContent).toBe('BBB');

		// clear all of them
		data.inA = false;
		data.inB = false;
		data.out = false;
		expect(div.textContent).toBe('');

		// although render a and b, but out not render
		data.inA = true;
		data.inB = true;
		expect(div.textContent).toBe('');

		// until out is true only a & b should be rendered
		data.out = true;
		expect(div.textContent).toBe('aaaBBB');
	});


	it('render content contains v-for and render first', function () {
		element.innerHTML =
			'<div v-if="show">' +
				'<h1>{{ title }}-</h1>' +
				'<ul>' +
					'<li v-for="item in items">' +
						'{{ $index }}.{{ item }}_' +
					'</li>' +
				'</ul>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: true,
				title: 'xxdk',
				items: ['a', 'b', 'c']
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		expect(div.textContent).toBe('xxdk-0.a_1.b_2.c_');

		// change for array
		data.items.shift();
		expect(div.textContent).toBe('xxdk-0.b_1.c_');
		data.items.unshift('A');
		expect(div.textContent).toBe('xxdk-0.A_1.b_2.c_');

		// clear div
		data.show = false;
		expect(div.textContent).toBe('');

		// change for data, but will not has appearance
		data.title = 'txgc';
		data.items.push('D');
		expect(div.textContent).toBe('');

		// render div, and will refresh appearance
		data.show = true;
		expect(div.textContent).toBe('txgc-0.A_1.b_2.c_3.D_');
	});


	it('render content contains v-for and no-render first', function () {
		element.innerHTML =
			'<div v-if="show">' +
				'<h1>{{ title }}-</h1>' +
				'<ul>' +
					'<li v-for="item in items">' +
						'{{ $index }}.{{ item }}_' +
					'</li>' +
				'</ul>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: false,
				title: 'xxdk',
				items: ['a', 'b', 'c']
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		expect(div.textContent).toBe('');

		data.show = true;
		expect(div.textContent).toBe('xxdk-0.a_1.b_2.c_');

		// change for array
		data.items.shift();
		expect(div.textContent).toBe('xxdk-0.b_1.c_');
		data.items.unshift('A');
		expect(div.textContent).toBe('xxdk-0.A_1.b_2.c_');

		// clear div
		data.show = false;
		expect(div.textContent).toBe('');

		// change for data, but will not has appearance
		data.title = 'txgc';
		data.items.push('D');
		expect(div.textContent).toBe('');

		// render div, and will refresh appearance
		data.show = true;
		expect(div.textContent).toBe('txgc-0.A_1.b_2.c_3.D_');
	});


	it('with equal level v-for and render first', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items" v-if="show">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				show: true,
				items: ['a', 'b', 'c']
			}
		});

		let data = vm.$data;
		let ul = element.firstChild;

		expect(ul.textContent).toBe('abc');

		data.show = false;
		expect(ul.textContent).toBe('');

		// change data
		data.items.push('d');
		data.items.$set(1, 'B');
		expect(data.items).toEqual(['a', 'B', 'c', 'd']);
		expect(ul.textContent).toBe('');

		data.show = true;
		expect(ul.textContent).toBe('aBcd');

		data.items.$set(1, 'b');
		expect(ul.textContent).toBe('abcd');
	});


	it('with equal level v-for and no render first', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items" v-if="show">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				show: false,
				items: ['a', 'b', 'c']
			}
		});

		let data = vm.$data;
		let ul = element.firstChild;

		expect(ul.textContent).toBe('');

		data.show = true;
		expect(ul.textContent).toBe('abc');

		// change data
		data.items.push('d');
		data.items.$set(1, 'B');
		expect(data.items).toEqual(['a', 'B', 'c', 'd']);
		expect(ul.textContent).toBe('aBcd');

		data.show = false;
		expect(ul.textContent).toBe('');

		data.items.$set(1, 'b');
		expect(ul.textContent).toBe('');

		data.show = true;
		expect(ul.textContent).toBe('abcd');
	});
});