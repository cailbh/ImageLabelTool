
import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
import svg_import_down from "../../assets/icons/import-down.svg"
import svg_entity1_url from "../../assets/imgs/entity1.png"
interface EntityProps {
    name: string;
    // id: number;
    // type: string;
    // count: number;
    x: number;
    y: number;
    children?: React.ReactNode;
}
interface EntityState {
    msg: string;
    currentRight: number,
    currentTop: number,
    count: number;
    style: object;
    name: string
}
export default class GraphEntity extends React.Component<EntityProps, EntityState> {

    constructor(props: EntityProps) {
        // let right = 0;
        // let top = 0;
        // let innerRight = 0;
        // let innerTop = 0;
        super(props)
        const styles = {
            position: 'relative',
            top: props.y,    // computed based on child and parent's height
            left: props.x,  // computed based on child and parent's width
            height: 100,
            width: 100,
            display: "flex",
            "flex-direction": "row",
            "align-items": "center",
            "justify-content": "center",
            // background: "red",
            background: "url(" + svg_entity1_url + ") no-repeat",
            "background-size": "100% 100%"
            // opacity: 0
        };
        this.state = {
            msg: 'hello 2005',
            name: props.name,
            count: 1,
            currentRight: 0,
            currentTop: 1,
            style: styles
        }
    }



    render() {
        let sty = this.state.style
        let name = this.state.name
        return (
            <div style={sty}>{name}
            </div>
        )
    }
}