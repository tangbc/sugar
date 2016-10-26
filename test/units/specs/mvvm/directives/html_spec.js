import MVVM from 'mvvm';

describe('v-html >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('normal', function () {
		element.innerHTML = '<div id="test1" v-html="layout"></div>';

		let vm = new MVVM({
			view: element,
			model: {
				layout: ''
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test1');

		expect(div.innerHTML).toBe('');

		data.layout = '<h2>title</h2><p>This is a paragraph</p>';
		expect(div.innerHTML).toBe('<h2>title</h2><p>This is a paragraph</p>');

		data.layout = 'This is a plain text string';
		expect(div.innerHTML).toBe('This is a plain text string');

		// undefine and null will transfer to ''
		data.layout = undefined;
		expect(div.innerHTML).toBe('');

		data.layout = {};
		expect(div.innerHTML).toBe('[object Object]');
	});


	it('normal in v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<p class="pp" v-html="item.layout"></p>' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ layout: '<i>aaa</i>' },
					{ layout: '<b>bbb</b>' },
					{ layout: '<span>ccc</span>' },
				]
			}

		});
		let items = vm.$data.items;
		let ps = element.querySelectorAll('.pp');

		expect(ps[0].innerHTML).toBe('<i>aaa</i>');
		expect(ps[1].innerHTML).toBe('<b>bbb</b>');
		expect(ps[2].innerHTML).toBe('<span>ccc</span>');

		items[0].layout = '<h2>AAA</h2>';
		expect(ps[0].innerHTML).toBe('<h2>AAA</h2>');

		items[1].layout = 'plain text bbb';
		expect(ps[1].innerHTML).toBe('plain text bbb');

		items.$set(2, { layout: '<div>CC</div>' });
		ps = element.querySelectorAll('.pp');
		expect(ps[2].innerHTML).toBe('<div>CC</div>');

		items.$remove(items[0]);
		ps = element.querySelectorAll('.pp');
		expect(ps[0].innerHTML).toBe('plain text bbb');
		expect(ps[1].innerHTML).toBe('<div>CC</div>');
	});
});