var MVVM = require('mvvm').default;
var util = require('src/util');

var triggerEvent = require('../../../test_util').triggerEvent;

describe("v-on >", function () {
	var element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('normal', function () {
		var count = 0;
		var cb = function () {
			count++;
		}

		element.innerHTML = '<span id="el" v-on:click="test"></span>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'test': cb
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(count).toBe(1);

		triggerEvent(el, 'click');
		triggerEvent(el, 'click');
		triggerEvent(el, 'click');
		expect(count).toBe(4);
	});


	it('a propagation situation', function () {
		element.innerHTML =
			'<div id="outer" v-on:click="outer">' +
				'<span id="inner" v-on:click="inner"></span>' +
			'</div>'

		var outerCount = 0, innerCount = 0;
		var vm = new MVVM({
			'view': element,
			'model': {
				'outer': function () {
					outerCount++;
				},
				'inner': function () {
					innerCount++;
				}
			}
		});
		var outer = element.querySelector('#outer');
		var inner = element.querySelector('#inner');

		triggerEvent(outer, 'click');
		expect(outerCount).toBe(1);
		expect(innerCount).toBe(0);

		triggerEvent(inner, 'click');
		expect(outerCount).toBe(2);
		expect(innerCount).toBe(1);

		triggerEvent(inner, 'click');
		expect(outerCount).toBe(3);
		expect(innerCount).toBe(2);

		triggerEvent(outer, 'click');
		triggerEvent(inner, 'click');
		expect(outerCount).toBe(5); // outer+1 and bubbling by inner+1, so is 5
		expect(innerCount).toBe(3);
	});


	it('use .stop to stopPropagation', function () {
		element.innerHTML =
			'<div id="outer" v-on:click="outer">' +
				'<span id="inner" v-on:click.stop="inner"></span>' +
			'</div>'

		var outerCount = 0, innerCount = 0;
		var vm = new MVVM({
			'view': element,
			'model': {
				'outer': function () {
					outerCount++;
				},
				'inner': function () {
					innerCount++;
				}
			}
		});
		var outer = element.querySelector('#outer');
		var inner = element.querySelector('#inner');

		triggerEvent(outer, 'click');
		expect(outerCount).toBe(1);
		expect(innerCount).toBe(0);

		triggerEvent(inner, 'click');
		expect(outerCount).toBe(1);
		expect(innerCount).toBe(1);

		triggerEvent(inner, 'click');
		expect(outerCount).toBe(1);
		expect(innerCount).toBe(2);

		triggerEvent(inner, 'click');
		expect(outerCount).toBe(1);
		expect(innerCount).toBe(3);

		triggerEvent(outer, 'click');
		triggerEvent(inner, 'click');
		expect(outerCount).toBe(2);
		expect(innerCount).toBe(4);
	});


	it('use .self to trigger event on self node', function () {
		element.innerHTML =
			'<div id="outer" v-on:click.self="outer">' +
				'<span id="inner" v-on:click="inner"></span>' +
			'</div>'

		var outerCount = 0, innerCount = 0;
		var vm = new MVVM({
			'view': element,
			'model': {
				'outer': function () {
					outerCount++;
				},
				'inner': function () {
					innerCount++;
				}
			}
		});
		var outer = element.querySelector('#outer');
		var inner = element.querySelector('#inner');

		triggerEvent(outer, 'click');
		expect(outerCount).toBe(1);
		expect(innerCount).toBe(0);

		triggerEvent(inner, 'click');
		expect(outerCount).toBe(1); // if not set .self, here should be 2 becasue propagation
		expect(innerCount).toBe(1);
	});


	it('a default situation', function () {
		element.innerHTML = '<a id="el" href="#abc" v-on:click="test"></a>';

		var hasPrevent;
		var vm = new MVVM({
			'view': element,
			'model': {
				'test': function (e) {
					// this feature is base on greater than or equal to ie9
					hasPrevent = e.defaultPrevented;
				}
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(hasPrevent).toBeFalsy();

		// there's no use hash to test default event because
		// in Firefox use triggerEvent for <a href="#abc"></a>
		// will not change window.location.hash, maybe it's a bug of Firefox 40.0
	});


	it('use .prevent to preventDefault', function () {
		element.innerHTML = '<a id="el" href="#abc" v-on:click.prevent="test"></a>';

		var hasPrevent;
		var vm = new MVVM({
			'view': element,
			'model': {
				'test': function (e) {
					hasPrevent = e.defaultPrevented;
				}
			}
		});
		var hash = window.location.hash;
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(hasPrevent).toBeTruthy();
		expect(window.location.hash).toBe(hash); // no change hash
	});


	it('setup keyCode', function () {
		element.innerHTML = '<input id="el" type="text" v-on:keyup.13="test">';

		var isEnter13 = false;
		var vm = new MVVM({
			'view': element,
			'model': {
				'test': function (e) {
					isEnter13 = e.keyCode === 13;
				}
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'keyup', function (e) {
			e.keyCode = 11;
		});
		expect(isEnter13).toBeFalsy();

		triggerEvent(el, 'keyup', function (e) {
			e.keyCode = 12;
		});
		expect(isEnter13).toBeFalsy();

		triggerEvent(el, 'keyup', function (e) {
			e.keyCode = 13;
		});
		expect(isEnter13).toBeTruthy();
	});


	it('passing multi arguments', function () {
		element.innerHTML = '<div id="el" v-on:mouseenter="test(123, \'sugar\', $event)"></div>';

		var args;
		var vm = new MVVM({
			'view': element,
			'model': {
				'test': function () {
					args = Array.prototype.slice.call(arguments);
				}
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'mouseenter');
		expect(args && args.length).toBe(3);
		expect(args && args[0]).toBe(123);
		expect(args && args[1]).toBe('sugar');
		expect(args && (args[2] instanceof Event)).toBeTruthy();
	});


	it('change event callback', function () {
		element.innerHTML = '<div id="el" v-on:click="test"></div>';

		var flag;
		var vm = new MVVM({
			'view': element,
			'model': {
				'test': function () {
					flag = 'first callback';
				}
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(flag).toBe('first callback');

		// change callback for binding
		vm.set('test', function () {
			flag = 'secound callback';
		});
		triggerEvent(el, 'click');
		expect(flag).toBe('secound callback');
	});


	it('multi events', function () {
		element.innerHTML = '<div id="el" v-on="{click: clickTest, mouseout: mouseoutTest(123, $event)}"></div>';

		var args, storeArgs = function () {
			args = Array.prototype.slice.call(arguments);
		}
		var vm = new MVVM({
			'view': element,
			'model': {
				'clickTest': storeArgs,
				'mouseoutTest': storeArgs
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(args.length).toBe(1);
		expect(args[0].type).toBe('click');

		triggerEvent(el, 'mouseout');
		expect(args.length).toBe(2);
		expect(args[0]).toBe(123);
		expect(args[1].type).toBe('mouseout');
	});


	it('change arguments with variable', function () {
		element.innerHTML = '<input id="el" v-on:focus="test(text, \'xxdk\')"/>';

		var args;
		var vm = new MVVM({
			'view': element,
			'model': {
				'text': 'aaa',
				'test': function (txt, num) {
					args = Array.prototype.slice.call(arguments);
				}
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'focus');
		expect(args.length).toBe(2);
		expect(args[0]).toBe('aaa');
		expect(args[1]).toBe('xxdk');

		// change data
		vm.set('text', 'AAA');
		triggerEvent(el, 'focus');
		expect(args.length).toBe(2);
		expect(args[0]).toBe('AAA');
		expect(args[1]).toBe('xxdk');
	});


	it('in v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span class="el" v-on:click="test($index, $event)">{{ item }}</span>' +
				'</li>' +
			'</ul>'

		var index, evt;
		var vm = new MVVM({
			'view': element,
			'model': {
				'items': [
					'aaa',
					'bbb',
					'ccc'
				],
				'test': function (i, e) {
					index = i;
					evt = e;
				}
			}
		});
		var data = vm.$data;
		var els = element.querySelectorAll('.el');

		triggerEvent(els[0], 'click');
		expect(index).toBe(0);
		expect(evt.target.textContent).toBe('aaa');

		triggerEvent(els[2], 'click');
		expect(index).toBe(2);
		expect(evt.target.textContent).toBe('ccc');

		// change array data
		expect(els[1].textContent).toBe('bbb');
		data.items.$set(1, 'BBB');
		// $set will recover original DOM
		els = element.querySelectorAll('.el');
		triggerEvent(els[1], 'click');
		expect(index).toBe(1);
		expect(evt.target.textContent).toBe('BBB');

		// test $index change with array method
		data.items.shift();
		els = element.querySelectorAll('.el');
		expect(data.items).toEqual([
			'BBB',
			'ccc'
		]);
		triggerEvent(els[0], 'click');
		expect(index).toBe(0);
		expect(evt.target.textContent).toBe('BBB');

		triggerEvent(els[1], 'click');
		expect(index).toBe(1);
		expect(evt.target.textContent).toBe('ccc');
	});


	it('use $remove event in v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items" v-on:dblclick="$remove">' +
					'{{ $index }}{{ item }}_' +
				'</li>' +
			'</ul>'

		var vm = new MVVM({
			'view': element,
			'model': {
				'items': ['a', 'b', 'c']
			}
		});

		var data = vm.$data;
		var ul = element.firstChild;

		expect(ul.textContent).toBe('0a_1b_2c_');

		var lis = ul.childNodes;
		triggerEvent(lis[1], 'dblclick');
		expect(ul.textContent).toBe('0a_1c_');

		var lis = ul.childNodes;
		triggerEvent(lis[0], 'dblclick');
		expect(ul.textContent).toBe('0c_');

		var lis = ul.childNodes;
		triggerEvent(lis[0], 'dblclick');
		expect(ul.textContent).toBe('');

		// push new data
		data.items.push('b');
		data.items.unshift('a');
		data.items.push('c');
		expect(ul.textContent).toBe('0a_1b_2c_');

		// come again above action
		var lis = ul.childNodes;
		triggerEvent(lis[1], 'dblclick');
		expect(ul.textContent).toBe('0a_1c_');

		var lis = ul.childNodes;
		triggerEvent(lis[0], 'dblclick');
		expect(ul.textContent).toBe('0c_');

		var lis = ul.childNodes;
		triggerEvent(lis[0], 'dblclick');
		expect(ul.textContent).toBe('');

		// cover new data
		data.items = ['n', 'b', 'a'];
		expect(ul.textContent).toBe('0n_1b_2a_');

		// come again above action
		var lis = ul.childNodes;
		triggerEvent(lis[1], 'dblclick');
		expect(ul.textContent).toBe('0n_1a_');

		var lis = ul.childNodes;
		triggerEvent(lis[0], 'dblclick');
		expect(ul.textContent).toBe('0a_');

		var lis = ul.childNodes;
		triggerEvent(lis[0], 'dblclick');
		expect(ul.textContent).toBe('');
	});


	it('use $remove outside v-for', function () {
		element.innerHTML = '<div v-on="{click: $remove}"></div>';

		var vm = new MVVM({
			'view': element,
			'model': {}
		});

		expect(util.warn).toHaveBeenCalledWith('The specify event $remove must be used in v-for scope');
	});
});