/**
 * 该组件负责图像视图与网络图视图的通信：
 * 
 */

import React from "react";
// import ImageView from "./ImageView";
import GraphView from "./GraphView";
import LabelView from "./LabelView";
import { Entity, EntityArray, Relationship, RelationshipArray } from '../lib/interface'
import { EntityArrayContextProvider, useEntityArray, useEntityArrayUpdate } from "../lib/context";
import { RelationshipArrayContextProvider, useRelationshipArray, useRelationshipArrayUpdate } from "../lib/context";
import { InfoContextProvider, useInfo, useInfoUpdate } from "../lib/context";
import { MemoArrayContextProvider, useMemoArray, useMemoArrayUpdate } from "../lib/context";


export default function UI() {
    return (
        <React.StrictMode>
            <InfoContextProvider>
                <RelationshipArrayContextProvider>
                    <EntityArrayContextProvider>
                        <MemoArrayContextProvider>
                            {/* <ImageView></ImageView> */}

                            <LabelView></LabelView>
                            <GraphView></GraphView>
                        </MemoArrayContextProvider>
                    </ EntityArrayContextProvider >
                </RelationshipArrayContextProvider>
            </InfoContextProvider>
        </React.StrictMode>
    )
}