var eventer = require('src/eventer').default;

function triggerEvent(target, evt, process) {
	var e = document.createEvent('HTMLEvents');
	e.initEvent(evt, true, true);

	if (process) {
		process(e);
	}

	target.dispatchEvent(e);
}

describe('eventer >', function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		element.innerHTML =
			'<h1>aaa</h1>' +
			'<button></button>' +
			'<input type="text"/>'
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});


	it('add event with anonymous function', function() {
		var count = 0, cxtTag;
		var h1 = element.querySelector('h1');

		eventer.add(h1, 'click', function() {
			count++;
			cxtTag = this.tagName;
		});

		triggerEvent(h1, 'click');
		expect(count).toBe(1);
		// anonymous function context is element
		expect(cxtTag).toBe('H1');

		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(count).toBe(5);
	});


	it('add event with context', function() {
		var h1 = element.querySelector('h1');
		var scope = {
			'count'  : 0,
			'evClick': function() {
				this.count++;
			}
		}

		eventer.add(h1, 'mouseenter', scope.evClick, false, scope);

		triggerEvent(h1, 'mouseenter');
		expect(scope.count).toBe(1);

		triggerEvent(h1, 'mouseenter');
		triggerEvent(h1, 'mouseenter');
		triggerEvent(h1, 'mouseenter');
		triggerEvent(h1, 'mouseenter');
		expect(scope.count).toBe(5);
	});


	it('remove event without context', function() {
		var h1 = element.querySelector('h1');
		var btn = element.querySelector('button');

		var count = 0;
		var evClickH1 = function() {
			count++;
		}
		eventer.add(h1, 'click', evClickH1);

		var evClickBtn = function() {
			eventer.remove(h1, 'click', evClickH1);
			count = 0;
		}
		eventer.add(btn, 'click', evClickBtn);

		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(count).toBe(3);

		// remove evClickH1 from h1
		triggerEvent(btn, 'click');
		expect(count).toBe(0);

		// evClickH1 has been remove
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(count).toBe(0);
	});


	it('remove event with context', function() {
		var h1 = element.querySelector('h1');
		var btn = element.querySelector('button');
		var scope = {
			'count'     : 0,
			'evClickH1' : function() {
				this.count++;
			},
			'evClickBtn': function() {
				this.count = 0;
				eventer.remove(h1, 'click', this.evClickH1);
			}
		}

		// clear records
		eventer.clear();

		eventer.add(h1, 'click', scope.evClickH1, false, scope);
		eventer.add(btn, 'click', scope.evClickBtn, false, scope);

		expect(Object.keys(eventer.$map).length).toBe(2);
		expect(Object.keys(eventer.$listeners).length).toBe(2);

		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(scope.count).toBe(3);

		// remove evClickH1 from h1
		triggerEvent(btn, 'click');
		expect(scope.count).toBe(0);
		expect(Object.keys(eventer.$map).length).toBe(1);
		expect(Object.keys(eventer.$listeners).length).toBe(1);

		// evClickH1 has been remove
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(scope.count).toBe(0);
	});


	it('multiple add and remove event', function() {
		var h1 = element.querySelector('h1');
		var btn = element.querySelector('button');
		var ipt = element.querySelector('input');

		var scope = {
			'count1'     : 0,
			'evClickH1' : function() {
				this.count1 = this.count1 + 1;
			},
			'evClickBtn': function() {
				this.count1 = this.count1 + 2;
			},
			'evClickIpt': function() {
				this.count1 = 0;
			},
			// another event
			'count2'     : 0,
			'evClickH1_2': function() {
				this.count2 = this.count2 + 1;
			}
		}

		// bind each element
		eventer.add(h1, 'click', scope.evClickH1, false, scope);
		eventer.add(btn, 'click', scope.evClickBtn, false, scope);
		eventer.add(ipt, 'click', scope.evClickIpt, false, scope);

		triggerEvent(h1, 'click');
		expect(scope.count1).toBe(1);
		triggerEvent(btn, 'click');
		expect(scope.count1).toBe(3);
		triggerEvent(ipt, 'click');
		expect(scope.count1).toBe(0);

		// bind h1 for another click event, they should be worked both
		eventer.add(h1, 'click', scope.evClickH1_2, false, scope);
		triggerEvent(h1, 'click');
		expect(scope.count1).toBe(1);
		expect(scope.count2).toBe(1);

		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(scope.count1).toBe(5);
		expect(scope.count2).toBe(5);

		// remove a designated event
		eventer.remove(h1, 'click', scope.evClickH1);
		triggerEvent(h1, 'click');
		expect(scope.count1).toBe(5);
		expect(scope.count2).toBe(6);

		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		triggerEvent(h1, 'click');
		expect(scope.count1).toBe(5);
		expect(scope.count2).toBe(9);
	});
});