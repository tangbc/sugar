define([
	'../../../../src/dom',
	'../../../../src/mvvm/index'
], function(dom, MVVM) {
/*------------------------------*/
describe("v-bind >", function() {
	var element;

	beforeEach(function() {
		element = document.createElement('div');
		document.body.appendChild(element);
	});

	afterEach(function() {
		document.body.removeChild(element);
	});

	function equalClass(classString, stringClass) {
		var fronts = classString.split(' ');
		var backs = stringClass.split(' ');

		if (fronts.length !== backs.length) {
			return false;
		}

		for (var i = 0; i < fronts.length; i++) {
			if (backs.indexOf(fronts[i]) === -1) {
				return false;
			}
		}

		return true;
	}

	it('test equalClass', function() {
		expect(equalClass('a', 'a b')).toBeFalsy();
		expect(equalClass('a c', 'a b')).toBeFalsy();

		expect(equalClass('a', 'a')).toBeTruthy();
		expect(equalClass('a b', 'b a')).toBeTruthy();
		expect(equalClass('a b c', 'c b a')).toBeTruthy();
		expect(equalClass('a b c def ghi', 'def b ghi a c')).toBeTruthy();
	});


	it('class single', function() {
		element.innerHTML = '<div v-bind:class="cls"></div>';

		var vm = new MVVM(element, {
			'cls': ''
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(dom.hasAttr(div, 'class')).toBe(false);

		data.cls = 'classA';
		expect(div.className).toBe('classA');
		expect(dom.hasClass(div, 'classA')).toBe(true);

		// remove class
		data.cls = '';
		expect(div.className).toBe('');
		expect(dom.hasAttr(div, 'class')).toBe(false);

		// add new class and will remove old class
		data.cls = 'classB';
		expect(div.className).toBe('classB');
		expect(dom.hasClass(div, 'classA')).toBe(false);
	});


	it('class single with static', function() {
		element.innerHTML = '<div class="static1 static2" v-bind:class="cls"></div>';

		var vm = new MVVM(element, {
			'cls': 'xxdk'
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(equalClass(div.className, 'static1 static2 xxdk')).toBe(true);

		data.cls = 'txgc';
		expect(equalClass(div.className, 'static1 static2 txgc')).toBe(true);

		data.cls = '';
		expect(equalClass(div.className, 'static1 static2')).toBe(true);
	});


	it('class array', function() {
		element.innerHTML = '<div class="static1" v-bind:class="[cls1, cls2, \'static2\']"></div>';

		var vm = new MVVM(element, {
			'cls1': 'aaa',
			'cls2': 'bbb'
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(equalClass(div.className, 'static1 aaa bbb static2')).toBe(true);

		data.cls1 = 'AAA';
		data.cls2 = 'BBB';
		expect(equalClass(div.className, 'static1 AAA BBB static2')).toBe(true);

		data.cls1 = '';
		data.cls2 = '';
		expect(equalClass(div.className, 'static1 static2')).toBe(true);
	});


	it('class object', function() {
		element.innerHTML = '<div v-bind:class="obj"></div>';

		var vm = new MVVM(element, {
			'obj': {
				'aaa': true,
				'bbb': false,
				'ccc': true
			}
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(equalClass(div.className, 'aaa ccc')).toBe(true);

		data.obj.bbb = true;
		data.obj.ccc = false;
		expect(equalClass(div.className, 'aaa bbb')).toBe(true);

		// cover obj
		data.obj = {
			'ddd': true,
			'eee': true,
			'fff': false
		}
		expect(equalClass(div.className, 'ddd eee')).toBe(true);

		data.obj.fff = true;
		data.obj.ddd = false;
		data.obj.eee = false;
		expect(equalClass(div.className, 'fff')).toBe(true);
	});


	it('class json', function() {
		element.innerHTML = '<div v-bind:class="{classA: isA, classB: isB}"></div>';

		var vm = new MVVM(element, {
			'isA': true,
			'isB': false,
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(equalClass(div.className, 'classA')).toBe(true);

		data.isB = true;
		expect(equalClass(div.className, 'classA classB')).toBe(true);

		data.isA = false;
		data.isB = false;
		expect(div.className).toBe('');
		expect(dom.hasAttr(div, 'class')).toBe(false);
	});


	it('style object', function() {
		element.innerHTML = '<div v-bind:style="obj"></div>';

		var vm = new MVVM(element, {
			'obj': {
				'color': 'red',
				'margin-top': '10px'
			}
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(div.style.color).toBe('red');
		expect(div.style.marginTop).toBe('10px');

		data.obj.color = 'black';
		expect(div.style.color).toBe('black');

		data.obj['margin-top'] = '15px';
		expect(div.style.marginTop).toBe('15px');

		// cover obj
		data.obj = {
			'border': '1px solid red',
			'font-size': '15px'
		}
		// should remove old style
		expect(div.style.color).toBe('');
		expect(div.style.marginTop).toBe('');
		// should add new style
		expect(div.style.border).toBe('1px solid red');
		expect(div.style.fontSize).toBe('15px');

		data.obj['font-size'] = '24px';
		expect(div.style.fontSize).toBe('24px');
	});


	it('style json', function() {
		element.innerHTML = '<div v-bind:style="{color: color, \'font-size\': size}"></div>';

		var vm = new MVVM(element, {
			'color': 'red',
			'size': '12px'
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(div.style.color).toBe('red');
		expect(div.style.fontSize).toBe('12px');

		data.color = 'green';
		expect(div.style.color).toBe('green');

		data.size = '111px';
		expect(div.style.fontSize).toBe('111px');
	});


	it('attribute normal', function() {
		element.innerHTML = '<div v-bind:id="vid"></div>';

		var vm = new MVVM(element, {
			'vid': 'xxdk'
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');

		data.vid = 'txgc';
		expect(dom.getAttr(div, 'id')).toBe('txgc');
	});


	it('attribute json', function() {
		element.innerHTML = '<div v-bind="{id: vid, \'data-type\': dtype}"></div>';

		var vm = new MVVM(element, {
			'vid': 'xxdk',
			'dtype': 'aaa'
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');
		expect(dom.getAttr(div, 'data-type')).toBe('aaa');

		data.vid = 'txgc';
		expect(dom.getAttr(div, 'id')).toBe('txgc');

		data.dtype = 'bbb';
		expect(dom.getAttr(div, 'data-type')).toBe('bbb');
	});


	it('attribute and classObject and styleObject', function() {
		element.innerHTML =
			'<div v-bind="{id: vid, class: clsObj, style: styObj}"></div>';

		var vm = new MVVM(element, {
			'vid': 'xxdk',
			'clsObj': {
				'classA': true,
				'classB': true
			},
			'styObj': {
				'color': 'red',
				'font-size': '13px'
			}
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');
		expect(div.className).toBe('classA classB');
		expect(div.style.color).toBe('red');
		expect(div.style.fontSize).toBe('13px');

		data.vid = 'txgc';
		expect(dom.getAttr(div, 'id')).toBe('txgc');

		data.styObj.color = 'green';
		expect(div.style.color).toBe('green');

		data.clsObj.classB = false;
		expect(div.className).toBe('classA');

		// cover
		data.styObj = {'margin-top': '15px'};
		expect(div.style.color).toBe('');
		expect(div.style.fontSize).toBe('');
		expect(div.style.marginTop).toBe('15px');

		data.styObj['margin-top'] = '50px';
		expect(div.style.marginTop).toBe('50px');

		data.clsObj = {'aaa': true, 'bbb': false};
		expect(div.className).toBe('aaa');

		data.clsObj.bbb = true;
		expect(div.className).toBe('aaa bbb');
	});


	it('attribute and classArray', function() {
		element.innerHTML = '<div v-bind="{id: vid, class: [cls1, cls2]}"></div>';

		var vm = new MVVM(element, {
			'vid': 'xxdk',
			'cls1': 'aaa',
			'cls2': 'bbb'
		});
		var data = vm.get();
		var div = element.childNodes[0];

		expect(dom.getAttr(div, 'id')).toBe('xxdk');
		expect(div.className).toBe('aaa bbb');

		data.cls1 = 'xxdk';
		expect(equalClass(div.className, 'xxdk bbb')).toBe(true);

		data.cls2 = '';
		expect(div.className).toBe('xxdk');
	});
});
/*------------------------------*/
});