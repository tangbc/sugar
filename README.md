# sugar
一个用于开发前端模块化 UI 组件的轻量级 JavaScript 框架 ( mvvm & template )


# 介绍

* 简单的模块化组件开发方式；视图组件自带模板功能(支持异步请求)和 mvvm 模式

* 框架分为两个独立的部分：**`sugar`** (实现组件系统) 和 **`mvvm`** (实现数据绑定 + 视图刷新)

# 框架组成
<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor" width="666">


# 项目结构
* `test/` 测试文件目录

* `build/` webpack 打包配置文件目录

* `demos/` 用 sugar.js 做的一些完整例子

* `dist/` 打包好的 sugar.js 和 mvvm.js 以及各自的压缩版本

* `src/` 源代码文件目录：

	* `src/main/` 为 sugar 的组件系统模块目录，该目录下所有的模块文件都最终服务于 component.js (视图组件基础模块)，组件之间可以相互调用、嵌套和消息通信，详细参见: [sugar api](http://tangbc.github.io/sugar/sugar.html)

	* **`src/mvvm/`** 为一个简单 mvvm 库，指令系统支持 v-text, v-model, v-bind, v-on 和 v-for 等，**mvvm 对于 sugar 没有任何依赖，可独立使用**。详细指令参见: [mvvm api](http://tangbc.github.io/sugar/mvvm.html)


# 举个栗子

```javascript
var sugar = require('dist/sugar.min');

/*
 * 定义 Page 组件，从 sugar.Component (约定了视图组件基础功能和 API) 继承.
 * Page 相当于获得了一个独立的视图，展现形式、数据和逻辑行为都可灵活自定义
 */
var Page = sugar.Component.extend({
	init: function(config) {
		// 在 config 里定义组件的初始状态和数据：
		config = this.cover(config, {
			'html' : '<h1 v-text="title"></h1>',
			// 也可指定视图的模板，sugar 会用 ajax 请求模板地址
			// 'template': 'tpl/page.html',
			'model': {
				'title': 'hello sugar~'
			}
		});
		// 调用父类 (sugar.Component) 的 init 方法并传入配置进行视图的渲染
		this.Super('init', arguments);
	},
	// 当视图渲染完毕之后会立即调用自身的 viewReady 方法，可在这里开始业务逻辑
	viewReady: function () {
		this.vm.set('title', 'view has been rendered!');
	}
});

/*
 * 再将定义好的 Page 组件生成实例并添加到页面
 * comp1, comp2 都是 Page 的实例，一个组件可生成多个实例，可以近似地认为: comp = new Page();
 */
var comp1 = sugar.core.create('component1', Page, {
	'target': document.querySelector('#demo1')
});

var comp2 = sugar.core.create('component2', Page, {
	'target': document.querySelector('#demo2')
});
```


# 组件示例
**`demos/`**  目录做了些示例，也可在 github.io 上在线预览效果：

* [打星评分组件](http://tangbc.github.io/sugar/demos/star/)
* [简单的日期选择组件](http://tangbc.github.io/sugar/demos/date/)
* [tangbc.github.io/sugar](http://tangbc.github.io/sugar)


# 引用 & 环境
* 引用方式：`sugar.js` 和 `mvvm.js` 均支持 `cmd` `amd` 以及 `script` 标签引用
	* `sugar (约 41 kb)` http://tangbc.github.io/sugar/dist/sugar.min.js
	* `mvvm (约 31 kb)` http://tangbc.github.io/sugar/dist/mvvm.min.js

* 浏览器支持：不支持低版本 IE (用了 `Object.defineProperty` 和 `Function.bind` 等)


# 主要更新日志
* `v1.0`
	* `sugar` 基础的组件系统和模块化创建方式
	* `mvvm` 支持基础数据模型指令（静态表达式）
* `v1.0.2`
	* `mvvm` 支持动态指令表达式: `<p v-text="isError ? errorMsg : sucMsg"></p>`
* `v1.0.4`
	* `mvvm` 细节化 v-for 指令的 `splice` 操作
* `v1.2.0`
	* `mvvm` 修复多个问题，增加指令表达式依赖提取和更新视图的稳定性，功能相对稳定的一个版本
