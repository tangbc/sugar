import MVVM from 'mvvm';
import * as dom from 'src/dom';
import * as util from 'src/util';
import { equalClass } from '../../../test_util';

describe('v-bind >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('test equalClass', function () {
		expect(equalClass('a', 'a b')).toBeFalsy();
		expect(equalClass('a c', 'a b')).toBeFalsy();

		expect(equalClass('a', 'a')).toBeTruthy();
		expect(equalClass('a b', 'b a')).toBeTruthy();
		expect(equalClass('a b c', 'c b a')).toBeTruthy();
		expect(equalClass('a b c def ghi', 'def b ghi a c')).toBeTruthy();
	});


	it('class single', function () {
		element.innerHTML = '<div v-bind:class="cls"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				cls: ''
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(dom.hasAttr(div, 'class')).toBe(false);

		data.cls = 'classA';
		expect(div.className).toBe('classA');
		expect(dom.hasClass(div, 'classA')).toBe(true);

		// remove class
		data.cls = '';
		expect(div.className).toBe('');
		expect(dom.hasAttr(div, 'class')).toBe(false);

		// add new class and will remove old class
		data.cls = 'classB';
		expect(div.className).toBe('classB');
		expect(dom.hasClass(div, 'classA')).toBe(false);
	});


	it('class single with static', function () {
		element.innerHTML = '<div class="static1 static2" v-bind:class="cls"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				cls: 'xxdk'
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(equalClass(div.className, 'static1 static2 xxdk')).toBe(true);

		data.cls = 'txgc';
		expect(equalClass(div.className, 'static1 static2 txgc')).toBe(true);

		data.cls = '';
		expect(equalClass(div.className, 'static1 static2')).toBe(true);
	});


	it('class array', function () {
		element.innerHTML = '<div class="static1" v-bind:class="[cls1, cls2, \'static2\']"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				cls1: 'aaa',
				cls2: 'bbb'
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(equalClass(div.className, 'static1 aaa bbb static2')).toBe(true);

		data.cls1 = 'AAA';
		data.cls2 = 'BBB';
		expect(equalClass(div.className, 'static1 AAA BBB static2')).toBe(true);

		data.cls1 = '';
		data.cls2 = '';
		expect(equalClass(div.className, 'static1 static2')).toBe(true);
	});


	it('class object', function () {
		element.innerHTML = '<div v-bind:class="obj"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				obj: {
					aaa: true,
					bbb: false,
					ccc: true
				}
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(equalClass(div.className, 'aaa ccc')).toBe(true);

		data.obj.bbb = true;
		data.obj.ccc = false;
		expect(equalClass(div.className, 'aaa bbb')).toBe(true);

		// cover obj
		data.obj = {
			ddd: true,
			eee: true,
			fff: false
		}
		expect(equalClass(div.className, 'ddd eee')).toBe(true);

		data.obj.fff = true;
		data.obj.ddd = false;
		data.obj.eee = false;
		expect(equalClass(div.className, 'fff')).toBe(true);
	});


	it('class json', function () {
		element.innerHTML = '<div v-bind:class="{classA: isA, classB: isB}"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				isA: true,
				isB: false,
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(equalClass(div.className, 'classA')).toBe(true);

		data.isB = true;
		expect(equalClass(div.className, 'classA classB')).toBe(true);

		data.isA = false;
		data.isB = false;
		expect(div.className).toBe('');
		expect(dom.hasAttr(div, 'class')).toBe(false);
	});


	it('class in v-for and cross scope', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span v-bind:class="{classA: item.hasA, classG: hasG}"></span>' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				hasG: true,
				items: [
					{ hasA: true },
					{ hasA: false },
					{ hasA: true }
				]
			}
		});
		let data = vm.$data;
		let els = element.querySelectorAll('span');

		expect(equalClass(els[0].className, 'classA classG')).toBe(true);
		expect(equalClass(els[1].className, 'classG')).toBe(true);
		expect(equalClass(els[2].className, 'classA classG')).toBe(true);

		// change for outside
		data.hasG = false;
		expect(equalClass(els[0].className, 'classA')).toBe(true);
		expect(equalClass(els[1].className, '')).toBe(true);
		expect(equalClass(els[2].className, 'classA')).toBe(true);

		// change for inside
		data.items[1].hasA = true;
		expect(equalClass(els[1].className, 'classA')).toBe(true);

		data.hasG = true;
		expect(equalClass(els[0].className, 'classA classG')).toBe(true);
		expect(equalClass(els[1].className, 'classA classG')).toBe(true);
		expect(equalClass(els[2].className, 'classA classG')).toBe(true);
	});


	it('style object', function () {
		element.innerHTML = '<div v-bind:style="obj"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				obj: {
					'color': 'red',
					'margin-top': '10px'
				}
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(div.style.color).toBe('red');
		expect(div.style.marginTop).toBe('10px');

		data.obj.color = 'black';
		expect(div.style.color).toBe('black');

		data.obj['margin-top'] = '15px';
		expect(div.style.marginTop).toBe('15px');

		// cover obj
		data.obj = {
			'border': '1px solid red',
			'font-size': '15px'
		}
		// should remove old style
		expect(div.style.color).toBe('');
		expect(div.style.marginTop).toBe('');
		// should add new style
		expect(div.style.border).toBe('1px solid red');
		expect(div.style.fontSize).toBe('15px');

		data.obj['font-size'] = '24px';
		expect(div.style.fontSize).toBe('24px');
	});


	it('style with invalid data type', function () {
		element.innerHTML = '<div v-bind:style="obj"></div>';

		new MVVM({
			view: element,
			model: {
				obj: 'color: red'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('v-bind for style must be a type of Object', 'color: red');
	});


	it('style json', function () {
		element.innerHTML = '<div v-bind:style="{color: color, \'font-size\': size}"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				color: 'red',
				size: '12px'
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(div.style.color).toBe('red');
		expect(div.style.fontSize).toBe('12px');

		data.color = 'green';
		expect(div.style.color).toBe('green');

		data.size = '111px';
		expect(div.style.fontSize).toBe('111px');
	});


	it('style in v-for and cross scope', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span v-bind:style="{color: item.color, margin: margin}"></span>' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				margin: '10px',
				items: [
					{ color: 'red' },
					{ color: 'green' },
					{ color: 'blue' }
				]
			}
		});
		let data = vm.$data;
		let els = element.querySelectorAll('span');

		expect(els[0].style.color).toBe('red');
		expect(els[0].style.margin).toBe('10px');
		expect(els[1].style.color).toBe('green');
		expect(els[1].style.margin).toBe('10px');
		expect(els[2].style.color).toBe('blue');
		expect(els[2].style.margin).toBe('10px');

		// will change all margin
		data.margin = '50px';
		expect(els[0].style.margin).toBe('50px');
		expect(els[1].style.margin).toBe('50px');
		expect(els[2].style.margin).toBe('50px');

		data.items[0].color = 'yellow';
		expect(els[0].style.color).toBe('yellow');

		data.items[2].color = 'gray';
		expect(els[2].style.color).toBe('gray');
	});


	it('attribute normal', function () {
		element.innerHTML = '<div v-bind:id="vid"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'xxdk'
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');

		data.vid = 'txgc';
		expect(dom.getAttr(div, 'id')).toBe('txgc');

		// set as null to remove
		data.vid = null;
		expect(dom.hasAttr(div, 'id')).toBe(false);
	});


	it('attribute json', function () {
		element.innerHTML = '<div v-bind="{id: vid, \'data-type\': dtype}"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'xxdk',
				dtype: 'aaa'
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');
		expect(dom.getAttr(div, 'data-type')).toBe('aaa');

		data.vid = 'txgc';
		expect(dom.getAttr(div, 'id')).toBe('txgc');

		data.dtype = 'bbb';
		expect(dom.getAttr(div, 'data-type')).toBe('bbb');
	});


	it('attribute and classObject and styleObject', function () {
		element.innerHTML =
			'<div v-bind="{id: vid, class: clsObj, style: styObj}"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'xxdk',
				clsObj: {
					classA: true,
					classB: true
				},
				styObj: {
					'color': 'red',
					'font-size': '13px'
				}
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');
		expect(div.className).toBe('classA classB');
		expect(div.style.color).toBe('red');
		expect(div.style.fontSize).toBe('13px');

		data.vid = 'txgc';
		expect(dom.getAttr(div, 'id')).toBe('txgc');

		data.styObj.color = 'green';
		expect(div.style.color).toBe('green');

		data.clsObj.classB = false;
		expect(div.className).toBe('classA');

		// cover
		data.styObj = { 'margin-top': '15px' };
		expect(div.style.color).toBe('');
		expect(div.style.fontSize).toBe('');
		expect(div.style.marginTop).toBe('15px');

		data.styObj['margin-top'] = '50px';
		expect(div.style.marginTop).toBe('50px');

		data.clsObj = { aaa: true, bbb: false };
		expect(div.className).toBe('aaa');

		data.clsObj.bbb = true;
		expect(div.className).toBe('aaa bbb');
	});


	it('attribute and classArray', function () {
		element.innerHTML = '<div v-bind="{id: vid, class: [cls1, cls2]}"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'xxdk',
				cls1: 'aaa',
				cls2: 'bbb'
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');
		expect(div.className).toBe('aaa bbb');

		data.cls1 = 'xxdk';
		expect(equalClass(div.className, 'xxdk bbb')).toBe(true);

		data.cls2 = '';
		expect(div.className).toBe('xxdk');
	});


	it('attribute has no value', function () {
		element.innerHTML = '<input v-bind:disabled="dis">';

		let vm = new MVVM({
			view: element,
			model: {
				dis: true
			}
		});
		let data = vm.$data;
		let div = element.childNodes[0];

		expect(dom.hasAttr(div, 'disabled')).toBe(true);

		// change data
		data.dis = false;
		expect(dom.hasAttr(div, 'disabled')).toBe(false);
	});


	it('attribute in v-for and cross scope', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span v-bind="{id: item.id, \'data-type\': type}"></span>' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				type: 'xxdk',
				items: [
					{ id: 'aaa' },
					{ id: 'bbb' },
					{ id: 'ccc' }
				]
			}
		});
		let data = vm.$data;
		let els = element.querySelectorAll('span');

		expect(dom.getAttr(els[0], 'id')).toBe('aaa');
		expect(dom.getAttr(els[0], 'data-type')).toBe('xxdk');
		expect(dom.getAttr(els[1], 'id')).toBe('bbb');
		expect(dom.getAttr(els[1], 'data-type')).toBe('xxdk');
		expect(dom.getAttr(els[2], 'id')).toBe('ccc');
		expect(dom.getAttr(els[2], 'data-type')).toBe('xxdk');

		// will change all data-type
		data.type = 'txgc';
		expect(dom.getAttr(els[0], 'data-type')).toBe('txgc');
		expect(dom.getAttr(els[1], 'data-type')).toBe('txgc');
		expect(dom.getAttr(els[2], 'data-type')).toBe('txgc');

		data.items[0].id = 'AAA';
		expect(dom.getAttr(els[0], 'id')).toBe('AAA');

		data.items[1].id = 'BBB';
		expect(dom.getAttr(els[1], 'id')).toBe('BBB');
	});
});