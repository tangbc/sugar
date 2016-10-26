import sugar from 'src/main/index';

let Component = sugar.Component;

describe('sugar component destroy >', function () {
	let wraper;

	beforeEach(function () {
		wraper = document.createElement('div');
		document.body.appendChild(wraper);
	});

	afterEach(function () {
		document.body.removeChild(wraper);
	});


	it('destroy all sub components', function () {
		let Comp2 = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					view: '<h2>Comp2</h2>'
				});
			}
		});

		let Comp1 = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					view: '<h1>Comp1</h1>'
				});
			},
			afterRender: function () {
				let comp2 = this.create('comp2', Comp2, {
					target: this.el
				});

				expect(this.el.innerHTML).toBe('<h1>Comp1</h1><div><h2>Comp2</h2></div>');
				expect(this.getChild('comp2')).toBe(comp2);
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				let comp1 = this.create('comp1', Comp1, {
					target: this.el
				});

				expect(this.el.innerHTML).toBe('<div><h1>Comp1</h1><div><h2>Comp2</h2></div></div>');
				expect(comp1).toBe(this.getChild('comp1'));

				// destroy comp1, comp2 will also be destroy
				comp1.destroy();
				expect(this.el.innerHTML).toBe('');
				expect(this.getChild('comp1')).toBe(null);
				expect(this.getChilds(true).length).toBe(0);

				// not allow to render again
				this._render();
				expect(this.el.innerHTML).toBe('');
				expect(this.getChild('comp1')).toBe(null);
			}
		});

		let view = sugar.core.create('view', View, {
			target: wraper
		});

		view.destroy();
	});


	it('receive destroy message', function () {
		let Comp = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					view: '<h1>Comp</h1>'
				});
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				this.create('comp', Comp, {
					target: this.el
				});
			},
			onSubDestroyed: function (msg) {
				expect(msg.param).toBe('comp');
				expect(this.getChild('comp')).toBe(null);
				expect(this.el.innerHTML).toBe('');
			}
		});
		let view = sugar.core.create('view', View, {
			target: wraper
		});

		expect(wraper.innerHTML).toBe('<div><div><h1>Comp</h1></div></div>');

		let subComp = view.getChild('comp');
		// pass true will fire a message to parent (view) after this component is destroyed
		subComp.destroy(true);

		view.destroy();
	});


	it('use beforeDestroy save component data', function () {
		let myMoney = null;

		let View = Component.extend({
			init: function (config) {
				this.$data = { money: '$699' };
				this.Super('init', config);
			},
			afterRender: function () {
				this.$data.money = '$998';
			},
			beforeDestroy: function () {
				myMoney = this.$data;
			}
		});

		let view = sugar.core.create('view', View, {
			target: wraper
		});

		expect(myMoney).toBe(null);
		expect(view.$data).toEqual({ money: '$998' });

		view.destroy();
		expect(myMoney).toEqual({ money: '$998' });
		expect(view.$data).toBe(undefined);
	});


	it('do not use sugar.core.destroy', function () {
		let Comp = Component.extend({
			init: function (config) {
				this.Super('init', config, {
					target: wraper,
					view: 'Comp'
				});
			}
		});
		let comp = sugar.core.create('comp', Comp, {
			target: wraper
		});

		expect(wraper.innerHTML).toBe('<div>Comp</div>');

		// have no any effect!
		sugar.core.destroy();
		expect(wraper.innerHTML).toBe('<div>Comp</div>');

		comp.destroy();
	});
});