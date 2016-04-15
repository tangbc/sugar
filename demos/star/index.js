require(['../../dist/sugar.min'], function(Sugar) {
	/**
	 * 打星评分基础模块
	 */
	var Star = Sugar.Container.extend({
		init: function(config) {
			// 初始数据的收集，config为实例创建时传进来的参数
			var def = config.def || 3, full = config.full || 5;

			var scores = this.$scores = 'fa-star-o|fa-star|fa-star-half-o'.split('|');
			var score, items = [], ceilDef = Math.ceil(def), isDecimal = def !== ceilDef;

			for (var i = 1; i < full + 1; i++) {
				score = i <= ceilDef ? (score = (i === ceilDef && isDecimal) ? scores[2] : scores[1]) : scores[0];
				items.push({'iconCls': score});
			}

			// 定义模块配置
			config = this.cover(config, {
				'class': 'moduleStar',
				'full' : full, // 满分星数
				'def'  : def,  // 默认星数
				'html' : [     // 渲染布局
					'<ul v-on:click="clickStar">',
						'<li v-for="star in stars">',
							'<i class="fa" v-bind="{\'class\': star.iconCls, \'data-index\': $index}"></i>',
						'</li>',
					'</ul>',
					'<h4 class="result">{{score}} 分</h4>'
				].join(''),
				'model': { // 定义MVVM数据模型
					'score'    : def,
					'stars'    : items,
					'clickStar': this.eventClickStar
				}
			});
			// 调用父类Sugar.Container的init方法进行视图渲染
			this.Super('init', arguments);
		},
		eventClickStar: function(e) {
			var el = e.target;

			if (el.tagName !== 'I') {
				return;
			}

			var i = +this.$.getAttr(el, 'data-index');
			var stars = this.vm.get('stars');
			var index = this.$scores.indexOf(stars[i].iconCls);
			var next = ++index % 3;

			stars[i].iconCls = this.$scores[next];
			this.vm.set('score', i + (next === 2 ? 0.5 : next));

			for (var j = 0; j < i; j++) {
				stars[j].iconCls = this.$scores[1];
			}
			for (var k = i + 1; k < stars.length; k++) {
				stars[k].iconCls = this.$scores[0];
			}
		}
	});


	// 创建五星模块实例，Star模块里有默认值，所以不需要配置full和def
	Sugar.core.create('fiveStars', Star, {
		'target': document.querySelector('#star-five')
	});


	// 创建十星模块实例，复用Star类，只需配置不同的参数即可生成独立的实例模块
	Sugar.core.create('tenStars', Star, {
		'target': document.querySelector('#star-ten'),
		'full'  : 10,
		'def'   : 6.5
	});
});