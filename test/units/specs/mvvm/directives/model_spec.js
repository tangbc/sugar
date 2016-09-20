var MVVM = require('mvvm').default;
var util = require('src/util');

var test_util = require('../../../test_util');
var triggerEvent = test_util.triggerEvent;
var setSelect = test_util.setSelect;


describe("v-model >", function () {
	var element;

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
			'view': element,
			'model': {
				'model': 'xxxxxxxx'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('v-model only for using in input, select, textarea');
	});


	it('use incorrect form-type', function () {
		element.innerHTML = '<input v-model="model">'; // miss type="text"

		new MVVM({
			'view': element,
			'model': {
				'model': 'xxxxxxxx'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('Do not use incorrect form-type with v-model: ', element.firstChild);
	});


	it('use dynamic expression', function () {
		element.innerHTML = '<input type="text" v-model="isA ? aaa : bbb">';

		new MVVM({
			'view': element,
			'model': {}
		});

		expect(util.warn).toHaveBeenCalledWith('v-model directive value can be use by static expression');
	});


	it('text and textarea', function () {
		element.innerHTML =
			'<input id="text" type="text" v-model="test">' +
			'<textarea id="area" v-model="test"></textarea>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'abc'
			}
		});
		var data = vm.$data;
		var text = element.querySelector('#text');
		var area = element.querySelector('#area');

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
		expect(text.value).toBe('fff');
		expect(data.test).toBe('fff');
	});


	it('text unLetter input composition event', function () {
		element.innerHTML = '<input id="text" type="text" v-model="test">';

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'abc'
			}
		});
		var data = vm.$data;
		var text = element.querySelector('#text');

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ''
			}
		});
		var data = vm.$data;
		var text = element.querySelector('#text');

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ''
			}
		});
		var data = vm.$data;
		var text = element.querySelector('#text');

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


	it('textarea use lazy param', function () {
		element.innerHTML = '<textarea id="text" v-model="test" lazy></textarea>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ''
			}
		});
		var data = vm.$data;
		var text = element.querySelector('#text');

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ''
			}
		});
		var data = vm.$data;
		var text = element.querySelector('#text');

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


	it('radio', function () {
		element.innerHTML =
			'<input type="radio" value="a" v-model="test">' +
			'<input type="radio" value="b" v-model="test">'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'a'
			}
		});
		var data = vm.$data;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 1
			}
		});
		var data = vm.$data;

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


	it('checkbox for single', function () {
		element.innerHTML = '<input type="checkbox" v-model="isCheck">';

		var vm = new MVVM({
			'view': element,
			'model': {
				'isCheck': true
			}
		});
		var data = vm.$data;

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
			'view': element,
			'model': {
				'isCheck': 1
			}
		});

		expect(util.warn).toHaveBeenCalledWith('Checkbox v-model value must be a type of Boolean or Array');
	});


	it('checkbox bind for array', function () {
		element.innerHTML =
			'<input type="checkbox" value="a" v-model="sels">' +
			'<input type="checkbox" value="b" v-model="sels">' +
			'<input type="checkbox" value="c" v-model="sels">'

		var vm = new MVVM({
			'view': element,
			'model': {
				'sels': []
			}
		});
		var data = vm.$data;
		var childs = element.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'sels': []
			}
		});
		var data = vm.$data;
		var childs = element.childNodes;

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


	it('single select without value', function () {
		element.innerHTML =
			'<select v-model="test">' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'b'
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ''
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'b'
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 3
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': '1'
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

		// here we hope that if specify number attribute
		// not only return data, but also input data both require a number
		expect(data.test).toBe('1');
		expect(select.value).toBe('');

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'b',
				'options': [
					{'value': 'a', 'text': 'AAA'},
					{'value': 'b', 'text': 'BBB'},
					{'value': 'c', 'text': 'CCC'}
				]
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': '',
				'options': [
					{'value': 'a', 'text': 'AAA'},
					{'value': 'b', 'text': 'BBB'},
					{'value': 'c', 'text': 'CCC'}
				]
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': 'c',
				'options': [
					{'value': 'a'},
					{'value': 'b'},
					{'value': 'c'}
				]
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

		expect(select.value).toBe('c');
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);

		// change/cover v-for(options) data,
		// becasue we are not sure if new options has previous selected value
		// so we clear the default selected value when options were rebuild
		data.options = [
			{'value': 'aa'},
			{'value': 'bb'},
			{'value': 'cc'}
		];
		expect(data.test).toBe('');
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
		data.options.push({'value': 'dd'});
		options = select.childNodes;
		expect(select.value).toBe('aa');
		expect(options.length).toBe(4);
		expect(options[0].selected).toBe(true);
		expect(options[3].value).toBe('dd');

		data.options.unshift({'value': 'xx'});
		options = select.childNodes;
		expect(select.value).toBe('aa');
		expect(options.length).toBe(5);
		expect(options[1].selected).toBe(true);
		expect(options[0].value).toBe('xx');

		data.options.splice(1, 0, {'value': 'oo'});
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
		data.options.$set(1, {'value': 'BB'});
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

		var vm = new MVVM({
			'view': element,
			'model': {
				'selects': [
					{
						'selected': 11,
						'options': [
							{'value': 11},
							{'value': 12},
							{'value': 13}
						]
					},
					{
						'selected': 22,
						'options': [
							{'value': 21},
							{'value': 22},
							{'value': 23}
						]
					},
					{
						'selected': 33,
						'options': [
							{'value': 31},
							{'value': 32},
							{'value': 33},
							{'value': 34}
						]
					}
				]
			}
		});
		var data = vm.$data;
		var div = element.querySelector('#select-group');
		var selects = div.childNodes;

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
			'view': element,
			'model': {
				'test': ['b']
			}
		});

		var warnMsg = 'The model [test] cannot set as Array when <select> has no multiple propperty';
		expect(util.warn).toHaveBeenCalledWith(warnMsg);
	});


	it('multiple select without value', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option>a</option>' +
				'<option>b</option>' +
				'<option>c</option>' +
			'</select>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ['b', 'c']
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': []
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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


	it('multiple select with v-for', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.value }}' +
				'</option>' +
			'</select>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ['a', 'b'],
				'options': [
					{'value': 'a'},
					{'value': 'b'},
					{'value': 'c'}
				]
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

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

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': [],
				'options': [
					{'value': 'a'},
					{'value': 'b'},
					{'value': 'c'}
				]
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		options[1].selected = true;
		options[2].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual(['b', 'c']);

		data.options.push({'value': 'd'});
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
			{'value': 'aa'},
			{'value': 'bb'},
			{'value': 'cc'}
		];
		options = select.childNodes;
		expect(options[0].value).toBe('aa');
		expect(options[0].selected).toBe(false);
		expect(options[1].value).toBe('bb');
		expect(options[1].selected).toBe(false);
		expect(options[2].value).toBe('cc');
		expect(options[2].selected).toBe(false);
		// when cover option the data.test will be reset
		expect(data.test).toEqual([]);
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

		var vm = new MVVM({
			'view': element,
			'model': {
				'selects': [
					{
						'selected': [11, 12],
						'options': [
							{'value': 11},
							{'value': 12},
							{'value': 13}
						]
					},
					{
						'selected': [22, 23],
						'options': [
							{'value': 21},
							{'value': 22},
							{'value': 23}
						]
					},
					{
						'selected': [33, 34],
						'options': [
							{'value': 31},
							{'value': 32},
							{'value': 33},
							{'value': 34}
						]
					}
				]
			}
		});
		var data = vm.$data;
		var div = element.querySelector('#select-group');
		var selects = div.childNodes;

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
			'view': element,
			'model': {
				'test': 'b'
			}
		});

		var warnMsg = '<select> cannot be multiple when the model set [test] as not Array';
		expect(util.warn).toHaveBeenCalledWith(warnMsg);
	});
});