import React from "react";
import Button from "../../Button";
import icon from "../../../icons";
// const Tiff = require("tiff.js")

export interface Props {
    callback: Function,
}

export default function FileLoader({callback}: Props) {
    return (
        <React.StrictMode>
            <Button
                path={icon.import}
                event={()=>{
                    choose_image(callback)
                }} 
                alt = "import image"
            ></Button>
        </React.StrictMode>
    )
}


function choose_image(callback: Function) {
    let input = document.createElement("input")
    input.type = "file"
    input.addEventListener("change", function() {
        if(this.files?.length) {
            let f = this.files[0]
            load_image(f, callback)
        }
    })
    input.click()
}

function load_image(f: File, callback:Function) {
    let extension = f.name.split('.')[1]
    if(extension.match(/(jpg|png|jpeg|webp|gif|ico|cur|bmp|avif)/i)) {
        let reader = new FileReader()
        reader.onload = function() {
            if(this.result && !(this.result instanceof ArrayBuffer)) {
                base64_to_imagedata(this.result, callback)
            }
        }
        reader.readAsDataURL(f)
    }else if(extension.match(/tiff?/i)) {
        // TODO: 支持 tiff 导入...
    }
}

function base64_to_imagedata(base64: string, callback:Function) {
    let img = new Image()
    img.onload = function() {
        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        context?.drawImage(img, 0, 0)
        let imdata = context?.getImageData(0, 0, img.width, img.height)
        callback(imdata)
    }
    img.src = base64
}