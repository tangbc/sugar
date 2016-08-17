var MVVM = require('mvvm').default;
var util = require('src/util');

function triggerEvent (target, evt, process) {
	var e = document.createEvent('HTMLEvents');
	e.initEvent(evt, true, true);

	if (process) {
		process(e);
	}

	target.dispatchEvent(e);
}

function setSelect(select, value) {
	var options = select.options;

	for (var i = 0; i < options.length; i++) {
		if (options[i].value == value) {
			options[i].selected = true;
		}
	}
}


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


	it('use dynamic expression', function () {
		element.innerHTML = '<input type="text" v-model="isA ? aaa : bbb">';

		var vm = new MVVM({
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

		// mock textarea for input
		area.value = 'e';
		triggerEvent(area, 'input');
		expect(text.value).toBe('e');
		expect(area.value).toBe('e');

		// mock text for change (blur)
		text.value = 'fff';
		triggerEvent(text, 'change');
		expect(text.value).toBe('fff');
		expect(text.value).toBe('fff');
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


	it('select single selection without value', function () {
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


	it('select single selection with value', function () {
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


	it('select single selection return all number', function () {
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


	it('select multi selection without value', function () {
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


	it('select multi selection return all number', function () {
		element.innerHTML =
			'<select v-model="test" multiple number>' +
				'<option value="1">A</option>' +
				'<option value="2">B</option>' +
				'<option value="3">C</option>' +
			'</select>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': [2]
			}
		});
		var data = vm.$data;
		var select = element.querySelector('select');
		var options = select.childNodes;

		expect(data.test).toEqual([2]);

		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		// set value by event
		options[0].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual([1, 2]);

		options[2].selected = true;
		triggerEvent(select, 'change');
		expect(data.test).toEqual([1, 2, 3]);

		// set value by data
		data.test.pop();
		expect(options[0].selected).toBe(true);
		expect(options[1].selected).toBe(true);
		expect(options[2].selected).toBe(false);

		data.test = [];
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(false);

		data.test.push(3); // does not work if string
		expect(options[0].selected).toBe(false);
		expect(options[1].selected).toBe(false);
		expect(options[2].selected).toBe(true);
	});


	it('select single selection with v-for', function () {
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


	it('select multi selection with v-for', function () {
		element.innerHTML =
			'<select v-model="test" multiple>' +
				'<option v-for="op in options" v-bind:value="op.value">' +
					'{{ op.text }}' +
				'</option>' +
			'</select>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': ['a', 'b'],
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


	it('select has multiple but not bind for array', function () {
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

		expect(util.warn).toHaveBeenCalledWith('<select> cannot be multiple when the model set [test] as not Array');
	});


	it('select has no multiple but bind for array', function () {
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

		expect(util.warn).toHaveBeenCalledWith('The model [test] cannot set as Array when <select> has no multiple propperty');
	});
});