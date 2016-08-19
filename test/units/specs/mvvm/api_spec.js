var MVVM = require('mvvm').default;
var util = require('src/util');

describe("mvvm instance >", function () {
	var element, vm, data;

	beforeEach(function () {
		element = document.createElement('div');
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';
		document.body.appendChild(element);

		data = {
			'vid': 'aaa',
			'text': 'bbb',
			'obj': {
				'a': 1,
				'b': 2
			}
		}

		vm = new MVVM({
			'view': element,
			'model': data
		});
	});

	afterEach(function () {
		vm = data = null;
		document.body.removeChild(element);
	});


	it('invalid build', function () {
		var text = document.createTextNode('plain text');
		var model = {'a': 1};
		new MVVM({
			'view': text,
			'model': model
		});
		expect(util.warn).toHaveBeenCalledWith('element must be a type of DOMElement: ', text);

		var el = document.createElement('div');
		new MVVM({
			'view': el,
			'model': 'not-an-object'
		});
		expect(util.warn).toHaveBeenCalledWith('model must be a type of Object: ', 'not-an-object');
	});


	it('use invalid directive', function () {
		var el = document.createElement('div');
		el.innerHTML =
			'<h1 v-text="title"></h1>' +
			'<h2 v-beta="title"></h2>'
		var model = {'title': 'xxdk'};

		new MVVM({
			'view': el,
			'model': model
		});
		expect(el.childNodes[0].textContent).toBe('xxdk');
		expect(el.childNodes[1].hasAttribute('v-beta')).toBe(false);
		expect(util.warn).toHaveBeenCalledWith('[v-beta] is an unknown directive!');
	});


	it('get', function () {
		var model = vm.get();
		var descriptor = Object.getOwnPropertyDescriptor(model, 'obj');

		// with description getter/setter
		expect(typeof descriptor.get).toBe('function');
		expect(typeof descriptor.set).toBe('function');

		// with Observer instance
		expect(typeof model.obj.__ob__).toBe('object');

		// get one
		expect(vm.get('vid')).toBe('aaa');

		// get all
		expect(vm.get()).toEqual({
			'vid': 'aaa',
			'text': 'bbb',
			'obj': {
				'a': 1,
				'b': 2
			}
		});
	});


	it('getCopy', function () {
		// getCopy returns a copy of model
		var model = vm.getCopy();
		var descriptor = Object.getOwnPropertyDescriptor(model, 'obj');

		// without description getter/setter
		expect(typeof descriptor.get).toBe('undefined');
		expect(typeof descriptor.set).toBe('undefined');

		// without Observer instance
		expect(typeof model.obj.__ob__).toBe('undefined');
	});


	it('set', function () {
		// set one
		vm.set('text', 'BBB');
		expect(data.text).toBe('BBB');

		// set object
		vm.set({
			'vid': 'AAA',
			'text': 'bbb',
			'obj': {
				'x': 123
			}
		});
		expect(data.vid).toBe('AAA');
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			'x': 123
		});
	});


	it('reset', function () {
		data.vid = 23333;
		data.text = 94949494;
		data.obj = {'x': 456};

		// reset one
		vm.reset('vid');
		expect(data.vid).toBe('aaa');

		// reset array
		vm.reset(['text', 'obj']);
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			'a': 1,
			'b': 2
		});

		// reset all
		data.vid = 23333;
		data.text = 94949494;
		data.obj = {'oo': 789};
		vm.reset();
		expect(data.vid).toBe('aaa');
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			'a': 1,
			'b': 2
		});
	});


	it('watch', function () {
		var tempVid;

		vm.watch('vid', function (newValue) {
			tempVid = newValue;
		});

		data.vid = 233333;
		expect(tempVid).toBe(data.vid);
	});


	it('shallow watch', function () {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		data = {
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		vm = new MVVM({
			'view': element,
			'model': data
		});

		var length, count = 0;
		vm.watch('items', function (newArray) {
			count++;
			length = newArray.length;
		});

		// change for array outside
		data.items.pop();
		expect(count).toBe(1);
		expect(length).toBe(data.items.length);

		// change for array inside (deep)
		// and will not trigger callback because use shallow watch
		data.items[0].text = 'aaa';
		expect(count).toBe(1);
		// but the interface still be updated
		expect(element.querySelector('ul').childNodes[0].textContent).toBe('aaa');
	});


	it('deep watch', function () {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		data = {
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		vm = new MVVM({
			'view': element,
			'model': data
		});

		var val, count = 0;
		vm.watch('items', function (newVal) {
			count++;
			val = newVal;
		}, true);

		// change for array inside (deep)
		data.items[0].text = 'aaa';
		expect(val[0].text).toBe('aaa');
		expect(count).toBe(1);

		// and also can be watch outside
		data.items.pop();
		expect(val).toBe(data.items);
		expect(val.length).toBe(2);
		expect(count).toBe(2);
	});


	it('destroy', function () {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		// use all directives
		element.innerHTML =
			'<div>{{ title }}</div>' +
			'<div v-text="title"></div>' +

			'<div>{{ html }}</div>' +
			'<div v-html="html"></div>' +

			'<div v-show="show"></div>' +
			'<div v-else></div>' +

			'<div v-if="render"></div>' +
			'<div v-else></div>' +

			'<div v-el="test"></div>' +

			'<div v-on:click="click(title)"></div>' +

			'<input type="text" v-model="title">' +
			'<input type="radio" value="boy" v-model="sex">' +
			'<input type="radio" value="girl" v-model="sex">' +
			'<input type="checkbox" v-model="isCheck">' +
			'<input type="checkbox" value="a" v-model="sports">' +
			'<input type="checkbox" value="b" v-model="sports">' +
			'<input type="checkbox" value="c" v-model="sports">' +
			'<select v-model="sel">' +
				'<option>aaa</option>' +
				'<option>bbb</option>' +
				'<option>ccc</option>' +
			'</select>' +

			'<div v-bind:class="cls"></div>' +
			'<div v-bind:style="styObj"></div>' +
			'<div v-bind:id="id"></div>' +

			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		data = {
			'title': 'xxdk',
			'html': '<b>123</b>',
			'show': true,
			'render': false,
			'click': function () {},
			'sex': 'girl',
			'isCheck': false,
			'sports': ['a', 'c'],
			'sel': 'bbb',
			'cls': 'xxx',
			'styObj': {
				'color': 'red'
			},
			'id': 'txgc',
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		vm = new MVVM({
			'view': element,
			'model': data
		});

		// destroy instance
		vm.destroy();
		// model should be null
		expect(vm.get()).toBeNull();
		// interface should be blank
		expect(element.innerHTML).toBe('');
	});


	it('computed property', function () {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		element.innerHTML =
			'<div>{{ a }}</div>' +
			'<div>{{ b }}</div>' +
			'<div>{{ c }}</div>' +
			'<div>{{ d }}</div>' +
			'<div>{{ e }}</div>'

		vm = new MVVM({
			'view': element,
			'model': {
				'a': 520,
				'c': 1314
			},
			'computed': {
				'b': function () {
					return this.a + 1;
				},
				'd': function () {
					return this.c - 1;
				},
				'e': function () {
					// also can use other computed properties
					// but must use the computed properties before
					return this.b + this.d;
				}
			}
		});

		var divs = element.childNodes;
		var a = 0, b = 1, c = 2, d = 3, e = 4;

		expect(divs[a].textContent).toBe('520');
		expect(divs[b].textContent).toBe('521');
		expect(divs[c].textContent).toBe('1314');
		expect(divs[d].textContent).toBe('1313');
		expect(divs[e].textContent).toBe((521 + 1313) + '');

		// change a, b will alse changed
		vm.set('a', 250);
		expect(divs[a].textContent).toBe('250');
		expect(divs[b].textContent).toBe('251');
		expect(divs[e].textContent).toBe((251 + 1313) + '');

		// change c, d will alse changed
		vm.set('c', 886);
		expect(divs[c].textContent).toBe('886');
		expect(divs[d].textContent).toBe('885');
		expect(divs[e].textContent).toBe((251 + 885) + '');
	});


	it('computed property with non-function', function () {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		element.innerHTML =
			'<div>{{ a }}</div>' +
			'<div>{{ b }}</div>'

		vm = new MVVM({
			'view': element,
			'model': {
				'a': 123
			},
			'computed': {
				'b': 'this.a + 1'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('computed property [b] must be a getter function!');
	});
});