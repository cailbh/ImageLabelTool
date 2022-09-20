import React from "react"

export interface Translate {
    x: number,
    y: number,
    scale: number,
}

const ImageToolMode = {
    SelectBrush: 0,
    Move: 1,
}
export {ImageToolMode}

export type AttrType = string | number | Node | null

type OnUpdate = (e: Node) => void

export type NodeInitStructure = {
    id: string | number,
    x: number,
    y: number,
    onUpdate: OnUpdate,
}
export class Node {

    attributes: {
        [key: string]: AttrType
    }
    
    // 建议通过 this.id 来修改 
    _id: string | number

    // 通过 this.x 来修改 
    _x: number = 0

    // 通过 this.y 来修改
    _y: number = 0

    // 更新属性(坐标, id, 属性)后会自动调用该函数
    onUpdate: OnUpdate

    constructor({id, x=0, y=0, onUpdate=function(){}}: NodeInitStructure) {
        this._id = id
        this.attributes = {}
        this._x = x
        this._y = y
        this.onUpdate = onUpdate
    }
    
    /* ```_val```为null则获取属性 */
    attr(_key: string, _val: AttrType | undefined = undefined) {
        let attrs = this.attributes
        if(_val === undefined) {
            return attrs[_key]
        }
        attrs[_key] = _val
        this.onUpdate(this)
    }

    set x(val: number) {
        this._x = val
        this.onUpdate(this)
    }
    
    set y(val: number) {
        this._y = val
        this.onUpdate(this)
    }

    set id(val: string | number) {
        this._id = val
        this.onUpdate(this)
    }

    get x() {
        return this._x
    }

    get y() {
        return this._y
    }

}

export class ImageType {

    width: number  = 0
    height: number = 0
    ratio: number  = 1
    data: Uint8ClampedArray           = null
    color_space: PredefinedColorSpace = null
    __image_data__: ImageData         = null
    __img__: HTMLImageElement         = null

    constructor(imdata: ImageData | null) {

        if(imdata !== null) {
            this.__image_data__ = imdata
            let canvas = document.createElement("canvas")
            canvas.width = imdata.width
            canvas.height = imdata.height
            let ctx = canvas.getContext('2d')
            ctx.putImageData(imdata, 0, 0)
            let img = new Image()
            img.src = canvas.toDataURL()
            this.__img__ = img
            this.width = imdata.width
            this.height = imdata.height
            this.data = imdata.data
            this.color_space = imdata.colorSpace
            this.ratio = imdata.width / imdata.height
        }
    }

    toImage() {
        return this.__img__
    }

    toImageData() {
        return this.__image_data__
    }

    resize(width, height, channels=4) {
        // 最近邻插值 缩放图片
        width = Math.floor(width)
        height = Math.floor(height)

        let new_image = new Uint8ClampedArray(width * height * channels),
            fx = this.width / width,
            fy = this.height / height
        for(let i = 0; i < width; ++i) {
            for(let j = 0; j < height; ++j) {
                let idx = channels * (j * width + i),
                    src_x = Math.round(i * fx),
                    src_y = Math.round(j * fy),
                    src_idx = channels * (src_y * this.width + src_x);
                for(let c = 0; c < channels; ++c) {
                    new_image[idx + c] = this.data[src_idx + c]
                }
            }
        }
        let img = new ImageData(new_image, width, height)
        return new ImageType(img)
    }
    
    crop(sx, sy, ex, ey) {
        sx = Math.max(0, sx)
        sy = Math.max(0, sy)
        ex = Math.min(this.width, ex)
        ey = Math.min(this.height, ey)

        let w = ex - sx,
            h = ey - sy;
        
        let arr = new Uint8ClampedArray(w * h * 4)
        for(let i = 0; i < w; ++i) {
            for(let j = 0; j < h; ++j) {
                let idx = 4 * (i + j * w)
                let old_idx = 4 * (i + sx + (j + sy) * this.width)
                for(let c = 0; c < 4; ++c) {
                    arr[idx + c] = this.data[old_idx + c]
                }
            }
        }

        let img = new ImageData(arr, w, h)
        return new ImageType(img)
    }
    
}

export type ImageTypeDispatch = React.Dispatch<React.SetStateAction<ImageType>>

export class Shape {
    /**
     * Shape是图形基类，不可以直接使用
     * 系统用到的所有图形都是其子类
     */

    render(ctx: CanvasRenderingContext2D, translate: Translate) {
        console.log('实现一下pls')
    };
}

export class Plot extends Shape {

    trace: {x: number, y: number}[] = []

    color = 'rgba(255, 0, 0, 0.25)'

    width = 10
    
    add_trace(x, y) {
        this.trace.push({x, y})
    }

    render(ctx: CanvasRenderingContext2D, translate: Translate) {
        function real_xy_to_translate(x, y) {
            return [
                x * translate.scale + translate.x,
                y * translate.scale + translate.y
            ]
        }
        ctx.beginPath()
        this.trace.forEach((c, i)=>{
            let [x, y] = real_xy_to_translate(c.x, c.y)
            if(i === 0) {
                ctx.moveTo(x, y)
            } else ctx.lineTo(x, y)
            ctx.strokeStyle = this.color
            ctx.lineWidth = this.width * translate.scale
        })
        ctx.stroke()
        ctx.closePath()
        // 画出采样点
        // this.trace.forEach((c, i)=>{
        //     let [x, y] = real_xy_to_translate(c.x, c.y)
        //     ctx.beginPath()
        //     ctx.arc(x, y, this.width / 2, 0, 2 * Math.PI)
        //     ctx.fillStyle = this.color
        //     ctx.fill()
        //     ctx.closePath()
        // })
    }
}

export class GraphLabel {
    shapes: Shape[] = []

    add_shape(shape: Shape) {
        this.shapes.push(shape)
    }
    
    render(ctx: CanvasRenderingContext2D, translate: Translate = {x:0, y:0, scale: 1}) {
        this.shapes.forEach(s=>{
            s.render(ctx, translate)
        })
    }
}