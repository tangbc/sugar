(function (app, Controller) {
	/**
	 * Router control for todoMVC
	 * https://github.com/flatiron/director
	 */

	var controller = new Controller();
	var routers = ['all', 'active', 'completed'];

	routers.forEach(function (router) {
		controller.on(router, function () {
			app.vm.set('type', router);
		});
	});

	/**
	 * Handle for undefined router
	 */
	controller.configure({
		notfound: function () {
			window.location.hash = '';
			app.vm.set('type', routers[0]);
		}
	});

	// Start for control
	controller.init();

})(todoMVC, Router);
