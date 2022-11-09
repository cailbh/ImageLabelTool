export default class LabelImage {
	entityCo: any;
	cWidth: number;
	cHeight: number;
	// 缩略图宽度
	sWidth: number;
	// 缩略图高度
	sHeight: number;
	// 图片宽度
	iWidth: number;
	// 图片高度
	iHeight: number;
	// 图片拖拽至边缘最小显示
	appearSize: number;
	// 缩放布进
	scaleStep: number;
	// 最小缩放比例
	minScale: number;
	// 最大缩放比例
	maxScale: number;
	// 图片在画板中的横坐标
	x: number;
	// 图片在画板中的纵坐标
	y: number;
	// 鼠标当前画板中的横坐标
	mouseX: number;
	// 鼠标当前画板中的纵坐标
	mouseY: number;
	// 拖动过程中，鼠标前一次移动的横坐标
	prevX: number;
	// 拖动过程中，鼠标前一次移动的纵坐标
	prevY: number;
	// 创建新标签输入名字
	inputs: string;
	// 鼠标移动过程中坐标
	moveP: any;
	// 拖动时，曲线圆点类型
	curveCircleType: string;
	// 拖动时，曲线下标
	curveIndex: number;
	// 缩放比例
	scale: number;
	// 鼠标在图片中的横坐标
	ix: number;
	// 鼠标在图片中的纵坐标
	iy: number;
	// 矩形框起点横坐标
	rectX: number;
	// 矩形框起点纵坐标
	rectY: number;
	// 曲线终点点横坐标
	endX: number;
	// 曲线终点纵坐标
	endY: number;
	// 关系起点id
	sourceID: string;
	// 关系起点id
	sourceIndex: string;
	// 关系终点id
	targetIndex: number;
	// 绘制多边形的圆点半径
	radius: number;

	// 绘制线段宽度
	lineWidth: number;

	//绘制区域模块透明度
	opacity: number;

	// 定时器
	timer: any;

	// 结果是否被修改
	isModify: boolean;

	// 是否全屏
	isFullScreen: boolean;

	// 是否移动图像标注圆点
	isDragCircle: boolean;

	// 当前点击圆点index
	snapCircleIndex: number;

	// 用于在拖拽或者缩放时，让绘制至存储面板的数据，只绘制一次
	drawFlag: boolean;

	// 监听滚动条缩放是否结束的定时器
	mousewheelTimer: any;

	// 历史记录下标
	historyIndex: number;
	Arrays: any;
	Nodes: any;
	Features: any;
	constructor(options) {
		// 画布宽度
		this.cWidth = 0;
		// 画布高度
		this.cHeight = 0;
		// 缩略图宽度
		this.sWidth = 0;
		// 缩略图高度
		this.sHeight = 0;
		// 图片宽度
		this.iWidth = 0;
		// 图片高度
		this.iHeight = 0;
		// 图片拖拽至边缘最小显示
		this.appearSize = 180;
		// 缩放布进
		this.scaleStep = 0.02;
		// 最小缩放比例
		this.minScale = 0.02;
		// 最大缩放比例
		this.maxScale = 8;
		// 图片在画板中的横坐标
		this.x = 0;
		// 图片在画板中的纵坐标
		this.y = 0;
		// 鼠标当前画板中的横坐标
		this.mouseX = 0;
		// 鼠标当前画板中的纵坐标
		this.mouseY = 0;
		// 拖动过程中，鼠标前一次移动的横坐标
		this.prevX = 0;
		// 拖动过程中，鼠标前一次移动的纵坐标
		this.prevY = 0;
		// 创建新标签输入名字
		this.inputs = "";
		// 拖动时，曲线圆点类型
		this.curveCircleType = '';
		// 拖动时，曲线下标
		this.curveIndex = -1;
		// 缩放比例
		this.scale = 0;
		// 鼠标在图片中的横坐标
		this.ix = 0;
		// 鼠标在图片中的纵坐标
		this.iy = 0;
		// 矩形框起点横坐标
		this.rectX = 0;
		// 矩形框起点纵坐标
		this.rectY = 0;
		// 曲线终点点横坐标
		this.endX = 0;
		// 曲线终点纵坐标
		this.endY = 0;

		this.moveP = [];

		// 关系起点下标
		this.sourceID = "0";
		this.sourceIndex = "0";
		this.targetIndex = -1;
		// 绘制多边形的圆点半径
		this.radius = 6;

		// 绘制线段宽度
		this.lineWidth = 1;

		//绘制区域模块透明度
		this.opacity = 0.45;

		// 定时器
		this.timer = null;

		// 结果是否被修改
		this.isModify = false;

		// 是否全屏
		this.isFullScreen = false;

		// 是否移动图像标注圆点
		this.isDragCircle = false;

		// 当前点击圆点index
		this.snapCircleIndex = 0;

		// 用于在拖拽或者缩放时，让绘制至存储面板的数据，只绘制一次
		this.drawFlag = true;

		// 监听滚动条缩放是否结束的定时器
		this.mousewheelTimer = null;

		// 历史记录下标
		this.historyIndex = 0;

		this.Arrays = {

			// 标定历史保存标签记录
			history: [],

			// 图片标注展示数据集
			imageAnnotateShower: [],

			// 图片标注存储数据集
			imageAnnotateMemory: [],

			// 关系标注展示数据集
			relationshipAnnotateShower: [],

			// 关系标注存储数据集
			relationshipAnnotateMemory: [],

			// 标注集操作 result list index
			resultIndex: 0,
			// 关系集操作 result list index
			relationshipIndex: 0,

		};
		this.Nodes = {
			// 图片节点
			image: null,
			// 画布节点
			canvas: null,
			// 缩略图节点
			scaleCanvas: null,
			// 缩放比例面板
			scalePanel: null,
			// 画布上下文
			ctx: null,
			// 缩略图画板上下文
			sCtx: null,
			// 缩略图方框
			scaleRect: null,
			// 存储图像数据的画布
			bCanvas: null,
			// 存储图像数据的上下文
			bCtx: null,
			// 绘图部分主外层函数
			canvasMain: null,
			// 标记结果数据集
			resultGroup: null,
			// 十字线开关按钮
			crossLine: null,
			// 标注结果开关按钮
			labelShower: null,
			// 屏幕快照按钮
			screenShot: null,
			// 全屏按钮
			screenFull: null,
			// 颜色选取器节点数据
			colorHex: null,
			// // 清空标注内容
			// clearScreen: options.clearScreen,
			// // 撤销，返回上一步
			// returnUp: options.returnUp,
			// 标签管理
			toolTagsManager: null,
			// 历史记录列表
			historyGroup: null
		};
		this.Features = {
			//
			N:true,
			// 拖动开关
			dragOn: true,
			// 矩形标注开关
			rectOn: false,
			// 多边形标注开关
			polygonOn: false,
			// 切换布局
			layoutOn: false,
			// 层级标注开关
			dropTOn: false,
			// 组合层级
			CombinOn: false,
			// 标签管理工具
			tagsOn: false,
			// 关系标注开关
			relationshipOn: false,
			// 实体线性趋势标注开关
			trendOn: false,
			// 十字线开关
			crossOn: false,
			// 标注结果显示
			labelOn: true,

		};
	}

}