import MVVM from 'mvvm';
import * as util from 'src/util';

describe('v-custom >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('use invalid directive value', function () {
		element.innerHTML = '<div v-custom:xxdk="test"></div>';

		new MVVM({
			view: element,
			model: {
				test: 123
			},
			customs: {
				xxdk: 11111
			}
		});

		expect(util.warn).toHaveBeenCalledWith('Custom directive [v-custom:xxdk] must define with a refresh function!');
	});


	it('normal', function () {
		element.innerHTML = '<div v-custom:xxdk="test"></div>';

		let flagNew, flagOld, flagEl;
		let vm = new MVVM({
			view: element,
			model: {
				test: 123
			},
			customs: {
				// that will use as directive refresh function
				// which is called by watcher init and depends change
				// and `this` will point at the current Parser instance
				xxdk: function (newValue, oldValue) {
					flagNew = newValue;
					flagOld = oldValue;
					flagEl = this.el;
				}
			}
		});
		let data = vm.$data;

		expect(flagEl).toBe(element.firstChild);

		expect(flagNew).toBe(123);
		expect(flagOld).toBeUndefined();

		data.test = '321';
		expect(flagNew).toBe('321');
		expect(flagOld).toBe(123);
	});


	it('complex expression', function () {
		element.innerHTML = '<div v-custom:xxdk="isInt ? int : decimal"></div>';

		let flagNew, flagOld;
		let vm = new MVVM({
			view: element,
			model: {
				isInt: true,
				int: 123,
				decimal: 1.23
			},
			customs: {
				xxdk: function (newValue, oldValue) {
					flagNew = newValue;
					flagOld = oldValue;
				}
			}
		});
		let data = vm.$data;

		expect(flagNew).toBe(123);
		expect(flagOld).toBeUndefined();

		data.isInt = false;
		expect(flagNew).toBe(1.23);
		expect(flagOld).toBe(123);

		data.decimal = 4.56;
		expect(flagNew).toBe(4.56);
		expect(flagOld).toBe(1.23);

		data.int = 456;
		expect(flagNew).toBe(4.56);
		expect(flagOld).toBe(1.23);

		data.isInt = true;
		expect(flagNew).toBe(456);
		expect(flagOld).toBe(4.56);
	});


	it('in v-for and use in diffrent element', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items" v-custom:text="item"></li>' +
			'</ul>' +
			'<h1 v-custom:text="title"></h1>'

		let vm = new MVVM({
			view: element,
			model: {
				title: 'txgc',
				items: ['a', 'b', 'c']
			},
			customs: {
				// mock for v-text directive use v-custom
				text: function (text) {
					this.el.textContent = text;
				}
			}
		});

		let data = vm.$data;
		let ul = element.firstChild;
		let h1 = element.childNodes[1];

		expect(ul.textContent).toBe('abc');
		expect(h1.textContent).toBe('txgc');

		data.title = 'xxdk';
		expect(h1.textContent).toBe('xxdk');

		data.items.$set(1, 'B');
		expect(ul.textContent).toBe('aBc');

		data.items.push('d');
		expect(ul.textContent).toBe('aBcd');
	});
});