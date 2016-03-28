
# 1. 简单介绍
sugar是一个用于创建可继承、可复用和可拓展前端模块&组件的轻量级javascript框架。简单优雅的模块化开发方式，支持模板和mvvm，让代码更专心于处理业务逻辑而不是繁琐的操作界面（DOM）


# 2. 项目结构
* `src/` 目录为sugar全部的组成模块

	* `src/main/` 为sugar的核心模块目录，该目录下所有的模块文件都最终服务于container.js（视图容器类），模块之间可以相互创建和消息通信，详细API参见: [sugar.README.md]

	* `src/mvvm/` 为一个简单的视图层mvvm库，通过数据绑定+视图刷新来实现，支持v-text, v-model, v-bind, v-on和v-for等几个常用的指令，mvvm与sugar没有任何依赖和耦合，可独立使用，详细指令参见: [mvvm.README.md]

* `dist/` 目录存放打包好的sugar.js和mvvm.js以及各自的压缩版本

* `build/` 打包配置文件目录，打包工具为webpack

* `test/` 为测试文件目录，暂无unit，都是肉测

* `demos` 用sugar.js做的几个完整例子


# 3. 简单使用

```javascript
var sugar = require('sugar');

/*
 * 定义Page模块，从sugar.Container(约定了视图模块基础功能和API)继承
 * Page相当于获得了一个独立的视图，展现形式、数据和逻辑行为都可灵活自定义
 */
var Page = sugar.Container.extend({
	init: function(config) {
		// 在config里定义模块的初始状态和数据：
		config = this.cover(config, {
			'html': '<h1>{{title}}</h1>',
			'model': {
				'title': 'hello sugar~'
			}
		});
		// 调用父类(sugar.Container)的init方法并传入配置进行渲染
		this.Super('init', arguments);
	},
	viewReady: {
		// 当视图渲染完毕之后立即调用自身的viewReady方法
	}
});

/*
 * 再将定义好的Page模块生成实例mod并添加到页面
 * mod是Page的一个实例(拥有Page的所有属性和方法)
 * 一个Page模块可生成N个实例，可以近似地认为：mod = new Page();
 */
var mod = sugar.core.create('pageName', Page, {
	'target': document.querySelector('body')
});
```


# 4. 适用环境
* 引用方式：cmd、amd以及script标签

* 浏览器支持：不支持低版本IE（因为用了Object.defineProperty和Function.bind等属性）


# 5、改进&建议
由于水平有限，必然存在很多不足之处，欢迎各种文明吐槽、意见、提bug和issues！


# 6、最后
推荐一首适合边写代码边听的英文歌：<a href="http://music.163.com/#/song?id=29019227" target="_blank">Suagr - Maroon 5</a>