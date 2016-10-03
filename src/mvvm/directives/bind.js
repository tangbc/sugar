import Parser, { linkParser } from '../parser';
import { setAttr, addClass, removeClass } from '../../dom';
import { each, isString, isArray, isObject, isEmptyObject, warn } from '../../util';

/**
 * 返回 contrast 相对于 refer 的差异对象
 * @param   {Object}  contrast  [对比对象]
 * @param   {Object}  refer     [参照对象]
 * @return  {Object}
 */
function getDiffObject (contrast, refer) {
	let unique = {};

	each(contrast, function (value, key) {
		let _diff, oldItem = refer[key];

		if (isObject(value)) {
			_diff = getDiffObject(value, oldItem);
			if (!isEmptyObject(_diff)) {
				unique[key] = _diff;
			}
		} else if (isArray(value)) {
			let newArray = [];

			each(value, function (nItem, index) {
				let _diff;

				if (isObject(nItem)) {
					_diff = getDiffObject(nItem, oldItem[index]);
					newArray.push(_diff);
				}
				else {
					// 新数组元素
					if (oldItem.indexOf(nItem) < 0) {
						newArray.push(nItem);
					}
				}
			});

			unique[key] = newArray;
		} else {
			if (value !== oldItem) {
				unique[key] = value;
			}
		}
	});

	return unique;
}

/**
 * 返回 contrast 相对于 refer 的差异数组
 * @param   {Array}  contrast  [对比数组]
 * @param   {Array}  refer     [参照数组]
 * @return  {Array}
 */
function getDiffArray (contrast, refer) {
	let uniques = [];

	if (!isArray(contrast) || !isArray(refer)) {
		return contrast;
	}

	each(contrast, function (item) {
		if (refer.indexOf(item) < 0) {
			uniques.push(item);
		}
	});

	return uniques;
}

/**
 * 返回两个比较值的差异
 * 获取绑定 object 和 array 的更新差异
 * @param   {Object|Array}  newVal
 * @param   {Object|Array}  oldVal
 * @return  {Object}
 */
function diff (newVal, oldVal) {
	let isA = isArray(newVal) && isArray(oldVal);
	let isO = isObject(newVal) && isObject(oldVal);
	let handler = isO ? getDiffObject : (isA ? getDiffArray : null);

	let after = handler && handler(newVal, oldVal) || newVal;
	let before = handler && handler(oldVal, newVal) || oldVal;

	return { after, before };
}

/**
 * 处理 styleObject, 批量更新元素 style
 * @param  {Element}  element
 * @param  {String}   styleObject
 */
function updateStyle (element, styleObject) {
	let style = element.style;

	if (!isObject(styleObject)) {
		return warn('v-bind for style must be a type of Object', styleObject);
	}

	each(styleObject, function (value, property) {
		if (style[property] !== value) {
			style[property] = value;
		}
	});
}

/**
 * 支持空格分割的 add/remove class
 * @param  {Element}  element
 * @param  {String}   className
 * @param  {Boolean}  remove
 */
function handleClass (element, className, remove) {
	each(className.split(' '), function (cls) {
		if (remove) {
			removeClass(element, cls);
		} else {
			addClass(element, cls);
		}
	});
}

/**
 * 根据绑定值更新元素的 className
 * @param  {Element}  element
 * @param  {Mix}      classValue
 * @param  {Boolean}  remove
 */
function updateClass (element, classValue, remove) {
	if (isString(classValue)) {
		handleClass(element, classValue, remove);
	} else if (isArray(classValue)) {
		each(classValue, function (cls) {
			handleClass(element, cls, remove);
		});
	} else if (isObject(classValue)) {
		each(classValue, function (add, cls) {
			handleClass(element, cls, remove || !add);
		});
	}
}


/**
 * v-bind 指令解析模块
 */
export function VBind () {
	Parser.apply(this, arguments);
}

let vbind = linkParser(VBind);

/**
 * 解析 v-bind 指令
 */
vbind.parse = function () {
	this.desc.deep = true;
	this.bind();
}

/**
 * 视图更新
 * @param  {Mix}  newValue
 * @param  {Mix}  oldValue
 */
vbind.update = function (newValue, oldValue) {
	let type = this.desc.args;
	if (type) {
		this.single(type, newValue, oldValue);
	} else {
		this.multi(newValue, oldValue);
	}
}

/**
 * 解析单个 attribute
 * @param  {String}  type
 * @param  {Mix}     newValue
 * @param  {Mix}     oldValue
 */
vbind.single = function (type, newValue, oldValue) {
	switch (type) {
		case 'class':
			this.processClass(newValue, oldValue);
			break;
		case 'style':
			this.processStyle(newValue, oldValue);
			break;
		default:
			this.processAttr(type, newValue);
	}
}

/**
 * 解析 attribute, class, style 组合
 * @param  {Object}  newObj
 * @param  {Object}  oldObj
 */
vbind.multi = function (newObj, oldObj) {
	if (oldObj) {
		let { after, before } = diff(newObj, oldObj);
		this.batch(after, before);
	}

	this.batch(newObj);
}

/**
 * 绑定属性批处理
 * @param  {Object}  newObj
 * @param  {Object}  oldObj
 */
vbind.batch = function (newObj, oldObj) {
	each(newObj, function (value, key) {
		this.single(key, value, oldObj && oldObj[key]);
	}, this);
}

/**
 * 更新处理 className
 * @param  {Mix}  newClass
 * @param  {Mix}  oldClass
 */
vbind.processClass = function (newClass, oldClass) {
	let el = this.el;

	// 数据更新
	if (oldClass) {
		let { after, before } = diff(newClass, oldClass);
		updateClass(el, before, true);
		updateClass(el, after);
	} else {
		updateClass(el, newClass);
	}
}

/**
 * 更新处理 style
 * @param  {Mix}  newStyle
 * @param  {Mix}  oldStyle
 */
vbind.processStyle = function (newStyle, oldStyle) {
	let el = this.el;

	// 数据更新
	if (oldStyle) {
		// 移除旧样式(设为 '')
		each(oldStyle, function (v, key) {
			oldStyle[key] = '';
		});

		updateStyle(el, oldStyle);
	}

	updateStyle(el, newStyle);
}

/**
 * 更新处理 attribute
 * @param  {String}   attr
 * @param  {String}   value
 */
vbind.processAttr = function (attr, value) {
	setAttr(this.el, attr, value);
}
