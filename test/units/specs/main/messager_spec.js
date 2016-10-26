import sugar from 'src/main/index';
import * as util from 'src/util';

let Component = sugar.Component;

describe('sugar message >', function () {
	let wraper;

	beforeEach(function () {
		wraper = document.createElement('div');
		document.body.appendChild(wraper);
	});

	afterEach(function () {
		document.body.removeChild(wraper);
	});


	it('fire message, from bottom to top', function () {
		let flag;
		// make 4 turn down relationship components
		// then send messages from one of them
		// and every parent component will receive the msg sent from CompLevel3
		// because their relationship is parent and son, message communication can be carried out

		let CompLevel3 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				this.fire('messageLevel3', 123);
			}
		});

		let CompLevel2 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// create Component CompLevel3
				this.create('comp3', CompLevel3, {
					target: this.el
				});

				this.fire('messageLevel2', {'id': 123}, 'afterSent');
				// fire another message at the same time
				this.fire('messageLevel22', 2222);
				// fire again next
				this.fire('messageLevel222', function (msg) {
					expect(msg.count).toBe(1); // return false by CompLevel1
				});
			},
			afterSent: function (msg) {
				// test message returns
				expect(msg.returns).toBe(1314);
			},
			onMessageLevel3: function (msg) {
				expect(msg.param).toBe(123);
				expect(msg.from).toBe(this.getChild('comp3'));
				expect(msg.to).toBe(this);
				expect(msg.count).toBe(1);
			}
		});

		let CompLevel1 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// create Component CompLevel2
				this.create('comp2', CompLevel2, {
					target: this.el
				});

				// just a message, no content no sent back
				this.fire('messageLevel1');
			},
			onMessageLevel3: function (msg) {
				expect(msg.param).toBe(123);
				expect(msg.from).toBe(this.getChild('comp2'));
				expect(msg.to).toBe(this);
				expect(msg.count).toBe(2);
			},
			onMessageLevel2: function (msg) {
				flag = 'xxdk';
				expect(msg.param).toEqual({'id': 123});
				msg.returns = 1314;
				return false; // it will casue thie msg doest't fire to parent, stop here
			},
			onMessageLevel22: function (msg) {
				expect(msg.count).toBe(1);
				expect(msg.param).toBe(2222);
			},
			onMessageLevel222: function (msg) {
				expect(msg.from).toBe(this.getChild('comp2'));
				return false;
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// create Component CompLevel1
				this.create('comp1', CompLevel1, {
					target: this.el
				});
			},
			onMessageLevel3: function (msg) {
				expect(msg.param).toBe(123);
				expect(msg.from).toBe(this.getChild('comp1'));
				expect(msg.to).toBe(this);
				expect(msg.count).toBe(3);
			},
			onMessageLevel2: function (msg) {
				// this func will not be called
				// because messageLevel2 is cut on CompLevel1 (by return false)
				flag = 'zzzz';
			},
			onMessageLevel22: function (msg) {
				expect(msg.count).toBe(2);
				expect(msg.param).toBe(2222);
			},
			onMessageLevel1: function (msg) {
				expect(msg.count).toBe(1);
				expect(msg.param).toBeUndefined();
				expect(msg.from).toBe(this.getChild('comp1'));
			}
		});

		let view = sugar.core.create('view', View, {
			target: wraper
		});

		expect(flag).toBe('xxdk');

		view.destroy();
	});


	it('broadcast message, from top to bottom', function () {
		let flag;

		let CompLevel3 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			onViewOk: function (msg) {
				expect(msg.count).toBe(3);
				expect(msg.to).toBe(this);
				expect(msg.param).toEqual([1, 2, 3, 4]);
				expect(msg.from).toBe(this.getParent());
				expect(msg.returns).toBe(123);
			},
			onLevel_1_ok: function () {
				// this func will not be called
				// because level_1_ok is cut on CompLevel2 (by return false)
				flag = 'level_3';
			},
			onLevel_2_ok: function (msg) {
				expect(msg.from).toBe(this.getParent());
			}
		});

		let CompLevel2 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// create Component CompLevel3
				this.create('comp3', CompLevel3, {
					target: this.el
				});

				this.broadcast('level_2_ok', this.afterSentLevel_2_ok);
			},
			afterSentLevel_2_ok: function (msg) {
				expect(msg.count).toBe(1);
			},
			onViewOk: function (msg) {
				expect(msg.count).toBe(2);
				expect(msg.to).toBe(this);
				expect(msg.param).toEqual([1, 2, 3, 4]);
				expect(msg.from).toBe(this.getParent());
				// add returns
				msg.returns = 123;
			},
			onLevel_1_ok: function (msg) {
				expect(msg.param).toBe(12);
				flag = 'level_2';
				return false; // it will casue thie msg doest't broadcast to child, stop here
			}
		});

		let CompLevel1 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// create Component CompLevel2
				this.create('comp2', CompLevel2, {
					target: this.el
				});

				this.broadcast('level_1_ok', 12, 'afterSentLevel_1_ok');
			},
			afterSentLevel_1_ok: function (msg) {
				expect(msg.count).toBe(1);
			},
			onViewOk: function (msg) {
				expect(msg.count).toBe(1);
				expect(msg.to).toBe(this);
				expect(msg.param).toEqual([1, 2, 3]);
				// change param
				msg.param.push(4);
				expect(msg.from).toBe(this.getParent());
			}
		});

		let View = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// create Component CompLevel1
				this.create('comp1', CompLevel1, {
					target: this.el
				});

				this.broadcast('viewOk', [1, 2, 3], this.afterSent);
			},
			afterSent: function (msg) {
				expect(msg.count).toBe(3);
			}
		});

		let view = sugar.core.create('view', View, {
			target: wraper
		});

		expect(flag).toBe('level_2');

		view.destroy();
	});


	it('notify message, between any two components', function () {
		let CompLevel2 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			onMsgSendToComp2: function (msg) {
				expect(msg.to).toBe(this);
				expect(msg.count).toBe(1);
				expect(msg.param).toBe(null);
				msg.returns = 'xxdk';
				expect(this.getParent().__rd__.name).toBe('comp1');
			}
		});

		let CompLevel1 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				this.create('comp2', CompLevel2, {
					target: this.el
				});
			},
			onMsgSendToComp1: function (msg) {
				expect(msg.to).toBe(this);
				expect(msg.count).toBe(1);
				expect(msg.param).toBe(456);
				expect(this.getParent().__rd__.name).toBe('view1');
				msg.returns = 'who are you?';
			}
		});

		let View1 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				this.create('comp1', CompLevel1, {
					target: this.el
				});
			},
			onMsgSendToView1: function (msg) {
				expect(msg.to).toBe(this);
				expect(msg.count).toBe(1);
				expect(msg.param).toBe(123);
			},
			onMsgSendToView1ByName: function (msg) {
				expect(msg.param).toBe(321);
			}
		});
		let view1 = sugar.core.create('view1', View1, {
			target: wraper
		});

		// View2 has no any relationship with others components
		// but it can communicate with any one by `notify`
		let View2 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// notify by component instance
				this.notify(sugar.core.get('view1'), 'msgSendToView1', 123);
				// send another message
				this.notify('view1', 'msgSendToView1ByName', 321);

				// notify by component name
				this.notify('view1.comp1', 'msgSendToComp1', 456, 'afterNotifyComp1');

				this.notify('view1.comp1.comp2', 'msgSendToComp2', function (msg) {
					expect(msg.returns).toBe('xxdk');
				});

				// notify to an unknown component
				this.notify('unknown', 'canYouReceiveMe');
				expect(util.warn).toHaveBeenCalledWith('Component: [unknown] is not exist!');
			},
			afterNotifyComp1: function (msg) {
				expect(msg.returns).toBe('who are you?');
			}
		});
		let view2 = sugar.core.create('view2', View2, {
			target: wraper
		});

		view1.destroy();
		view2.destroy();
	});


	it('globalCast message, every component create by sugar will be received', function () {
		let CompLevel2 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			onCast: function (msg) {
				expect(msg.param).toBe(789);
			}
		});

		let CompLevel1 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				this.create('comp2', CompLevel2, {
					target: this.el
				});
			},
			onCast: function (msg) {
				expect(msg.param).toBe(789);
			}
		});

		let View1 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				this.create('comp2', CompLevel1, {
					target: this.el
				});
			},
			onCast: function (msg) {
				expect(msg.param).toBe(789);
			},
			onInsideCast: function (msg) {
				expect(msg.from).toBe('__core__');
			}
		});
		let view1 = sugar.core.create('view1', View1, {
			target: wraper
		});

		let View2 = Component.extend({
			init: function (config) {
				this.Super('init', config);
			},
			afterRender: function () {
				// cast inside componet, but it's same to everywhere
				sugar.core.globalCast('insideCast', this.afterSentInsideCast, this);
			},
			afterSentInsideCast: function (msg) {
				// just view2 and view1 have the message recevier `onInsideCast`
				expect(msg.count).toBe(2);
			},
			onCast: function (msg) {
				expect(msg.param).toBe(789);
			},
			onInsideCast: function (msg) {
				expect(msg.from).toBe('__core__');
			}
		});
		let view2 = sugar.core.create('view2', View2, {
			target: wraper
		});

		// globalCast should be only send by sugar.core
		sugar.core.globalCast('cast', 789, function (msg) {
			expect(msg.count).toBe(4); // 4 component in this spec
			expect(sugar.core.getChilds(true).length).toBe(2);
		});

		view1.destroy();
		view2.destroy();
	});
});