var sugar = require('src/main/index').default;
var dom = require('src/dom').default;
var util = require('src/util').default;
var Component = sugar.Component;

function triggerEvent(target, evt, process) {
	var e = document.createEvent('HTMLEvents');
	e.initEvent(evt, true, true);

	if (process) {
		process(e);
	}

	target.dispatchEvent(e);
}

describe('sugar Component api >', function() {
	var wraper;

	beforeEach(function() {
		wraper = document.createElement('div');
		document.body.appendChild(wraper);
	});

	afterEach(function() {
		document.body.removeChild(wraper);
	});



	it('simple api', function() {
		// define a simple component
		var View = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'class': 'simple-view',
					'tag'  : 'p',
					'css'  : {
						'width': '100px'
					},
					'attr' : {
						'id': 'su-view'
					},
					'html' : '<h1 class="aa">a component</h1><h2 class="aa">a title</h2>',
					// this is custom configuration
					'aaa': {
						'bbb': {
							'ccc': 'so deep'
						}
					},
					'xxx': 123
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				this.test_interface() // test interface
					.test_getConfig() // test api getConfig
					.test_setConfig() // test api setConfig
					.test_query()     // test api query
					.test_bind()      // test api bind
					.test_unbind()    // test api unbind
			},
			test_interface: function() {
				var el = this.el;

				expect(el.className).toBe('simple-view');
				expect(el.tagName).toBe('P');
				expect(dom.getAttr(el, 'id')).toBe('su-view');
				expect(el.style.width).toBe('100px');
				expect(el.innerHTML).toBe('<h1 class="aa">a component</h1><h2 class="aa">a title</h2>');

				return this;
			},
			test_getConfig: function() {
				var c = this.getConfig();

				expect(c.html).toBe('<h1 class="aa">a component</h1><h2 class="aa">a title</h2>');
				expect(c.css).toEqual({
					'width': '100px'
				});

				// test getConfig single
				expect(this.getConfig('attr')).toEqual({
					'id': 'su-view'
				});

				// test getConfig path
				expect(this.getConfig('aaa/bbb/ccc')).toBe('so deep');

				return this;
			},
			test_setConfig: function() {
				// set single
				expect(this.getConfig('xxx')).toBe(123);
				this.setConfig('xxx', 321);
				expect(this.getConfig('xxx')).toBe(321);

				// set path
				expect(this.getConfig('aaa/bbb/ccc')).toBe('so deep');
				this.setConfig('aaa/bbb/ccc', 'really deep');
				expect(this.getConfig('aaa/bbb/ccc')).toBe('really deep');

				return this;
			},
			test_query: function() {
				var h1 = this.query('h1');
				expect(h1.innerHTML).toBe('a component');

				var aas = this.queryAll('.aa');
				expect(aas.length).toBe(2);
				expect(aas[0].innerHTML).toBe('a component');
				expect(aas[1].innerHTML).toBe('a title');

				return this;
			},
			test_bind: function() {
				this.$count = 0;
				var h1 = this.query('h1');

				this.bind(h1, 'click', 'click_h1');
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(1);

				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(5);

				return this;
			},
			click_h1: function() {
				this.$count++;
			},
			test_unbind: function() {
				var h1 = this.query('h1');
				// trigger again
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(6);

				// unbind click_h1
				this.unbind(h1, 'click', 'click_h1');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(6);

				return this;
			}
		});

		// create to wraper
		var view = sugar.core.create('view', View, {
			'target': wraper
		});

		view.destroy();
	});


	it('cover config must be 2 arguments', function() {
		var View = Component.extend({
			init: function(config) {
				config = this.cover({
					'target': wraper,
					'class': 'invalid use this.cover'
				});
				this.Super('init', arguments);
			}
		});

		var view = sugar.core.create('view', View);

		expect(util.warn).toHaveBeenCalledWith('Failed to cover config, 2 argumenst required');

		view.destroy();
	});


	it('use mvvm', function() {
		var View = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'html': '<h1>{{ title }}</h1>',
					'model': {
						'title': 'hello sugar~'
					}
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				expect(this.el.innerHTML).toBe('<h1>hello sugar~</h1>');

				this.vm.set('title', 'xxdk');
				expect(this.el.innerHTML).toBe('<h1>xxdk</h1>');
			}
		});

		// create to wraper
		var view = sugar.core.create('view', View, {
			'target': wraper
		});

		view.destroy();
	});


	it('create sub component', function() {
		var subInstance,
			anotherSubInstance;
		var flag;

		var SubComponent = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'tag': 'p',
					'class': 'aa bb',
					'html': '<h2>{{ title }}</h2>',
					'model': {
						'title': config.title
					}
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				// test getParent
				var parent = this.getParent();
				parent.changeFlag();
				expect(flag).toBe('in view component');
			},
			changeFlag: function() {
				flag = 'in sub component';
			}
		});

		var AnotherSub = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'html': '<h3>AnotherSub</h3>'
				});
				this.Super('init', arguments);
			}
		});

		var View = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'html': '<div class="box"></div><p></p>'
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				var box = this.query('.box');
				var p = this.query('p');

				// create sub component to current component
				subInstance = this.create('sub', SubComponent, {
					'target': box,
					'title': 'I am sub component'
				});

				// already append to view
				expect(box.innerHTML).toBe('<p class="aa bb"><h2>I am sub component</h2></p>');

				// test getChild api
				expect(this.getChild('sub')).toBe(subInstance);
				subInstance.changeFlag();
				expect(flag).toBe('in sub component');

				// create another sub component
				anotherSubInstance = this.create('sub_another', AnotherSub, {
					'target': p
				});

				// already append to view
				expect(p.innerHTML).toBe('<div><h3>AnotherSub</h3></div>');

				// test getChilds map
				var chsObj = this.getChilds();
				expect(Object.keys(chsObj)).toEqual(['sub', 'sub_another']);
				expect(chsObj['sub']).toBe(subInstance);
				expect(chsObj['sub_another']).toBe(anotherSubInstance);

				// return child array
				var chsArr = this.getChilds(true);
				expect(chsArr.length).toBe(2);
				expect(chsArr[0]).toBe(subInstance);
				expect(chsArr[1]).toBe(anotherSubInstance);

				// create for invalid component name
				this.create(123, AnotherSub);
				expect(util.warn).toHaveBeenCalledWith('Module name [123] must be a type of String');
				// create for invalid component Class
				this.create('invalid',321);
				expect(util.warn).toHaveBeenCalledWith('Module Class [321] must be a type of Component');
				// create for already exist component name
				this.create('sub_another', AnotherSub);
				expect(util.warn).toHaveBeenCalledWith('Module [sub_another] is already exists!');


			},
			changeFlag: function() {
				flag = 'in view component';
			}
		});

		var view = sugar.core.create('view', View, {
			'target': wraper
		});

		view.destroy();
	});


	it('component inherit', function() {
		var Son = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'target': wraper,
					'all': 123,
					'a': 'base_a'
				});
				this.Super('init', arguments);
			},
			getA: function() {
				return this.getConfig('a');
			}
		});

		var Son1 = Son.extend({
			init: function(config) {
				config = this.cover(config, {
					'a': 'son_1_a',
					'b': {
						'c': 'son_1_c'
					}
				});
				this.Super('init', arguments);
			},
			getC: function() {
				return this.getConfig('b/c');
			}
		});

		var Son2 = Son1.extend({
			init: function(config) {
				config = this.cover(config, {
					'b': {
						'c': 'son_2_c',
						'd': 'son_2_d'
					}
				});
				this.Super('init', arguments);
			},
			getD: function() {
				return this.getConfig('b/d');
			}
		});

		var son = sugar.core.create('son', Son);
		var son1 = sugar.core.create('son1', Son1);
		var son2 = sugar.core.create('son2', Son2);

		expect(son.getA()).toBe('base_a');
		expect(son1.getA()).toBe('son_1_a');
		expect(son2.getA()).toBe('son_1_a');

		expect(son.getC).toBe(undefined);
		expect(son1.getC()).toBe('son_1_c');
		expect(son2.getC()).toBe('son_2_c');

		expect(son.getD).toBe(undefined);
		expect(son1.getD).toBe(undefined);
		expect(son2.getD()).toBe('son_2_d');

		// destroy them
		son.destroy();
		son1.destroy();
		son2.destroy();
	});
});