import React from "react";
import "./view-card.css"

export interface Props {
    top: JSX.Element,
    body: JSX.Element,
}

export default function ViewCard({top, body}: Props) {
    return (
    <div className="card-container">
        <div className="card-top">
            {top}
        </div>
        <div className="card-body">
            {body}
        </div>
    </div>
    )
}
