var Observer = require('src/mvvm/observer');

describe('Observer >', function() {

	it('normal filed change', function() {
		var data = {};
		data.normal = 111;
		data.arr = ['a'];
		data.obj = {'a': 1}

		var access, newValue, oldValue;
		var callback = function(path, last, old) {
			access = path;
			newValue = last;
			oldValue = old;
		}
		new Observer(data, callback, this);

		data.normal = 222;
		// 'normal' 222 111
		expect(access).toBe('normal');
		expect(newValue).toBe(222);
		expect(oldValue).toBe(111);

		data.arr = ['a', 'b'];
		// 'arr' ['a', 'b'] ['a']
		expect(access).toBe('arr');
		expect(newValue).toEqual(['a', 'b']);
		expect(oldValue).toEqual(['a']);

		data.obj = {'b': 2};
		// 'obj' {'b': 2} {'a': 1}
		expect(access).toBe('obj');
		expect(newValue).toEqual({'b': 2});
		expect(oldValue).toEqual({'a': 1});

		data.normal = 222;
		// will not change
		expect(access).toBe('obj');
		expect(newValue).toEqual({'b': 2});
		expect(oldValue).toEqual({'a': 1});
	});


	it('array const item change', function() {
		var data = {};
		data.arr = ['a', 'b', 'c'];

		var access, newValue, oldValue;
		var callback = function(path, last, old) {
			access = path;
			newValue = last;
			oldValue = old;
		}
		new Observer(data, callback, this);

		data.arr[0] = 'aaa';
		// arr*0 'aaa' 'a'
		expect(access).toBe('arr*0');
		expect(newValue).toBe('aaa');
		expect(oldValue).toBe('a');
		expect(data.arr[0]).toBe('aaa');
	});


	it('array object item change', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue;
		var callback = function(path, last, old) {
			access = path;
			newValue = last;
			oldValue = old;
		}
		new Observer(data, callback, this);

		data.arr[0].text = 'a333';
		// 'arr*0*text' 'a333' 'aaa'
		expect(access).toBe('arr*0*text');
		expect(newValue).toBe('a333');
		expect(oldValue).toBe('aaa');
		expect(data.arr[0]).toEqual({'text': 'a333', 'cap': 'A'});

		data.arr[1] = {'new': true};
		// 'arr*1' {'new': true} {'text': 'aaa', 'cap': 'A'}
		expect(access).toBe('arr*1');
		expect(newValue).toEqual({'new': true});
		expect(oldValue).toEqual({'text': 'bbb', 'cap': 'B'});
	});


	it('array method push', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue, args;
		var callback = function(path, last, old, arg) {
			access = path;
			newValue = last;
			oldValue = old;
			args = arg;
		}
		new Observer(data, callback, this);

		data.arr.push({'text': 'ddd', 'cap': 'D'});
		// 'arr' [newArray] 'push' [{'text': 'ddd', 'cap': 'D'}]
		expect(access).toBe('arr');
		expect(oldValue).toBe('push');
		expect(args).toEqual([{'text': 'ddd', 'cap': 'D'}]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'},
			{'text': 'ddd', 'cap': 'D'}
		]);
	});


	it('array method pop', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue, args;
		var callback = function(path, last, old, arg) {
			access = path;
			newValue = last;
			oldValue = old;
			args = arg;
		}
		new Observer(data, callback, this);

		data.arr.pop();
		// 'arr' [newArray] 'pop' []
		expect(access).toBe('arr');
		expect(oldValue).toBe('pop');
		expect(args).toEqual([]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'}
		]);
	});


	it('array method unshift', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue, args;
		var callback = function(path, last, old, arg) {
			access = path;
			newValue = last;
			oldValue = old;
			args = arg;
		}
		new Observer(data, callback, this);

		data.arr.unshift({'text': 'xxx', 'cap': 'X'});
		// 'arr' [newArray] 'unshift' [{'text': 'xxx', 'cap': 'X'}]
		expect(access).toBe('arr');
		expect(oldValue).toBe('unshift');
		expect(args).toEqual([{'text': 'xxx', 'cap': 'X'}]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'xxx', 'cap': 'X'},
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		]);
	});


	it('array method shift', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue, args;
		var callback = function(path, last, old, arg) {
			access = path;
			newValue = last;
			oldValue = old;
			args = arg;
		}
		new Observer(data, callback, this);

		data.arr.shift();
		// 'arr' [newArray] 'shift' []
		expect(access).toBe('arr');
		expect(oldValue).toBe('shift');
		expect(args).toEqual([]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		]);
	});


	it('array method $set', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue, args;
		var callback = function(path, last, old, arg) {
			access = path;
			newValue = last;
			oldValue = old;
			args = arg;
		}
		new Observer(data, callback, this);

		data.arr.$set(1, {'text': 'bxxx', 'cap': 'BBX'});
		// 'arr' [newArray] 'splice' [1, 1, {'text': 'bxxx', 'cap': 'BBX'}]
		expect(access).toBe('arr');
		expect(oldValue).toBe('splice');
		expect(args).toEqual([1, 1, {'text': 'bxxx', 'cap': 'BBX'}]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bxxx', 'cap': 'BBX'},
			{'text': 'ccc', 'cap': 'C'}
		]);

		// out of length
		data.arr.$set(5, {'text': 'ddd', 'cap': 'D'});
		// 'arr' [newArray] 'splice' [3, 1, {'text': 'ddd', 'cap': 'D'}]
		expect(access).toBe('arr');
		expect(oldValue).toBe('splice');
		expect(args).toEqual([3, 1, {'text': 'ddd', 'cap': 'D'}]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bxxx', 'cap': 'BBX'},
			{'text': 'ccc', 'cap': 'C'},
			{'text': 'ddd', 'cap': 'D'}
		]);
	});


	it('array method $remove', function() {
		var data = {};
		data.arr = [
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'bbb', 'cap': 'B'},
			{'text': 'ccc', 'cap': 'C'}
		];

		var access, newValue, oldValue, args;
		var callback = function(path, last, old, arg) {
			access = path;
			newValue = last;
			oldValue = old;
			args = arg;
		}
		new Observer(data, callback, this);

		data.arr.$remove(data.arr[1]);
		// 'arr' [newArray] 'splice' [1, 1]
		expect(access).toBe('arr');
		expect(oldValue).toBe('splice');
		expect(args).toEqual([1, 1]);
		expect(data.arr).toEqual(newValue);
		expect(data.arr).toEqual([
			{'text': 'aaa', 'cap': 'A'},
			{'text': 'ccc', 'cap': 'C'}
		]);
	});


	it('deep change for classObject in array', function() {
		var data = {};
		data.arr = [
			{
				'classObject': {
					'gsw_a': true,
					'gsw_b': false
				}
			},
			{
				'classObject': {
					'cavs_1': false,
					'cavs_2': false
				}
			}
		];

		var access, newValue, oldValue;
		var callback = function(path, last, old) {
			access = path;
			newValue = last;
			oldValue = old;
		}
		new Observer(data, callback, this);

		data.arr[1].classObject.cavs_2 = true;
		// 'arr*1*classObject' true false
		// if change target belongs to an object, OB just trigger the path to this object
		// so here the access is 'arr*1*classObject' instead of 'arr*1*classObject*cavs_2'
		expect(access).toBe('arr*1*classObject');
		expect(newValue).toBe(true);
		expect(oldValue).toBe(false);
		expect(data.arr[1].classObject.cavs_2).toEqual(true);

		data.arr[0].classObject = {
			'okc_west': true,
			'okc_durt': false
		}
		// 'arr*0*classObject' {newObject} {oldObject}
		expect(access).toBe('arr*0*classObject');
		expect(data.arr[0].classObject).toEqual(newValue);
		expect(newValue).toEqual({
			'okc_west': true,
			'okc_durt': false
		});
		expect(oldValue).toEqual({
			'gsw_a': true,
			'gsw_b': false
		});
	});


	it('deep change for two-lever loops', function() {
		var data = {};
		data.arr = [
			{
				'subs': [
					{'text': 'aaa'},
					{'text': 'bbb'}
				]
			},
			{
				'subs': [
					{'text': 'ccc'},
					{'text': 'ddd'}
				]
			}
		];

		var access, newValue, oldValue;
		var callback = function(path, last, old) {
			access = path;
			newValue = last;
			oldValue = old;
		}
		new Observer(data, callback, this);

		data.arr[1].subs[0].text = 'CCC';
		// 'arr*1*subs*0*text' 'CCC' 'ccc'
		expect(access).toBe('arr*1*subs*0*text');
		expect(newValue).toBe('CCC');
		expect(oldValue).toBe('ccc');
		expect(data.arr[1].subs[0]).toEqual({'text': 'CCC'});

		data.arr[0].subs[1] = {'text': 'BBB', 'add': true};
		// 'arr*0*subs*1' {newObject} {oldObject}
		expect(access).toBe('arr*0*subs*1');
		expect(data.arr[0].subs[1]).toEqual(newValue);
		expect(newValue).toEqual({'text': 'BBB', 'add': true});
		expect(oldValue).toEqual({'text': 'bbb'});
	});


	it('deep change for two-lever loops and classObject', function() {
		var data = {};
		data.arr = [
			{
				'subs': [
					{
						'classObject': {
							'gsw_a': true,
							'gsw_b': true
						}
					}
				]
			},
			{
				'subs': [
					{
						'classObject': {
							'cavs_1': false,
							'cavs_2': false
						}
					}
				]
			}
		];

		var access, newValue, oldValue;
		var callback = function(path, last, old) {
			access = path;
			newValue = last;
			oldValue = old;
		}
		new Observer(data, callback, this);

		data.arr[0].subs[0].classObject.gsw_b = false;
		// 'arr*0*subs*0*classObject' false true
		expect(access).toBe('arr*0*subs*0*classObject');
		expect(newValue).toBe(false);
		expect(oldValue).toBe(true);
		expect(data.arr[0].subs[0].classObject).toEqual({
			'gsw_a': true,
			'gsw_b': false
		});

		data.arr[1].subs[0].classObject = {
			'okc_west': false,
			'okc_durt': true
		};
		// 'arr*0*subs*0*classObject' false true
		expect(access).toBe('arr*1*subs*0*classObject');
		expect(data.arr[1].subs[0].classObject).toEqual(newValue);
		expect(newValue).toEqual({
			'okc_west': false,
			'okc_durt': true
		});
		expect(oldValue).toEqual({
			'cavs_1': false,
			'cavs_2': false
		});
	});
});