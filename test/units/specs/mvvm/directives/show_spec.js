import MVVM from 'mvvm';

describe('v-show >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('normal hidden first', function () {
		element.innerHTML = '<div id="test1" v-show="isShow">title</div>';

		let vm = new MVVM({
			view: element,
			model: {
				isShow: false
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test1');

		expect(div.style.display).toBe('none');

		data.isShow = true;
		expect(div.style.display).toBe('');
	});


	it('normal show first', function () {
		element.innerHTML = '<div id="test2" v-show="isShow">title</div>';

		let vm = new MVVM({
			view: element,
			model: {
				isShow: true
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test2');

		expect(div.style.display).toBe('');

		data.isShow = false;
		expect(div.style.display).toBe('none');
	});


	it('has inline style init and show first', function () {
		element.innerHTML = '<div id="test3" v-show="isShow" style="display: inline">title</div>';

		let vm = new MVVM({
			view: element,
			model: {
				isShow: true
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test3');

		expect(div.style.display).toBe('inline');

		data.isShow = false;
		expect(div.style.display).toBe('none');

		data.isShow = true;
		expect(div.style.display).toBe('inline');
	});


	it('has inline style init and hidden first', function () {
		element.innerHTML = '<div id="test4" v-show="isShow" style="display: inline-block">title</div>';

		let vm = new MVVM({
			view: element,
			model: {
				isShow: false
			}
		});
		let data = vm.$data;
		let div = element.querySelector('#test4');

		expect(div.style.display).toBe('none');

		data.isShow = true;
		expect(div.style.display).toBe('inline-block');
	});


	it('with inline style display none, show first', function () {
		element.innerHTML = '<div v-show="isShow" style="display: none">title</div>';

		let vm = new MVVM({
			view: element,
			model: {
				isShow: true
			}
		});
		let data = vm.$data;
		let div = element.querySelector('div');

		expect(div.style.display).toBe('');

		data.isShow = false;
		expect(div.style.display).toBe('none');

		data.isShow = true;
		expect(div.style.display).toBe('');
	});


	it('with inline style display none, hidden first', function () {
		element.innerHTML = '<div v-show="isShow" style="display: none">title</div>';

		let vm = new MVVM({
			view: element,
			model: {
				isShow: false
			}
		});
		let data = vm.$data;
		let div = element.querySelector('div');

		expect(div.style.display).toBe('none');

		data.isShow = true;
		expect(div.style.display).toBe('');

		data.isShow = false;
		expect(div.style.display).toBe('none');
	});


	it('with v-else block', function () {
		element.innerHTML =
			'<div id="ok" v-show="ok">OK</div>' +
			'~~~ v-show just find next sibling elementNode for v-else ~~~' +
			'<div id="notok" v-else>Not OK</div>'

		let vm = new MVVM({
			view: element,
			model: {
				ok: true
			}
		});
		let data = vm.$data;
		let ok = element.querySelector('#ok');
		let notok = element.querySelector('#notok');

		expect(ok.style.display).toBe('');
		expect(notok.style.display).toBe('none');

		data.ok = false;
		expect(ok.style.display).toBe('none');
		expect(notok.style.display).toBe('');
	});


	it('with v-else block and has inline style init', function () {
		element.innerHTML =
			'<div id="ok" v-show="ok" style="display: inline">OK</div>' +
			'<div id="notok" v-else style="display: inline-block">Not OK</div>'

		let vm = new MVVM({
			view: element,
			model: {
				ok: true
			}
		});
		let data = vm.$data;
		let ok = element.querySelector('#ok');
		let notok = element.querySelector('#notok');

		expect(ok.style.display).toBe('inline');
		expect(notok.style.display).toBe('none');

		data.ok = false;
		expect(ok.style.display).toBe('none');
		expect(notok.style.display).toBe('inline-block');

		data.ok = true;
		expect(ok.style.display).toBe('inline');
		expect(notok.style.display).toBe('none');
	});


	it('in v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'<span class="sp" v-show="item.show" style="display: block;"></span>' +
				'</li>' +
			'</ul>'

		let vm = new MVVM({
			view: element,
			model: {
				items: [
					{ show: true },
					{ show: true },
					{ show: false }
				]
			}
		});
		let items = vm.$data.items;
		let sps = element.querySelectorAll('.sp');

		expect(sps[0].style.display).toBe('block');
		expect(sps[1].style.display).toBe('block');
		expect(sps[2].style.display).toBe('none');

		items[1].show = false;
		items[2].show = true;
		expect(sps[1].style.display).toBe('none');
		expect(sps[2].style.display).toBe('block');

		items.$set(1, { show: true });
		sps = element.querySelectorAll('.sp');
		expect(sps[1].style.display).toBe('block');

		items.unshift({ show: false });
		sps = element.querySelectorAll('.sp');
		expect(sps[0].style.display).toBe('none');
		expect(sps[1].style.display).toBe('block');
		expect(sps[2].style.display).toBe('block');
		expect(sps[3].style.display).toBe('block');
	});
});