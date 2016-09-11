// util methods for test case
module.exports = {
	/**
	 * manual trigger an element a specify Event
	 * @param   {Element}   target
	 * @param   {String}    evt
	 * @param   {Function}  process
	 */
	triggerEvent: function (target, evt, process) {
		var e = document.createEvent('HTMLEvents');
		e.initEvent(evt, true, true);

		if (process) {
			process(e);
		}

		target.dispatchEvent(e);
	},

	/**
	 * set <select> value
	 * @param  {Select}  select
	 * @param  {String}  value
	 */
	setSelect: function (select, value) {
		var options = select.options;
		for (var i = 0; i < options.length; i++) {
			if (options[i].value == value) {
				options[i].selected = true;
			}
		}
	}
}
