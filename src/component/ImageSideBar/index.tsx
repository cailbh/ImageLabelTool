import React, { useEffect, useRef } from "react";
import AddLayer from "./AddLayer"
import { ImageType, GraphLabel } from "../../typing";
import "./style.css"

export interface Props {
    image: ImageType,
    labels: GraphLabel[],
    setLabels: Function,
    setLayerId: Function,
    layer_id: number,
}

export default function ImageSideBar({image, labels, setLabels, setLayerId, layer_id}: Props) {
    /**
     * 在图像左侧展示的图层
     */

    function add_layer() {
        let lid = labels.length
        setLabels([...labels, new GraphLabel()])
        setLayerId(lid)
    }

    const sidebar = useRef<HTMLDivElement>(null)

    useEffect(()=>{
        let box_width = sidebar.current.clientWidth
        let padding = 5   //* canvas的外边距
        let width = box_width - padding * 2
        let height = Math.floor(width / image.ratio)
        sidebar.current.innerHTML = null
        labels.forEach((label, i)=>{
            let bar = document.createElement("div")
            sidebar.current.appendChild(bar)
            bar.className = 'bar'
            let canvas = document.createElement('canvas')
            canvas.className = i !== layer_id? "common-canvas" : "highlight-canvas"
            bar.onclick=()=>{
                setLayerId(i)
                let els = document.getElementsByClassName("highlight-canvas")
                for(let i = 0; i < els.length; ++i) {
                    els[i].className = "common-canvas"
                }
                canvas.className = 'highlight-canvas'
            }
            bar.appendChild(canvas)
            canvas.width = width
            canvas.height = height
            let ctx = canvas.getContext('2d')
            label.render(ctx, {x:0, y:0, scale: width / image.width})
        })
    }, [labels, image])

    return (
        <div id="sidebar">
            <div id="layer-container" ref={sidebar}>
            </div>
            <AddLayer
                add_layer={add_layer}
            ></AddLayer>
        </div>
    )
}