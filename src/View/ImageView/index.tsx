import React, { useEffect, useState } from "react";
import ImageTool from "../../component/ImageTool";
import ImageDisplay from "../../component/ImageDisplay";
import ViewCard from "../ViewCard";
import { GraphLabel, ImageToolMode, ImageType } from "../../typing";
import ImageSideBar from "../../component/ImageSideBar";
import "./style.css"

export default function Left() {
    const [image_data, img_dispatch] = useState(new ImageType(null))
    const [mode, setMode] = useState(ImageToolMode.Move)
    const [layer_id, setLayerId] = useState(0)
    const [labels, setLabels] = useState([new GraphLabel()])

    function set_layer_id(id) {
        if(!labels[id]) {
            labels[id] = new GraphLabel()
        }
        setLayerId(id)
    }

    function img_load_callback(imdata: ImageData) {
        let img = new ImageType(imdata)
        img_dispatch(img)
    }
    
    let body = (
        <div className="image-view_body">
            <ImageSideBar
                image={image_data}
                labels={labels}
                setLabels={setLabels}
                setLayerId={setLayerId}
                layer_id={layer_id}
            ></ImageSideBar>
            
            <ImageDisplay
                image={image_data}
                labels={labels}
                mode={mode}
                layer_id={layer_id}
                setLabels={setLabels}
            ></ImageDisplay>
        </div>
    )

    return (
        <ViewCard
            top={(
                <ImageTool
                    img_load_callback={img_load_callback}
                    setMode={(m)=>{
                        setMode(m)
                    }}
                ></ImageTool>
            )}
            body={body}
        />
    )
}
