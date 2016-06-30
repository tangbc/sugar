# sugar

[![Travis CI Status](https://travis-ci.org/tangbc/sugar.svg?branch=master)](https://travis-ci.org/tangbc/sugar)
[![codecov](https://codecov.io/gh/tangbc/sugar/branch/master/graph/badge.svg)](https://codecov.io/gh/tangbc/sugar)


# 1. Intro

* Easy way to develop Web Components with `Sugar.js`, support template layout and MVVM

* `Sugar.js` consists of two independent parts: **`sugar`** (Component system) and **`mvvm`** (DataBinding + ViewRefresh)


# 2. Diagram

<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor-en" width="666">


# 3. Directory

* `test/` Test files directory

* `build/` Webpack config files

* `demos/` Some complete examples developed by sugar.js

* `dist/` Packaged sugar.js and mvvm.js, as well as their compressed files

* `src/` Source code files directory:

	* `src/main/` Component system module directory, all of the module files in this directory are eventually serving for component.js (component basic definition module). Components can be included each other, nested and message communication. See more Api: [sugar api](http://tangbc.github.io/sugar/sugar.html)

	* **`src/mvvm/`** A lightweight mvvm library, command system support v-text, v-model, v-bind, v-on, v-for and so on. **mvvm does not have any dependence on sugar, it can be used independently**. See more Api: [mvvm api](http://tangbc.github.io/sugar/mvvm.html)


# 4. Demos

There are some examples of the **`demos/`** directory, you can also preview the demos on the github.io

* [Star rating](http://tangbc.github.io/sugar/demos/star)
* [Simple datePicker](http://tangbc.github.io/sugar/demos/date)
* [tangbc.github.io/sugar](http://tangbc.github.io/sugar)
* [Simple TodoMVC](http://tangbc.github.io/sugar/demos/todoMVC)

You can edit and preview a Radio-Component at [jsfiddle](https://jsfiddle.net/tangbc/may7jzb4/6/)


# 5. Usage

* `sugar.js` and `mvvm.js` both support `cmd` `amd` and browser `script` tag
	* `sugar (about 40 kb)` http://tangbc.github.io/sugar/dist/sugar.min.js
	* `mvvm (about 32 kb)` http://tangbc.github.io/sugar/dist/mvvm.min.js

* Browser support: do not support IE8 and belove (used many ES5 characteristics)


# 6. ChangeLog

* `v1.0`
	* `sugar` basic component system
	* `mvvm` support basic model instruction (static expression)
* `v1.0.2`
	* `mvvm` support dynamic instruction expressions: `<div v-text="isError ? err_msg : suc_msg"></div>`
* `v1.0.4`
	* `mvvm` process splice action in v-for array operation
* `v1.0.6`
	* `mvvm` fixes many issues, add instruction expressions that depend on extracting and updating view's stability
* `v1.0.8`
	* `mvvm` update v-bind for object/json can be used with a simple diff algorithm
* `v1.1.0`
	* abandon requirejs (v1.0.8) and change test-runner to [Karma](https://github.com/karma-runner/karma)，add code coverage


# 7. Contribution

1. Clone to local **`git clone https://github.com/tangbc/sugar.git`**

2. Install Nodejs packages：**`npm install`**

3. Debug for `sugar` ：**`npm run dev-sugar`**

4. Debug for `mvvm` ：**`npm run dev-mvvm`**

5. Uint test：**`npm run test`**

6. Generate the code coverage report：**`npm run cover`**

7. Pack and uglify source code：**`npm run pack`**
