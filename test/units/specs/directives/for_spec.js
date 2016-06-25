var MVVM = require('mvvm');

describe("v-for >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('not array first', function() {
		element.innerHTML =
			'<ul id="test8">' +
				'<li v-for="item in items">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': null
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test8');

		expect(ul.textContent).toBe('');
	});


	it('empty array first', function() {
		element.innerHTML =
			'<ul id="test8">' +
				'<li v-for="item in items">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': []
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test8');

		expect(ul.textContent).toBe('');

		items.push('a');
		expect(ul.textContent).toBe('a');
	});


	it('no-object item', function() {
		element.innerHTML =
			'<ul id="test1">' +
				'<li v-for="item in items">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': ['a', 'b']
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test1');

		expect(ul.textContent).toBe('ab');

		items.push('c');
		items.push('d');
		items.push('e');
		items.push('f');
		expect(ul.textContent).toBe('abcdef');

		items.shift();
		expect(ul.textContent).toBe('bcdef');

		items.shift();
		items.shift();
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('f');

		items.unshift('e');
		items.unshift('d');
		items.unshift('c');
		items.unshift('b');
		items.unshift('a');
		expect(ul.textContent).toBe('abcdef');

		items.pop();
		items.pop();
		items.pop();
		expect(ul.textContent).toBe('abc');

		// only delete
		items.splice(1, 1);
		expect(ul.textContent).toBe('ac');

		// only add
		items.splice(1, 0, 'b');
		expect(ul.textContent).toBe('abc');

		// delete & add
		items.splice(2, 1, 'C', 'D');
		expect(ul.textContent).toBe('abCD');

		// cover
		data.items = ['A', 'B', 'C'];
		expect(ul.textContent).toBe('ABC');

		// try again for new observe
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('C');

		items.unshift('B');
		items.unshift('A');
		expect(ul.textContent).toBe('ABC');

		items.push('D');
		items.push('E');
		items.push('F');
		items.push('G');
		items.push('H');
		expect(ul.textContent).toBe('ABCDEFGH');

		items.pop();
		items.pop();
		expect(ul.textContent).toBe('ABCDEF');

		items.splice(3, 2, 'd', 'e');
		expect(ul.textContent).toBe('ABCdeF');
	});


	it('simple object item', function() {
		element.innerHTML =
			'<ul id="test2">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a'},
				{'text': 'b'}
			]
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test2');

		expect(ul.textContent).toBe('ab');

		items.push({'text': 'c'});
		items.push({'text': 'd'});
		items.push({'text': 'e'});
		items.push({'text': 'f'});
		expect(ul.textContent).toBe('abcdef');

		items.shift();
		expect(ul.textContent).toBe('bcdef');

		items.shift();
		items.shift();
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('f');

		items.unshift({'text': 'e'});
		items.unshift({'text': 'd'});
		items.unshift({'text': 'c'});
		items.unshift({'text': 'b'});
		items.unshift({'text': 'a'});
		expect(ul.textContent).toBe('abcdef');

		items.pop();
		items.pop();
		items.pop();
		expect(ul.textContent).toBe('abc');

		// only delete
		items.splice(1, 1);
		expect(ul.textContent).toBe('ac');

		// only add
		items.splice(1, 0, {'text': 'b'});
		expect(ul.textContent).toBe('abc');

		// delete & add
		items.splice(2, 1, {'text': 'C'}, {'text': 'D'});
		expect(ul.textContent).toBe('abCD');

		// cover
		data.items = [{'text': 'A'}, {'text': 'B'}, {'text': 'C'}];
		expect(ul.textContent).toBe('ABC');

		// try again for new observe
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('C');

		items.unshift({'text': 'B'});
		items.unshift({'text': 'A'});
		expect(ul.textContent).toBe('ABC');

		items.push({'text': 'D'});
		items.push({'text': 'E'});
		items.push({'text': 'F'});
		items.push({'text': 'G'});
		items.push({'text': 'H'});
		expect(ul.textContent).toBe('ABCDEFGH');

		items.pop();
		items.pop();
		expect(ul.textContent).toBe('ABCDEF');

		items.splice(3, 2, {'text': 'd'}, {'text': 'e'});
		expect(ul.textContent).toBe('ABCdeF');
	});


	it('$index with no-object item', function() {
		element.innerHTML =
			'<ul id="test3">' +
				'<li v-for="item in items">' +
					'{{ $index }}_{{ item }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': ['a', 'b']
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test3');

		expect(ul.textContent).toBe('0_a1_b');

		items.push('c');
		items.push('d');
		items.push('e');
		expect(ul.textContent).toBe('0_a1_b2_c3_d4_e');

		items.shift();
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('0_d1_e');

		items.unshift('c');
		items.unshift('b');
		expect(ul.textContent).toBe('0_b1_c2_d3_e');

		items.pop();
		items.pop();
		expect(ul.textContent).toBe('0_b1_c');

		items.splice(0, 1, 'B');
		items.splice(1, 1, 'C');
		expect(ul.textContent).toBe('0_B1_C');

		items.splice(0, 2);
		expect(ul.textContent).toBe('');

		data.items = ['X', 'Y', 'Z'];
		expect(ul.textContent).toBe('0_X1_Y2_Z');
	});


	it('$index with object item', function() {
		element.innerHTML =
			'<ul id="test4">' +
				'<li v-for="item in items">' +
					'{{ $index }}_{{ item.text }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a'},
				{'text': 'b'}
			]
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test4');

		expect(ul.textContent).toBe('0_a1_b');

		items.push({'text': 'c'});
		items.push({'text': 'd'});
		items.push({'text': 'e'});
		expect(ul.textContent).toBe('0_a1_b2_c3_d4_e');

		items.shift();
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('0_d1_e');

		items.unshift({'text': 'c'});
		items.unshift({'text': 'b'});
		expect(ul.textContent).toBe('0_b1_c2_d3_e');

		items.pop();
		items.pop();
		expect(ul.textContent).toBe('0_b1_c');

		items.splice(0, 1, {'text': 'B'});
		items.splice(1, 1, {'text': 'C'});
		expect(ul.textContent).toBe('0_B1_C');

		items.splice(0, 2);
		expect(ul.textContent).toBe('');

		data.items = [{'text': 'X'}, {'text': 'Y'}, {'text': 'Z'}];
		expect(ul.textContent).toBe('0_X1_Y2_Z');
	});


	it('$set', function() {
		element.innerHTML =
			'<ul id="test5">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a'},
				{'text': 'b'}
			]
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test5');

		expect(ul.textContent).toBe('ab');

		items.$set(1, {'text': 'B'});
		expect(ul.textContent).toBe('aB');

		items.unshift({'text': 'x'});
		items.$set(1, {'text': 'A'});
		expect(ul.textContent).toBe('xAB');

		items.unshift({'text': 'y'});
		items.$set(1, {'text': 'X'});
		expect(ul.textContent).toBe('yXAB');

		items.shift();
		items.$set(1, {'text': 'a'});
		expect(ul.textContent).toBe('XaB');

		items.shift();
		items.$set(1, {'text': 'b'});
		expect(ul.textContent).toBe('ab');
	});


	it('$remove', function() {
		element.innerHTML =
			'<ul id="test6">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'a'},
				{'text': 'b'}
			]
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test6');

		expect(ul.textContent).toBe('ab');

		items.$remove(items[0]);
		expect(ul.textContent).toBe('b');

		items.push({'text': 'c'});
		items.push({'text': 'd'});
		items.push({'text': 'e'});
		expect(ul.textContent).toBe('bcde');

		items.splice(0, 0, {'text': 'a'});
		expect(ul.textContent).toBe('abcde');

		items.$remove(items[2]);
		expect(ul.textContent).toBe('abde');

		items.$remove(items[2]);
		expect(ul.textContent).toBe('abe');

		items.$remove(items[2]);
		expect(ul.textContent).toBe('ab');

		// for invalid remove
		items.$remove(items[2]);
		expect(items.length).toBe(2);
		expect(ul.textContent).toBe('ab');

		items.$remove(items[0]);
		expect(ul.textContent).toBe('b');
	});


	it('two level v-for and cross scope', function() {
		element.innerHTML =
			'<ul id="test7">' +
				'<li v-for="item in items">' +
					'<b>{{ item.text }}-</b>' +
					'<span v-for="sub in item.subs">' +
						'{{ item.text + \'_\' + sub.text }}' +
					'</span>' +
				'</li>' +
			'</ul>'

		var vm = new MVVM(element, {
			'items': [
				{'text': 'A', 'subs': [{'text': 'a'}]},
				{'text': 'B', 'subs': [{'text': 'b'}]}
			]
		});
		var data = vm.get();
		var items = data.items;
		var ul = element.querySelector('#test7');

		expect(ul.textContent).toBe('A-A_aB-B_b');

		items[1].subs[0].text = 'bbb';
		expect(ul.textContent).toBe('A-A_aB-B_bbb');
	});
});