import React from "react";
import "./style.css"

export interface Props {
    children: Array<JSX.Element> | JSX.Element,
} // 一般 Children是Array<Button>

export default function Toolbar({children}: Props) {
    let body = children instanceof Array? children.map(child=>(
        <div className="toolbar-item">
            {child}
        </div>
    )): children
    return (
        <div className="toolbar">
            {body}
        </div>
    )
}