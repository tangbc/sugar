import MVVM from 'mvvm';
import * as util from 'src/util';

describe('v-if >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('invalid use(on the root element)', function () {
		element.innerHTML = '<div v-if="render"></div>';

		new MVVM({
			view: element,
			model: {
				render: true
			}
		});

		expect(util.warn).toHaveBeenCalledWith('v-if cannot use in the root element!');
	});


	it('normal render first', function () {
		element.innerHTML =
			'<div>' +
				'<div id="test1" v-if="render"><b>123</b></div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				render: true
			}
		});
		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.innerHTML).toBe('<div id="test1"><b>123</b></div>');

		data.render = false;
		expect(warpper.innerHTML).toBe('');

		data.render = true;
		expect(warpper.innerHTML).toBe('<div id="test1"><b>123</b></div>');
	});


	it('normal no-render first', function () {
		element.innerHTML =
			'<div>' +
				'<div id="test2" v-if="render"><b>123</b></div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				render: false
			}
		});
		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.innerHTML).toBe('');

		data.render = true;
		expect(warpper.innerHTML).toBe('<div id="test2"><b>123</b></div>');

		data.render = false;
		expect(warpper.innerHTML).toBe('');
	});


	it('render content contains directive and render first', function () {
		element.innerHTML =
			'<div>' +
				'<div id="test3" v-if="render">' +
					'<p>--{{ text }}--</p>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				render: true,
				text: 'aaa'
			}
		});
		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.innerHTML).toBe('<div id="test3"><p>--aaa--</p></div>');

		data.text = 'bbb';
		expect(warpper.innerHTML).toBe('<div id="test3"><p>--bbb--</p></div>');

		data.render = false;
		expect(warpper.innerHTML).toBe('');

		data.text = 'ccc';
		data.render = true;
		expect(warpper.innerHTML).toBe('<div id="test3"><p>--ccc--</p></div>');

		data.text = 'ddd';
		expect(warpper.innerHTML).toBe('<div id="test3"><p>--ddd--</p></div>');
	});


	it('render content contains directive and no-render first', function () {
		element.innerHTML =
			'<div>' +
				'<div id="test4" v-if="render">' +
					'<p>--{{ text }}--</p>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				render: false,
				text: 'aaa'
			}
		});
		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.innerHTML).toBe('');

		data.render = true;
		expect(warpper.innerHTML).toBe('<div id="test4"><p>--aaa--</p></div>');

		data.text = 'bbb';
		expect(warpper.innerHTML).toBe('<div id="test4"><p>--bbb--</p></div>');

		data.render = false;
		expect(warpper.innerHTML).toBe('');

		data.text = 'ccc';
		data.render = true;
		expect(warpper.innerHTML).toBe('<div id="test4"><p>--ccc--</p></div>');

		data.text = 'ddd';
		expect(warpper.innerHTML).toBe('<div id="test4"><p>--ddd--</p></div>');
	});


	it('with v-else block', function () {
		element.innerHTML =
			'<div>' +
				'<div id="ok" v-if="ok">' +
					'<i>OK</i>' +
				'</div>' +
				'<div id="notok" v-else>' +
					'<b>Not OK</b>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				ok: true
			}
		});
		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.innerHTML).toBe('<div id="ok"><i>OK</i></div>');

		data.ok = false;
		expect(warpper.innerHTML).toBe('<div id="notok"><b>Not OK</b></div>');

		data.ok = true;
		expect(warpper.innerHTML).toBe('<div id="ok"><i>OK</i></div>');
	});


	it('with v-else block has text siblings', function () {
		element.innerHTML =
			'<div>' +
				'<div id="ok" v-if="ok">' +
					'<i>OK</i>' +
				'</div>' +
				'<!-- comments -->' +
				'<div id="notok" v-else>' +
					'<b>Not OK</b>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				ok: true
			}
		});
		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.innerHTML).toBe('<div id="ok"><i>OK</i></div><!-- comments -->');

		data.ok = false;
		expect(warpper.innerHTML).toBe('<!-- comments --><div id="notok"><b>Not OK</b></div>');

		data.ok = true;
		expect(warpper.innerHTML).toBe('<div id="ok"><i>OK</i></div><!-- comments -->');
	});


	it('nest v-if render all first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-if="out">' +
					'<a v-if="inA">{{ a }}</a>' +
					'<b v-if="inB">{{ b }}</b>' +
				'</div>' +
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
		let warpper = element.firstChild;

		// initial render result
		expect(warpper.textContent).toBe('aaabbb');

		// clear out
		data.out = false;
		expect(warpper.textContent).toBe('');

		// render out
		data.out = true;
		expect(warpper.textContent).toBe('aaabbb');

		// clear a
		data.inA = false;
		expect(warpper.textContent).toBe('bbb');
		// change b to test data reactive
		data.b = 'BBB';
		expect(warpper.textContent).toBe('BBB');

		// ignore a and clear out
		data.out = false;
		expect(warpper.textContent).toBe('');

		// render out, and a still be no-render
		data.out = true;
		expect(warpper.textContent).toBe('BBB');

		// now, change a and b, then render a
		data.a = 'AAA';
		data.b = '3B';
		data.inA = true;
		expect(warpper.textContent).toBe('AAA3B');

		// clear all of them
		data.inA = false;
		data.inB = false;
		data.out = false;
		expect(warpper.textContent).toBe('');

		// although render a and b, but out not render
		data.inA = true;
		data.inB = true;
		expect(warpper.textContent).toBe('');

		// until out is true only a & b should be rendered
		data.out = true;
		expect(warpper.textContent).toBe('AAA3B');
	});


	it('nest v-if no-render all first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-if="out">' +
					'<a v-if="inA">{{ a }}</a>' +
					'<b v-if="inB">{{ b }}</b>' +
				'</div>' +
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
		let warpper = element.firstChild;

		// initial render result
		expect(warpper.textContent).toBe('');

		// render out
		data.out = true;
		expect(warpper.textContent).toBe('');

		// render a
		data.inA = true;
		expect(warpper.textContent).toBe('aaa');
		// change a to test data reactive
		data.a = 'AAA';
		expect(warpper.textContent).toBe('AAA');

		// ignore b and clear out
		data.out = false;
		expect(warpper.textContent).toBe('');

		// render out, and b still be no-render
		data.out = true;
		expect(warpper.textContent).toBe('AAA');

		// now, change a and b, then render a
		data.a = 'aaa';
		data.b = 'BBB';
		data.inA = false;
		data.inB = true;
		expect(warpper.textContent).toBe('BBB');

		// clear all of them
		data.inA = false;
		data.inB = false;
		data.out = false;
		expect(warpper.textContent).toBe('');

		// although render a and b, but out not render
		data.inA = true;
		data.inB = true;
		expect(warpper.textContent).toBe('');

		// until out is true only a & b should be rendered
		data.out = true;
		expect(warpper.textContent).toBe('aaaBBB');
	});


	it('back-to-back v-if', function () {
		element.innerHTML =
			'<div>' +
				'<h1 v-if="showA">{{a}}</h1>' +
				'<h1 v-if="showB">{{b}}</h1>' +
				'<h1 v-if="showC">{{c}}</h1>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				a: 1,
				b: 2,
				c: 3,
				showA: true,
				showB: false,
				showC: true
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		expect(div.textContent).toBe('13');

		data.showB = true;
		expect(div.textContent).toBe('123');

		data.showA = false;
		expect(div.textContent).toBe('23');

		data.showC = false;
		expect(div.textContent).toBe('2');
	});


	it('back-to-back v-if has others siblings', function () {
		element.innerHTML =
			'<div>' +
				'-' +
				'<h1 v-if="showA">{{a}}</h1>' +
				'-' +
				'<h1 v-if="showB">{{b}}</h1>' +
				'-' +
				'<h1 v-if="showC">{{c}}</h1>' +
				'-' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				a: 1,
				b: 2,
				c: 3,
				showA: true,
				showB: false,
				showC: true
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		expect(div.textContent).toBe('-1--3-');

		data.showB = true;
		expect(div.textContent).toBe('-1-2-3-');

		data.showA = false;
		expect(div.textContent).toBe('--2-3-');

		data.showC = false;
		expect(div.textContent).toBe('--2--');
	});


	it('render content contains v-for and render first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-if="show">' +
					'<h1>{{ title }}-</h1>' +
					'<ul>' +
						'<li v-for="item in items">' +
							'{{ $index }}.{{ item }}_' +
						'</li>' +
					'</ul>' +
				'</div>' +
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
		let warpper = element.firstChild;

		expect(warpper.textContent).toBe('xxdk-0.a_1.b_2.c_');

		// change for array
		data.items.shift();
		expect(warpper.textContent).toBe('xxdk-0.b_1.c_');
		data.items.unshift('A');
		expect(warpper.textContent).toBe('xxdk-0.A_1.b_2.c_');

		// clear warpper
		data.show = false;
		expect(warpper.textContent).toBe('');

		// change for data, but will not has appearance
		data.title = 'txgc';
		data.items.push('D');
		expect(warpper.textContent).toBe('');

		// render warpper, and will refresh appearance
		data.show = true;
		expect(warpper.textContent).toBe('txgc-0.A_1.b_2.c_3.D_');
	});


	it('render content contains v-for and no-render first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-if="show">' +
					'<h1>{{ title }}-</h1>' +
					'<ul>' +
						'<li v-for="item in items">' +
							'{{ $index }}.{{ item }}_' +
						'</li>' +
					'</ul>' +
				'</div>' +
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
		let warpper = element.firstChild;

		expect(warpper.textContent).toBe('');

		data.show = true;
		expect(warpper.textContent).toBe('xxdk-0.a_1.b_2.c_');

		// change for array
		data.items.shift();
		expect(warpper.textContent).toBe('xxdk-0.b_1.c_');
		data.items.unshift('A');
		expect(warpper.textContent).toBe('xxdk-0.A_1.b_2.c_');

		// clear warpper
		data.show = false;
		expect(warpper.textContent).toBe('');

		// change for data, but will not has appearance
		data.title = 'txgc';
		data.items.push('D');
		expect(warpper.textContent).toBe('');

		// render warpper, and will refresh appearance
		data.show = true;
		expect(warpper.textContent).toBe('txgc-0.A_1.b_2.c_3.D_');
	});


	it('cannot use v-if and v-for on the same element', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items" v-if="show">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		new MVVM({
			view: element,
			model: {
				show: true,
				items: ['a', 'b', 'c']
			}
		});

		let msg = 'Do not use v-if and v-for on the same element! Consider filtering the source Array instead.';
		expect(util.warn).toHaveBeenCalledWith(msg);
	});


	it('has others siblings render first', function () {
		element.innerHTML =
			'<div>' +
				'<div>XX</div>' +
				'-' +
				'<div v-if="show">{{ title }}</div>' +
				'<div>OO</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: true,
				title: 'aaa'
			}
		});

		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.textContent).toBe('XX-aaaOO');

		data.title = 'bbb';
		expect(warpper.textContent).toBe('XX-bbbOO');

		data.show = false;
		expect(warpper.textContent).toBe('XX-OO');

		data.show = true;
		expect(warpper.textContent).toBe('XX-bbbOO');

		data.title = 'ccc';
		expect(warpper.textContent).toBe('XX-cccOO');
	});


	it('has others siblings no render first', function () {
		element.innerHTML =
			'<div>' +
				'<div>XX</div>' +
				'<div v-if="show">{{ title }}</div>' +
				'-' +
				'<div>OO</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: false,
				title: 'aaa'
			}
		});

		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.textContent).toBe('XX-OO');

		data.show = true;
		expect(warpper.textContent).toBe('XXaaa-OO');

		data.title = 'bbb';
		expect(warpper.textContent).toBe('XXbbb-OO');

		data.show = false;
		expect(warpper.textContent).toBe('XX-OO');

		data.show = true;
		expect(warpper.textContent).toBe('XXbbb-OO');

		data.title = 'ccc';
		expect(warpper.textContent).toBe('XXccc-OO');
	});


	it('has v-else and others siblings render first', function () {
		element.innerHTML =
			'<div>' +
				'<div>XX</div>' +
				'-' +
				'<div v-if="show">{{ title }}</div>' +
				'<div v-else>{{ desc }}</div>' +
				'<div>OO</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: true,
				title: 'aaa',
				desc: 'AAA'
			}
		});

		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.textContent).toBe('XX-aaaOO');

		data.title = 'bbb';
		expect(warpper.textContent).toBe('XX-bbbOO');

		data.show = false;
		expect(warpper.textContent).toBe('XX-AAAOO');

		data.desc = 'BBB';
		expect(warpper.textContent).toBe('XX-BBBOO');

		data.show = true;
		expect(warpper.textContent).toBe('XX-bbbOO');

		data.title = 'ccc';
		expect(warpper.textContent).toBe('XX-cccOO');
	});


	it('has v-else and others siblings no render first', function () {
		element.innerHTML =
			'<div>' +
				'<div>XX</div>' +
				'<div v-if="show">{{ title }}</div>' +
				'<div v-else>{{ desc }}</div>' +
				'-' +
				'<div>OO</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: false,
				title: 'aaa',
				desc: 'AAA'
			}
		});

		let data = vm.$data;
		let warpper = element.firstChild;

		expect(warpper.textContent).toBe('XXAAA-OO');

		data.desc = 'BBB';
		expect(warpper.textContent).toBe('XXBBB-OO');

		data.show = true;
		expect(warpper.textContent).toBe('XXaaa-OO');

		data.title = 'bbb';
		expect(warpper.textContent).toBe('XXbbb-OO');

		data.show = false;
		expect(warpper.textContent).toBe('XXBBB-OO');

		data.desc = 'CCC';
		expect(warpper.textContent).toBe('XXCCC-OO');
	});
});