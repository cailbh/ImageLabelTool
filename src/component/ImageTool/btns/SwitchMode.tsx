import React from "react";
import "./switch-mode.css"
import Button from "../../Button"
import icon from "../../../icons"
import { ImageToolMode } from "../../../typing";

interface Props {
    setMode: Function
}

export function SwitchMode({setMode}: Props) {
    return (
        <div id="switch-mode">
            <Button
                path={icon.move}
                alt="move"
                event={()=>{
                    setMode(ImageToolMode.Move)
                }}
            ></Button>

            <Button
                path={icon.pen}
                alt="pen"
                event={()=>{
                    setMode(ImageToolMode.SelectBrush)
                }}
            ></Button>
        </div>
    )
}