var MVVM = require('mvvm').default;

describe("v-text >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('normal', function() {
		element.innerHTML = '<div id="test1" v-text="text"></div>';

		var vm = new MVVM(element, {
			'text': '123'
		});
		var data = vm.get();

		expect(element.querySelector('#test1').textContent).toBe('123');

		data.text = '321 123';
		expect(element.querySelector('#test1').textContent).toBe('321 123');
	});


	it('mustache', function() {
		element.innerHTML = '<div id="test2">{{ text }}</div>';

		var vm = new MVVM(element, {
			'text': '123'
		});
		var data = vm.get();

		expect(element.querySelector('#test2').textContent).toBe('123');

		data.text = '321 123';
		expect(element.querySelector('#test2').textContent).toBe('321 123');
	});


	it('multi expression with normal', function() {
		element.innerHTML = '<div id="test3" v-text="\'hello! \' + name"></div>';

		var vm = new MVVM(element, {
			'name': 'Stephen'
		});
		var data = vm.get();

		expect(element.querySelector('#test3').textContent).toBe('hello! Stephen');

		data.name = 'Klay';
		expect(element.querySelector('#test3').textContent).toBe('hello! Klay');
	});


	it('multi expression with mustache', function() {
		element.innerHTML = '<div id="test4">hello! {{ name }}</div>';

		var vm = new MVVM(element, {
			'name': 'Stephen'
		});
		var data = vm.get();

		expect(element.querySelector('#test4').textContent).toBe('hello! Stephen');

		data.name = 'Klay';
		expect(element.querySelector('#test4').textContent).toBe('hello! Klay');
	});


	it('normal in v-for', function() {
		element.innerHTML =
			'<ul id="test5">' +
				'<li v-for="item in items">' +
					'<span v-text="item.text"></span>' +
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
		var ul = element.querySelector('#test5');

		expect(ul.textContent).toBe('a111b222c333');

		items[1].text = '222b';
		expect(ul.textContent).toBe('a111222bc333');

		items.$set(2, {'text': '333ccc'});
		expect(ul.textContent).toBe('a111222b333ccc');

		items.$remove(items[0]);
		expect(ul.textContent).toBe('222b333ccc');
	});


	it('mustache in v-for', function() {
		element.innerHTML =
			'<ul id="test6">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
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
		var ul = element.querySelector('#test6');

		expect(ul.textContent).toBe('a111b222c333');

		items[1].text = '222b';
		expect(ul.textContent).toBe('a111222bc333');

		items.$set(2, {'text': '333ccc'});
		expect(ul.textContent).toBe('a111222b333ccc');

		items.$remove(items[0]);
		expect(ul.textContent).toBe('222b333ccc');
	});


	it('multi expression with normal in v-for', function() {
		element.innerHTML =
			'<ul id="test7">' +
				'<li v-for="item in items">' +
					'<span v-text="item.text + \'_\' + item.name"></span>' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a111', 'name': 'A'},
				{'text': 'b222', 'name': 'B'},
				{'text': 'c333', 'name': 'C'}
			]
		});
		var items = vm.get('items');
		var ul = element.querySelector('#test7');

		expect(ul.textContent).toBe('a111_Ab222_Bc333_C');

		items[1].text = '222b';
		expect(ul.textContent).toBe('a111_A222b_Bc333_C');

		items[1].name = 'BB';
		expect(ul.textContent).toBe('a111_A222b_BBc333_C');

		items.$set(0, {'text': 'aaa', 'name': 'AAA'});
		expect(ul.textContent).toBe('aaa_AAA222b_BBc333_C');

		items.$remove(items[2]);
		expect(ul.textContent).toBe('aaa_AAA222b_BB');

		items.push({'text': '333c', 'name': 'CC'});
		expect(ul.textContent).toBe('aaa_AAA222b_BB333c_CC');

		items.shift();
		expect(ul.textContent).toBe('222b_BB333c_CC');

		items[0].text = 'b222';
		expect(ul.textContent).toBe('b222_BB333c_CC');

		items.unshift({'text': 'aaa', 'name': 'AAA'});
		expect(ul.textContent).toBe('aaa_AAAb222_BB333c_CC');

		items[1].name = '2B';
		expect(ul.textContent).toBe('aaa_AAAb222_2B333c_CC');
	});


	it('multi expression with mustache in v-for', function() {
		element.innerHTML =
			'<ul id="test8">' +
				'<li v-for="item in items">' +
					'{{ item.text }}_{{ item.name }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a111', 'name': 'A'},
				{'text': 'b222', 'name': 'B'},
				{'text': 'c333', 'name': 'C'}
			]
		});
		var items = vm.get('items');
		var ul = element.querySelector('#test8');

		expect(ul.textContent).toBe('a111_Ab222_Bc333_C');

		items[1].text = '222b';
		expect(ul.textContent).toBe('a111_A222b_Bc333_C');

		items[1].name = 'BB';
		expect(ul.textContent).toBe('a111_A222b_BBc333_C');

		items.$set(0, {'text': 'aaa', 'name': 'AAA'});
		expect(ul.textContent).toBe('aaa_AAA222b_BBc333_C');

		items.$remove(items[2]);
		expect(ul.textContent).toBe('aaa_AAA222b_BB');

		items.push({'text': '333c', 'name': 'CC'});
		expect(ul.textContent).toBe('aaa_AAA222b_BB333c_CC');

		items.shift();
		expect(ul.textContent).toBe('222b_BB333c_CC');

		items[0].text = 'b222';
		expect(ul.textContent).toBe('b222_BB333c_CC');

		items.unshift({'text': 'aaa', 'name': 'AAA'});
		expect(ul.textContent).toBe('aaa_AAAb222_BB333c_CC');

		items[1].name = '2B';
		expect(ul.textContent).toBe('aaa_AAAb222_2B333c_CC');
	});
});