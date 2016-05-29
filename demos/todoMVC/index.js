window.onload = function buildTodoMVC() {
	// todos 本地存储
	var Storage = {
		save: function(todos) {
			localStorage.setItem('TODOS', JSON.stringify(todos));
		},
		getAll: function() {
			return JSON.parse(localStorage.getItem('TODOS') || '[]');
		}
	}

	// 数据过滤器
	var Filter = {
		all: function(todos) {
			return todos;
		},
		active: function(todos) {
			return todos.filter(function(todo) {
				return !todo.completed;
			});
		},
		completed: function(todos) {
			return todos.filter(function(todo) {
				return todo.completed;
			});
		}
	}

	// 定义 TodoMVC 组件
	var TodoMVC = Sugar.Component.extend({
		init: function(config) {
			var todos = Storage.getAll();
			var actives = Filter.active(todos);
			var completeds = Filter.completed(todos);

			config = this.cover(config, {
				'target'  : document.querySelector('#todoMVC'),
				'template': 'todomvc.html',
				'model'   : {
					'checkAll' : !!todos.length && todos.length === completeds.length,
					'todo'     : '',
					'left'     : actives.length,
					'type'     : 'all',
					'showClear': completeds.length > 0,
					'todos'    : [],
					'allTodos' : todos,
					// 事件回调
					'keyupEnter' : this.keyupEnter,
					'clickRemove': this.removeItem,
					'clickFilter': this.clickFilter
				}
			});
			this.Super('init', arguments);
		},

		// 视图渲染完毕
		viewReady: function() {
			this.updateList();
			// 监测 checkAll 的变更
			this.vm.watch('checkAll', this.onCheckAll);
			// 监测 todos 的变更
			this.vm.watch('todos', this.onChangeTodos, true);
		},

		// 点击全选 or 全不选
		onCheckAll: function(paths, last) {
			var todos = this.vm.get('todos');

			if (this.$autoCheck) {
				return;
			}

			todos.forEach(function(item) {
				item.completed = last;
			});

			this.update();
		},

		// todos 变化
		onChangeTodos: function(path, last) {
			if (!Array.isArray(last)) {
				this.update();
			}
		},

		// 保存数据至缓存中
		saveTodos: function(todos) {
			Storage.save(todos);
			return this;
		},

		// 更新缓存和界面
		update: function() {
			var vm = this.vm.get();
			vm.left = Filter.active(vm.allTodos).length;
			vm.showClear = Filter.completed(vm.allTodos).length > 0;
			this.saveTodos(vm.allTodos).updateList().updateCheckAll();
		},

		// 更新 checkAll 状态
		updateCheckAll: function() {
			var vm = this.vm.get();
			var alls = Filter.all(vm.todos).length;
			this.$autoCheck = true;
			vm.checkAll = !!alls && alls === Filter.completed(vm.todos).length;
			this.$autoCheck = false;
		},

		// 按下 enter 键
		keyupEnter: function() {
			var vm = this.vm.get();
			var todo = vm.todo;

			if (!todo) {
				return;
			}

			vm.todo = '';
			vm.allTodos.push({'text': todo, 'completed': false});
			this.update();
		},

		// 移除一条 todo
		removeItem: function(e) {
			var vm = this.vm.get();
			var index = +this.$.getAttr(e.target, 'data-index');
			vm.allTodos.splice(vm.allTodos.indexOf(vm.todos[index]), 1);
			this.update();
		},

		// 点击过滤器
		clickFilter: function(type) {
			this.updateList(type).updateCheckAll();
		},

		// 更新列表数据
		updateList: function(type) {
			var filters, vm = this.vm.get();

			type = type || vm.type;

			if (type === 'clear') {
				vm.showClear = false;
				filters = Filter.active(vm.allTodos);
				this.saveTodos(filters);
				this.vm.set({
					'type'    : 'all',
					'allTodos': filters
				});
			}
			else {
				vm.type = type;
				filters = Filter[type](vm.allTodos);
			}

			this.vm.set('todos', filters);

			return this;
		}
	});

	// 创建组件实例
	Sugar.core.create('todoMVC', TodoMVC);
}