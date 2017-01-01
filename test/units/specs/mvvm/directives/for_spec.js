import MVVM from 'mvvm';
import * as util from 'src/util';

describe('v-for >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('invalid expression', function () {
		element.innerHTML =
			'<ul id="test8">' +
				'<li v-for="item for items"></li>' +
			'</ul>'

		new MVVM({
			view: element,
			model: {
				items: null
			}
		});

		expect(util.warn).toHaveBeenCalledWith('The format of v-for must be like "item in/of items"!');
	});


	it('invalid use on the root element', function () {
		element.innerHTML = '<li v-for="item in items"></li>';

		new MVVM({
			view: element,
			model: {
				items: []
			}
		});

		expect(util.warn).toHaveBeenCalledWith('v-for cannot use in the root element!');
	});


	it('not array first', function () {
		element.innerHTML =
			'<ul id="test8">' +
				'<li v-for="item in items">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		new MVVM({
			view: element,
			model: {
				items: null
			}
		});
		let ul = element.querySelector('#test8');

		expect(ul.textContent).toBe('');
	});


	it('empty array first', function () {
		element.innerHTML =
			'<ul id="test8">' +
				'<li v-for="item in items">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: []
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test8');

		expect(ul.textContent).toBe('');

		items.push('a');
		expect(ul.textContent).toBe('a');
	});


	it('no-object item', function () {
		element.innerHTML =
			'<ul id="test1">' +
				'<li v-for="item in items">' +
					'{{ item }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: ['a', 'b']
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test1');

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

		// no delete & no add
		items.splice(1, 0);
		expect(ul.textContent).toBe('abCD');

		// cover
		data.items = ['A', 'B', 'C'];
		items = data.items;
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

		// splice for over length
		items.splice(2, 70, 'X');
		expect(ul.textContent).toBe('ABX');

		// splice from first & over length, will be recompiled
		items.splice(0, 140, 'O');
		expect(ul.textContent).toBe('O');
	});


	it('simple object item', function () {
		element.innerHTML =
			'<ul id="test2">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a' },
					{ text: 'b' }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test2');

		expect(ul.textContent).toBe('ab');

		items.push({ text: 'c' });
		items.push({ text: 'd' });
		items.push({ text: 'e' });
		items.push({ text: 'f' });
		expect(ul.textContent).toBe('abcdef');

		items.shift();
		expect(ul.textContent).toBe('bcdef');

		items.shift();
		items.shift();
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('f');

		items.unshift({ text: 'e' });
		items.unshift({ text: 'd' });
		items.unshift({ text: 'c' });
		items.unshift({ text: 'b' });
		items.unshift({ text: 'a' });
		expect(ul.textContent).toBe('abcdef');

		items.pop();
		items.pop();
		items.pop();
		expect(ul.textContent).toBe('abc');

		// only delete
		items.splice(1, 1);
		expect(ul.textContent).toBe('ac');

		// only add
		items.splice(1, 0, { text: 'b' });
		expect(ul.textContent).toBe('abc');

		// delete & add
		items.splice(2, 1, { text: 'C' }, { text: 'D' });
		expect(ul.textContent).toBe('abCD');

		// cover
		data.items = [{ text: 'A' }, { text: 'B' }, { text: 'C' }];
		items = data.items;
		expect(ul.textContent).toBe('ABC');

		// try again for new observe
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('C');

		items.unshift({ text: 'B' });
		items.unshift({ text: 'A' });
		expect(ul.textContent).toBe('ABC');

		items.push({ text: 'D' });
		items.push({ text: 'E' });
		items.push({ text: 'F' });
		items.push({ text: 'G' });
		items.push({ text: 'H' });
		expect(ul.textContent).toBe('ABCDEFGH');

		items.pop();
		items.pop();
		expect(ul.textContent).toBe('ABCDEF');

		items.splice(3, 2, { text: 'd'}, { text: 'e' });
		expect(ul.textContent).toBe('ABCdeF');
	});


	it('$index with no-object item', function () {
		element.innerHTML =
			'<ul id="test3">' +
				'<li v-for="item in items">' +
					'{{ $index }}_{{ item }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: ['a', 'b']
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test3');

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


	it('$parent.$index', function () {
		element.innerHTML =
			'<div>' +
				'<ul>' +
					'<li v-for="u in us">' +
						'|' +
						'<span v-for="p in u.ps">' +
							'{{ $parent.$index }}_{{ $index }}$' +
						'</span>' +
						'|' +
					'</li>' +
				'</ul>' +
			'</div>'

		let vm = new MVVM({
			view: element,
			model: {
				us: [
					{ ps: [1] },
					{ ps: [1,1] },
					{ ps: [1,1,1] }
				]
			}
		});

		let data = vm.$data;
		let ul = element.querySelector('ul');

		expect(ul.textContent).toBe('|0_0$||1_0$1_1$||2_0$2_1$2_2$|');

		data.us[2].ps.push(1);
		expect(ul.textContent).toBe('|0_0$||1_0$1_1$||2_0$2_1$2_2$2_3$|');

		data.us[2].ps.shift();
		expect(ul.textContent).toBe('|0_0$||1_0$1_1$||2_0$2_1$2_2$|');

		data.us.splice(1, 1);
		expect(ul.textContent).toBe('|0_0$||1_0$1_1$1_2$|');
	});


	it('$index with object item', function () {
		element.innerHTML =
			'<ul id="test4">' +
				'<li v-for="item in items">' +
					'{{ $index }}_{{ item.text }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a' },
					{ text: 'b' }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test4');

		expect(ul.textContent).toBe('0_a1_b');

		items.push({ text: 'c' });
		items.push({ text: 'd' });
		items.push({ text: 'e' });
		expect(ul.textContent).toBe('0_a1_b2_c3_d4_e');

		items.shift();
		items.shift();
		items.shift();
		expect(ul.textContent).toBe('0_d1_e');

		items.unshift({ text: 'c' });
		items.unshift({ text: 'b' });
		expect(ul.textContent).toBe('0_b1_c2_d3_e');

		items.pop();
		items.pop();
		expect(ul.textContent).toBe('0_b1_c');

		items.splice(0, 1, { text: 'B' });
		items.splice(1, 1, { text: 'C' });
		expect(ul.textContent).toBe('0_B1_C');

		items.splice(0, 2);
		expect(ul.textContent).toBe('');

		data.items = [{ text: 'X' }, { text: 'Y' }, { text: 'Z' }];
		expect(ul.textContent).toBe('0_X1_Y2_Z');
	});


	it('$set', function () {
		element.innerHTML =
			'<ul id="test5">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a' },
					{ text: 'b' }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test5');

		expect(ul.textContent).toBe('ab');

		items.$set(1, { text: 'B' });
		expect(ul.textContent).toBe('aB');

		items.unshift({ text: 'x' });
		items.$set(1, { text: 'A' });
		expect(ul.textContent).toBe('xAB');

		items.unshift({ text: 'y' });
		items.$set(1, { text: 'X' });
		expect(ul.textContent).toBe('yXAB');

		items.shift();
		items.$set(1, { text: 'a' });
		expect(ul.textContent).toBe('XaB');

		items.shift();
		items.$set(1, { text: 'b' });
		expect(ul.textContent).toBe('ab');
	});


	it('$remove', function () {
		element.innerHTML =
			'<ul id="test6">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a' },
					{ text: 'b' }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test6');

		expect(ul.textContent).toBe('ab');

		items.$remove(items[0]);
		expect(ul.textContent).toBe('b');

		items.push({ text: 'c' });
		items.push({ text: 'd' });
		items.push({ text: 'e' });
		expect(ul.textContent).toBe('bcde');

		items.splice(0, 0, { text: 'a' });
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


	it('two level v-for and cross scope', function () {
		element.innerHTML =
			'<ul id="test7">' +
				'<li v-for="item in items">' +
					'<b>{{ item.text }}-</b>' +
					'<span v-for="sub in item.subs">' +
						'{{ item.text + \'_\' + sub.text }}' +
					'</span>' +
					' ' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'A', subs: [{ text: 'a' }] },
					{ text: 'B', subs: [{ text: 'b' }] }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test7');

		expect(ul.textContent).toBe('A-A_a B-B_b ');

		items[0].text = 'A1';
		expect(ul.textContent).toBe('A1-A1_a B-B_b ');

		items[0].subs[0].text = 'a1';
		expect(ul.textContent).toBe('A1-A1_a1 B-B_b ');

		items[1].text = 'B1';
		expect(ul.textContent).toBe('A1-A1_a1 B1-B1_b ');

		items[1].subs[0].text = 'b1';
		expect(ul.textContent).toBe('A1-A1_a1 B1-B1_b1 ');

		items[0].text = 'A2';
		expect(ul.textContent).toBe('A2-A2_a1 B1-B1_b1 ');

		items[0].subs[0].text = 'a2';
		expect(ul.textContent).toBe('A2-A2_a2 B1-B1_b1 ');

		items[0].subs.push({'text': 'a3'});
		expect(ul.textContent).toBe('A2-A2_a2A2_a3 B1-B1_b1 ');

		items[1].subs.push({'text': 'b2'});
		expect(ul.textContent).toBe('A2-A2_a2A2_a3 B1-B1_b1B1_b2 ');

		items[1].subs = [{'text': 'b3'}];
		expect(ul.textContent).toBe('A2-A2_a2A2_a3 B1-B1_b3 ');

		items[1].subs[0].text = 'b4';
		expect(ul.textContent).toBe('A2-A2_a2A2_a3 B1-B1_b4 ');

		items[0].subs.pop();
		expect(ul.textContent).toBe('A2-A2_a2 B1-B1_b4 ');

		items[0].subs.unshift({'text': 'a0'});
		expect(ul.textContent).toBe('A2-A2_a0A2_a2 B1-B1_b4 ');

		items[0].subs.shift();
		expect(ul.textContent).toBe('A2-A2_a2 B1-B1_b4 ');
	});


	it('same object value', function () {
		element.innerHTML =
			'<ul id="test">' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a' },
					{ text: 'b' },
					{ text: 'c' }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test');

		expect(ul.textContent).toBe('abc');

		// set 0 to 2, and their value will be related
		items.$set(0, items[2]);
		expect(ul.textContent).toBe('cbc');

		// change one of both, the other will be changed
		items[0].text = 'x';
		expect(ul.textContent).toBe('xbx');
		items[2].text = 'o';
		expect(ul.textContent).toBe('obo');

		// all the same
		let obj = { text: 'x' };
		data.items = [obj, obj, obj];
		expect(ul.textContent).toBe('xxx');

		obj.text = 'y';
		expect(ul.textContent).toBe('yyy');

		// take one hair and move the whole body
		data.items[1].text = 'z';
		expect(ul.textContent).toBe('zzz');
	});


	it('with non-directive element equal to v-for', function () {
		element.innerHTML =
			'<ul id="test">' +
				'<a>XX</a>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
				'<b>OO</b>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ text: 'a' },
					{ text: 'b' },
					{ text: 'c' }
				]
			}
		});
		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test');

		expect(ul.textContent).toBe('XXabcOO');

		items.$set(1, { text: 'B' });
		expect(ul.textContent).toBe('XXaBcOO');

		items.splice(1, 1);
		expect(ul.textContent).toBe('XXacOO');

		data.items = [];
		expect(ul.textContent).toBe('XXOO');

		data.items.unshift({ text: 'a' });
		expect(ul.textContent).toBe('XXaOO');

		data.items.push({ text: 'b' });
		expect(ul.textContent).toBe('XXabOO');

		// if over array length, append to last
		data.items.$set(100, { text: 'c' });
		expect(data.items.length).toBe(3);
		expect(ul.textContent).toBe('XXabcOO');

		// replace the first one
		data.items.$set(0, { text: 'A' });
		expect(ul.textContent).toBe('XXAbcOO');

		// replace the last one
		data.items.$set(2, { text: 'C' });
		expect(ul.textContent).toBe('XXAbCOO');

		// exchange array item A and C
		let tmp = data.items[0];
		data.items.$set(0, data.items[2]);
		data.items.$set(2, tmp);
		expect(ul.textContent).toBe('XXCbAOO');

		data.items[0].text = 'c';
		expect(ul.textContent).toBe('XXcbAOO');

		data.items[2].text = 'a';
		expect(ul.textContent).toBe('XXcbaOO');
	});


	it('two-dimensional array', function () {
		element.innerHTML =
			'<ul id="test">' +
				'<li v-for="item in items">' +
					'-' +
					'<ul>' +
						'<li v-for="sub in item">' +
							'{{ sub }}' +
						'</li>' +
					'</ul>' +
					'-' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					['a']
				]
			}
		});

		let data = vm.$data;
		let items = data.items;
		let ul = element.querySelector('#test');

		expect(ul.textContent).toBe('-a-');

		items[0].push('b');
		expect(ul.textContent).toBe('-ab-');
		items[0].push('c');
		expect(ul.textContent).toBe('-abc-');

		items.$set(0, []); // amount to `items[0] = []`
		expect(ul.textContent).toBe('--');

		items[0].unshift('c');
		items[0].unshift('b');
		items[0].unshift('a');
		expect(ul.textContent).toBe('-abc-');

		items.push(['d', 'e', 'f']);
		expect(ul.textContent).toBe('-abc--def-');

		items[1].push('g');
		items[1].push('h');
		expect(ul.textContent).toBe('-abc--defgh-');

		items.splice(0, 1);
		expect(ul.textContent).toBe('-defgh-');

		items[0].unshift('c');
		items[0].unshift('b');
		items[0].unshift('a');
		expect(ul.textContent).toBe('-abcdefgh-');
	});
});