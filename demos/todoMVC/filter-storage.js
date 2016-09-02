(function (exports) {
	/**
	 * Todos localStorage
	 * @type  {Object}
	 */
	var Storage = {
		save: function (todos) {
			localStorage.setItem('TODOS', JSON.stringify(todos));
		},
		getAll: function () {
			return JSON.parse(localStorage.getItem('TODOS') || '[]');
		}
	}

	exports.Storage = Storage;


	/**
	 * Data filter, change by router type
	 * @type  {Object}
	 */
	var Filter = {
		all: function (todos) {
			return todos;
		},
		active: function (todos) {
			return todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		completed: function (todos) {
			return todos.filter(function (todo) {
				return todo.completed;
			});
		}
	}

	exports.Filter = Filter;

})(window);
