// 选择对图像的操作方式
import React from "react";
import FileLoader from "./btns/FileLoader";
import Toolbar from "../Toolbar";
import { SwitchMode } from "./btns/SwitchMode";


export interface Props {
    img_load_callback: Function,
    setMode: Function,
}

function ImageTool({img_load_callback, setMode}: Props) {

    return (
        <Toolbar>
            <FileLoader callback={img_load_callback} />
            <SwitchMode
                setMode={setMode}
            />
        </Toolbar>
    )
}

export default ImageTool