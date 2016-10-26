import * as util from 'src/util';
import {
	isNormal,
	createGetter,
	createSetter
} from 'src/mvvm/expression/index';
import { createPath } from 'src/mvvm/expression/path';


describe('directive expression >', function () {
	let element;

	beforeEach(function () {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function () {
		document.body.removeChild(element);
	});


	it('isNormal expression', function () {
		// valid normal expression
		expect(isNormal('title')).toBe(true);
		expect(isNormal('title_aa')).toBe(true);
		expect(isNormal('item.title')).toBe(true);
		expect(isNormal('item["title"]')).toBe(true);
		expect(isNormal('item["title"]["sub"].text')).toBe(true);

		// not normal expression, with operator
		expect(isNormal('a > b')).toBe(false);
		expect(isNormal('a + 1')).toBe(false);
		expect(isNormal('a = b ? c : d')).toBe(false);
	});


	it('createGetter', function () {
		let scope, getter;

		// shallow value
		scope = {
			a: 123
		}
		getter = createGetter('a');
		expect(getter.call(scope, scope)).toBe(123);

		// deep value
		scope = {
			a: {
				b: {
					c: 321
				}
			}
		}
		getter = createGetter('a');
		expect(getter.call(scope, scope)).toEqual({
			b: {
				c: 321
			}
		});

		getter = createGetter('a.b');
		expect(getter.call(scope, scope)).toEqual({
			c: 321
		});

		getter = createGetter('a.b.c');
		expect(getter.call(scope, scope)).toBe(321);

		getter = createGetter('(a.b.c + a.b.c)*2 + 1.5');
		expect(getter.call(scope, scope)).toBe(321*4 + 1.5);

		// complex expression
		scope = {
			a: true,
			b: 11.11,
			c: 8.18
		}
		getter = createGetter('a ? b : c');
		expect(getter.call(scope, scope)).toBe(11.11);

		// with const string and number
		scope = {
			a: 456
		}
		getter = createGetter('a + "_" + 789');
		expect(getter.call(scope, scope)).toBe('456_789');

		// javascript keyword
		scope = {
			n: 1.23
		}
		getter = createGetter('parseInt(n)');
		expect(getter.call(scope, scope)).toBe(1);

		// invalid keyword
		getter = createGetter('var a = 1');
		expect(util.warn).toHaveBeenCalledWith('Avoid using unallow keyword in expression [var a = 1]');

		// invalid expression
		getter = createGetter('a ++ 1');
		expect(util.error).toHaveBeenCalledWith('Invalid generated expression: [a ++ 1]');
	});


	it('createPath', function () {
		expect(createPath('title')).toEqual(['title']);
		expect(createPath('item.title')).toEqual(['item', 'title']);
		expect(createPath('item["title"]')).toEqual(['item', 'title']);
		expect(createPath("item['title']")).toEqual(['item', 'title']);
		expect(createPath('item.title.some')).toEqual(['item', 'title', 'some']);
		expect(createPath('item.title.some.text')).toEqual(['item', 'title', 'some', 'text']);
		expect(createPath('item["title"].some["text"]')).toEqual(['item', 'title', 'some', 'text']);
		expect(createPath("item['title'].some['text']")).toEqual(['item', 'title', 'some', 'text']);
		expect(createPath('item["title"]["some"]["text"]')).toEqual(['item', 'title', 'some', 'text']);
		expect(createPath("item['title']['some']['text']")).toEqual(['item', 'title', 'some', 'text']);

		expect(createPath('items[0]')).toEqual(['items', '0']);
		expect(createPath('items[0].title')).toEqual(['items', '0', 'title']);
		expect(createPath('items[0]["title"]')).toEqual(['items', '0', 'title']);
		expect(createPath('items[0]["title"]["text"]')).toEqual(['items', '0', 'title', 'text']);
		expect(createPath('items[0]["title"][1].text')).toEqual(['items', '0', 'title', '1', 'text']);
		expect(createPath('items[0]["title"][1]["text"]')).toEqual(['items', '0', 'title', '1', 'text']);

		expect(createPath('_title_')).toEqual(['_title_']);
		expect(createPath('item._title_')).toEqual(['item', '_title_']);
		expect(createPath('item["_title_"]')).toEqual(['item', '_title_']);
		expect(createPath("item['_title_']")).toEqual(['item', '_title_']);
	});


	it('createSetter', function () {
		let setter, scope;

		// normal set
		setter = createSetter('a');
		scope = { a: 123 };
		setter.call(scope, scope, 321);
		expect(scope.a).toBe(321);

		// deep set
		setter = createSetter('a.b.c');
		scope = {
			a: {
				b: {
					c: 456
				}
			}
		}
		setter.call(scope, scope, 654);
		expect(scope.a.b.c).toBe(654);

		// invaild expression
		setter = createSetter('""');
		setter.call(scope, setter, "");
		expect(util.error).toHaveBeenCalledWith('Invalid setter expression [""]');
	});
});