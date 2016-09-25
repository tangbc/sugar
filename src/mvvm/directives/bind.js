import Parser, { linkParser } from '../parser';
import { setAttr, addClass, removeClass } from '../../dom';
import { each, isString, isArray, isObject, isEmptyObject, warn } from '../../util';

/**
 * 返回 contrastObject 相对于 referObject 的差异对象
 * @param   {Object}  contrastObject  [对比对象]
 * @param   {Object}  referObject     [参照对象]
 * @return  {Object}
 */
function getUniqueObject (contrastObject, referObject) {
	var unique = {};

	each(contrastObject, function (value, key) {
		var _diff, oldItem = referObject[key];

		if (isObject(value)) {
			_diff = getUniqueObject(value, oldItem);
			if (!isEmptyObject(_diff)) {
				unique[key] = _diff;
			}
		} else if (isArray(value)) {
			var newArray = [];

			each(value, function (nItem, index) {
				var _diff;

				if (isObject(nItem)) {
					_diff = getUniqueObject(nItem, oldItem[index]);
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
 * 返回 contrastArray 相对于 referArray 的差异数组
 * @param   {Array}  contrastArray  [对比数组]
 * @param   {Array}  referArray     [参照数组]
 * @return  {Array}
 */
function getUniqueArray (contrastArray, referArray) {
	var uniques = [];

	if (!isArray(contrastArray) || !isArray(referArray)) {
		return contrastArray;
	}

	each(contrastArray, function (item) {
		if (referArray.indexOf(item) < 0) {
			uniques.push(item);
		}
	});

	return uniques;
}

/**
 * 返回两个比较值的差异
 * 获取绑定 object 和 array 的更新差异
 * @param   {Object|Array}  newTarget
 * @param   {Object|Array}  oldTarget
 * @return  {Object}
 */
function diff (newTarget, oldTarget) {
	var isA = isArray(newTarget) && isArray(oldTarget);
	var isO = isObject(newTarget) && isObject(oldTarget);
	var handler = isO ? getUniqueObject : (isA ? getUniqueArray : null);

	var after = handler && handler(newTarget, oldTarget) || newTarget;
	var before = handler && handler(oldTarget, newTarget) || oldTarget;

	return { after, before };
}

/**
 * 处理 styleObject, 批量更新元素 style
 * @param   {Element}  element
 * @param   {String}   styleObject
 */
function updateStyle (element, styleObject) {
	var style = element.style;

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
 * @param   {Element}  element
 * @param   {String}   className
 * @param   {Boolean}  remove
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
 * @param   {Element}  element
 * @param   {Mix}      classValue
 * @param   {Boolean}  remove
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

var vbind = linkParser(VBind);

/**
 * 解析 v-bind 指令
 */
vbind.parse = function () {
	this.desc.deep = true;
	this.bind();
}

/**
 * 视图更新
 * @param   {Mix}  newValue
 * @param   {Mix}  oldValue
 */
vbind.update = function (newValue, oldValue) {
	var type = this.desc.args;
	if (type) {
		this.single(type, newValue, oldValue);
	} else {
		this.multi(newValue, oldValue);
	}
}

/**
 * 解析单个 attribute
 * @param   {String}  type
 * @param   {Mix}     newValue
 * @param   {Mix}     oldValue
 */
vbind.single = function (type, newValue, oldValue) {
	switch (type) {
		case 'class':
			this.handleClass(newValue, oldValue);
			break;
		case 'style':
			this.handleStyle(newValue, oldValue);
			break;
		default:
			this.handleAttr(type, newValue);

	}
}

/**
 * 解析 attribute, class, style 组合
 * @param   {Object}  newJson
 * @param   {Object}  oldJson
 */
vbind.multi = function (newJson, oldJson) {
	if (oldJson) {
		let { after, before } = diff(newJson, oldJson);
		this.batch(after, before);
	}

	this.batch(newJson);
}

/**
 * 绑定属性批处理
 * @param   {Object}  newObj
 * @param   {Object}  oldObj
 */
vbind.batch = function (newObj, oldObj) {
	each(newObj, function (value, key) {
		this.single(key, value, oldObj && oldObj[key]);
	}, this);
}

/**
 * 更新处理 className
 * @param   {Mix}  newClass
 * @param   {Mix}  oldClass
 */
vbind.handleClass = function (newClass, oldClass) {
	var el = this.el;

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
 * @param   {Mix}  newStyle
 * @param   {Mix}  oldStyle
 */
vbind.handleStyle = function (newStyle, oldStyle) {
	var el = this.el;

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
 * @param   {String}   attr
 * @param   {String}   value
 */
vbind.handleAttr = function (attr, value) {
	setAttr(this.el, attr, value);
}
