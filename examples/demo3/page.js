/**
 * demo3的page页面主模块
 */

define(['page'], function() {
	var sugar = require('../../sugar');
	var $ = sugar.jquery;

	/**
	 * 定义页面模块
	 */
	return sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'class'   : 'demo3',
				// 模板文件uri，通过ajax拉取，不限文件后缀
				'template': 'page.tpl',
				// MVVM数据模型定义，详细API请参考：http://cn.vuejs.org/api/#指令
				'model'   : {
					// 双向数据message
					'message': 'Vue.js是一款比较易上手的视图层mvvm库，在sugar.js中是一把开发利刃~',
					// nba球队数据数组
					'nba'    : [],
					// 赛季奖项radio切换
					'award'  : 'mvp'
				}
			});
			this.Super('init', arguments);
		},

		viewReady: function() {
			// 添加nba球队数据
			var teams = [
				{'range': 1, 'name' : '勇士', 'score': 115.7, 'lost' : 97.4, 'diff' : 18.3, 'recent': '10胜0负', 'record': '70-12'},
				{'range': 2, 'name' : '雷霆', 'score': 103.8, 'lost' : 99, 'diff' : 4.8, 'recent': '7胜3负', 'record': '60-22'},
				{'range': 3, 'name' : '马刺', 'score': 101.7, 'lost' : 92.3, 'diff' : 9.4, 'recent': '8胜2负', 'record': '58-24'},
				{'range': 4, 'name' : '快船', 'score': 107.3, 'lost' : 103, 'diff' : 4.3, 'recent': '4胜6负', 'record': '57-25'},
				{'range': 5, 'name' : '火箭', 'score': 102.9, 'lost' : 108.6, 'diff' : -5.7, 'recent': '3胜7负', 'record': '50-32'}
			];

			// 渲染数据
			this.vm.set('nba', teams);
		}
	});
});