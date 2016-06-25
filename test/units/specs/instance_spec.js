var MVVM = require('mvvm');

describe("mvvm instance >", function() {
	var element, vm, data;

	beforeEach(function() {
		element = document.createElement('div');
		element.innerHTML = '<div v-bind:id="vid">{{ text }}</div>';
		document.body.appendChild(element);

		data = {
			'vid': 'aaa',
			'text': 'bbb'
		}

		vm = new MVVM(element, data);
	});

	afterEach(function() {
		vm = data = null;
		document.body.removeChild(element);
	});


	it('get', function() {
		// get one
		expect(vm.get('vid')).toBe('aaa');

		// get all
		expect(vm.get()).toEqual({
			'vid': 'aaa',
			'text': 'bbb'
		});
	});


	it('set', function() {
		// set one
		vm.set('text', 'BBB');
		expect(data.text).toBe('BBB');

		// set object
		vm.set({
			'vid': 'AAA',
			'text': 'bbb'
		});
		expect(data.vid).toBe('AAA');
		expect(data.text).toBe('bbb');
	});


	it('reset', function() {
		data.vid = 23333;
		data.text = 94949494;

		// reset one
		vm.reset('vid');
		expect(data.vid).toBe('aaa');

		// reset array
		vm.reset(['text']);
		expect(data.text).toBe('bbb');

		// reset all
		data.vid = 23333;
		data.text = 94949494;
		vm.reset();
		expect(data.vid).toBe('aaa');
		expect(data.text).toBe('bbb');
	});


	it('watch', function() {
		var tempVid;

		vm.watch('vid', function(path, lastValue) {
			tempVid = lastValue;
		});

		data.vid = 233333;
		expect(tempVid).toBe(data.vid);
	});


	it('shallow watch', function() {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		data = {
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		vm = new MVVM(element, data);

		var length, count = 0;
		vm.watch('items', function(path, newArray) {
			count++;
			length = newArray.length;
		});

		// change for array outside
		data.items.pop();
		expect(count).toBe(1);
		expect(length).toBe(data.items.length);

		// change for array inside (deep)
		data.items[0].text = 'aaa';
		expect(count).toBe(1);
	});


	it('deep watch', function() {
		// clear first
		element = data = vm = null;
		element = document.createElement('div');
		document.body.appendChild(element);

		element.innerHTML =
			'<ul>' +
				'<li v-for="item in items">' +
					'{{ item.text }}' +
				'</li>' +
			'</ul>'

		data = {
			'items': [
				{'text': 111},
				{'text': 222},
				{'text': 333}
			]
		}

		vm = new MVVM(element, data);

		var path, val, old, count = 0;
		vm.watch('items', function(access, newVal, oldVal) {
			count++;
			path = access;
			val = newVal;
			old = oldVal;
		}, true);

		// change for array inside (deep)
		data.items[0].text = 'aaa';
		expect(path).toBe('items*0*text');
		expect(val).toBe('aaa');
		expect(old).toBe(111);
		expect(count).toBe(1);

		// and also can be watch outside
		data.items.pop();
		expect(path).toBe('items');
		expect(val).toBe(data.items);
		expect(old).toBe('pop');
		expect(count).toBe(2);
	});
});