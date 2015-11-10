<!-- demo3的布局模板文件 可以在模板中运用Vue指令来控制视图与数据 -->
<h1>demo3：利用模板和MVVM构建模块布局</h1>
<h3>轻量、易用、API简单的sugar.js适用于构建模块化和组件化的web应用。</h3>
<h3>
	其他3个例子：
	<a style="margin-left: 20px;" href="../demo1/">demo1</a>
	<a style="margin-left: 20px;" href="../demo2/">demo2</a>
	<a style="margin-left: 20px;" href="../demo4/">demo4</a>
</h3>
<hr/>
<!-- 示例1 -->
<dl>
	<dt>1、双向数据绑定：</dt>
	<dd>
		<p v-text="message"></p>
		<input class="msg" v-model="message">
	</dd>
</dl>
<!-- 示例2 -->
<dl>
	<dt>2、强大的repeat数组渲染：</dt>
	<dd>
		<table>
		<thead>
			<tr>
				<th>排名</th>
				<th>球队</th>
				<th>场均得分</th>
				<th>场均失分</th>
				<th>分差</th>
				<th>最近10场</th>
				<th>战绩</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="team in nba">
				<td v-text="team.range"></td>
				<td v-text="team.name"></td>
				<td v-text="team.score"></td>
				<td v-text="team.lost"></td>
				<td v-text="team.diff"></td>
				<td v-text="team.recent"></td>
				<td v-text="team.record"></td>
			</tr>
		</tbody>
	</table>
	</dd>
</dl>
<!-- 示例3 -->
<dl>
	<dt>3、极其方便的UI控制：</dt>
	<dd>
		<!-- 单选框 -->
		<div style="padding-top: 10px;">
			<label>
				<input type="radio" name="picked" value="mvp" v-model="award"> MVP
			</label>
			<label>
				<input type="radio" name="picked" value="mvdp" v-model="award"> 最佳防守球员
			</label>
			<label>
				<input type="radio" name="picked" value="score" v-model="award"> 得分王
			</label>
			<label>
				<input type="radio" name="picked" value="assist" v-model="award"> 助攻王
			</label>
			<label>
				<input type="radio" name="picked" value="steal" v-model="award"> 抢断王
			</label>
		</div>
		<!-- 切换内容区 -->
		<div>
			<h3 v-show="award=='mvp'">史提芬库里</h3>
			<h3 v-show="award=='mvdp'">卡哇伊伦纳德</h3>
			<h3 v-show="award=='score'">拉塞尔维斯布鲁克</h3>
			<h3 v-show="award=='assist'">约翰沃尔</h3>
			<h3 v-show="award=='steal'">克里斯保罗</h3>
		</div>
	</dd>
</dl>
<!-- 其他 -->
<dl>
	<dt>4、其他功能等等……</dt>
</dl>