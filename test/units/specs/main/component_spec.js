import sugar from 'src/main/index';
import * as util from 'src/util';
import { triggerEvent } from '../../test_util';

let Component = sugar.Component;

describe('sugar component api >', function () {
	let wraper;

	beforeEach(function () {
		wraper = document.createElement('div');
		document.body.appendChild(wraper);
	});

	afterEach(function () {
		document.body.removeChild(wraper);
	});


	it('simple api', function () {
		// define a simple component
		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'simple-view',
					tag: 'p',
					css: {
						width: '100px',
						display: 'inline'
					},
					attr: {
						id: 'su-view'
					},
					view: '<h1 class="aa">a component</h1><h2 class="aa">a title</h2>',
					// this is custom configuration
					aaa: {
						bbb: {
							ccc: 'so deep'
						}
					},
					xxx: 123
				});
			},
			afterRender: function () {
				this.test_interface() // test interface
					.test_getConfig() // test api getConfig
					.test_setConfig() // test api setConfig
					.test_query()     // test api query
					.test_hide()      // test api hide
					.test_show()      // test api show
					.test_on()        // test api on
					.test_off()       // test api off
			},
			test_interface: function () {
				let el = this.el;

				expect(el.className).toBe('simple-view');
				expect(el.tagName).toBe('P');
				expect(this.$.getAttr(el, 'id')).toBe('su-view');
				expect(el.style.width).toBe('100px');
				expect(el.innerHTML).toBe('<h1 class="aa">a component</h1><h2 class="aa">a title</h2>');

				return this;
			},
			test_getConfig: function () {
				let c = this.getConfig();

				expect(c.view).toBe('<h1 class="aa">a component</h1><h2 class="aa">a title</h2>');
				expect(c.css).toEqual({
					width: '100px',
					display: 'inline'
				});

				// test getConfig single
				expect(this.getConfig('attr')).toEqual({
					id: 'su-view'
				});

				// test getConfig path
				expect(this.getConfig('aaa.bbb.ccc')).toBe('so deep');

				return this;
			},
			test_setConfig: function () {
				// set single
				expect(this.getConfig('xxx')).toBe(123);
				this.setConfig('xxx', 321);
				expect(this.getConfig('xxx')).toBe(321);

				// set path
				expect(this.getConfig('aaa.bbb.ccc')).toBe('so deep');
				this.setConfig('aaa.bbb.ccc', 'really deep');
				expect(this.getConfig('aaa.bbb.ccc')).toBe('really deep');

				return this;
			},
			test_query: function () {
				let h1 = this.query('h1');
				expect(h1.innerHTML).toBe('a component');

				let aas = this.queryAll('.aa');
				expect(aas.length).toBe(2);
				expect(aas[0].innerHTML).toBe('a component');
				expect(aas[1].innerHTML).toBe('a title');

				return this;
			},
			test_hide: function () {
				expect(this.el.style.display).toBe('inline');
				this.hide();
				expect(this.el.style.display).toBe('none');
				return this;
			},
			test_show: function () {
				expect(this.el.style.display).toBe('none');
				this.show();
				expect(this.el.style.display).toBe('inline');
				return this;
			},
			test_on: function () {
				this.$count = 0;
				let h1 = this.query('h1');

				this.on(h1, 'click', 'click_h1');
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(1);

				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(5);

				return this;
			},
			click_h1: function () {
				this.$count++;
			},
			test_off: function () {
				let h1 = this.query('h1');
				// trigger again
				triggerEvent(h1, 'click');
				expect(this.$count).toBe(6);

				// unbind click_h1
				this.off(h1, 'click', 'click_h1');
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
		let view = sugar.core.create('view', View, {
			'target': wraper
		});

		view.destroy();
	});


	it('use mvvm', function () {
		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					view: '<h1>{{ title }}</h1>',
					model: {
						title: 'hello sugar~'
					}
				});
			},
			afterRender: function () {
				expect(this.el.innerHTML).toBe('<h1>hello sugar~</h1>');

				this.vm.set('title', 'xxdk');
				expect(this.el.innerHTML).toBe('<h1>xxdk</h1>');
			}
		});

		// create to wraper
		let view = sugar.core.create('view', View, {
			'target': wraper
		});

		view.destroy();
	});


	it('use selector target', function () {
		wraper.innerHTML =
			'<div id="app">' +
				'<h1>{{ title }}</h1>' +
			'</div>'

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					model: {
						title: 'xxdk'
					}
				});
			}
		});

		let view = sugar.core.create('view', View, {
			target: '#app'
		});

		expect(wraper.querySelector('h1').textContent).toBe('xxdk');

		view.destroy();
	});


	it('use beforeRender', function () {
		let flag;

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view: '<p>xxdk</p>'
				});
			},
			beforeRender: function () {
				expect(flag).toBe(undefined);
				flag = true;
			},
			afterRender: function () {
				expect(flag).toBe(true);
			}
		});

		let view = sugar.core.create('view', View);

		view.destroy();
	});


	it('replace component target', function () {
		wraper.innerHTML = '<div class="target"></div>';

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper.querySelector('.target'),
					// this component will replace .target
					replace: true,
					tag: 'span',
					class: 'comp',
					view: 'component-replace-target'
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(wraper.innerHTML).toBe('<span class="comp">component-replace-target</span>');

		view.destroy();
	});


	it('create subComponent', function () {
		let subInstance,
			anotherSubInstance;
		let flag;

		let SubComponent = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					tag: 'p',
					class: 'aa bb',
					view: '<h2>{{ title }}</h2>',
					model: {
						title: config.title
					}
				});
			},
			afterRender: function () {
				// test getParent
				let parent = this.getParent();
				parent.changeFlag();
				expect(flag).toBe('in view component');
			},
			changeFlag: function () {
				flag = 'in subComponent';
			}
		});

		let AnotherSub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					view: '<h3>AnotherSub</h3>'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					view: '<div class="box"></div><p></p>'
				});
			},
			afterRender: function () {
				let box = this.query('.box');
				let p = this.query('p');

				// create subComponent to current component
				subInstance = this.create('sub', SubComponent, {
					target: box,
					title: 'I am subComponent'
				});

				// already append to view
				expect(box.innerHTML).toBe('<p class="aa bb"><h2>I am subComponent</h2></p>');

				// test getChild api
				expect(this.getChild('sub')).toBe(subInstance);
				subInstance.changeFlag();
				expect(flag).toBe('in subComponent');

				// create another subComponent
				anotherSubInstance = this.create('sub_another', AnotherSub, {
					target: p
				});

				// already append to view
				expect(p.innerHTML).toBe('<div><h3>AnotherSub</h3></div>');

				// test getChilds map
				let chsObj = this.getChilds();
				expect(Object.keys(chsObj)).toEqual(['sub', 'sub_another']);
				expect(chsObj.sub).toBe(subInstance);
				expect(chsObj.sub_another).toBe(anotherSubInstance);

				// return child array
				let chsArr = this.getChilds(true);
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
			changeFlag: function () {
				flag = 'in view component';
			}
		});

		let view = sugar.core.create('view', View, {
			target: wraper
		});

		view.destroy();
	});


	it('subComponent declarative nested + single + no-config', function () {
		let Sub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'subComp',
					view: '<p>SUB</p>'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view:
						'<h1>title</h1>' +
						'<SubComponent></SubComponent>',
					// declare subComponent
					childs: {
						SubComponent: Sub
					}
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(wraper.innerHTML).toBe(
			'<div>' +
				'<h1>title</h1>' +
				'<div class="subComp">' +
					'<p>SUB</p>' +
				'</div>' +
			'</div>'
		);

		view.destroy();
	});


	it('subComponent declarative nested + single + config', function () {
		let Sub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'subComp'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view:
						'<h1>title</h1>' +
						'<SubComponent></SubComponent>',
					// declare subComponent
					childs: {
						SubComponent: [Sub, { view: 'SSS' }]
					}
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(wraper.innerHTML).toBe(
			'<div>' +
				'<h1>title</h1>' +
				'<div class="subComp">SSS</div>' +
			'</div>'
		);

		view.destroy();
	});


	it('subComponent declarative nested + multi + no-config', function () {
		let Sub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'subComp',
					view: '<p>SUB</p>'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view:
						'<h1>title</h1>' +
						'<SubComponent></SubComponent>' +
						'<SubComponent></SubComponent>' +
						'<SubComponent></SubComponent>',
					// declare subComponent
					childs: {
						SubComponent: Sub
					}
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(wraper.innerHTML).toBe(
			'<div>' +
				'<h1>title</h1>' +
				'<div class="subComp"><p>SUB</p></div>' +
				'<div class="subComp"><p>SUB</p></div>' +
				'<div class="subComp"><p>SUB</p></div>' +
			'</div>'
		);

		view.destroy();
	});


	it('subComponent declarative nested + multi + config', function () {
		let Sub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'subComp'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view:
						'<h1>title</h1>' +
						'<SubComponent></SubComponent>' +
						'<SubComponent></SubComponent>' +
						'<SubComponent></SubComponent>',
					// declare subComponent
					childs: {
						SubComponent: [Sub, { view: 'BBB' }]
					}
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(wraper.innerHTML).toBe(
			'<div>' +
				'<h1>title</h1>' +
				'<div class="subComp">BBB</div>' +
				'<div class="subComp">BBB</div>' +
				'<div class="subComp">BBB</div>' +
			'</div>'
		);

		view.destroy();
	});


	it('subComponent declarative nested + name property', function () {
		let Sub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'subComp',
					view: '<p>SUB</p>'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view:
						'<h1>title</h1>' +
						'<SubComponent name="xxdk"></SubComponent>',
					// declare subComponent
					childs: {
						xxdk: Sub
					}
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(wraper.innerHTML).toBe(
			'<div>' +
				'<h1>title</h1>' +
				'<div class="subComp">' +
					'<p>SUB</p>' +
				'</div>' +
			'</div>'
		);

		view.destroy();
	});


	it('subComponent declarative nested + not find target', function () {
		let Sub = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					class: 'subComp',
					view: '<p>SUB</p>'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view:
						'<h1>title</h1>' +
						'<Sub></Sub>',
					// declare subComponent
					childs: {
						xxdk: Sub
					}
				});
			}
		});

		let view = sugar.core.create('view', View);

		expect(util.warn).toHaveBeenCalledWith('Cannot find target element for sub component [xxdk]');

		view.destroy();
	});


	it('component inherit', function () {
		let Son = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					all: 123,
					a: 'base_a'
				});
			},
			getA: function () {
				return this.getConfig('a');
			}
		});

		let Son1 = Son.extend({
			init: function (config) {
				this.Super('init', config, {
					a: 'son_1_a',
					b: {
						c: 'son_1_c'
					}
				});
			},
			getC: function () {
				return this.getConfig('b.c');
			}
		});

		let Son2 = Son1.extend({
			init: function (config) {
				this.Super('init', config, {
					b: {
						c: 'son_2_c',
						d: 'son_2_d'
					}
				});
			},
			getD: function () {
				return this.getConfig('b.d');
			}
		});

		let son = sugar.core.create('son', Son);
		let son1 = sugar.core.create('son1', Son1);
		let son2 = sugar.core.create('son2', Son2);

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