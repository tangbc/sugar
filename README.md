
# 1. 简单介绍
* sugar 是一个创建可继承、可复用和可拓展前端模块&组件的轻量级 javascript 框架

* 特点：简单优雅的模块化开发方式；自带模板功能和 mvvm

* 项目分为两个独立的部分：`sugar` (实现模块化) 和 `mvvm` (实现数据与视图同步)

# 2. 框架组成图
<img src="http://7xodrz.com1.z0.glb.clouddn.com/sugar-constructor-new" width="666">


# 3. 项目结构
* `demos/` 用 sugar.js 做的几个完整例子

* `test/` 为测试文件目录，暂无unit，都是肉测

* `build/` 打包配置文件目录，打包工具为 webpack

* `dist/` 存放打包好的 sugar.js 和 mvvm.js 以及各自的压缩版本

* `src/` 目录为 sugar 全部的组成模块：

	* `src/main/` 为 sugar 的核心模块目录，该目录下所有的模块文件都最终服务于 container.js (视图容器基础模块)，模块之间可以相互创建和消息通信，详细 API 参见: [README-sugar.md](https://github.com/tangbc/sugar/blob/master/README-sugar.md)

	* **`src/mvvm/`** 为一个简单的视图层 mvvm 库（其实只是个数据绑定+视图刷新的 ViewModel），支持 v-text, v-model, v-bind, v-on 和 v-for 等几个常用的指令，**mvvm 与 sugar 没有任何依赖和耦合，可独立使用**。详细指令参见: [README-mvvm.md](https://github.com/tangbc/sugar/blob/master/README-mvvm.md)


# 4. 举个栗子

```javascript
var sugar = require('dist/sugar.min');

/*
 * 定义 Page 模块，从 sugar.Container (约定了视图模块基础功能和 API)继承
 * Page 相当于获得了一个独立的视图，展现形式、数据和逻辑行为都可灵活自定义
 */
var Page = sugar.Container.extend({
	init: function(config) {
		// 在 config 里定义模块的初始状态和数据：
		config = this.cover(config, {
			'html': '<h1 v-text="title"></h1>',
			'model': {
				'title': 'hello sugar~'
			}
		});
		// 调用父类 (sugar.Container) 的 init 方法并传入配置进行渲染
		this.Super('init', arguments);
	},
	viewReady: {
		// 当视图渲染完毕之后立即调用自身的 viewReady 方法
	}
});

/*
 * 再将定义好的 Page 模块生成实例 mod 并添加到页面
 * mod 是 Page 的一个实例(拥有 Page 的所有属性和方法)
 * 一个 Page 模块可生成 N 个实例，可以近似地认为: mod = new Page();
 */
var mod = sugar.core.create('pageName', Page, {
	'target': document.querySelector('body')
});
```


# 5. 适用环境
* 引用方式：cmd, amd 以及 script 标签

* 浏览器支持：不支持低版本 IE (用了 Object.defineProperty, Function.bind 等)


# 6. 改进&建议
水平有限，必然存在很多不足之处，欢迎各种文明吐槽、意见、 issues 和 pull request ！


# 7. 最后
推荐一首适合边写代码边听的英文歌：<a href="http://music.163.com/#/song?id=29019227" target="_blank">Suagr - Maroon 5</a>