/**
 * manual trigger an element a specify Event
 * @param   {Element}   target
 * @param   {String}    evt
 * @param   {Function}  process
 */
export function triggerEvent (target, evt, process) {
	var e = document.createEvent('HTMLEvents');
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
	var options = select.options;
	for (var i = 0; i < options.length; i++) {
		/* jshint ignore:start */
		if (options[i].value == value) {
			options[i].selected = true;
		}
		/* jshint ignore:end */
	}
}
