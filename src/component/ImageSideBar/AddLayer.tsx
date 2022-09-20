import React from "react";
import icon from "../../icons";
import "./style.css"

interface Props {
    add_layer: Function
}

export default function Add({add_layer}: Props) {
    return (
        <div id="add-layer"
            onClick={()=>{
                add_layer()
            }}>
            <img
                src={icon.add}
                alt="add icon" 
                
            />
        </div>
    )
}