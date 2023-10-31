<p>
	<a href="https://travis-ci.org/tangbc/sugar">
		<img src="https://travis-ci.org/tangbc/sugar.svg?branch=master" alt="Travis CI Status"/>
	</a>
	<a href="https://codecov.io/gh/tangbc/sugar">
		<img src="https://codecov.io/gh/tangbc/sugar/branch/master/graph/badge.svg" alt="Code Coverage"/>
	</a>
	<br>
	<img src="https://tangbc.github.io/github-images/browser-matrix.svg" alt="Sauce Browser Matrix"/>
</p>


## sugar

> A lightweight and powerful JavaScript MVVM library for building easy web UI.

Simple api and without any dependence. Consists of two independent libraries:
* **`mvvm.js`** *A simple ViewModel library* , ***it can be used independently***.
* **`sugar.js`** *Component system + mvvm.js , for building flexible web components*.


## Diagram

<img src="https://tangbc.github.io/github-images/sugar-diagram-en.png" width="600">


## HelloWorld

### mvvm.js
```html
<html>
<body>
	<div id="app">
		<h1>{{ title }}</h1>
	</div>

	<script src="https://tangbc.github.io/sugar/dist/mvvm.js"></script>
	<script>
	var vm = new MVVM({
		view: document.getElementById('app'),
		model: {
			title: 'Hello world!'
		}
	})

	// Model drive View:
	vm.$data.title = 'Change title!';
	</script>
</body>
</html>
```
More MVVM directives are supported, see all at [documentation](https://github.com/tangbc/sugar/wiki/MVVM).

### sugar.js
```html
<html>
<body>
	<div id="app">
		<h1>{{ title }}</h1>
	</div>

	<script src="https://tangbc.github.io/sugar/dist/sugar.js"></script>
	<script>
	// define HelloWorld component:
	var HelloWorld = Sugar.Component.extend({
		init: function (config) {
			this.Super('init', config, {
				target: '#app',
				model: {
					title: 'Hello world!'
				}
			});
		},
		// Hook of after view was rendered.
		afterRender: function () {
			// Model drive View:
			this.vm.$data.title = 'Change title!';
		}
	});

	// create component instance:
	var app = Sugar.core.create('hello-world', HelloWord);
	</script>
</body>
</html>
```
SubComponent, component nesting and message system see [documentaion](https://github.com/tangbc/sugar/wiki).


## Demos

There are several complete and amusing demos in **`demos/`** folder make you know more about `sugar.js`, check it out and preview them in the following links:

* [StarRating](https://tangbc.github.io/sugar/demos/starRating)
* [DatePicker](https://tangbc.github.io/sugar/demos/datePicker)
* [TodoMVC](https://tangbc.github.io/sugar/demos/todoMVC)
* [Snake eat apple game](https://tangbc.github.io/snake-eat-bugs/)

> *i. Sometimes Github-page link disconnected by `Enforce HTTPS`, please use `https` protocol instead.*

> *ii. Some demos need httpSever (Ajax), so run script `npm run server` to preview them if in your local.*

You can also experience `sugar.js` online with a ***RadioComponent*** at [jsfiddle](https://jsfiddle.net/tangbc/may7jzb4/9/).


## Usage

* Both support [`UMD`](https://github.com/umdjs/umd) (Universal Module Definition)
	* `mvvm.js (just 28 kb)` https://tangbc.github.io/sugar/dist/mvvm.min.js
	* `sugar.js (just 35 kb)` https://tangbc.github.io/sugar/dist/sugar.min.js

* Browsers: **Not support IE8 and below**. Besides, support most modern desktop and mobile browsers.


## Documentation

[Get start and check documentation on Wiki.](https://github.com/tangbc/sugar/wiki)


## Directories

* **`build/`** Development, production and test configurations.

* **`demos/`** Several complete examples/demos developed by `sugar.js`.

* **`dist/`** Product files of `sugar.js` and `mvvm.js`, and their compressed.

* **`src/`** Source code module files:

	* `src/main/`<sup>20%</sup> A simple component system. [API & Doc](https://github.com/tangbc/sugar/wiki/API)

	* **`src/mvvm/`**<sup>80%</sup> A powerful and easy-using MVVM library. [API & Doc](https://github.com/tangbc/sugar/wiki/MVVM)

* **`test/`** Unit test specs writing by karma + jasmine.


## Contribution

*Welcome any pull request of fixbug or improvement, even only supplement some unit test specs.*

1. Fork and clone repository to your local.

2. Install NodeJS package devtools: **`npm install`**.

3. Develop and debug: **`npm run dev`** *(generate sourcemap files in `bundle/`)*.

4. Add and write test spec, *(in `test/units/specs/`)* then run uint test：**`npm run test`**.

5. Generate the test coverage report and jshint checking up: **`npm run build`**.


## ChangeLogs

[Check details from releases](https://github.com/tangbc/sugar/releases)


## License

[MIT License](https://github.com/tangbc/sugar/blob/master/LICENSE)
