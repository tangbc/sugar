import MVVM from 'mvvm';
import {
	setSelect,
	equalClass,
	triggerEvent
} from '../../../test_util';

describe('v-once >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('normal', function () {
		element.innerHTML =
			'<h1>{{ title }}</h1>' +
			'<h1 v-once>{{ title }}</h1>'

		let vm = new MVVM({
			view: element,
			model: {
				title: 'xxdk'
			}
		});

		let data = vm.$data;

		let noOnce = element.childNodes[0];
		let hasOnce = element.childNodes[1];

		// just one directive instance
		expect(vm.__vm__.$directives.length).toBe(1);

		expect(noOnce.textContent).toBe('xxdk');
		expect(hasOnce.textContent).toBe('xxdk');

		// v-once childNodes have no data-reactive
		data.title = 'txgc';
		expect(noOnce.textContent).toBe('txgc');
		expect(hasOnce.textContent).toBe('xxdk');
	});


	it('with v-for', function () {
		element.innerHTML =
			'<ul v-once>' +
				'<li v-for="item in items">{{ item }}</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: ['a', 'b', 'c']
			}
		});

		let data = vm.$data;

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(element.textContent).toBe('abc');

		data.items.push('d');
		expect(element.textContent).toBe('abc');

		data.items.splice(1, 1);
		expect(element.textContent).toBe('abc');

		data.items = ['n', 'b', 'a'];
		expect(element.textContent).toBe('abc');
	});


	it('with v-if render first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-once v-if="show">' +
					'<span>{{ title }}</span>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: true,
				title: 'xxdk'
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(div.textContent).toBe('xxdk');

		data.show = false;
		expect(div.textContent).toBe('xxdk');

		data.title = 'txgc';
		expect(div.textContent).toBe('xxdk');
	});


	it('with v-if no-render first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-once v-if="show">' +
					'<span>{{ title }}</span>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: false,
				title: 'xxdk'
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(div.textContent).toBe('');

		data.show = true;
		expect(div.textContent).toBe('');
	});


	it('with v-pre', function () {
		element.innerHTML =
			'<div v-once v-pre>' +
				'<span>{{ title }}</span>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				title: 'xxdk'
			}
		});

		let div = element.firstChild;

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(div.textContent).toBe('{{ title }}');
	});


	it('with v-on', function () {
		element.innerHTML =
			'<h1 v-once v-on:click="click1">test</h1>' +
			'<div v-once>' +
				'<h2 v-on:click="click2(title)">test</h2>' +
			'</div>'

		let flag1, flag2;

		let vm = new MVVM({
			view: element,
			model: {
				title: 'xxdk',
				click1: function () {
					flag1 = 123;
				},
				click2: function (title) {
					flag2 = title;
				}
			}
		});

		let data = vm.$data;
		let h1 = element.querySelector('h1');
		let h2 = element.querySelector('h2');

		expect(vm.__vm__.$directives.length).toBe(0);

		triggerEvent(h1, 'click');
		expect(flag1).toBe(123);

		triggerEvent(h2, 'click');
		expect(flag2).toBe('xxdk');

		// when used v-once, change callback or arguments will not effect
		data.click1 = function () {
			flag1 = 222;
		}
		triggerEvent(h1, 'click');
		expect(flag1).toBe(123);

		data.title = 'txgc';
		triggerEvent(h2, 'click');
		expect(flag2).toBe('xxdk');
	});


	it('with v-model', function () {
		element.innerHTML =
			'<div v-once>' +
				'<input type="text" v-model="text">' +
				'<input type="radio" value="1" v-model="radio" name="rd">' +
				'<input type="radio" value="2" v-model="radio" name="rd">' +
				'<input type="checkbox" value="1" v-model="checkbox">' +
				'<input type="checkbox" value="2" v-model="checkbox">' +
				'<select v-model="select">' +
					'<option>a</option>' +
					'<option>b</option>' +
					'<option>c</option>' +
				'</select>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				text: 'text',
				radio: '1',
				checkbox: ['1', '2'],
				select: 'b'
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		let text = div.childNodes[0];
		let radio1 = div.childNodes[1];
		let radio2 = div.childNodes[2];
		let checkbox1 = div.childNodes[3];
		let checkbox2 = div.childNodes[4];
		let select = div.childNodes[5];

		expect(vm.__vm__.$directives.length).toBe(0);

		// two-way data-binding will not effect
		// text
		text.value = 'aaaa';
		triggerEvent(text, 'change');
		expect(data.text).toBe('text');

		data.text = 'bbbb';
		expect(text.value).toBe('aaaa'); // data not change

		// radio
		expect(radio1.checked).toBe(true);
		expect(radio2.checked).toBe(false);

		radio2.click();
		expect(radio1.checked).toBe(false);
		expect(radio2.checked).toBe(true);

		expect(data.radio).toBe('1'); // data not change

		// checkbox
		expect(checkbox1.checked).toBe(true);
		expect(checkbox2.checked).toBe(true);

		checkbox1.click();
		checkbox2.click();
		expect(checkbox1.checked).toBe(false);
		expect(checkbox2.checked).toBe(false);

		expect(data.checkbox).toEqual(['1', '2']); // data not change

		// select
		expect(select.value).toBe('b');

		setSelect(select, 'c');
		expect(select.value).toBe('c');

		triggerEvent(select, 'change');
		expect(data.select).toBe('b'); // data not change
	});


	it('with v-bind', function () {
		element.innerHTML =
			'<div v-once>' +
				'<h1 v-bind:id="vid">123</h1>' +
				'<h2 v-bind:class="cls">123</h2>' +
				'<h3 v-bind:class="[clsa, clsb]">123</h3>' +
				'<h4 v-bind:class="clsObj">123</h4>' +
				'<h5 v-bind:class="{aaa: isA, bbb: isB}">123</h5>' +
				'<h6 v-bind:style="{border: vborder, color: vcolor}">123</h6>' +
				'<b v-bind:style="styObj">123</b>' +
				'<span v-bind="{\'data-id\': did, class: vbCls, style: vbStyObj}">123</span>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				vid: '123',
				cls: 'xxdk',
				clsa: 'aaa',
				clsb: 'bbb',
				clsObj: { ccc: true, ddd: false },
				isA: true,
				isB: false,
				vborder: '1px solid red',
				vcolor: 'red',
				styObj: { margin: '10px', padding: '10px' },
				did: '456',
				vbCls: 'txgc',
				vbStyObj: { width: '100px', height: '100px' }
			}
		});

		let data = vm.$data;
		let div = element.firstChild;

		let h1 = div.childNodes[0];
		let h2 = div.childNodes[1];
		let h3 = div.childNodes[2];
		let h4 = div.childNodes[3];
		let h5 = div.childNodes[4];
		let h6 = div.childNodes[5];
		let b = div.childNodes[6];
		let span = div.childNodes[7];

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(h1.getAttribute('id')).toBe('123');
		data.vid = '321';
		expect(h1.getAttribute('id')).toBe('123');

		expect(h2.className).toBe('xxdk');
		data.cls = 'ffffff';
		expect(h2.className).toBe('xxdk');

		expect(equalClass(h3.className, 'aaa bbb')).toBe(true);
		data.clsa = 'x';
		data.clsb = 'o';
		expect(equalClass(h3.className, 'aaa bbb')).toBe(true);

		expect(h4.className).toBe('ccc');
		data.clsObj.ccc = false;
		data.clsObj.ddd = true;
		expect(h4.className).toBe('ccc');

		expect(h5.className).toBe('aaa');
		data.isA = false;
		data.isB = true;
		expect(h5.className).toBe('aaa');

		expect(h6.style.border).toBe('1px solid red');
		expect(h6.style.color).toBe('red');
		data.vborder = '20px solid blue';
		data.vcolor = 'blue';
		expect(h6.style.border).toBe('1px solid red');
		expect(h6.style.color).toBe('red');

		expect(b.style.margin).toBe('10px');
		expect(b.style.padding).toBe('10px');
		data.styObj.margin = '1000px';
		data.styObj.padding = '1000px';
		expect(b.style.margin).toBe('10px');
		expect(b.style.padding).toBe('10px');

		expect(span.getAttribute('data-id')).toBe('456');
		expect(span.className).toBe('txgc');
		expect(span.style.width).toBe('100px');
		expect(span.style.height).toBe('100px');
		data.did = '6666';
		data.vbCls = 'lllll';
		data.vbStyObj.width = '1000px';
		data.vbStyObj.height = '1000px';
		expect(span.getAttribute('data-id')).toBe('456');
		expect(span.className).toBe('txgc');
		expect(span.style.width).toBe('100px');
		expect(span.style.height).toBe('100px');
	});


	it('with v-custom', function () {
		element.innerHTML =
			'<h1 v-once v-custom:xxdk="title1"></h1>' +
			'<div v-once>' +
				'<h2 v-custom:xxdk="title2"></h2>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				title1: '111',
				title2: '222'
			},
			customs: {
				xxdk: function (text) {
					this.el.textContent = '<'+ text +'>';
				}
			}
		});

		let data = vm.$data;
		let h1 = element.querySelector('h1');
		let h2 = element.querySelector('h2');

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(h1.textContent).toBe('<111>');
		expect(h2.textContent).toBe('<222>');

		data.title1 = 'aaaa';
		data.title2 = 'bbbb';

		expect(h1.textContent).toBe('<111>');
		expect(h2.textContent).toBe('<222>');
	});


	it('with rest directives', function () {
		element.innerHTML =
			'<div v-once>' +
				'<h1 v-show="show"></h1>' +
				'<!-- This is comment -->' +
				'<h2 v-else></h2>' +
				'<h3 v-html="html"></h3>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				show: false,
				html: '<b>123</b>'
			}
		});

		let data = vm.$data;
		let h1 = element.querySelector('h1');
		let h2 = element.querySelector('h2');
		let h3 = element.querySelector('h3');

		expect(vm.__vm__.$directives.length).toBe(0);

		expect(h1.style.display).toBe('none');
		expect(h2.style.display).toBe('');
		expect(h3.innerHTML).toBe('<b>123</b>');

		data.show = true;
		data.html = '<span>321</span>';

		expect(h1.style.display).toBe('none');
		expect(h2.style.display).toBe('');
		expect(h3.innerHTML).toBe('<b>123</b>');
	});
});