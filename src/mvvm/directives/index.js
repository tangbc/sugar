import { VOn as von } from './on';
import { VEl as vel } from './el';
import { VIf as vif } from './if';
import { VFor as vfor } from './for';
import { VText as vtext } from './text';
import { VHtml as vhtml } from './html';
import { VShow as vshow } from './show';
import { VBind as vbind } from './bind';
import { VModel as vmodel } from './model';
import { VCustom as vcustom } from './custom';

/**
 * 导出指令解析模块
 * @type {Object}
 */
export const DirectiveParsers = {
	von,
	vel,
	vif,
	vfor,
	vtext,
	vhtml,
	vshow,
	vbind,
	vmodel,
	vcustom
};
