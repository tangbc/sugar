var MVVM = require('mvvm').default;
var util = require('src/util').default;

/*------------------------------*/
describe("v-el >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('normal', function() {
		element.innerHTML = '<span id="test1" v-el="elSpan">123</span>';

		var vm = new MVVM(element, {});
		var data = vm.get();

		expect(data.$els.elSpan.textContent).toBe('123');
		expect(data.$els.elSpan).toBe(element.querySelector('#test1'));

	});


	it('inside v-if render first', function() {
		element.innerHTML =
			'<div v-if="isRender">' +
				'<span id="test2" v-el="elSpan">1234</span>' +
			'</div>'

		var vm = new MVVM(element, {
			'isRender': true
		});
		var data = vm.get();

		expect(data.$els.elSpan.textContent).toBe('1234');
		expect(data.$els.elSpan).toBe(element.querySelector('#test2'));

		data.isRender = false;
		expect(data.$els.elSpan).toBeNull();

		data.isRender = true;
		expect(data.$els.elSpan.textContent).toBe('1234');
		expect(data.$els.elSpan).toBe(element.querySelector('#test2'));
	});


	it('inside v-if no-render first', function() {
		element.innerHTML =
			'<div v-if="isRender">' +
				'<span id="test3" v-el="elSpan">12345</span>' +
			'</div>'

		var vm = new MVVM(element, {
			'isRender': false
		});
		var data = vm.get();

		expect(data.$els.elSpan).toBeUndefined();

		data.isRender = true;
		expect(data.$els.elSpan.textContent).toBe('12345');
		expect(data.$els.elSpan).toBe(element.querySelector('#test3'));

		data.isRender = false;
		expect(data.$els.elSpan).toBeNull();
	});


	it('inside v-for', function() {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span v-el="item.el" v-text="item.text"></span>' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a111'},
				{'text': 'b222'},
				{'text': 'c333'}
			]
		});
		var items = vm.get('items');

		expect(items[0].el.textContent).toBe(items[0].text);
		expect(items[1].el.textContent).toBe(items[1].text);
		expect(items[2].el.textContent).toBe(items[2].text);

		items.$set(1, {'text': '222b'});
		expect(items[1].el.textContent).toBe('222b');

		items.$remove(items[0]);
		expect(items[1].el.textContent).toBe('c333');
	});


	it('inside v-for with invalid register', function() {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span v-el="elSpan" v-text="item.text"></span>' +
				'</li>' +
			'</ul>'

		new MVVM(element, {
			'items': [
				{'text': 'a111'},
				{'text': 'b222'},
				{'text': 'c333'}
			]
		});

		expect(util.warn).toHaveBeenCalledWith('If v-el use in v-for, it must be defined on loop body');
	});
});