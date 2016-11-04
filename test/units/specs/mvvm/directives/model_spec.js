import MVVM from 'mvvm';
import * as util from 'src/util';
import {
	setSelect,
	triggerEvent
} from '../../../test_util';

describe('v-model >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('use on invalid element', function () {
		element.innerHTML = '<div v-model="model"></div>';

		new MVVM({
			view: element,
			model: {
				model: 'xxxxxxxx'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('v-model only for using in input, select, textarea');
	});


	it('use incorrect form-type', function () {
		element.innerHTML = '<input v-model="model">'; // miss type="text"

		new MVVM({
			view: element,
			model: {
				model: 'xxxxxxxx'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('Do not use incorrect form-type with v-model: ', element.firstChild);
	});


	it('use dynamic expression', function () {
		element.innerHTML = '<input type="text" v-model="isA ? aaa : bbb">';

		new MVVM({
			view: element,
			model: {}
		});

		expect(util.warn).toHaveBeenCalledWith('v-model directive value can be use by static expression');
	});


	it('text and textarea', function () {
		element.innerHTML =
			'<input id="text" type="text" v-model="test">' +
			'<textarea id="area" v-model="test"></textarea>'

		let vm = new MVVM({
			view: element,
			model: {
				test: 'abc'
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');
		let area = element.querySelector('#area');

		expect(text.value).toBe('abc');
		expect(area.value).toBe('abc');

		data.test = 'cba';
		expect(text.value).toBe('cba');
		expect(area.value).toBe('cba');

		// mock text for input
		text.value = 'd';
		triggerEvent(text, 'input');
		expect(text.value).toBe('d');
		expect(area.value).toBe('d');
		expect(data.test).toBe('d');

		// mock textarea for input
		area.value = 'e';
		triggerEvent(area, 'input');
		expect(text.value).toBe('e');
		expect(area.value).toBe('e');
		expect(data.test).toBe('e');

		// mock text for change (blur)
		text.value = 'fff';
		triggerEvent(text, 'change');
		expect(text.value).toBe('fff');
		expect(area.value).toBe('fff');
		expect(data.test).toBe('fff');
	});


	it('text change and blur event', function () {
		element.innerHTML = '<input id="text" type="text" v-model="test">';

		let vm = new MVVM({
			view: element,
			model: {
				test: 'abc'
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');

		text.value = 'xxdk';
		triggerEvent(text, 'change');
		expect(data.test).toBe('xxdk');

		text.value = 'txgc';
		triggerEvent(text, 'blur');
		expect(data.test).toBe('txgc');
	});


	it('text unLetter input composition event', function () {
		element.innerHTML = '<input id="text" type="text" v-model="test">';

		let vm = new MVVM({
			view: element,
			model: {
				test: 'abc'
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');

		// composition lock and should not set data
		triggerEvent(text, 'compositionstart');
		text.value = 'cba';
		triggerEvent(text, 'input');
		expect(data.test).toBe('abc');

		// should be work fine after unlock (compositionend)
		triggerEvent(text, 'compositionend');
		triggerEvent(text, 'input');
		expect(data.test).toBe('cba');
	});


	it('text use lazy param', function () {
		element.innerHTML = '<input id="text" type="text" v-model="test" lazy>';

		let vm = new MVVM({
			view: element,
			model: {
				test: ''
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');

		// mock for text input(lazy update data)
		text.value = 'a';
		triggerEvent(text, 'input');
		expect(text.value).toBe('a');
		// the `change` event has not been called, so data will not change that time
		expect(data.test).toBe('');

		// call `change` to update data
		triggerEvent(text, 'change');
		expect(data.test).toBe('a');

		text.value = 'ab';
		triggerEvent(text, 'change');
		expect(data.test).toBe('ab');

		// try input again
		text.value = 'abc';
		triggerEvent(text, 'input');
		expect(text.value).toBe('abc');
		expect(data.test).toBe('ab');

		triggerEvent(text, 'change');
		expect(data.test).toBe('abc');
	});


	it('text use debounce param', function (done) {
		element.innerHTML = '<input id="text" type="text" v-model="test" debounce="300">';

		let vm = new MVVM({
			view: element,
			model: {
				test: ''
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');

		text.value = 'a';
		triggerEvent(text, 'input');
		expect(data.test).toBe('');
		setTimeout(function () {
			expect(data.test).toBe('');
		}, 290);
		setTimeout(function () {
			expect(data.test).toBe('a');
			done();
		}, 310);
	});


	it('text use trim param', function () {
		element.innerHTML =
			'<pre id="noTrim">-{{ test1 }}-</pre>' +
			'<input id="noTrimIpt" type="text" v-model="test1">' +

			'<pre id="toTrim">-{{ test2 }}-</pre>' +
			'<input id="toTrimIpt" type="text" v-model="test2" trim>'

		new MVVM({
			view: element,
			model: {
				test1: '',
				test2: ''
			}
		});

		let noTrim = element.querySelector('#noTrim');
		let noTrimIpt = element.querySelector('#noTrimIpt');

		let toTrim = element.querySelector('#toTrim');
		let toTrimIpt = element.querySelector('#toTrimIpt');

		expect(noTrim.textContent).toBe('--');
		expect(toTrim.textContent).toBe('--');

		// keep the head and the tail spaces
		noTrimIpt.value = '  cba  ';
		triggerEvent(noTrimIpt, 'change');
		expect(noTrim.textContent).toBe('-  cba  -');

		// trim input string
		toTrimIpt.value = '  nba  ';
		triggerEvent(toTrimIpt, 'change');
		expect(toTrim.textContent).toBe('-nba-');
	});


	it('textarea use lazy param', function () {
		element.innerHTML = '<textarea id="text" v-model="test" lazy></textarea>';

		let vm = new MVVM({
			view: element,
			model: {
				test: ''
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');

		// mock for text input(lazy update data)
		text.value = 'a';
		triggerEvent(text, 'input');
		expect(text.value).toBe('a');
		// the `change` event has not been called, so data will not change that time
		expect(data.test).toBe('');

		// call `change` to update data
		triggerEvent(text, 'change');
		expect(data.test).toBe('a');

		text.value = 'ab';
		triggerEvent(text, 'change');
		expect(data.test).toBe('ab');

		// try input again
		text.value = 'abc';
		triggerEvent(text, 'input');
		expect(text.value).toBe('abc');
		expect(data.test).toBe('ab');

		triggerEvent(text, 'change');
		expect(data.test).toBe('abc');
	});


	it('textarea use debounce param', function (done) {
		element.innerHTML = '<textarea id="text" v-model="test" debounce="500"></textarea>';

		let vm = new MVVM({
			view: element,
			model: {
				test: ''
			}
		});
		let data = vm.$data;
		let text = element.querySelector('#text');

		text.value = 'a';
		triggerEvent(text, 'input');
		expect(data.test).toBe('');
		setTimeout(function () {
			expect(data.test).toBe('');
		}, 490);
		setTimeout(function () {
			expect(data.test).toBe('a');
			done();
		}, 510);
	});


	it('text in v-for bind for same model', function () {
		element.innerHTML =
			'<h1>{{ value }}</h1>' +
			'<ul>' +
				'<li v-for="item of items">' +
					'<input type="text" v-model="value">' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				value: 'xxdk',
				items: [0, 0, 0]
			}
		});

		let data = vm.$data;
		let ul = element.querySelector('ul');
		let h1 = element.querySelector('h1');
		let lis = ul.querySelectorAll('li');

		expect(h1.textContent).toBe('xxdk');
		expect(lis[0].firstChild.value).toBe('xxdk');
		expect(lis[1].firstChild.value).toBe('xxdk');
		expect(lis[2].firstChild.value).toBe('xxdk');

		// change data
		data.value = 'txgc';
		expect(h1.textContent).toBe('txgc');
		expect(lis[0].firstChild.value).toBe('txgc');
		expect(lis[1].firstChild.value).toBe('txgc');
		expect(lis[2].firstChild.value).toBe('txgc');

		// change one of inputs value
		lis[1].firstChild.value = 'xx';
		triggerEvent(lis[1].firstChild, 'change');

		expect(h1.textContent).toBe('xx');
		expect(lis[0].firstChild.value).toBe('xx');
		expect(lis[1].firstChild.value).toBe('xx');
		expect(lis[2].firstChild.value).toBe('xx');

		// array method
		data.items.unshift(1314);
		lis = ul.querySelectorAll('li');
		lis[0].firstChild.value = 'oo';
		triggerEvent(lis[0].firstChild, 'input');

		expect(h1.textContent).toBe('oo');
		expect(lis[0].firstChild.value).toBe('oo');
		expect(lis[1].firstChild.value).toBe('oo');
		expect(lis[2].firstChild.value).toBe('oo');
		expect(lis[3].firstChild.value).toBe('oo');

		// remove the secound item
		data.items.splice(1, 1);
		lis = ul.querySelectorAll('li');
		expect(lis.length).toBe(3);
		lis[1].firstChild.value = 'ko';
		triggerEvent(lis[1].firstChild, 'input');

		expect(h1.textContent).toBe('ko');
		expect(lis[0].firstChild.value).toBe('ko');
		expect(lis[1].firstChild.value).toBe('ko');
		expect(lis[2].firstChild.value).toBe('ko');
	});


	it('text in v-for bind for diffrent model', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item of items">' +
					'<input type="text" v-model="item.value">' +
					'<span>{{ item.value }}</span>' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ value: 'a' },
					{ value: 'b' },
					{ value: 'c' }
				]
			}
		});

		let data = vm.$data;
		let ul = element.querySelector('ul');
		let lis = ul.querySelectorAll('li');
		let input;

		expect(ul.textContent).toBe('abc');

		// change item input value
		input = lis[0].querySelector('input');
		input.value = 'A';
		triggerEvent(input, 'input');
		expect(data.items[0].value).toBe('A');
		expect(ul.textContent).toBe('Abc');

		// change data item
		input = lis[1].querySelector('input');
		data.items[1].value = 'B';
		expect(ul.textContent).toBe('ABc');
		expect(input.value).toBe('B');

		// array method
		data.items.push({ value: 'd' });
		lis = ul.querySelectorAll('li');
		expect(ul.textContent).toBe('ABcd');
		input = lis[3].querySelector('input');
		expect(input.value).toBe('d');
		input.value = 'D';
		triggerEvent(input, 'change');
		expect(ul.textContent).toBe('ABcD');
		expect(data.items[3].value).toBe('D');

		// splice, replace
		data.items.$set(2, { value: 'C' });
		expect(ul.textContent).toBe('ABCD');
		lis = ul.querySelectorAll('li');
		input = lis[2].querySelector('input');
		input.value = 'CC';
		triggerEvent(input, 'blur');
		expect(ul.textContent).toBe('ABCCD');
		expect(data.items[2].value).toBe('CC');
		data.items[2].value = 'cc';
		expect(ul.textContent).toBe('ABccD');
		expect(input.value).toBe('cc');
	});


	it('radio', function () {
		element.innerHTML =
			'<input type="radio" value="a" v-model="test">' +
			'<input type="radio" value="b" v-model="test">'

		let vm = new MVVM({
			view: element,
			model: {
				test: 'a'
			}
		});
		let data = vm.$data;

		expect(element.childNodes[0].checked).toBe(true);
		expect(element.childNodes[1].checked).toBe(false);

		element.childNodes[1].click();
		expect(data.test).toBe('b');
		expect(element.childNodes[0].checked).toBe(false);
		expect(element.childNodes[1].checked).toBe(true);

		element.childNodes[0].click();
		expect(data.test).toBe('a');
		expect(element.childNodes[0].checked).toBe(true);
		expect(element.childNodes[1].checked).toBe(false);
	});


	it('radio returns a number value', function () {
		element.innerHTML =
			'<input type="radio" value="1" v-model="test" number>' +
			'<input type="radio" value="2" v-model="test">'

		let vm = new MVVM({
			view: element,
			model: {
				test: 1
			}
		});
		let data = vm.$data;

		expect(element.childNodes[0].checked).toBe(true);
		expect(element.childNodes[1].checked).toBe(false);

		element.childNodes[1].click();
		expect(data.test).toBe('2');
		expect(element.childNodes[0].checked).toBe(false);
		expect(element.childNodes[1].checked).toBe(true);

		element.childNodes[0].click();
		expect(data.test).toBe(1);
		expect(element.childNodes[0].checked).toBe(true);
		expect(element.childNodes[1].checked).toBe(false);

		element.childNodes[1].click();
		expect(data.test).toBe('2');
		expect(element.childNodes[0].checked).toBe(false);
		expect(element.childNodes[1].checked).toBe(true);
	});


	it('radio in v-for', function () {
		element.innerHTML =
			'<h1>{{ selected }}</h1>' +
			'<ul>' +
				'<li v-for="item of items">' +
					'<input type="radio" v-bind:value="item.value" v-model="selected">' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				selected: 'b',
				items: [
					{ value: 'a' },
					{ value: 'b' },
					{ value: 'c' }
				]
			}
		});

		let data = vm.$data;
		let ul = element.querySelector('ul');
		let lis = ul.querySelectorAll('li');

		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(false);

		lis[2].firstChild.click();
		expect(data.selected).toBe(lis[2].firstChild.value);
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(true);

		// array method
		data.items.push({'value': 'd'});
		lis = ul.querySelectorAll('li');
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(lis[3].firstChild.checked).toBe(false);

		lis[3].firstChild.click();
		expect(data.selected).toBe(lis[3].firstChild.value);
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(false);
		expect(lis[3].firstChild.checked).toBe(true);
	});


	it('radio in nesting v-for', function () {
		element.innerHTML =
			'<div>' +
				'<dl v-for="group of groups">' +
					'<dt>{{ group.selected }}</dt>' +
					'<dd v-for="radio in group.radios">' +
						'<input type="radio" ' +
							'v-bind="{value: radio.value, number: group.number}" ' +
							'v-model="group.selected"' +
						'>' +
					'</dd>' +
				'</dl>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				groups: [
					{
						selected: 11,
						number: false,
						radios: [
							{ value: 11 },
							{ value: 12 },
							{ value: 13 }
						]
					},
					{
						selected: 22,
						number: true,
						radios: [
							{ value: 21 },
							{ value: 22 },
							{ value: 23 }
						]
					},
					{
						selected: 'aa',
						number: true, // just try to toNumber
						radios: [
							{ value: 'aa' },
							{ value: 32 },
							{ value: 33 }
						]
					}
				]
			}
		});

		let data = vm.$data;
		let div = element.querySelector('div');
		let dls = div.querySelectorAll('dl');
		let dt, dds;

		expect(div.textContent).toBe('1122aa');

		// 1. test the first group, no specfy number
		dt = dls[0].firstChild;
		dds = dls[0].querySelectorAll('dd');
		expect(dt.textContent).toBe('11');
		expect(dds[0].firstChild.checked).toBe(true);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(false);

		dds[1].firstChild.click();
		expect(dt.textContent).toBe('12');
		expect(div.textContent).toBe('1222aa');
		expect(dds[1].firstChild.hasAttribute('number')).toBe(false);
		expect(data.groups[0].selected).toBe('12'); // string
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(true);
		expect(dds[2].firstChild.checked).toBe(false);

		data.groups[0].selected = 13;
		expect(dt.textContent).toBe('13');
		expect(div.textContent).toBe('1322aa');
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(true);

		// 2. test the secound group, specfy number
		dt = dls[1].firstChild;
		dds = dls[1].querySelectorAll('dd');
		expect(dt.textContent).toBe('22');
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(true);
		expect(dds[2].firstChild.checked).toBe(false);

		dds[0].firstChild.click();
		expect(dt.textContent).toBe('21');
		expect(div.textContent).toBe('1321aa');
		expect(dds[1].firstChild.hasAttribute('number')).toBe(true);
		expect(data.groups[1].selected).toBe(21); // number
		expect(dds[0].firstChild.checked).toBe(true);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(false);

		data.groups[1].selected = 23;
		expect(dt.textContent).toBe('23');
		expect(div.textContent).toBe('1323aa');
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(true);

		// we hope that data set to string also works
		data.groups[1].selected = '22';
		expect(dt.textContent).toBe('22');
		expect(div.textContent).toBe('1322aa');
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(true);
		expect(dds[2].firstChild.checked).toBe(false);

		// 3. test the third group, specfy number but not all-number
		dt = dls[2].firstChild;
		dds = dls[2].querySelectorAll('dd');
		expect(dt.textContent).toBe('aa');
		expect(dds[0].firstChild.checked).toBe(true);
		expect(dds[0].firstChild.hasAttribute('number')).toBe(true);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(false);

		dds[1].firstChild.click();
		expect(dt.textContent).toBe('32');
		expect(div.textContent).toBe('132232');
		expect(data.groups[2].selected).toBe(32); // number
		expect(dds[1].firstChild.hasAttribute('number')).toBe(true);
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(true);
		expect(dds[2].firstChild.checked).toBe(false);

		data.groups[2].selected = 33;
		expect(dt.textContent).toBe('33');
		expect(div.textContent).toBe('132233');
		expect(dds[0].firstChild.checked).toBe(false);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(true);

		dds[0].firstChild.click();
		expect(data.groups[2].selected).toBe('aa'); // back to string
		expect(dds[0].firstChild.checked).toBe(true);
		expect(dds[1].firstChild.checked).toBe(false);
		expect(dds[2].firstChild.checked).toBe(false);
	});


	it('checkbox for single', function () {
		element.innerHTML = '<input type="checkbox" v-model="isCheck">';

		let vm = new MVVM({
			view: element,
			model: {
				isCheck: true
			}
		});
		let data = vm.$data;

		expect(element.childNodes[0].checked).toBe(true);

		vm.set('isCheck', false);
		expect(data.isCheck).toBe(false);
		expect(element.childNodes[0].checked).toBe(false);

		data.isCheck = true;
		expect(element.childNodes[0].checked).toBe(true);

		element.childNodes[0].click();
		expect(data.isCheck).toBe(false);
	});


	it('checkbox bind for invalid data type', function () {
		element.innerHTML = '<input type="checkbox" v-model="isCheck">';

		new MVVM({
			view: element,
			model: {
				isCheck: 1
			}
		});

		expect(util.warn).toHaveBeenCalledWith('Checkbox v-model value must be a type of Boolean or Array');
	});


	it('checkbox bind for array', function () {
		element.innerHTML =
			'<input type="checkbox" value="a" v-model="sels">' +
			'<input type="checkbox" value="b" v-model="sels">' +
			'<input type="checkbox" value="c" v-model="sels">'

		let vm = new MVVM({
			view: element,
			model: {
				sels: []
			}
		});
		let data = vm.$data;
		let childs = element.childNodes;

		expect(childs[0].checked).toBe(false);
		expect(childs[1].checked).toBe(false);
		expect(childs[2].checked).toBe(false);

		// to hook
		childs[0].click();
		expect(childs[0].checked).toBe(true);
		expect(data.sels).toEqual(['a']);

		childs[1].click();
		expect(childs[1].checked).toBe(true);
		expect(data.sels).toEqual(['a', 'b']);

		childs[2].click();
		expect(childs[2].checked).toBe(true);
		expect(data.sels).toEqual(['a', 'b', 'c']);

		// to unhook
		childs[0].click();
		expect(childs[0].checked).toBe(false);
		expect(data.sels).toEqual(['b', 'c']);

		childs[1].click();
		expect(childs[1].checked).toBe(false);
		expect(data.sels).toEqual(['c']);

		childs[2].click();
		expect(childs[2].checked).toBe(false);
		expect(data.sels).toEqual([]);

		childs[0].click();
		childs[1].click();
		childs[2].click();
		expect(data.sels).toEqual(['a', 'b', 'c']);
	});


	it('checkbox bind for array return a number', function () {
		element.innerHTML =
			'<input type="checkbox" value="0" v-model="sels" number>' +
			'<input type="checkbox" value="1" v-model="sels">' +
			'<input type="checkbox" value="2" v-model="sels" number>'

		let vm = new MVVM({
			view: element,
			model: {
				sels: []
			}
		});
		let data = vm.$data;
		let childs = element.childNodes;

		expect(childs[0].checked).toBe(false);
		expect(childs[1].checked).toBe(false);
		expect(childs[2].checked).toBe(false);

		// to hook
		childs[0].click();
		expect(childs[0].checked).toBe(true);
		expect(data.sels).toEqual([0]);

		childs[1].click();
		expect(childs[1].checked).toBe(true);
		expect(data.sels).toEqual([0, '1']);

		childs[2].click();
		expect(childs[2].checked).toBe(true);
		expect(data.sels).toEqual([0, '1', 2]);

		// to unhook
		childs[0].click();
		expect(childs[0].checked).toBe(false);
		expect(data.sels).toEqual(['1', 2]);

		childs[1].click();
		expect(childs[1].checked).toBe(false);
		expect(data.sels).toEqual([2]);

		childs[2].click();
		expect(childs[2].checked).toBe(false);
		expect(data.sels).toEqual([]);

		childs[0].click();
		childs[1].click();
		childs[2].click();
		expect(data.sels).toEqual([0, '1', 2]);
	});


	it('checkbox in v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item of items">' +
					'<input type="checkbox" v-bind:value="item.value" v-model="selects">' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				selects: ['a', 'c'],
				items: [
					{ value: 'a' },
					{ value: 'b' },
					{ value: 'c' },
				]
			}
		});

		let data = vm.$data;
		let ul = element.querySelector('ul');
		let lis = ul.childNodes;

		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(true);

		lis[1].firstChild.click();
		expect(data.selects).toEqual(['a', 'c', 'b']);
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);

		data.selects.shift();
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);

		// array method
		data.items.push({'value': 'd'});
		lis = ul.childNodes;
		expect(lis.length).toBe(4);
		expect(lis[3].firstChild.checked).toBe(false);
		lis[3].firstChild.click();
		expect(data.selects).toEqual(['c', 'b', 'd']);
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(lis[3].firstChild.checked).toBe(true);
	});


	it('checkbox in nesting v-for', function () {
		element.innerHTML =
			'<div>' +
				'<ul v-for="group of groups">' +
					'<li v-for="checkbox of group.checkboxs">' +
						'<input type="checkbox" ' +
							'v-bind="{value: checkbox.value, number: group.number}" ' +
							'v-model="group.selects">' +
					'</li>' +
				'</ul>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				groups: [
					{
						selects: [11, 12],
						number: false,
						checkboxs: [
							{ value: 11 },
							{ value: 12 },
							{ value: 13 },
						]
					},
					{
						selects: [22, 23],
						number: true,
						checkboxs: [
							{ value: 21 },
							{ value: 22 },
							{ value: 23 },
						]
					},
					{
						selects: [],
						number: true,
						checkboxs: [
							{ value: 'aa' },
							{ value: 'bb' },
							{ value: 33 },
						]
					}
				]
			}
		});

		let data = vm.$data;
		let uls = element.firstChild.querySelectorAll('ul');
		let lis;

		// 1. test the first group, no specfy number
		lis = uls[0].querySelectorAll('li');
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(false);

		lis[2].firstChild.click();
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(data.groups[0].selects).toEqual([11, 12, '13']);

		lis[0].firstChild.click();
		lis[1].firstChild.click();
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(data.groups[0].selects).toEqual(['13']);

		lis[0].firstChild.click();
		lis[1].firstChild.click();
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(data.groups[0].selects).toEqual(['13', '11', '12']);

		data.groups[0].selects.splice(1, 1);
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);

		// 2. test the secound group, specfy number
		lis = uls[1].querySelectorAll('li');
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);

		lis[0].firstChild.click();
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(data.groups[1].selects).toEqual([22, 23, 21]); // add number 21

		lis[1].firstChild.click();
		lis[2].firstChild.click();
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(false);
		expect(data.groups[1].selects).toEqual([21]);

		lis[2].firstChild.click();
		lis[1].firstChild.click();
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);
		expect(data.groups[1].selects).toEqual([21, 23, 22]);

		data.groups[1].selects.splice(1, 1);
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(false);

		// 3. test the third group, not all number
		lis = uls[2].querySelectorAll('li');
		expect(lis[0].firstChild.checked).toBe(false);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(false);

		lis[0].firstChild.click();
		expect(data.groups[2].selects).toEqual(['aa']);
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(false);
		expect(lis[2].firstChild.checked).toBe(false);

		lis[2].firstChild.click();
		lis[1].firstChild.click();
		expect(data.groups[2].selects).toEqual(['aa', 33, 'bb']);
		expect(lis[0].firstChild.checked).toBe(true);
		expect(lis[1].firstChild.checked).toBe(true);
		expect(lis[2].firstChild.checked).toBe(true);
	});


	it('single select without value', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: 'b'
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(select.value).toBe(data.test);
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by event
		setSelect(select, 'a');
		triggerEvent(select, 'change');
		expect(data.test).toBe('a');
		expect(select.value).toBe('a');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		// set value by data
		data.test = 'c';
		expect(select.value).toBe('c');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);
	});


	it('single select & without specify default selected', function () {
			element.innerHTML =
			'<select v-model="test">' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: ''
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		// if no default selected value was defined in model, the single select will not select any options
		// in modern browsers behavior, if no specify, single select always selected the first option by default
		// but in v-model of mvvm, we hope that `data` is the highest-priority decision-maker instead of options
		expect(data.test).toBe('');
		expect(select.value).toBe('');

		// set value by data
		data.test = 'c';
		expect(select.value).toBe('c');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		// set value by event
		setSelect(select, 'a');
		triggerEvent(select, 'change');
		expect(data.test).toBe('a');
		expect(select.value).toBe('a');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);
	});


	it('single select with value', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option value="a">AAA</option>' +
				'<option value="b">BBB</option>' +
				'<option value="c">CCC</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: 'b'
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(select.value).toBe(data.test);
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by event
		setSelect(select, 'a');
		triggerEvent(select, 'change');
		expect(data.test).toBe('a');
		expect(select.value).toBe('a');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		// set value by data
		data.test = 'c';
		expect(select.value).toBe('c');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);
	});


	it('single select return all number', function () {
		element.innerHTML =
			'<select v-model="test" number>' +
				'<option value="1">AAA</option>' +
				'<option value="2">BBB</option>' +
				'<option value="3">CCC</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: 3
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(data.test).toBe(3);
		expect(select.value).toBe('3');

		// set value by event
		setSelect(select, '1');
		triggerEvent(select, 'change');
		expect(data.test).toBe(1);
		expect(select.value).toBe('1');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		setSelect(select, 2);
		triggerEvent(select, 'change');
		expect(data.test).toBe(2);
		expect(select.value).toBe('2');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by data
		data.test = 3;
		expect(select.value).toBe('3');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);
	});


	it('single select return all number & specify a not-number default selected', function () {
		element.innerHTML =
			'<select v-model="test" number>' +
				'<option value="1">AAA</option>' +
				'<option value="2">BBB</option>' +
				'<option value="3">CCC</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: '1'
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		// here we hope that if specify number attribute
		// input data type is nonessential number, it support pass string
		expect(data.test).toBe('1');
		expect(select.value).toBe('1');

		// set value by event
		setSelect(select, '2');
		triggerEvent(select, 'change');
		expect(data.test).toBe(2);
		expect(select.value).toBe('2');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by data
		data.test = 3;
		expect(select.value).toBe('3');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);
	});


	it('single select with v-for', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.text }}' +
				'</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: 'b',
				options: [
					{ value: 'a', text: 'AAA' },
					{ value: 'b', text: 'BBB' },
					{ value: 'c', text: 'CCC' }
				]
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by event
		options[0].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toBe('a');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		// set value by data
		data.test = 'c';
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);
	});


	it('single select with v-for & without specify default selected', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.text }}' +
				'</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: '',
				options: [
					{ value: 'a', text: 'AAA' },
					{ value: 'b', text: 'BBB' },
					{ value: 'c', text: 'CCC' }
				]
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(data.test).toBe('');
		expect(select.value).toBe('');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		// set value by data
		data.test = 'c';
		expect(select.value).toBe('c');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		// set value by event
		options[0].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toBe('a');
		expect(select.value).toBe('a');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);
	});


	it('single select with v-for & change option data', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.value }}' +
				'</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: 'c',
				options: [
					{ value: 'a' },
					{ value: 'b' },
					{ value: 'c' }
				]
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(select.value).toBe('c');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		// change/cover v-for(options) data,
		// becasue we are not sure if new options has previous selected value
		// so we reset the default selected value to ''(indicate select no option) & no change data
		data.options = [
			{ value: 'aa' },
			{ value: 'bb' },
			{ value: 'cc' }
		];
		expect(data.test).toBe('c');
		expect(select.value).toBe('');

		// set value by data
		data.test = 'cc';
		expect(select.value).toBe('cc');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		// set value by event
		options[0].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toBe('aa');
		expect(select.value).toBe('aa');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		// test for array method
		data.options.push({ value: 'dd' });
		options = select.childNodes;
		expect(select.value).toBe('aa');
		expect(options.length).toBe(4);
		expect(options[0].selected).toBe(true);
		expect(options[3].value).toBe('dd');

		data.options.unshift({ value: 'xx' });
		options = select.childNodes;
		expect(select.value).toBe('aa');
		expect(options.length).toBe(5);
		expect(options[1].selected).toBe(true);
		expect(options[0].value).toBe('xx');

		data.options.splice(1, 0, { value: 'oo' });
		options = select.childNodes;
		expect(select.value).toBe('aa');
		expect(options.length).toBe(6);
		expect(options[0].value).toBe('xx');
		expect(options[1].value).toBe('oo');
		expect(options[2].value).toBe('aa');
		expect(options[3].value).toBe('bb');
		expect(options[4].value).toBe('cc');
		expect(options[5].value).toBe('dd');
		expect(options[2].selected).toBe(true);

		options[1].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toBe('oo');
		expect(select.value).toBe('oo');

		data.options.pop();
		options = select.childNodes;
		expect(data.test).toBe('oo');
		expect(select.value).toBe('oo');
		expect(options.length).toBe(5);
		expect(options[0].value).toBe('xx');
		expect(options[1].value).toBe('oo');
		expect(options[2].value).toBe('aa');
		expect(options[3].value).toBe('bb');
		expect(options[4].value).toBe('cc');
		expect(options[1].selected).toBe(true);

		data.options.shift();
		options = select.childNodes;
		expect(data.test).toBe('oo');
		expect(select.value).toBe('oo');
		expect(options.length).toBe(4);
		expect(options[0].value).toBe('oo');
		expect(options[1].value).toBe('aa');
		expect(options[2].value).toBe('bb');
		expect(options[3].value).toBe('cc');
		expect(options[0].selected).toBe(true);

		// if remove the selected option, data will not clear default selected value!
		// so we should specify a new select value after remove before
		data.options.shift();
		data.test = 'bb';
		options = select.childNodes;
		expect(select.value).toBe('bb');
		expect(options.length).toBe(3);
		expect(options[0].value).toBe('aa');
		expect(options[0].selected).toBe(false);
		expect(options[1].value).toBe('bb');
		expect(options[1].selected).toBe(true);
		expect(options[2].value).toBe('cc');
		expect(options[2].selected).toBe(false);

		data.options.splice(2, 1);
		options = select.childNodes;
		expect(data.test).toBe('bb');
		expect(select.value).toBe('bb');
		expect(options.length).toBe(2);
		expect(options[0].value).toBe('aa');
		expect(options[1].value).toBe('bb');

		// if not specify a new select value after remove
		// it will be wrong and confused! DO NOT HAPPEN THIS!
		data.options.$set(1, { value: 'BB' });
		options = select.childNodes;
		expect(data.test).toBe('bb');
		expect(select.value).toBe('aa');
		expect(options.length).toBe(2);
		expect(options[0].value).toBe('aa');
		expect(options[1].value).toBe('BB');

		options[1].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toBe('BB');
		expect(select.value).toBe('BB');

		data.options.$remove(data.options[0]);
		options = select.childNodes;
		expect(data.test).toBe('BB');
		expect(select.value).toBe('BB');
		expect(options.length).toBe(1);
		expect(options[0].value).toBe('BB');
	});


	it('single select with v-for & nesting level select-group', function () {
		element.innerHTML =
			'<div id="select-group">' +
				'<select v-for="sel in selects" v-model="sel.selected" number>' +
					'<option v-for="op in sel.options" v-bind:value="op.value">' +
						'{{ op.value }}' +
					'</option>' +
				'</select>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				selects: [
					{
						selected: 11,
						options: [
							{ value: 11 },
							{ value: 12 },
							{ value: 13 }
						]
					},
					{
						selected: 22,
						options: [
							{ value: 21 },
							{ value: 22 },
							{ value: 23 }
						]
					},
					{
						selected: 33,
						options: [
							{ value: 31 },
							{ value: 32 },
							{ value: 33 },
							{ value: 34 }
						]
					}
				]
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#select-group');
		let selects = div.childNodes;

		// test list
		expect(selects[0].value).toBe('11');
		expect(selects[0].options.length).toBe(3);
		expect(selects[1].value).toBe('22');
		expect(selects[1].options.length).toBe(3);
		expect(selects[2].value).toBe('33');
		expect(selects[2].options.length).toBe(4);

		// test select event
		selects[0].options[1].selected = true;
		triggerEvent(selects[0], 'change');
		expect(selects[0].value).toBe('12');
		expect(data.selects[0].selected).toBe(12);

		selects[1].options[0].selected = true;
		triggerEvent(selects[1], 'change');
		expect(selects[1].value).toBe('21');
		expect(data.selects[1].selected).toBe(21);

		selects[2].options[3].selected = true;
		triggerEvent(selects[2], 'change');
		expect(selects[2].value).toBe('34');
		expect(data.selects[2].selected).toBe(34);

		// test data reactive
		data.selects[0].selected = 13;
		expect(selects[0].value).toBe('13');
		expect(selects[0].options[0].selected).toBe(false);
		expect(selects[0].options[1].selected).toBe(false);
		expect(selects[0].options[2].selected).toBe(true);

		data.selects[1].selected = 23;
		expect(selects[1].value).toBe('23');
		expect(selects[1].options[0].selected).toBe(false);
		expect(selects[1].options[1].selected).toBe(false);
		expect(selects[1].options[2].selected).toBe(true);

		data.selects[2].selected = 33;
		expect(selects[2].value).toBe('33');
		expect(selects[2].options[0].selected).toBe(false);
		expect(selects[2].options[1].selected).toBe(false);
		expect(selects[2].options[2].selected).toBe(true);
		expect(selects[2].options[3].selected).toBe(false);
	});


	it('single select but bind for array', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		new MVVM({
			view: element,
			model: {
				test: ['b']
			}
		});

		let warnMsg = 'The model [test] cannot set as Array when <select> has no multiple propperty';
		expect(util.warn).toHaveBeenCalledWith(warnMsg);
	});


	it('multiple select without value', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: ['b', 'c']
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(true);

		// set value by event
		options[0].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual(['a', 'b', 'c']);

		options[1].selected = false;
		options[2].selected = false;
		triggerEvent(select, 'change');
		expect(data.test).toEqual(['a']);

		options[0].selected = false;
		triggerEvent(select, 'change');
		expect(data.test.length).toBe(0);

		// set value by data
		data.test.push('a');
		expect(options[0].selected).toBe(true);

		data.test = ['b', 'c'];
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(true);
	});


	it('multiple select return all number', function () {
		element.innerHTML =
			'<select v-model="test" multiple number>' +
				'<option value="1">A</option>' +
				'<option value="2">B</option>' +
				'<option value="3">C</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: []
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		// set value by event
		options[0].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual([1]);

		options[2].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual([1, 3]);

		// set value by data
		data.test.pop();
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		data.test = [];
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		data.test.push(3); // does not work if string '3'
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		options[0].selected = true;
		options[1].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual([1, 2, 3]);
	});


	it('multiple select return all number & specify some not-number default selected', function () {
		element.innerHTML =
			'<select v-model="test" multiple number>' +
				'<option value="1">A</option>' +
				'<option value="2">B</option>' +
				'<option value="3">C</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: ['1', '3'] // pass string default values, it still works
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		options[1].selected = true;
		triggerEvent(select, 'change'); // when change one, all option will go througn and format data
		expect(data.test).toEqual([1, 2, 3]);

		data.test = ['2', '3']; // pass string values, it still works
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(true);
	});


	it('multiple select with v-for', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.value }}' +
				'</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: ['a', 'b'],
				options: [
					{ value: 'a' },
					{ value: 'b' },
					{ value: 'c' }
				]
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by event
		options[2].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual(['a', 'b', 'c']);

		options[1].selected = false;
		triggerEvent(select, 'change');
		expect(data.test).toEqual(['a', 'c']);

		// set value by data
		data.test.push('b');
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(true);

		data.test = [];
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);
	});


	it('multiple select with v-for & change option data', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.value }}' +
				'</option>' +
			'</select>'

		let vm = new MVVM({
			view: element,
			model: {
				test: [],
				options: [
					{ value: 'a' },
					{ value: 'b' },
					{ value: 'c' }
				]
			}
		});
		let data = vm.$data;
		let select = element.querySelector('select');
		let options = select.childNodes;

		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		options[1].selected = true;
		options[2].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual(['b', 'c']);

		data.options.push({ value: 'd' });
		options = select.childNodes;
		expect(options.length).toBe(4);
		expect(options[3].value).toBe('d');
		expect(options[0].selected).toBe(false);// a
		expect(options[1].selected).toBe(true); // b
		expect(options[2].selected).toBe(true); // c
		expect(options[3].selected).toBe(false);// d

		data.options.$remove(data.options[1]);
		options = select.childNodes;
		expect(data.test).toEqual(['b', 'c']);
		// if remove the selected option, data will not clear default selected value!
		// so we should manual remove the selected value from data
		data.test.$remove('b');
		expect(data.test).toEqual(['c']);
		expect(options.length).toBe(3);
		expect(options[0].value).toBe('a');
		expect(options[0].selected).toBe(false);
		expect(options[1].value).toBe('c');
		expect(options[1].selected).toBe(true);
		expect(options[2].value).toBe('d');
		expect(options[2].selected).toBe(false);

		data.options = [
			{ value: 'aa' },
			{ value: 'bb' },
			{ value: 'cc' }
		];
		options = select.childNodes;
		expect(options[0].value).toBe('aa');
		expect(options[0].selected).toBe(false);
		expect(options[1].value).toBe('bb');
		expect(options[1].selected).toBe(false);
		expect(options[2].value).toBe('cc');
		expect(options[2].selected).toBe(false);
		// when cover option the data.test will not be changed
		expect(data.test).toEqual(['c']);
	});


	it('multiple select & nesting level select-group', function () {
		element.innerHTML =
			'<div id="select-group">' +
				'<select v-for="sel in selects" v-model="sel.selected" number multiple>' +
					'<option v-for="op in sel.options" v-bind:value="op.value">' +
						'{{ op.value }}' +
					'</option>' +
				'</select>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				selects: [
					{
						selected: [11, 12],
						options: [
							{ value: 11 },
							{ value: 12 },
							{ value: 13 }
						]
					},
					{
						selected: [22, 23],
						options: [
							{ value: 21 },
							{ value: 22 },
							{ value: 23 }
						]
					},
					{
						selected: [33, 34],
						options: [
							{ value: 31 },
							{ value: 32 },
							{ value: 33 },
							{ value: 34 }
						]
					}
				]
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#select-group');
		let selects = div.childNodes;

		// test list
		expect(selects[0].options.length).toBe(3);
		expect(selects[0].options[0].value).toBe('11');
		expect(selects[0].options[0].selected).toBe(true);
		expect(selects[0].options[1].value).toBe('12');
		expect(selects[0].options[1].selected).toBe(true);
		expect(selects[0].options[2].value).toBe('13');
		expect(selects[0].options[2].selected).toBe(false);

		expect(selects[1].options.length).toBe(3);
		expect(selects[1].options[0].value).toBe('21');
		expect(selects[1].options[0].selected).toBe(false);
		expect(selects[1].options[1].value).toBe('22');
		expect(selects[1].options[1].selected).toBe(true);
		expect(selects[1].options[2].value).toBe('23');
		expect(selects[1].options[2].selected).toBe(true);

		expect(selects[2].options.length).toBe(4);
		expect(selects[2].options[0].value).toBe('31');
		expect(selects[2].options[0].selected).toBe(false);
		expect(selects[2].options[1].value).toBe('32');
		expect(selects[2].options[1].selected).toBe(false);
		expect(selects[2].options[2].value).toBe('33');
		expect(selects[2].options[2].selected).toBe(true);
		expect(selects[2].options[3].value).toBe('34');
		expect(selects[2].options[3].selected).toBe(true);

		// test select event
		selects[0].options[2].selected = true;
		triggerEvent(selects[0], 'change');
		expect(data.selects[0].selected).toEqual([11, 12, 13]);

		selects[1].options[0].selected = true;
		triggerEvent(selects[1], 'change');
		expect(data.selects[1].selected).toEqual([21, 22, 23]);

		selects[2].options[0].selected = true;
		selects[2].options[1].selected = true;
		triggerEvent(selects[2], 'change');
		expect(data.selects[2].selected).toEqual([31, 32, 33, 34]);

		// test data reactive
		data.selects[0].selected.shift();
		expect(selects[0].options[0].selected).toBe(false);

		data.selects[1].selected.pop();
		expect(selects[1].options[2].selected).toBe(false);

		data.selects[2].selected.splice(2, 1);
		expect(selects[2].options[2].selected).toBe(false);
	});


	it('multiple select but not bind for array', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		new MVVM({
			view: element,
			model: {
				test: 'b'
			}
		});

		let warnMsg = '<select> cannot be multiple when the model set [test] as not Array';
		expect(util.warn).toHaveBeenCalledWith(warnMsg);
	});
});