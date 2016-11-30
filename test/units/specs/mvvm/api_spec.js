import MVVM from 'mvvm';
import * as util from 'src/util';
import { triggerEvent } from '../../test_util';

describe('mvvm instance api >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('invalid build', function () {
		let text = document.createTextNode('plain text');
		let model = { a: 1 };

		new MVVM({
			view: text,
			model: model
		});

		expect(util.warn).toHaveBeenCalledWith('view must be a type of DOMElement: ', text);

		let el = document.createElement('div');

		new MVVM({
			view: el,
			model: 'not-an-object'
		});

		expect(util.warn).toHaveBeenCalledWith('model must be a type of Object: ', 'not-an-object');
	});


	it('use invalid directive', function () {
		let el = document.createElement('div');
		el.innerHTML =
			'<h1 v-text="title"></h1>' +
			'<h2 v-beta="title"></h2>'

		let model = {'title': 'xxdk'};

		new MVVM({
			view: el,
			model: model
		});

		expect(el.childNodes[0].textContent).toBe('xxdk');
		expect(el.childNodes[1].hasAttribute('v-beta')).toBe(false);
		expect(util.warn).toHaveBeenCalledWith('[v-beta] is an unknown directive!');
	});


	it('lazy compile', function () {
		let layout =
			'<h1 v-html="html"></h1>' +
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ $index }}_{{ item.text }}.' +
				'</li>' +
			'</ul>' +
			'<input type="text" v-model="title">';

		element.innerHTML = layout;

		let vm = new MVVM({
			view: element,
			model: {
				html: '<i>xxdk</i>',
				items: [
					{text: 'aaa'},
					{text: 'bbb'},
					{text: 'ccc'},
				],
				title: 'txgc'
			},
			// if lazy is true, MVVM will not start complie until `mount` is called
			lazy: true
		});

		let data = vm.$data;

		// data observe is ready
		expect(typeof data.__ob__).toBe('object');

		// element has not been compile
		expect(element.querySelector('h1').hasAttribute('v-html')).toBe(true);
		expect(element.querySelector('ul').textContent).toBe('{{ $index }}_{{ item.text }}.');
		expect(element.querySelector('input').hasAttribute('v-model')).toBe(true);
		expect(element.querySelector('input').value).toBe('');

		// start compile by manual
		vm.mount();

		// element is compiled this time
		expect(element.innerHTML).toBe([
			'<h1><i>xxdk</i></h1>',
			'<ul>',
				'<li>0_aaa.</li>',
				'<li>1_bbb.</li>',
				'<li>2_ccc.</li>',
			'</ul>',
			'<input type="text">'
		].join(''));

		let input = element.querySelector('input');
		expect(input.value).toBe('txgc');
		input.value = 'abc';
		triggerEvent(input, 'input');
		expect(data.title).toBe('abc');

		// change innerHTML and mount again
		element.innerHTML = '<h1>{{ title }}</h1><p v-html="html"></p>';
		vm.mount();
		expect(element.innerHTML).toBe('<h1>abc</h1><p><i>xxdk</i></p>');
		data.html = '<b>xxoo</b>';
		expect(element.innerHTML).toBe('<h1>abc</h1><p><b>xxoo</b></p>');
	});


	it('get', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				}
			}
		});

		let model = vm.get();
		let descriptor = Object.getOwnPropertyDescriptor(model, 'obj');

		// with description getter/setter
		expect(typeof descriptor.get).toBe('function');
		expect(typeof descriptor.set).toBe('function');

		// with Observer instance
		expect(typeof model.obj.__ob__).toBe('object');

		// get one
		expect(vm.get('vid')).toBe('aaa');

		// get all
		expect(vm.get()).toEqual({
			vid: 'aaa',
			text: 'bbb',
			obj: {
				a: 1,
				b: 2
			}
		});
	});


	it('get deep', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				}
			}
		});

		expect(vm.get('obj.a')).toBe(1);
		expect(vm.get('obj.b')).toBe(2);
	});


	it('getCopy', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				},
				arr: [
					{ text: 111 }
				]
			}
		});

		let data = vm.$data;

		// getCopy returns a copy of model
		let model = vm.getCopy();
		let descriptor = Object.getOwnPropertyDescriptor(model, 'obj');

		// without description getter/setter
		expect(typeof descriptor.get).toBe('undefined');
		expect(typeof descriptor.set).toBe('undefined');

		// without Observer instance
		expect(typeof model.obj.__ob__).toBe('undefined');

		// object or array has no reference to vm.$data
		let objCopy = vm.getCopy('obj');
		objCopy.a = 11111;
		expect(data.obj.a).toBe(1);

		let arrCopy = vm.getCopy('arr');
		arrCopy[0].text = 22222;
		expect(data.arr[0].text).toBe(111);
	});


	it('set', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				}
			}
		});

		let data = vm.$data;

		// set one
		vm.set('text', 'BBB');
		expect(data.text).toBe('BBB');

		// set object
		vm.set({
			vid: 'AAA',
			text: 'bbb',
			obj: {
				x: 123
			}
		});
		expect(data.vid).toBe('AAA');
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			x: 123
		});
	});


	it('set deep', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				}
			}
		});

		let data = vm.$data;

		vm.set('obj.a', 520);
		vm.set('obj.b', 1314);

		expect(data.obj).toEqual({
			a: 520,
			b: 1314
		});
	});


	it('reset', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				}
			}
		});

		let data = vm.$data;

		data.vid = 23333;
		data.text = 94949494;
		data.obj = { x: 456 };

		// reset one
		vm.reset('vid');
		expect(data.vid).toBe('aaa');

		// reset array
		vm.reset(['text', 'obj']);
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			a: 1,
			b: 2
		});

		// reset all
		data.vid = 23333;
		data.text = 94949494;
		data.obj = {'oo': 789};
		vm.reset();
		expect(data.vid).toBe('aaa');
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			a: 1,
			b: 2
		});
	});


	it('watch', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		let vm = new MVVM({
			view: element,
			model: {
				vid: 'aaa',
				text: 'bbb',
				obj: {
					a: 1,
					b: 2
				}
			}
		});

		let data = vm.$data;
		let tempVid;

		vm.watch('vid', function (newValue) {
			tempVid = newValue;
		});

		data.vid = 233333;
		expect(tempVid).toBe(data.vid);
	});


	it('shallow watch for array', function () {

		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let data = {
			items: [
				{ text: 111 },
				{ text: 222 },
				{ text: 333 }
			]
		}

		let vm = new MVVM({
			view: element,
			model: data
		});

		let length, count = 0;
		vm.watch('items', function (newArray) {
			count++;
			length = newArray.length;
		});

		// change for array outside
		data.items.pop();
		expect(count).toBe(1);
		expect(length).toBe(data.items.length);

		// change for array inside (deep)
		// and will not trigger callback because use shallow watch
		data.items[0].text = 'aaa';
		expect(count).toBe(1);
		// but the interface still be updated
		expect(element.querySelector('ul').childNodes[0].textContent).toBe('aaa');
	});


	it('deep watch for array', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let data = {
			items: [
				{ text: 111 },
				{ text: 222 },
				{ text: 333 }
			]
		}

		let vm = new MVVM({
			view: element,
			model: data
		});

		let val, count = 0;
		vm.watch('items', function (newVal) {
			count++;
			val = newVal;
		}, true);

		// change for array inside (deep)
		data.items[0].text = 'aaa';
		expect(val[0].text).toBe('aaa');
		expect(count).toBe(1);

		// and also can be watch outside
		data.items.pop();
		expect(val).toBe(data.items);
		expect(val.length).toBe(2);
		expect(count).toBe(2);
	});


	it('shallow watch for object', function () {
		element.innerHTML = '<h1>{{ info.title }}</h1>';

		let data = {
			info: {
				title: 'xxdk'
			}
		}

		let vm = new MVVM({
			view: element,
			model: data
		});

		let h1 = element.firstChild;
		expect(h1.textContent).toBe('xxdk');

		let count = 0;
		vm.watch('info', function (newVal) {
			count++;
		});

		vm.$data.info.title = 'txgc';
		// interface will change but watch function cannot be triggered
		expect(h1.textContent).toBe('txgc');
		expect(count).toBe(0);

		// change for watched model(shallow)
		vm.$data.info = {
			title: 'lindan'
		}
		// interface will change and watch function can be triggered
		expect(h1.textContent).toBe('lindan');
		expect(count).toBe(1);
	});


	it('deep watch for object', function () {
		element.innerHTML = '<h1>{{ info.title }}</h1>';

		let data = {
			info: {
				title: 'xxdk'
			}
		}

		let vm = new MVVM({
			view: element,
			model: data
		});

		let h1 = element.firstChild;
		expect(h1.textContent).toBe('xxdk');

		let count = 0;
		vm.watch('info', function (newVal) {
			count++;
		}, true);

		vm.$data.info.title = 'txgc';
		// interface will change and use `deep` option
		// watch function will be triggered
		expect(h1.textContent).toBe('txgc');
		expect(count).toBe(1);

		// the same to shallow
		vm.$data.info = {
			title: 'lindan'
		}
		expect(h1.textContent).toBe('lindan');
		expect(count).toBe(2);
	});


	it('destroy', function () {
		// try to use all directives
		element.innerHTML =
			'<div>{{ title }}</div>' +
			'<div v-text="title"></div>' +

			'<div v-html="html"></div>' +

			'<div v-show="show"></div>' +
			'<div v-else></div>' +

			'<div v-if="render"></div>' +
			'<div v-else></div>' +

			'<div v-el="test"></div>' +

			'<div v-on:click="click(title)"></div>' +

			'<input type="text" v-model="title">' +
			'<input type="radio" value="boy" v-model="sex">' +
			'<input type="radio" value="girl" v-model="sex">' +
			'<input type="checkbox" v-model="isCheck">' +
			'<input type="checkbox" value="a" v-model="sports">' +
			'<input type="checkbox" value="b" v-model="sports">' +
			'<input type="checkbox" value="c" v-model="sports">' +
			'<select v-model="sel">' +
				'<option>aaa</option>' +
				'<option>bbb</option>' +
				'<option>ccc</option>' +
			'</select>' +

			'<div v-bind:class="cls"></div>' +
			'<div v-bind:style="styObj"></div>' +
			'<div v-bind:id="id"></div>' +

			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>' +

			'<div v-pre>{{ title }}</div>' +

			'<div v-custom:xx="cso"></div>'

		let data = {
			title: 'xxdk',
			html: '<b>123</b>',
			show: true,
			render: false,
			click: function () {},
			sex: 'girl',
			isCheck: false,
			sports: ['a', 'c'],
			sel: 'bbb',
			cls: 'xxx',
			styObj: {
				color: 'red'
			},
			id: 'txgc',
			items: [
				{ text: 111 },
				{ text: 222 },
				{ text: 333 }
			],
			cso: 123
		}

		let vm = new MVVM({
			view: element,
			model: data,
			customs: {
				xx: function () {}
			}
		});

		// destroy instance
		vm.destroy();
		// model should be null
		expect(vm.get()).toBeNull();
		// interface should be blank
		expect(element.innerHTML).toBe('');
	});


	it('computed property', function () {
		element.innerHTML =
			'<div>{{ a }}</div>' +
			'<div>{{ b }}</div>' +
			'<div>{{ c }}</div>' +
			'<div>{{ d }}</div>' +
			'<div>{{ e }}</div>'

		let vm = new MVVM({
			view: element,
			model: {
				a: 520,
				c: 1314
			},
			computed: {
				b: function () {
					return this.a + 1;
				},
				d: function () {
					return this.c - 1;
				},
				e: function () {
					// also can use other computed properties
					// but must use the computed properties before
					return this.b + this.d;
				}
			}
		});

		let divs = element.childNodes;
		let a = 0, b = 1, c = 2, d = 3, e = 4;

		expect(divs[a].textContent).toBe('520');
		expect(divs[b].textContent).toBe('521');
		expect(divs[c].textContent).toBe('1314');
		expect(divs[d].textContent).toBe('1313');
		expect(divs[e].textContent).toBe((521 + 1313) + '');

		// change a, b will alse changed
		vm.set('a', 250);
		expect(divs[a].textContent).toBe('250');
		expect(divs[b].textContent).toBe('251');
		expect(divs[e].textContent).toBe((251 + 1313) + '');

		// change c, d will alse changed
		vm.set('c', 886);
		expect(divs[c].textContent).toBe('886');
		expect(divs[d].textContent).toBe('885');
		expect(divs[e].textContent).toBe((251 + 885) + '');
	});


	it('computed property with non-function', function () {
		element.innerHTML =
			'<div>{{ a }}</div>' +
			'<div>{{ b }}</div>'

		new MVVM({
			view: element,
			model: {
				a: 123
			},
			computed: {
				b: 'this.a + 1'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('computed property [b] must be a getter function!');
	});


	it('use methods and context', function () {
		element.innerHTML =
			'<div v-on:click="evClick"></div>'

		let scope = {
			a: 123
		};

		let context;
		new MVVM({
			view: element,
			model: {},
			methods: {
				evClick: function cb () {
					context = this;
				}
			},
			// when specify context, methods will bind for context
			context: scope
		});

		triggerEvent(element.firstChild, 'click');
		expect(context).toBe(scope);
	});


	it('callback wrote in methods should be reset', function () {
		element.innerHTML = '<div v-on:click="evClick"></div>';

		let flag, count = 0;
		let vm = new MVVM({
			view: element,
			model: {},
			methods: {
				evClick: function cb () {
					flag = 111;
					count++;
				}
			}
		});

		let data = vm.$data;

		triggerEvent(element.firstChild, 'click');
		expect(count).toBe(1);
		expect(flag).toBe(111);

		// change callback
		data.evClick = function () {
			flag = 222;
			count++;
		}
		triggerEvent(element.firstChild, 'click');
		expect(count).toBe(2);
		expect(flag).toBe(222);

		// reset action shoud also reset the event callback
		vm.reset();
		triggerEvent(element.firstChild, 'click');
		expect(count).toBe(3);
		expect(flag).toBe(111);
	});


	it('use methods and without context', function () {
		element.innerHTML =
			'<div v-on:click="evClick"></div>'

		let context;
		let vm = new MVVM({
			view: element,
			model: {},
			methods: {
				evClick: function cb () {
					context = this;
				}
			}
			// when no-specify context, methods will bind for vm.$data
		});

		triggerEvent(element.firstChild, 'click');
		expect(context).toBe(vm.$data);
	});


	it('batch watches with context', function () {
		element.innerHTML =
			'<h1>{{ title }}</h1>' +
			'<ul class="test1">' +
				'<li v-for="item of items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>' +
			'<ul class="test2">' +
				'<li v-for="item of list">' +
					'{{ item.name }}' +
				'</li>' +
			'</ul>'

		let scope = {
			a: 123
		};

		let context;
		let flag_title;
		let flag_items_shallow;
		let flag_list_deep;

		let vm = new MVVM({
			view: element,
			model: {
				title: 'xxdk',
				items: [
					{ text: 'aaa' },
					{ text: 'bbb' },
				],
				list: [
					{ name: 'AAA' },
					{ name: 'BBB' },
				]
			},
			watches: {
				// normal/shallow watch, just pass a watch callback
				title: function (newVal, oldValue) {
					context = this;
					flag_title = newVal;
				},
				items: function () {
					context = this;
					flag_items_shallow = true;
				},
				// for deep watch, pass a object contains handler and deep
				list: {
					handler: function () {
						context = this;
						flag_list_deep = true;
					},
					deep: true
				}
			},
			// when specify context, each watch callback will bind for context
			context: scope
		});

		let data = vm.$data;
		let ulItems = element.querySelector('.test1');
		let ulLists = element.querySelector('.test2');

		// change for title
		data.title = 'txgc';
		expect(context).toBe(scope);
		expect(flag_title).toBe('txgc');

		// change for items, deep change, and will not trigger it's watch callback
		context = null;
		data.items[0].text = 'a';
		expect(ulItems.textContent).toBe('abbb');
		expect(context).toBeNull();
		expect(flag_items_shallow).toBe(undefined);

		// change for items, shallow changes, and it works
		data.items.push({ text: 'ccc' });
		expect(ulItems.textContent).toBe('abbbccc');
		expect(context).toBe(scope);
		expect(flag_items_shallow).toBe(true);

		// change for list, deep changes, and it works because specified a deep config
		context = null;
		data.list[1].name = 'B';
		expect(ulLists.textContent).toBe('AAAB');
		expect(context).toBe(scope);
		expect(flag_list_deep).toBe(true);

		// reset flag, and change for list, shallow changes, it also works
		context = null;
		flag_list_deep = false;
		data.list.unshift({ name: 'OOO' });
		expect(ulLists.textContent).toBe('OOOAAAB');
		expect(context).toBe(scope);
		expect(flag_list_deep).toBe(true);
	});


	it('batch watches without context', function () {
		element.innerHTML =
			'<h1>{{ title }}</h1>' +
			'<ul>' +
				'<li v-for="item of items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		let context;
		let vm = new MVVM({
			view: element,
			model: {
				title: 'xxdk',
				items: [
					{ text: 'aaa' },
					{ text: 'bbb' }
				]
			},
			watches: {
				// normal/shallow watch, just pass a watch callback
				title: function (newVal, oldValue) {
					context = this;
				},
				// for deep watch, pass a object contains handler and deep
				items: {
					handler: function () {
						context = this;
					},
					deep: true
				}
			}
			// when no-specify context, watch callback will bind for vm.$data
		});

		let data = vm.$data;

		// change for title
		data.title = 'txgc';
		expect(context).toBe(data);

		// change for items, deep change
		context = null;
		data.items[0].text = 'a';
		expect(context).toBe(data);

		// change for items, shallow changes
		context = null;
		data.items.push({ text: 'ccc' });
		expect(context).toBe(data);
	});


	it('use watchAll callback', function () {
		element.innerHTML =
			'<h1>{{ title }}</h1>' +
			'<div>{{ info.text }}</div>' +
			'<input type="checkbox" v-model="info.bool">' +
			'<ul>' +
				'<li v-for="item in items">' +
					'<a>{{ item.id }}</a>' +
					'<a>{{ item.sub.id }}</a>' +
				'</li>' +
			'</ul>' +
			'<ul>' +
				'<li v-for="op in options">{{ op }}</li>' +
			'</ul>'

		let scope = {};
		let param, newVal, oldVal, context;

		let vm = new MVVM({
			view: element,
			model: {
				title: 'aaa',
				info: {
					text: 'bbb',
					bool: false
				},
				items: [
					{ id: 123, sub: { id: 111 } },
					{ id: 456, sub: { id: 222 } },
					{ id: 789, sub: { id: 333 } }
				],
				options: ['a', 'b', 'c']
			},
			watchAll: function (_param, _newVal, _oldVal) {
				param = _param;
				newVal = _newVal;
				oldVal = _oldVal;
				context = this;
			},
			context: scope
		});

		let data = vm.$data;

		// one level
		data.title = 'AAA';
		expect(param.path).toBe('title');
		expect(newVal).toBe('AAA');
		expect(oldVal).toBe('aaa');

		expect(context).toBe(scope);

		// two level
		data.info.text = 'BBB';
		expect(param.path).toBe('info*text');
		expect(newVal).toBe('BBB');
		expect(oldVal).toBe('bbb');

		data.info.bool = !!0; // no change at all
		expect(param.path).toBe('info*text');
		expect(newVal).toBe('BBB');
		expect(oldVal).toBe('bbb');

		// cover object
		// NOTICE:
		// because directive value not likely be an object,
		// it was not collected by watcher,
		// so if cover an object, newVal and oldVal will not change!!
		data.info = {
			text: 'xxx',
			bool: true
		}
		expect(param.path).toBe('info');

		// array inner change
		data.items[0].id = 222;
		expect(param.path).toBe('items*0*id');
		expect(newVal).toBe(222);
		expect(oldVal).toBe(123);

		data.items[1].sub.id = 222000;
		expect(param.path).toBe('items*1*sub*id');
		expect(newVal).toBe(222000);
		expect(oldVal).toBe(222);

		data.items[2].sub.id = 333000;
		expect(param.path).toBe('items*2*sub*id');
		expect(newVal).toBe(333000);
		expect(oldVal).toBe(333);

		// array methods
		expect(data.items).toEqual([
			{ id: 222, sub: { id: 111 } },
			{ id: 456, sub: { id: 222000 } },
			{ id: 789, sub: { id: 333000 } }
		]);

		let newOne = { id: 100, sub: { id: 1000 } };
		data.items.push(newOne);
		expect(param.path).toBe('items');
		expect(param.action.method).toBe('push');
		expect(param.action.args).toEqual([newOne]);
		expect(oldVal.length).toBe(3);
		expect(newVal.length).toBe(4);

		data.items.pop();
		expect(param.path).toBe('items');
		expect(param.action.method).toBe('pop');
		expect(param.action.args).toEqual([]);
		expect(oldVal.length).toBe(4);
		expect(newVal.length).toBe(3);

		newOne = { id: 666, sub: { id: 222 } };
		data.items.$set(1, newOne);
		expect(param.path).toBe('items');
		expect(param.action.method).toBe('splice');
		expect(param.action.args).toEqual([1, 1, newOne]);

		data.items.splice(2, 1);
		expect(param.path).toBe('items');
		expect(param.action.method).toBe('splice');
		expect(param.action.args).toEqual([2, 1]);
	});


	it('use v-hook with v-if', function () {
		element.innerHTML =
			'<div>' +
				'<div id="el" v-if="show" v-hook:after="afterAppend" v-hook:before="beforeRemove">xxdk</div>' +
				'<div id="else" v-else>txgc</div>' +
			'</div>'


		let targetEl;
		let afterFlag, beforeFlag;
		let cxt, scope = {a: 123};

		let vm = new MVVM({
			view: element,
			model: {
				show: true
			},
			hooks: {
				afterAppend: function (el, isElse) {
					targetEl = el;
					afterFlag = true;
					cxt = this;
				},
				beforeRemove: function (el, isElse) {
					beforeFlag = true;
					cxt = this;
				}
			},
			context: scope
		});

		let data = vm.$data;

		let div = element.firstChild;

		// hooks were called once during compie
		expect(cxt).toBe(scope);
		expect(targetEl).toBe(div.querySelector('#el'));
		expect(afterFlag).toBe(true);
		expect(beforeFlag).toBe(undefined);

		// clear flag
		cxt = null;
		afterFlag = null;
		beforeFlag = null;

		data.show = false;
		expect(cxt).toBe(scope);
		// both afterAppend and beforeRemove are triggered!
		expect(afterFlag).toBe(true);
		expect(beforeFlag).toBe(true);

		// clear flag
		cxt = null;
		afterFlag = null;
		beforeFlag = null;

		data.show = true;
		expect(cxt).toBe(scope);
		expect(targetEl).toBe(div.querySelector('#el'));
		expect(afterFlag).toBe(true);
		expect(beforeFlag).toBe(true);
	});


	it('use v-hook with v-for', function () {
		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items" v-hook:after="afterAppend" v-hook:before="beforeRemove">' +
					'{{ $index }}_{{ item }}' +
				'</li>' +
			'</ul>'

		let afters = [];
		let befores = [];
		let cxt, scope = {a: 123};

		let vm = new MVVM({
			view: element,
			model: {
				items: ['a', 'b', 'c']
			},
			hooks: {
				afterAppend: function (el, index) {
					afters.push({ el, index });
					cxt = this;
				},
				beforeRemove: function (el, index) {
					befores.push({ el, index });
					cxt = this;
				}
			},
			context: scope
		});

		let data = vm.$data;
		let ul = element.querySelector('ul');
		let lis = ul.childNodes;

		expect(cxt).toBe(scope);

		// hooks were called once during compie
		expect(afters.length).toBe(data.items.length);
		expect(befores.length).toBe(0);
		// afterAppend shoud call with v-for item and index
		util.each(afters, function (after, index) {
			expect(after.index).toBe(index);
			expect(after.el).toBe(lis[index]);
		});

		// clear data
		afters = [];
		befores = [];
		data.items.unshift('x');
		expect(afters.length).toBe(1);
		expect(befores.length).toBe(0);
		expect(afters[0].index).toBe(0);
		expect(afters[0].el).toBe(lis[0]);

		afters = [];
		befores = [];
		data.items.push('o');
		expect(afters.length).toBe(1);
		expect(befores.length).toBe(0);
		expect(afters[0].index).toBe(data.items.length - 1);
		expect(afters[0].el).toBe(lis[data.items.length - 1]);

		expect(data.items).toEqual(['x', 'a', 'b', 'c', 'o']);

		afters = [];
		befores = [];
		data.items.shift();
		expect(afters.length).toBe(0);
		expect(befores.length).toBe(1);
		expect(befores[0].index).toBe(0);
		expect(befores[0].el.textContent).toBe('0_x');

		afters = [];
		befores = [];
		data.items.pop();
		expect(afters.length).toBe(0);
		expect(befores.length).toBe(1);
		expect(befores[0].index).toBe(data.items.length);
		expect(befores[0].el.textContent).toBe((data.items.length) + '_o');

		expect(data.items).toEqual(['a', 'b', 'c']);

		afters = [];
		befores = [];
		data.items.$remove('b');
		expect(afters.length).toBe(0);
		expect(befores.length).toBe(1);
		expect(befores[0].index).toBe(1);
		expect(befores[0].el.textContent).toBe('1_b');

		expect(data.items).toEqual(['a', 'c']);

		afters = [];
		befores = [];
		data.items.$set(1, 'C');
		expect(afters.length).toBe(1);
		expect(befores.length).toBe(1);
		expect(befores[0].index).toBe(1);
		expect(befores[0].el.textContent).toBe('1_c');
		expect(afters[0].index).toBe(1);
		expect(afters[0].el.textContent).toBe('1_C');

		expect(data.items).toEqual(['a', 'C']);

		afters = [];
		befores = [];
		data.items.splice(0, 0, 'x', 'o');
		expect(data.items).toEqual(['x', 'o', 'a','C']);
		expect(afters.length).toBe(2);
		expect(befores.length).toBe(0);
		expect(afters[0].index).toBe(0);
		expect(afters[0].el.textContent).toBe('0_x');
		expect(afters[1].index).toBe(1);
		expect(afters[1].el.textContent).toBe('1_o');

		afters = [];
		befores = [];
		data.items.splice(0, 2);
		expect(data.items).toEqual(['a','C']);
		expect(afters.length).toBe(0);
		expect(befores.length).toBe(2);
		expect(befores[0].index).toBe(0);
		expect(befores[0].el.textContent).toBe('0_x');
		expect(befores[1].index).toBe(1);
		expect(befores[1].el.textContent).toBe('1_o');

		afters = [];
		befores = [];
		data.items = ['n', 'b', 'a'];
		expect(afters.length).toBe(3);
		expect(befores.length).toBe(2);
		util.each(afters, function (after, index) {
			expect(after.index).toBe(index);
			expect(after.el).toBe(lis[index]);
		});
		expect(befores[0].index).toBe(0);
		expect(befores[0].el.textContent).toBe('0_a');
		expect(befores[1].index).toBe(1);
		expect(befores[1].el.textContent).toBe('1_C');
	});
});