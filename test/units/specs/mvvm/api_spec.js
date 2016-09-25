var MVVM = require('mvvm').default;
var util = require('src/util');

var triggerEvent = require('../../test_util').triggerEvent;

describe("mvvm instance api >", function () {
	var element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('invalid build', function () {
		var text = document.createTextNode('plain text');
		var model = {'a': 1};
		new MVVM({
			'view': text,
			'model': model
		});
		expect(util.warn).toHaveBeenCalledWith('view must be a type of DOMElement: ', text);

		var el = document.createElement('div');
		new MVVM({
			'view': el,
			'model': 'not-an-object'
		});
		expect(util.warn).toHaveBeenCalledWith('model must be a type of Object: ', 'not-an-object');
	});


	it('use invalid directive', function () {
		var el = document.createElement('div');
		el.innerHTML =
			'<h1 v-text="title"></h1>' +
			'<h2 v-beta="title"></h2>'
		var model = {'title': 'xxdk'};

		new MVVM({
			'view': el,
			'model': model
		});
		expect(el.childNodes[0].textContent).toBe('xxdk');
		expect(el.childNodes[1].hasAttribute('v-beta')).toBe(false);
		expect(util.warn).toHaveBeenCalledWith('[v-beta] is an unknown directive!');
	});


	it('lazy compile', function () {
		var layout =
			'<h1 v-html="html"></h1>' +
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ $index }}_{{ item.text }}.' +
				'</li>' +
			'</ul>' +
			'<input type="text" v-model="title">';

		element.innerHTML = layout;

		var vm = new MVVM({
			'view': element,
			'model': {
				'html': '<i>xxdk</i>',
				'items': [
					{'text': 'aaa'},
					{'text': 'bbb'},
					{'text': 'ccc'},
				],
				'title': 'txgc'
			},
			// if lazy is true, MVVM will not start complie until `mount` is called
			'lazy': true
		});

		var data = vm.$data;

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

		var input = element.querySelector('input');
		expect(input.value).toBe('txgc');
		input.value = 'abc';
		triggerEvent(input, 'input');
		expect(data.title).toBe('abc');

		// change innerHTML and mount again
		element.innerHTML = '<h1>{{ title }}</h1><p>{{{ html }}}</p>';
		vm.mount();
		expect(element.innerHTML).toBe('<h1>abc</h1><p><i>xxdk</i></p>');
		data.html = '<b>xxoo</b>';
		expect(element.innerHTML).toBe('<h1>abc</h1><p><b>xxoo</b></p>');
	});


	it('get', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		var model = vm.get();
		var descriptor = Object.getOwnPropertyDescriptor(model, 'obj');

		// with description getter/setter
		expect(typeof descriptor.get).toBe('function');
		expect(typeof descriptor.set).toBe('function');

		// with Observer instance
		expect(typeof model.obj.__ob__).toBe('object');

		// get one
		expect(vm.get('vid')).toBe('aaa');

		// get all
		expect(vm.get()).toEqual({
			'vid': 'aaa',
			'text': 'bbb',
			'obj': {
				'a': 1,
				'b': 2
			}
		});
	});


	it('get deep', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		expect(vm.get('obj.a')).toBe(1);
		expect(vm.get('obj.b')).toBe(2);
	});


	it('getCopy', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		// getCopy returns a copy of model
		var model = vm.getCopy();
		var descriptor = Object.getOwnPropertyDescriptor(model, 'obj');

		// without description getter/setter
		expect(typeof descriptor.get).toBe('undefined');
		expect(typeof descriptor.set).toBe('undefined');

		// without Observer instance
		expect(typeof model.obj.__ob__).toBe('undefined');
	});


	it('set', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		var data = vm.$data;

		// set one
		vm.set('text', 'BBB');
		expect(data.text).toBe('BBB');

		// set object
		vm.set({
			'vid': 'AAA',
			'text': 'bbb',
			'obj': {
				'x': 123
			}
		});
		expect(data.vid).toBe('AAA');
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			'x': 123
		});
	});


	it('set deep', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		var data = vm.$data;

		vm.set('obj.a', 520);
		vm.set('obj.b', 1314);

		expect(data.obj).toEqual({
			'a': 520,
			'b': 1314
		});
	});


	it('reset', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		var data = vm.$data;

		data.vid = 23333;
		data.text = 94949494;
		data.obj = {'x': 456};

		// reset one
		vm.reset('vid');
		expect(data.vid).toBe('aaa');

		// reset array
		vm.reset(['text', 'obj']);
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			'a': 1,
			'b': 2
		});

		// reset all
		data.vid = 23333;
		data.text = 94949494;
		data.obj = {'oo': 789};
		vm.reset();
		expect(data.vid).toBe('aaa');
		expect(data.text).toBe('bbb');
		expect(data.obj).toEqual({
			'a': 1,
			'b': 2
		});
	});


	it('watch', function () {
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';

		var vm = new MVVM({
			'view': element,
			'model': {
				'vid': 'aaa',
				'text': 'bbb',
				'obj': {
					'a': 1,
					'b': 2
				}
			}
		});

		var data = vm.$data;
		var tempVid;

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

		var data = {
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		var vm = new MVVM({
			'view': element,
			'model': data
		});

		var length, count = 0;
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

		var data = {
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		var vm = new MVVM({
			'view': element,
			'model': data
		});

		var val, count = 0;
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

		var data = {
			'info': {
				'title': 'xxdk'
			}
		}

		var vm = new MVVM({
			'view': element,
			'model': data
		});

		var h1 = element.firstChild;
		expect(h1.textContent).toBe('xxdk');

		var count = 0;
		vm.watch('info', function (newVal) {
			count++;
		});

		vm.$data.info.title = 'txgc';
		// interface will change but watch function cannot be triggered
		expect(h1.textContent).toBe('txgc');
		expect(count).toBe(0);

		// change for watched model(shallow)
		vm.$data.info = {
			'title': 'lindan'
		}
		// interface will change and watch function can be triggered
		expect(h1.textContent).toBe('lindan');
		expect(count).toBe(1);
	});


	it('deep watch for object', function () {
		element.innerHTML = '<h1>{{ info.title }}</h1>';

		var data = {
			'info': {
				'title': 'xxdk'
			}
		}

		var vm = new MVVM({
			'view': element,
			'model': data
		});

		var h1 = element.firstChild;
		expect(h1.textContent).toBe('xxdk');

		var count = 0;
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
			'title': 'lindan'
		}
		expect(h1.textContent).toBe('lindan');
		expect(count).toBe(2);
	});


	it('destroy', function () {
		// try to use all directives
		element.innerHTML =
			'<div>{{ title }}</div>' +
			'<div v-text="title"></div>' +

			'<div>{{ html }}</div>' +
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

			'<div v-pre>{{ title }}</div>'

		var data = {
			'title': 'xxdk',
			'html': '<b>123</b>',
			'show': true,
			'render': false,
			'click': function () {},
			'sex': 'girl',
			'isCheck': false,
			'sports': ['a', 'c'],
			'sel': 'bbb',
			'cls': 'xxx',
			'styObj': {
				'color': 'red'
			},
			'id': 'txgc',
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		var vm = new MVVM({
			'view': element,
			'model': data
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

		var vm = new MVVM({
			'view': element,
			'model': {
				'a': 520,
				'c': 1314
			},
			'computed': {
				'b': function () {
					return this.a + 1;
				},
				'd': function () {
					return this.c - 1;
				},
				'e': function () {
					// also can use other computed properties
					// but must use the computed properties before
					return this.b + this.d;
				}
			}
		});

		var divs = element.childNodes;
		var a = 0, b = 1, c = 2, d = 3, e = 4;

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
			'view': element,
			'model': {
				'a': 123
			},
			'computed': {
				'b': 'this.a + 1'
			}
		});

		expect(util.warn).toHaveBeenCalledWith('computed property [b] must be a getter function!');
	});


	it('use methods and context', function () {
		element.innerHTML =
			'<div v-on:click="evClick"></div>'

		var scope = {
			'a': 123
		};

		var context;
		new MVVM({
			'view': element,
			'model': {},
			'methods': {
				'evClick': function cb () {
					context = this;
				}
			},
			// when specify context, methods will bind for context
			'context': scope
		});

		triggerEvent(element.firstChild, 'click');
		expect(context).toBe(scope);
	});


	it('use methods and without context', function () {
		element.innerHTML =
			'<div v-on:click="evClick"></div>'

		var context;
		var vm = new MVVM({
			'view': element,
			'model': {},
			'methods': {
				'evClick': function cb () {
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

		var scope = {
			'a': 123
		};

		var context;
		var flag_title;
		var flag_items_shallow;
		var flag_list_deep;

		var vm = new MVVM({
			'view': element,
			'model': {
				'title': 'xxdk',
				'items': [
					{'text': 'aaa'},
					{'text': 'bbb'},
				],
				'list': [
					{'name': 'AAA'},
					{'name': 'BBB'},
				]
			},
			'watches': {
				// normal/shallow watch, just pass a watch callback
				'title': function (newVal, oldValue) {
					context = this;
					flag_title = newVal;
				},
				'items': function () {
					context = this;
					flag_items_shallow = true;
				},
				// for deep watch, pass a object contains handler and deep
				'list': {
					'handler': function () {
						context = this;
						flag_list_deep = true;
					},
					'deep': true
				}
			},
			// when specify context, each watch callback will bind for context
			'context': scope
		});

		var data = vm.$data;
		var ulItems = element.querySelector('.test1');
		var ulLists = element.querySelector('.test2');

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
		data.items.push({'text': 'ccc'});
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
		data.list.unshift({'name': 'OOO'});
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

		var context;
		var vm = new MVVM({
			'view': element,
			'model': {
				'title': 'xxdk',
				'items': [
					{'text': 'aaa'},
					{'text': 'bbb'},
				]
			},
			'watches': {
				// normal/shallow watch, just pass a watch callback
				'title': function (newVal, oldValue) {
					context = this;
				},
				// for deep watch, pass a object contains handler and deep
				'items': {
					'handler': function () {
						context = this;
					},
					'deep': true
				}
			}
			// when no-specify context, watch callback will bind for vm.$data
		});

		var data = vm.$data;

		// change for title
		data.title = 'txgc';
		expect(context).toBe(data);

		// change for items, deep change
		context = null;
		data.items[0].text = 'a';
		expect(context).toBe(data);

		// change for items, shallow changes
		context = null;
		data.items.push({'text': 'ccc'});
		expect(context).toBe(data);
	});
});