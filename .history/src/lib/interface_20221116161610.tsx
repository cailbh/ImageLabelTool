export class EntityArray {
    array: Array<Entity>;
}
export class RelationshipArray {
    array: Array<Relationship>;
}
export class MemoArray {
    relArray: Array<Relationship>;
    entArray: Array<Entity>;
}
export class Entity {
    name: string;
    id: string;
    type: string;
    x: number;
    y: number;
    //图片绘制起始位置
    ix: number;
    iy: number;
    //标注绘制起始位置
    lx: number;
    ly: number;
    // 图片宽度
    iWidth: number;
    // 图片高度
    iHeight: number;
    //图片缩放
    iScale: number;
    visAble: boolean;
    labels: any;
    content: any;
    contentType: string;
    labelLocation: any;
    rgb: string;
    level:number;
    visibility: boolean;
    trend: any;
    trendIndex: number;
    centerPoint: any;
    rectMask: any;
    color: string;
    describe: string;
    attribute: any;
    active: boolean;
    children: any;
    constructor(myName: string) { //定义带参数的构造函数
        this.name = myName;
    }
}


export class Relationship {
    name: string;
    id: string;
    type: string;
    targetId: string;
    sourceId: string;
    color: string;
    weight: number;
    visAble: boolean
    // constructor(myName: string) { //定义带参数的构造函数
    //     this.name = myName;
    // }
}

export class Info {
    changeState: number;
}

export default class LabelState {
    //任务名称
    taskName: string;
    //文件列表
    imgFiles: any;
    //图片总数
    imgSum: number;
    //选择图片下标
    imgIndex: number;
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
    mousewheelTimer: null;

    // 历史记录下标
    historyIndex: number;
    Arrays: any;
    Nodes: any;
    Features: any;

}