(function (app, Controller) {
	/**
	 * router control for todoMVC
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
	 * handle for undefined router
	 */
	controller.configure({
		'notfound': function notfound () {
			window.location.hash = '';
			app.vm.set('type', routers[0]);
		}
	});

	// start for control
	controller.init();

})(todoMVC, Router);