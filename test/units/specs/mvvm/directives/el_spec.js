import MVVM from 'mvvm';
import * as util from 'src/util';

describe('v-el >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('normal', function () {
		element.innerHTML = '<span id="test1" v-el="elSpan">123</span>';

		let vm = new MVVM({
			view: element,
			model: {}
		});

		expect(vm.$els.elSpan.textContent).toBe('123');
		expect(vm.$els.elSpan).toBe(element.querySelector('#test1'));

	});


	it('inside v-if render first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-if="isRender">' +
					'<span id="test2" v-el="elSpan">1234</span>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				isRender: true
			}
		});
		let data = vm.$data;

		expect(vm.$els.elSpan.textContent).toBe('1234');
		expect(vm.$els.elSpan).toBe(element.querySelector('#test2'));

		data.isRender = false;
		expect(vm.$els.elSpan).toBeNull();

		data.isRender = true;
		expect(vm.$els.elSpan.textContent).toBe('1234');
		expect(vm.$els.elSpan).toBe(element.querySelector('#test2'));
	});


	it('inside v-if no-render first', function () {
		element.innerHTML =
			'<div>' +
				'<div v-if="isRender">' +
					'<span id="test3" v-el="elSpan">12345</span>' +
				'</div>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				isRender: false
			}
		});
		let data = vm.$data;

		expect(vm.$els.elSpan).toBeUndefined();

		data.isRender = true;
		expect(vm.$els.elSpan.textContent).toBe('12345');
		expect(vm.$els.elSpan).toBe(element.querySelector('#test3'));

		data.isRender = false;
		expect(vm.$els.elSpan).toBeNull();
	});


	it('cannot inside v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span v-el="item.el" v-text="item.text"></span>' +
				'</li>' +
			'</ul>'

		new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a111' },
					{ text: 'b222' },
					{ text: 'c333' }
				]
			}
		});

		expect(util.warn).toHaveBeenCalledWith('v-el can not be used inside v-for! Consider use v-custom to handle v-for element.');
	});
});