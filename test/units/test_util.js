/**
 * manual trigger an element a specify Event
 * @param   {Element}   target
 * @param   {String}    evt
 * @param   {Function}  process
 */
export function triggerEvent (target, evt, process) {
	let e = document.createEvent('HTMLEvents');
	e.initEvent(evt, true, true);

	if (process) {
		process(e);
	}

	target.dispatchEvent(e);
}

/**
 * set <select> value
 * @param  {Select}  select
 * @param  {String}  value
 */
export function setSelect (select, value) {
	let options = select.options;
	for (let i = 0; i < options.length; i++) {
		/* jshint ignore:start */
		if (options[i].value == value) {
			options[i].selected = true;
		}
		/* jshint ignore:end */
	}
}

/**
 * compare two class string is equal
 * @param   {String}  classString
 * @param   {String}  stringClass
 * @return  {Boolean}
 */
export function equalClass (classString, stringClass) {
	let fronts = classString.split(' ');
	let backs = stringClass.split(' ');

	if (fronts.length !== backs.length) {
		return false;
	}

	for (let i = 0; i < fronts.length; i++) {
		if (backs.indexOf(fronts[i]) === -1) {
			return false;
		}
	}

	return true;
}
