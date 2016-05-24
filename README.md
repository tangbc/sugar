# sugar
一个用于开发前端模块化 UI 组件的轻量级 JavaScript 框架 ( mvvm & template )


# 介绍

* 简单的模块化组件开发方式；视图组件自带模板功能(支持异步请求)和 mvvm 模式

* 框架分为两个独立的部分：**`sugar`** (实现组件系统) 和 **`mvvm`** (实现数据绑定 + 视图刷新)

# 框架组成
<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor" width="666">


# 举个栗子

这里以定义、创建一个简单可复用的 `radio` 组件为例：
```html
<div id="radio-box-phone"></div>
<hr/>
<div id="radio-box-job"></div>
```

```javascript
// 定义一个通用单选框组件，实现的功能：生成指定的 radio 数据
var RadioComponent = Sugar.Component.extend({
	// 初始化组件配置数据
	init: function(config) {
		config = this.cover(config, {
			// 组件布局，也可以通过 tempalte: xxx.html 来加载外部模板
			'html' : `
				<h2>Q: {{ title }}</h2>
				<h2>A: {{ selected }}</h2>
				<ul>
					<li v-for="item in items">
						<label>
							<input type="radio" v-bind:value="item.value"  v-model="selected">
							{{ item.value }}
						</label>
					</li>
				</ul>
			`,
			// MVVM 数据模型
			'model': {
      			'title'   : config.title,
				'items'   : config.items,
				'selected': config.selected
			}
		});
		this.Super('init', arguments);
	}
});

// 用 RadioComponent 生成一个 phoneQA 的组件实例
var phoneQA = Sugar.core.create('phone', RadioComponent, {
	'target'  : document.querySelector('#radio-box-phone'),
 	'title'   : 'What cell phone do you use ? ',
	'selected': 'iPhone',
	'items'   : [
		{'value': 'iPhone'},
		{'value': 'XiaoMi'},
		{'value': 'Meizux'},
		{'value': 'HuaWei'},
    	{'value': 'Others'}
	]
});
// 用 RadioComponent 生成一个 jobQA 的组件实例
var jobQA = Sugar.core.create('job', RadioComponent, {
	'target'  : document.querySelector('#radio-box-job'),
  	'title'   : 'What\'s your job ? ',
	'selected': 'Programmer',
	'items'   : [
		{'value': 'Doctor'},
		{'value': 'Programmer'},
		{'value': 'Teacher'},
		{'value': 'Student'},
    	{'value': 'Others'}
	]
});

```
最终生成的两个独立的 `radio` 视图组件实例：

<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-radio-example">

可在线修改本例的代码及预览 [jsfiddle](https://jsfiddle.net/tangbc/may7jzb4/6/)


# 项目结构
* `test/` 测试文件目录

* `build/` webpack 打包配置文件目录

* `demos/` 用 sugar.js 做的一些完整例子

* `dist/` 打包好的 sugar.js 和 mvvm.js 以及各自的压缩版本

* `src/` 源代码文件目录：

	* `src/main/` 为 sugar 的组件系统模块目录，该目录下所有的模块文件都最终服务于 component.js (视图组件基础模块)，组件之间可以相互调用、嵌套和消息通信，详细参见: [sugar api](http://tangbc.github.io/sugar/sugar.html)

	* **`src/mvvm/`** 为一个简单 mvvm 库，指令系统支持 v-text, v-model, v-bind, v-on 和 v-for 等，**mvvm 对于 sugar 没有任何依赖，可独立使用**。详细指令参见: [mvvm api](http://tangbc.github.io/sugar/mvvm.html)


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
* `v1.0.6`
	* `mvvm` 修复多个问题，增加指令表达式依赖提取和更新视图的稳定性，功能相对稳定的一个版本
* `v1.0.8`
	* `mvvm` v-bind 指令用于更新 object/json 时支持简单的 diff 差异对比
