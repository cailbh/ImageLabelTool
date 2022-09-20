import React from "react";
import "./btn.css"

export interface Props {
    path: string, // 按钮的图片路径
    alt: string,
    event: Function, // 按钮的点击事件
}

export default function Button({path, event, alt=""}: Props) {
    return (
        <div className="event-button_box">
            <img 
                className="event-button"
                src={path}
                alt={alt} 
                onClick={()=>{event()}}
            />
        </div>
    )
}
