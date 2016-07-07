var sugar = require('src/main/index').default;
var Component = sugar.Component;
var Cache = require('src/main/cache').default;

function triggerEvent(target, evt, process) {
	var e = document.createEvent('HTMLEvents');
	e.initEvent(evt, true, true);

	if (process) {
		process(e);
	}

	target.dispatchEvent(e);
}

describe('sugar module api >', function() {
	var wraper = document.createElement('div');
	document.body.appendChild(wraper);


	it('destroy all sub components', function() {
		var Comp2 = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'html': '<h2>Comp2</h2>'
				});
				this.Super('init', arguments);
			}
		});

		var Comp1 = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'html': '<h1>Comp1</h1>'
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				var comp2 = this.create('comp2', Comp2, {
					'target': this.el
				});

				expect(this.el.innerHTML).toBe('<h1>Comp1</h1><div><h2>Comp2</h2></div>');
				expect(this.getChild('comp2')).toBe(comp2);
			}
		});

		var View = Component.extend({
			init: function(config) {
				this.Super('init', arguments);
			},
			viewReady: function() {
				var comp1 = this.create('comp1', Comp1, {
					'target': this.el
				});

				expect(this.el.innerHTML).toBe('<div><h1>Comp1</h1><div><h2>Comp2</h2></div></div>');
				expect(comp1).toBe(this.getChild('comp1'));

				// destroy comp1, comp2 will also be destroy
				comp1.destroy();
				expect(this.el.innerHTML).toBe('');
				expect(this.getChild('comp1')).toBe(null);
				expect(this.getChilds(true).length).toBe(0);
				expect(Cache.length).toBe(1);

				// not allow to render again
				this._render();
				expect(this.el.innerHTML).toBe('');
				expect(this.getChild('comp1')).toBe(null);
			}
		});

		var view = sugar.core.create('view', View, {
			'target': wraper
		});

		view.destroy();
	});


	it('receive destroy message', function() {
		var Comp = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'html': '<h1>Comp</h1>'
				});
				this.Super('init', arguments);
			},
			viewReady: function() {
				this.bind(this.el, 'click', function() {
					// pass true means fire a message to parent after this component is destroyed
					this.destroy(true);
				});
			}
		});

		var View = Component.extend({
			init: function() {
				this.Super('init', arguments);
			},
			viewReady: function() {
				this.create('comp', Comp, {
					'target': this.el
				});
			},
			onSubDestroyed: function(msg) {
				expect(msg.param).toBe('comp');
				expect(this.getChild('comp')).toBe(null);
				expect(this.el.innerHTML).toBe('');
			}
		});
		var view = sugar.core.create('view', View, {
			'target': wraper
		});

		expect(wraper.innerHTML).toBe('<div><div><h1>Comp</h1></div></div>');

		triggerEvent(view.getChild('comp').el, 'click');

		view.destroy();
	});


	it('use beforeDestroy save component data', function() {
		var myMoney = null;

		var View = Component.extend({
			init: function() {
				this.$data = {'money': '$699'};
				this.Super('init', arguments);
			},
			viewReady: function() {
				this.$data.money = '$998';
			},
			beforeDestroy: function() {
				myMoney = this.$data;
			}
		});

		var view = sugar.core.create('view', View, {
			'target': wraper
		});

		expect(myMoney).toBe(null);
		expect(view.$data).toEqual({'money': '$998'});

		view.destroy();
		expect(myMoney).toEqual({'money': '$998'});
		expect(view.$data).toBe(undefined);
	});


	it('do not use sugar.core.destroy', function() {
		var Comp = Component.extend({
			init: function(config) {
				config = this.cover(config, {
					'target': wraper,
					'html': 'Comp'
				});
				this.Super('init', arguments);
			}
		});
		var comp = sugar.core.create('comp', Comp, {
			'target': wraper
		});

		expect(wraper.innerHTML).toBe('<div>Comp</div>');

		// have no any effect!
		sugar.core.destroy();
		expect(wraper.innerHTML).toBe('<div>Comp</div>');

		comp.destroy();
	});
});