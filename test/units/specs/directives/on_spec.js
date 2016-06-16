define([
	'../../../../src/mvvm/index'
], function(MVVM) {
/*------------------------------*/

function triggerEvent(target, evt, process) {
	var e = document.createEvent('HTMLEvents');
	e.initEvent(evt, true, true);

	if (process) {
		process(e);
	}

	target.dispatchEvent(e);
}


describe("v-on >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('normal', function() {
		var count = 0;
		var cb = function() {
			count++;
		}

		element.innerHTML = '<span id="el" v-on:click="test"></span>';

		var vm = new MVVM(element, {
			'test': cb
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(count).toBe(1);

		triggerEvent(el, 'click');
		triggerEvent(el, 'click');
		triggerEvent(el, 'click');
		expect(count).toBe(4);
	});


	it('a propagation situation', function() {
		element.innerHTML = [
			'<div id="outer" v-on:click="outer">',
				'<span id="inner" v-on:click="inner"></span>',
			'</div>'
		].join('');

		var outerCount = 0, innerCount = 0;
		var vm = new MVVM(element, {
			'outer': function() {
				outerCount++;
			},
			'inner': function() {
				innerCount++;
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


	it('use .stop to stopPropagation', function() {
		element.innerHTML = [
			'<div id="outer" v-on:click="outer">',
				'<span id="inner" v-on:click.stop="inner"></span>',
			'</div>'
		].join('');

		var outerCount = 0, innerCount = 0;
		var vm = new MVVM(element, {
			'outer': function() {
				outerCount++;
			},
			'inner': function() {
				innerCount++;
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


	it('a default situation', function() {
		element.innerHTML = '<a id="el" href="#abc" v-on:click="test"></a>';

		var hasPrevent;
		var vm = new MVVM(element, {
			'test': function(e) {
				// this feature is base on greater than or equal to ie9
				hasPrevent = e.defaultPrevented;
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(hasPrevent).toBeFalsy();

		// there's no use hash to test default event because
		// in Firefox use triggerEvent for <a href="#abc"></a>
		// will not change window.location.hash, maybe it's a bug of Firefox 40.0
	});


	it('use .prevent to preventDefault', function() {
		element.innerHTML = '<a id="el" href="#abc" v-on:click.prevent="test"></a>';

		var hasPrevent;
		var vm = new MVVM(element, {
			'test': function(e) {
				hasPrevent = e.defaultPrevented;
			}
		});
		var hash = window.location.hash;
		var el = element.querySelector('#el');

		triggerEvent(el, 'click');
		expect(hasPrevent).toBeTruthy();
		expect(window.location.hash).toBe(hash); // no change hash
	});


	it('setup keyCode', function() {
		element.innerHTML = '<input id="el" type="text" v-on:keyup.13="test">';

		var isEnter13 = false;
		var vm = new MVVM(element, {
			'test': function(e) {
				isEnter13 = e.keyCode === 13;
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'keyup', function(e) {
			e.keyCode = 11;
		});
		expect(isEnter13).toBeFalsy();

		triggerEvent(el, 'keyup', function(e) {
			e.keyCode = 12;
		});
		expect(isEnter13).toBeFalsy();

		triggerEvent(el, 'keyup', function(e) {
			e.keyCode = 13;
		});
		expect(isEnter13).toBeTruthy();
	});


	it('passing multi arguments', function() {
		element.innerHTML = '<div id="el" v-on:mouseenter="test(123, \'sugar\', $event)"></div>';

		var args;
		var vm = new MVVM(element, {
			'test': function() {
				args = Array.prototype.slice.call(arguments);
			}
		});
		var el = element.querySelector('#el');

		triggerEvent(el, 'mouseenter');
		expect(args && args.length).toBe(3);
		expect(args && args[0]).toBe(123);
		expect(args && args[1]).toBe('sugar');
		expect(args && (args[2] instanceof Event)).toBeTruthy();
	});
});
/*------------------------------*/
});