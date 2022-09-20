import React, { useEffect, useRef, useState } from "react";
import { ImageToolMode, ImageType, Translate, GraphLabel, Plot } from "../../typing";
import "./style.css"

export interface Props {
    image: ImageType,
    labels: GraphLabel[],
    mode: number,
    layer_id: number,
    setLabels: Function,
}


export default function ImageDisplay(props: Props) {
    let { image, labels, mode, layer_id } = props
    const [translate, setTranslate] = useState<Translate>({
        x: 0,
        y: 0,
        scale: 1,
    })

    let canvas_ref = useRef<HTMLCanvasElement>(null)
    let box_ref = useRef<HTMLDivElement>(null)

    let body = (
        <div className="canvas-container" ref={box_ref}>
            <canvas ref={canvas_ref}></canvas>
        </div>
    )

    useEffect(() => {
        let canvas = canvas_ref.current
        if (image.data !== null) {
            setTranslate(translate_init(
                canvas.width,
                canvas.height,
                image.width,
                image.height
            ))
        }
        // console.log(translate)
    }, [image,])

    useEffect(() => {
        let canvas = canvas_ref.current
        if (image.data !== null) {
            setTranslate(translate_init(
                canvas.width,
                canvas.height,
                image.width,
                image.height
            ))
        }
        // console.log(translate)
    }, [image,])

    useEffect(() => {
        let box = box_ref.current
        let canvas = canvas_ref.current
        let width = box.clientWidth
        let height = box.clientHeight - 4 // QAQ 不减4会有“bug”
        update_canvas(canvas, width, height, translate, props)
    }, [image, translate])

    useEffect(() => {
        let box = box_ref.current
        let canvas = canvas_ref.current
        let width = box.clientWidth
        let height = box.clientHeight - 4

        switch (mode) {
            case ImageToolMode.Move:
                apply_move_mode(canvas, translate, setTranslate, width, height, props)
                break;
            case ImageToolMode.SelectBrush:
                apply_select_mode(canvas, translate, setTranslate, width, height, props)
                break;
        }
    }, [mode, translate, labels, layer_id])

    return (
        <React.StrictMode>
            {body}
        </React.StrictMode>
    )
}

// 钢笔工具 涂抹选择区域 pen:
function apply_select_mode(canvas: HTMLCanvasElement, translate: Translate, setTranslate, width, height, props: Props) {
    let { layer_id, labels, image } = props
    let label = labels[layer_id]

    canvas.onwheel = (e: WheelEvent) => {
        let delta = e.deltaY // 下正上负
        let d_scale = 0.1
        if (delta > 0) {
            d_scale = - d_scale
        }
        translate.scale += d_scale
        translate.scale = Math.max(0.1, translate.scale)
        setTranslate({ ...translate })
    }

    // 下面的事件不允许调用setTranslate!(会把down更新掉)
    let down = false, plot: Plot;
    canvas.onmousedown = function (e: MouseEvent) {
        down = true
        plot = new Plot()
        label.add_shape(plot) // 往当前图层添加图形
        let [x, y] = translated_to_real_xy(translate, e.offsetX, e.offsetY)
        plot.add_trace(x, y)
        update_canvas(canvas, width, height, translate, props)
    }
    canvas.onmouseup = function (e: MouseEvent) {
        if (down && image.data !== null && translate !== null) {
            let [x, y] = translated_to_real_xy(translate, e.offsetX, e.offsetY)
            plot.add_trace(x, y)
            update_canvas(canvas, width, height, translate, props)
        }
        down = false
        props.setLabels([...labels])
    }
    canvas.onmousemove = function (e: MouseEvent) {
        if (down && image.data !== null && translate !== null) {
            let [x, y] = translated_to_real_xy(translate, e.offsetX, e.offsetY)
            plot.add_trace(x, y)
            update_canvas(canvas, width, height, translate, props)
        }
    }
}

function translated_to_real_xy(translate, x, y) {
    x = (x - translate.x) / translate.scale
    y = (y - translate.y) / translate.scale
    return [x, y]
}

// 移动工具 移动缩放画布
function apply_move_mode(canvas: HTMLCanvasElement, translate: Translate, setTranslate, width, height, props: Props) {
    let { image, labels } = props
    canvas.onwheel = (e: WheelEvent) => {
        let delta = e.deltaY // 下正上负
        let d_scale = 0.1
        if (delta > 0) {
            d_scale = - d_scale
        }
        translate.scale += d_scale
        // translate.x =  translate.x * d_scale
        translate.scale = Math.max(0.1, translate.scale)
        setTranslate({ ...translate })
    }

    // 下面的事件不允许调用setTranslate!(会把down更新掉)
    let down = false, start_x, start_y, hist_x, hist_y;
    canvas.onmousedown = function (e: MouseEvent) {
        down = true
        start_x = e.clientX
        start_y = e.clientY
        hist_x = hist_y = 0
    }
    canvas.onmouseup = function (e: MouseEvent) {
        if (down && image.data !== null && translate !== null) {
            let last_x = e.clientX,
                last_y = e.clientY
            let dx = last_x - start_x - hist_x,
                dy = last_y - start_y - hist_y
            hist_x += dx
            hist_y += dy
            translate.x += dx
            translate.y += dy
            update_canvas(canvas, width, height, translate, props)
        }
        down = false
        setTranslate({ ...translate })
    }
    canvas.onmousemove = function (e: MouseEvent) {
        if (down && image.data !== null && translate !== null) {
            let last_x = e.clientX,
                last_y = e.clientY
            let dx = last_x - start_x - hist_x,
                dy = last_y - start_y - hist_y
            hist_x += dx
            hist_y += dy
            translate.x += dx
            translate.y += dy
            update_canvas(canvas, width, height, translate, props)
        }
    }
}

// 1. 生成buffer层 2. 更新canvas
function update_canvas(canvas: HTMLCanvasElement, width: number, height: number,
    translate: Translate, props: Props) {
    let { image, labels } = props
    let buffer = render_buffer(width, height, translate, props)
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext("2d")
    ctx?.putImageData(buffer, 0, 0)
    labels.forEach((layer, layer_id) => {
        layer.render(ctx, translate)
    })
}

function render_buffer(width: number, height: number, translate: Translate, props: Props) {
    let { image, labels } = props
    let canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext('2d')
    if (image.data !== null) {
        let x = translate.x, y = translate.y, scale = translate.scale
        let real_w = Math.floor(image.width * scale),
            real_h = Math.floor(image.height * scale)
        ctx.drawImage(
            image.toImage(),
            0, 0, image.width, image.height,
            x, y, real_w, real_h
        )
    }
    labels.forEach((layer, layer_id) => {
        layer.render(ctx, translate)
    })
    return ctx.getImageData(0, 0, width, height)
}

function translate_init(canvas_width: number, canvas_height: number, image_width: number, image_height: number): Translate {
    let image_ratio = image_width / image_height
    let w, h
    w = canvas_width
    h = w / image_ratio
    if (h > canvas_width) {
        h = canvas_height
        w = h * image_ratio
    }
    let scale = w / image_width

    return {
        x: (canvas_width - w) / 2,
        y: (canvas_height - h) / 2,
        scale: scale,
    }
}

export function image_data_to_img(data: ImageData) {
    let canvas = document.createElement("canvas")
    canvas.width = data.width
    canvas.height = data.height

    let ctx = canvas.getContext('2d')
    ctx.putImageData(data, 0, 0)

    let img = new Image()
    img.src = canvas.toDataURL()
    return img
}