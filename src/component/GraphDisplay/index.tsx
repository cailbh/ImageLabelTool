import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
// import * as d3 from 'd3'
import GraphEntity from "../GraphEntity"
import GraphRelationship from "../GraphRelationship"
import png_entity1_url from "../../assets/imgs/entity1.png"
import png_entity_url from "../../assets/imgs/entity.png"
import png_back_url from "../../assets/imgs/back1.png"
import svg_add_url from "../../assets/imgs/add.svg"
import svg_attr_url from "../../assets/imgs/attr.svg"
import svg_circle_url from "../../assets/imgs/c.svg"
import svg_del_url from "../../assets/imgs/del.svg"
import svg_drop_url from "../../assets/imgs/drop.svg"
import svg_jt_url from "../../assets/imgs/jiantou.svg"
import svg_line_url from "../../assets/imgs/line.png"
import svg_layout_url from "../../assets/imgs/changeLayout.svg"

import svg_entity_url from "../../assets/imgs/entity.svg"
// import { Button, Divider } from 'antd';
import Button from "../Button";
import { Entity, EntityArray, Relationship, RelationshipArray, MemoArray } from '../../lib/interface'
import { useEntityArray, useEntityArrayUpdate, useMemoArray, useMemoArrayUpdate } from "../../lib/context";
import { useRelationshipArray, useRelationshipArrayUpdate, useInfo, useInfoUpdate } from "../../lib/context";
import './index.css';

import { changeConfirmLocale } from "antd/lib/modal/locale";
import Item from "antd/lib/list/Item";
const d3 = require('d3')
export default function GraphDisplay() {

    //实体列表
    const entityArray = useRef(null);
    //实体关系列表
    const relationshipArray = useRef(null);
    //删除实体列表
    const delEntityArray = useRef(null)
    //删除实体关系列表
    const delRelationshipArray = useRef(null)
    //全局实体列表
    const entityContext = useEntityArray();
    const updateEntityArray = useEntityArrayUpdate()
    // 全局关系列表
    const relationshipContext = useRelationshipArray();
    const updateRelationshipArray = useRelationshipArrayUpdate()

    // 全局回收站储存
    const memoContext = useMemoArray();
    const updateMemoArray = useMemoArrayUpdate()

    // 全局信息传递
    const infoContext = useInfo();
    const updateInfo = useInfoUpdate()

    const [change, setChange] = useState<number>();
    // 工具状态
    const [toolType, setToolType] = useState(-1);
    //当前选择实体id
    const [currentEntityid, setCurrentEntityid] = useState();
    //当前选择实体
    const [currentEntity, setCurrentEntity] = useState<Entity>();
    //当前选择关系id
    const [currentRelationshipid, setCurrentRelationshipid] = useState();
    //当前选择关系
    const [currentRelationship, setCurrentRelationship] = useState<Relationship>();
    const chart = useRef(null);
    const changeActive = useRef(null)

    const focusEntId = useRef(null)

    const [layoutType, setLayoutType] = useState(0)

    // setChange(1)
    const addEntity = () => {
        if (change == 0) {
            setChange(1)
        }
        else {
            setChange(0)
        }
        return (
            <span>12</span>
        )
    }
    const changeToolType = (type) => {

        d3.select('.butContain')
            .style("display", "none")
        setToolType(type)
        setToolType(preType => { return preType })
        if (type == 2) {

            let entityId = currentEntityid
            let entityC = entityContext.array.find(function (item, index, arr) {
                return item.id === entityId
            })

            setCurrentEntity(entityC)
        }
    }
    //实体点击
    const entityClick = (ent) => {
        if (toolType == 1) {
            let entityId = ent.target.id
            d3.select('#graph').select('svg').selectAll(".text_" + entityId).remove()
            d3.select('#graph').select('svg').selectAll("." + entityId).remove()
            delEntityById(entityId)
        }
        if (toolType == 2) {
            let entityId = ent.target.id
            let entityC = entityContext.array.find(function (item, index, arr) {
                return item.id === entityId
            })
            setCurrentEntity(entityC)
        }
        d3.select("#graphSvg").style("cursor", "default")
    }
    //实体鼠标漂浮
    const entityMouseOver = (ent) => {
        var item = ent.target
        focusEntId.current = item.id
        let svgWidth = chart.current.clientWidth
        let svgHeight = chart.current.clientHeight
        var graphDiv = d3.select('#graph')
        var svg = graphDiv
            .select("#graphSvg")
            .select("#entityGraph")
            .select('#entityG')
        if (layoutType == 0) {

            entityContext.array.forEach(function (element, index, arr) {
                if (element.id === item.id) {
                    arr[index].active = true
                    // element.x = svgWidth * (element.lx - element.ix) / (element.iScale * element.iWidth)
                    // element.y = svgHeight * (element.ly - element.iy) / (element.iScale * element.iHeight)
                    // var rSize = 50
                    // var smallCircles = svg.select(".smallCircle" + element.id)
                    //     .attr("opacity", 1)

                }
                else
                    arr[index].active = false
            })
            if (changeActive.current == 0) {
                // setEntityArray([...entityArray])
                updateEntityArray(entityContext.array)
                updateInfo({ changeState: 1 })
                changeActive.current = 1
            }
        }


        // console.log(item, entityArray, entityContext, entityTp)
        var sPathD = d3
            .selectAll("[class*=" + "sD-" + item.id + "]")
            .style("display", "block")

        var tPathD = d3
            .selectAll("[class*=" + "tD-" + item.id + "]")
            .style("display", "block")
        if (toolType == 0) {
            d3.select("#graphSvg").style("cursor", "move")
        }
        if (toolType == 1) {
            d3.select("#graphSvg").style("cursor", "crosshair")
        }
        if (toolType == 2) {
            d3.select("#graphSvg").style("cursor", "text")
        }
    }
    //实体鼠标离开
    const entityMouseOut = (ent) => {
        // if (layoutType == 0) {
        entityContext.array.forEach(function (i, index, arr) {
            arr[index].active = false
        })
        if (changeActive.current == 1) {
            // setEntityArray([...entityArray])
            updateEntityArray(entityContext.array)
            updateInfo({ changeState: 1 })
            changeActive.current = 0
        }
        // }


        var item = ent.target
        var sPathD = d3
            .selectAll("[class*=" + "sD-" + item.id + "]")
            .style("display", "none")

        var tPathD = d3
            .selectAll("[class*=" + "tD-" + item.id + "]")
            .style("display", "none")

        d3.select("#graphSvg").style("cursor", "default")
        // var text = d3.select("#text_" + item.id)
        //     .style("display", "none")
    }

    const attrClick = (ent, id, index) => {
        console.log(ent, id, index)
        var graphDiv = d3.select('#graph')
        var svg = graphDiv
            .select("#graphSvg")
            .select("#entityGraph")
            .select('#entityG')

        var tx = svg
            .select("#t_" + id + "_" + (index - 1))
            .attr("opacity", 1)
        console.log(svg, tx, ".text_attr" + id + "" + (index - 1))
    }
    const delEntityById = (strId) => {
        entityContext.array.forEach(function (item, index, arr) {
            if (item.id == strId) {
                arr.splice(index, 1)
                delEntityArray.current.push(item)
            }
        })
        let delRels = []
        for (let i = 0; i < relationshipContext.array.length; i++) {
            var item = relationshipContext.array[i]
            if ((item.sourceId == strId) || (item.targetId == strId)) {
                relationshipContext.array.splice(i, 1)
                i--
                delRels.push(item)
            }
        }
        delRelationshipArray.current.push(delRels)
        // if (changeActive.current == 0) {
        // setEntityArray([...entityArray])
        updateEntityArray(entityContext.array)
        console.log(entityContext, entityArray)
        // setRelationshipArray([...relationshipArray])
        updateRelationshipArray(relationshipContext.array)

        updateInfo({ changeState: 1 })
        updateMemoArray(delEntityArray.current, delRelationshipArray.current)
        // }
        // context.array = entityArray
    }

    const history = (tp) => {
        if ('undo' == tp) {
            if (delEntityArray.current.length > 0) {
                entityArray.current.push(delEntityArray.current[delEntityArray.current.length - 1])
                delEntityArray.current.splice(delEntityArray.current.length - 1, 1)
            }
            delRelationshipArray.current[delRelationshipArray.current.length - 1].forEach(element => {
                relationshipContext.array.push(element)
            });
            updateEntityArray(entityArray.current)
            console.log(entityContext, entityArray)
            // updateRelationshipArray(relationshipContext.array)
            // updateInfo({ changeState: 1 })
        }
    }

    const addRelationship = () => {
        console.log(entityContext)
        // let rel = new Relationship()
        // let len = entityArray.length
        // if (len >= 2) {
        //     var tmp = 0
        //     for (let i = 0; i < entityArray.length - 1; i++) {
        //         for (let j = i + 1; j < entityArray.length; j++) {
        //             let eSource = entityArray[i];
        //             let eTarget = entityArray[j];
        //             var jg = 0
        //             relationshipContext.array.forEach(function (item, index, arr) {
        //                 if ((item.sourceId === eSource.id) && (item.targetId === eTarget.id)) {
        //                     jg = 1
        //                 }
        //             })
        //             if (jg === 0) {
        //                 rel.sourceId = eSource.id
        //                 rel.targetId = eTarget.id
        //                 tmp = 1
        //                 break;
        //             }
        //         }
        //     }
        //     if (tmp === 1) {
        //         updateRelationshipArray([...relationshipContext.array, rel])
        //     }

        // }
    }

    const showEntityAttribute = (entity) => {
        if (!entity) return <>暂无数据</>;
        return (
            <GraphEntity entity={entity} ></GraphEntity >
        )
    }
    const showRelationshipAttribute = (relationships) => {

        // if (relationships.length == 0) return <>暂无数据</>;
        // return relationships.map((relationship) => {
        return (
            <GraphRelationship relationship={relationships} ></GraphRelationship >
        )
        // })


    }
    //初始化
    useEffect(() => {
        entityArray.current = []
        relationshipArray.current = []

        delEntityArray.current = []
        delRelationshipArray.current = []

        // setToolType(-1)
        let svgWidth = chart.current.clientWidth
        let svgHeight = chart.current.clientHeight
        let rSize = 30
        var graphDiv = d3.select('#graph')
        // .style("background", "url(" + png_back_url + ")")
        graphDiv.select('svg').remove()
        var svg = graphDiv.append("svg")
            .attr("id", "graphSvg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .on("contextmenu", function (d, i) {
                d.preventDefault();
            });
        svg.append("g")
            .attr("id", "relationshipGraph")
            .append("g")
            .attr("id", "relationshipG")

        svg.append("g")
            .attr("id", "entityGraph")
            .append("g")
            .attr("id", "entityG")
        var defs = svg.append('defs')


        changeActive.current = 0

        let tool = document.getElementById('graphTools');

        tool.addEventListener("click", (e) => {
            var tar = (e.target as any)
            switch (true) {
                case tar.className.indexOf('toolDrag') > -1:  // 拖拽
                    // SetFeatures('dragOn', true);
                    break;
                default:
                    break;
            }
        })

        const toolLayout = document.querySelector('.toolLayout');
        const toolLayoutDiv = document.getElementById('layoutDiv')
        const graphTool = document.getElementsByClassName('graphTool');
        toolLayout.addEventListener("mouseover", (e) => {
            toolLayoutDiv.style['z-index'] = 9999

        })
        for (var i = 0; i < graphTool.length; i++) {
            graphTool[i].addEventListener("mouseover", (e) => {
                let tar = e.target as Element
                switch (true) {
                    case tar.className.indexOf('layout') < 0:
                        // toolLayoutDiv.style['z-index'] = -9999
                        break;
                    default:
                        break
                }
            })

            graphTool[i].addEventListener("click", (e) => {
                let tar = e.target as Element
                switch (true) {
                    case tar.className.indexOf('drop') > -1:
                        changeToolType(0)
                        break;
                    case tar.className.indexOf('edit') > -1:
                        changeToolType(2)
                        addRelationship()
                        break;
                    case tar.className.indexOf('del') > -1:
                        changeToolType(1)
                        break;
                    case tar.className.indexOf('undo') > -1:
                        history('undo')
                        break;
                    // case tar.className.indexOf('toolPrint') > -1:
                    //     history('redo')
                    //     break;
                    
                    default:
                        break
                }
            })
        }

        toolLayoutDiv.addEventListener("mouseleave", (e) => {
            toolLayoutDiv.style['z-index'] = -9999
        })




        let layout = document.getElementById('layouts');
        layout.addEventListener('click', function (e) {
            for (let i = 0; i < layout.children.length; i++) {
                layout.children[i].classList.remove('focus');
            }
            var tar = (e.target as any)
            tar.classList.add('focus');
            switch (true) {
                case tar.className.indexOf('toolCrossLayout') > -1:  // 对应
                    SetLayOut(0);
                    break;
                case tar.className.indexOf('toolForceLayout') > -1:  // 力导图
                    SetLayOut(1);
                    break;
                case tar.className.indexOf('toolDragLayout') > -1:  // 自定义
                    SetLayOut(2);
                    break;
                default:
                    break;
            }
        })
    }, []);

    // useEffect(() => {
    //     if (change) {
    //         let ent = new Entity(String.fromCharCode(Math.floor(Math.random() * 26) + 97))
    //         ent.name = String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    //         ent.id = ""
    //         ent.x = (Math.random() * 500)
    //         ent.y = (Math.random() * 500)
    //         for (let i = 0; i < 15; i++) {
    //             ent.id += String.fromCharCode(Math.floor(Math.random() * 26) + 97)
    //         }
    //         updateEntityArray([...entityContext.array, ent])
    //     }
    // }, [change]);

    //渲染实体
    useEffect(() => {
        if (entityContext.array) {
            let svgWidth = chart.current.clientWidth
            let svgHeight = chart.current.clientHeight
            let rSize = 60
            var graphsvg = d3.select('#graph').select("#graphSvg").select("#entityGraph")
            graphsvg.select('#entityG').remove()
            var svg = graphsvg.append("g")
                .attr("id", "entityG")
                .attr("width", svgWidth)
                .attr("height", svgHeight)


            var relGraphsvg = d3.select('#graph').select("#graphSvg").select("#relationshipGraph")
            relGraphsvg.select('#relationshipG').remove()
            var relSvg = relGraphsvg.append("g")
                .attr("id", "relationshipG")
                .attr("width", svgWidth)
                .attr("height", svgHeight)

            var relDefs = relSvg.append('defs')



            var defs = svg.append('defs')
            // var defs = svg.select('defs')
            const newPath = (ids, dx, dy, type) => {
                let startA = [0, 0]
                let endA = [0, 0]
                if (type == 'source') {
                    let eTarget = entityContext.array.find(function (item, index, arr) {
                        return item.id === ids[3]
                    })
                    startA = [dx, dy]
                    endA = [eTarget.x, eTarget.y]
                }
                else if (type == 'target') {
                    let eSource = entityContext.array.find(function (item, index, arr) {
                        return item.id === ids[1]
                    })
                    startA = [eSource.x, eSource.y]
                    endA = [dx, dy]
                }

                let unitVec = getUnitVector(startA, endA)
                startA[0] += rSize * unitVec[0]
                startA[1] += rSize * unitVec[1]
                endA[0] -= rSize * unitVec[0]
                endA[1] -= rSize * unitVec[1]
                let middleA = computeControlPoint(startA, endA);
                let lineWidth = 2;
                let path = d3.path()
                path.moveTo(startA[0], startA[1])
                path.quadraticCurveTo(middleA[0], middleA[1], endA[0], endA[1]);
                return path.toString()
            }
            var drag = d3.drag()
                // .on('start', function (d) {
                //     // d3.select(this).classed("dragging", true)
                //     // console.log('start')
                // })
                .on("end", function (d) {
                    if (toolType == 0) {
                        var ent = d3.select(this)
                        var strId = this.id
                        var x = parseFloat(this.attributes.cx.value)
                        var y = parseFloat(this.attributes.cy.value)
                        entityContext.array.forEach(function (item, index, arr) {
                            if (item.id == strId) {
                                arr[index].x = x
                                arr[index].y = y
                            }
                        })
                        // setEntityArray([...entityArray])
                        updateEntityArray(entityContext.array)
                        var text = d3.select(".text_" + this.id)
                            .style("display", "none")
                    }
                })
                .on("drag", function (d) {
                    if (toolType == 0) {
                        d3.select("#graphSvg").style("cursor", "move")
                        d3.select(this)
                            .attr("cx", d.cx = d.x)
                            .attr("cy", d.cy = d.y);
                        d3.select('#graph').select('svg').select(".text_" + this.id)
                            .attr("x", d.cx = d.x)
                            .attr("y", d.cy = d.y);
                        var sPath = d3
                            .selectAll("[class*=" + "s-" + this.id + "]")
                            .attr('d', function () {
                                var ids = (this.attributes.class.value).split('-')
                                return newPath(ids, d.x, d.y, "source")
                            })
                        var tPath = d3
                            .selectAll("[class*=" + "t-" + this.id + "]")
                            .attr('d', function () {
                                var ids = (this.attributes.class.value).split('-')
                                return newPath(ids, d.x, d.y, "target")
                            })

                        var sPathD = d3
                            .selectAll("[class*=" + "sD-" + this.id + "]")
                            .style("display", "block")
                            .attr('path', function () {
                                var ids = (this.attributes.class.value).split('-')
                                return newPath(ids, d.x, d.y, "source")
                            })
                        var tPathD = d3
                            .selectAll("[class*=" + "tD-" + this.id + "]")
                            .style("display", "block")
                            .attr('path', function () {
                                var ids = (this.attributes.class.value).split('-')
                                return newPath(ids, d.x, d.y, "target")
                            })
                    }
                });
            if (layoutType == 0 || layoutType == 2) {
                for (let i = 0; i < entityContext.array.length; i++) {
                    const element = entityContext.array[i];
                    if (element.visAble) {
                        if (layoutType == 0) {
                            element.x = svgWidth * (element.lx - element.ix) / (element.iScale * element.iWidth)
                            element.y = svgHeight * (element.ly - element.iy) / (element.iScale * element.iHeight)
                        }


                        var smallR = 10
                        var k = 0
                        var stepR = Math.PI / 5
                        var startR = -Math.PI / 2
                        var elementAttribute = element.attribute
                        var len = elementAttribute.length
                        if (focusEntId.current == element.id) {
                            while (k < len) {
                                var t = startR + k * stepR
                                var x = element.x + (rSize + smallR) * Math.cos(t)
                                var y = element.y + (rSize + smallR) * Math.sin(t)
                                var smallCircle = svg.append("circle")
                                    .attr("id", element.id + "_" + k)
                                    .attr("class", "smallCircle" + element.id)
                                    .attr("cx", x)
                                    .attr("cy", y)
                                    .attr("r", 10)
                                    // .attr("opacity", 0)
                                    .attr("fill", "rgb(0,0,0,0)")
                                    .attr("stroke-width", 2)
                                    .attr("stroke", element.color)
                                    .on("click", function (d) {
                                        attrClick(d, element.id, k)
                                    })
                                var attrKey = svg.append("text")
                                    .attr("id", "t_" + element.id + "_" + k)
                                    .attr("class", "text_attr" + element.id)
                                    .attr("x", x + (15))
                                    .attr("y", y)
                                    .attr("opacity", 1)
                                    .text(elementAttribute[k].attrKey + ": " + elementAttribute[k].attrValue)
                                // .on("mouseover", function (d) {
                                //     entityMouseOver(d)
                                // })
                                // .on("mouseout", function (d) {
                                //     entityMouseOut(d)
                                // })
                                k = k + 1
                            }
                        }

                        let color = element.color
                        var pat = defs.append('pattern')
                            .attr('id', 'pic' + i)
                            // .attr('patternUnits', 'userSpaceOnUse')
                            .attr('width', 1)
                            .attr('height', 1)
                            .append('svg:image')
                            .attr('xlink:href', png_entity_url)
                            .attr("width", rSize * 2)
                            .attr("height", rSize * 2)
                            .style("fill", "#000")
                            .style("filter", "drop-shadow(" + color + " " + (-rSize * 3) + "px 0)")
                            .style("transform", "translateX(" + rSize * 3 + "px)")
                        var circle = svg.append("circle")
                            .attr("id", element.id)
                            .attr("class", element.id)
                            .attr("cx", element.x)
                            .attr("cy", element.y)
                            .attr("r", rSize)
                            // .attr("fill", "url(#pic" + i + ")")
                            .attr("fill",element.color)
                            .attr("opacity","0.2")
                            .attr("stroke", "#000")
                            .on("click", (d) => {
                                entityClick(d)
                            })
                            .on("contextmenu", function (d, i) {
                                d.preventDefault();
                                d3.select('.butContain')
                                    .style("display", "block")
                                    .style("top", d.layerY + "px")
                                    .style("left", d.layerX + "px")
                                setCurrentEntityid(d.target.id)
                            })
                            .on("mouseover", function (d) {
                                entityMouseOver(d)
                            })
                            .on("mouseout", function (d) {
                                entityMouseOut(d)
                            })
                            .call(drag);
                        var text = svg.append("text")
                            .attr("id", "text_" + element.id)
                            .attr("class", "text_" + element.id)
                            .attr("x", element.x - (5 * element.name.length))
                            .attr("y", element.y)
                            .text(element.name)
                        // .style("display", "none")
                    }

                }
                relationshipContext.array.forEach(function (relItem, relIndex, relArr) {
                    if (relItem.type != 'root') {
                        let eSource = entityContext.array.find(function (item, index, arr) {
                            return item.id === relItem.sourceId
                        })
                        let eTarget = entityContext.array.find(function (item, index, arr) {
                            return item.id === relItem.targetId
                        })
                        let startA = [eSource.x, eSource.y]
                        let endA = [eTarget.x, eTarget.y]
                        let unitVec = getUnitVector(startA, endA)
                        startA[0] += rSize * unitVec[0]
                        startA[1] += rSize * unitVec[1]
                        endA[0] -= rSize * unitVec[0]
                        endA[1] -= rSize * unitVec[1]
                        let middleA = computeControlPoint(startA, endA);
                        let lineWidth = 2;
                        let path = d3.path()
                        path.moveTo(startA[0], startA[1])
                        path.quadraticCurveTo(middleA[0], middleA[1], endA[0], endA[1]);

                        let path1 = d3.path()
                        path1.moveTo(middleA[0], middleA[1])

                        relSvg.append('path')
                            .attr("class", "s-" + eSource.id + "-t-" + eTarget.id)
                            .attr('d', path.toString())
                            // .attr('fill', "url(#piC)")
                            // .attr('fill', relItem.color)
                            .attr('fill-opacity', '0')
                            .style('stroke', relItem.color)
                            // .style('stroke-dasharray', '0 3')
                            .style("stroke-opacity", "0.5")
                            .style('stroke-width', lineWidth)
                        // .attr("stroke", "url(#piC)")
                        // .attr("filter", "url(#piC)")


                        var relText = relSvg.append("text")
                            .attr("id", "text_" + relItem.id)
                            .attr("class", "s-" + eSource.id + "-t-" + eTarget.id)
                            .attr("x", middleA[0] - (5 * relItem.name.length))
                            .attr("y", middleA[1])
                            .text(relItem.name)

                        relSvg.append('path')
                            .attr('fill', relItem.color)
                            .attr("class", "sD-" + eSource.id + "-tD-" + eTarget.id)
                            .style("display", "none")
                            .attr('d', 'M 11 0 C 7 5 -1 9 -10 10 L -10 10 C -5 7 -1 5 1 0 C -1 -5 -4 -9 -10 -10 L -10 -10 C -1 -9 7 -5 11 0 Z')
                            .append('animateMotion')
                            .attr('path', path.toString())
                            .attr("class", "sD-" + eSource.id + "-tD-" + eTarget.id)
                            // .style("display", "none")
                            .attr('begin', 1 + 'ms')
                            .attr('dur', 2000000 + 'ms')
                            .attr('rotate', 'auto')
                            .attr("repeatCount", "indefinite")

                        const rotate = (A, B) => {

                            var x = A[1] - B[1]
                            var y = A[0] - B[0];
                            if (!x && !y) {
                                return 0;
                            }
                            var angle = (180 + Math.atan2(-y, -x) * 180 / Math.PI + 360) % 360;
                            return 270 - angle;
                        }
                        const midP = (A, B, C) => {
                            let x = 0;
                            let y = 0;
                            x = 0.25 * A[0] + 0.5 * B[0] + 0.25 * C[0]
                            y = 0.25 * A[1] + 0.5 * B[1] + 0.25 * C[1]
                            return x + ',' + y
                        }
                        relSvg.append('path')
                            .attr('fill', relItem.color)
                            .attr("class", "sDM-" + eSource.id + "-tDM-" + eTarget.id)
                            // .style("display", "none")
                            .attr('d', 'M 11 0 C 7 5 -1 9 -10 10 L -10 10 C -5 7 -1 5 1 0 C -1 -5 -4 -9 -10 -10 L -10 -10 C -1 -9 7 -5 11 0 Z')
                            .attr('transform',
                                function (t, k) {
                                    return ` rotate(${rotate(startA, endA)},${midP(startA, middleA, endA)}) translate(${midP(startA, middleA, endA)})`
                                })
                    }
                })
            }
            else if (layoutType == 1 && (entityContext.array.length > 0)) {
                // let nodes = []
                // let edges = []
                // for (let i = 0; i < entityArray.length; i++) {
                //     const element = entityArray[i];
                //     nodes.push({
                //         id: element.id,
                //         name: element.name, // 节点名称
                //     });

                // }
                const drags = () => {

                    function dragstarted(event, d) {
                        if (!event.active) forceSimulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }
                    function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                    }

                    function dragended(event, d) {
                        if (!event.active) forceSimulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }
                    return d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended);
                }
                var nodes = []
                entityContext.array.forEach(function (entItem, entIndex, entArr) {
                    if (entItem.visAble) {
                        nodes.push(entItem)
                    }
                })
                var edges = []
                relationshipContext.array.forEach(function (relItem, relIndex, relArr) {
                    if (relItem.type != "root") {
                        edges.push({
                            source: relItem.sourceId,
                            target: relItem.targetId,
                            color: relItem.color
                        })
                    }
                })
                // var edges = [{ source: "0", target: "2" }, { source: "0", target: "2" },
                // { source: "0", target: "3" }, { source: "2", target: "4" },
                // { source: "2", target: "5" }, { source: "1", target: "6" }];
                // var edges = [{ source: 0, target: 1 }, { source: 0, target: 2 },
                // { source: 0, target: 3 }, { source: 1, target: 4 },
                // { source: 1, target: 5 }, { source: 1, target: 6 }];

                // var edges = [{ source: "0", target: "1" }];

                var forceSimulation = d3.forceSimulation()
                    .force("link", d3.forceLink().id((d) => { return d.id }))
                    .force("charge", d3.forceManyBody().strength(-100))
                    .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2));
                forceSimulation.nodes(nodes)
                    .on("tick");

                forceSimulation.force("link")
                    .links(edges)
                    .distance(200);

                // var node = svg.selectAll(".node")
                //     .data(nodes)
                //     .enter()
                //     .append("circle")
                //     .attr("class", "node")
                //     .attr("r", 15)
                //     .attr("fill", "black")
                //     .call(drags());

                var pat = defs.selectAll('.pattern')
                    .data(nodes)
                    .enter()
                    .append("pattern")
                    .attr('id', function (d) { return 'pic' + d.id })
                    // .attr('patternUnits', 'userSpaceOnUse')
                    .attr('width', 1)
                    .attr('height', 1)
                    .append('svg:image')
                    .attr('xlink:href', png_entity_url)
                    .attr("width", rSize * 2)
                    .attr("height", rSize * 2)
                    .style("fill", "#000")
                    .style("filter", function (d) { return "drop-shadow(" + d.color + " " + (-rSize * 3) + "px 0)" })
                    .style("transform", "translateX(" + rSize * 3 + "px)")

                var circle = svg.selectAll('circle')
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("id", function (d) { return d.id })
                    .attr("class", function (d) { return d.id })
                    .attr("cx", function (d) { return d.x })
                    .attr("cy", function (d) { return d.y })
                    .attr("r", rSize)
                    // .attr("fill", "black")
                    .attr("fill", function (d) { return "url(#pic" + d.id + ")" })
                    .on("click", function (d) {
                        entityClick(d)
                    })
                    .on("contextmenu", function (d, i) {
                        d.preventDefault();
                        d3.select('.butContain')
                            .style("display", "block")
                            .style("top", d.layerY + "px")
                            .style("left", d.layerX + "px")
                        setCurrentEntityid(d.target.id)
                    })
                    .on("mouseover", function (d) {
                        entityMouseOver(d)
                    })
                    .on("mouseout", function (d) {
                        entityMouseOut(d)
                    })
                    .call(drags());

                var text = svg.selectAll('.text')
                    .data(nodes)
                    .enter()
                    .append("text")
                    .attr("id", function (d) { return "text_" + d.id })
                    .attr("class", function (d) { return "text_" + d.id })
                    .attr("x", function (d) { return d.x - (5 * d.name.length) })
                    .attr("y", function (d) { return d.y - (5 * d.name.length) })
                    .text(function (d) { return d.name })

                let lineWidth = 2;
                var path = relSvg.selectAll('.path')
                    .data(edges)
                    .enter()
                    .append('path')
                    .attr("class", function (d) { return "s-" + d.source.id + "-t-" + d.target.id })
                    .attr('d', function (d) {
                        let eSource = d.source
                        let eTarget = d.target
                        let startA = [eSource.x, eSource.y]
                        let endA = [eTarget.x, eTarget.y]
                        let unitVec = getUnitVector(startA, endA)
                        startA[0] += rSize * unitVec[0]
                        startA[1] += rSize * unitVec[1]
                        endA[0] -= rSize * unitVec[0]
                        endA[1] -= rSize * unitVec[1]
                        let middleA = computeControlPoint(startA, endA);
                        let path = d3.path()
                        path.moveTo(startA[0], startA[1])
                        path.quadraticCurveTo(middleA[0], middleA[1], endA[0], endA[1]);
                        return path.toString()
                    })
                    // .attr('fill', "url(#piC)")
                    // .attr('fill', relItem.color)
                    .attr('fill-opacity', '0')
                    .style('stroke', function (d) { return d.color })
                    // .style('stroke-dasharray', '0 3')
                    .style("stroke-opacity", "0.5")
                    .style('stroke-width', lineWidth)

                forceSimulation.on("tick", () => {
                    // link.attr("x1", d => d.source.x)
                    //     .attr("y1", d => d.source.y)
                    //     .attr("x2", d => d.target.x)
                    //     .attr("y2", d => d.target.y);
                    circle.attr("cx", (d) => {
                        if (d.x < rSize) return rSize
                        return d.x > svgWidth - rSize ? svgWidth - rSize : d.x
                    })
                        .attr("cy", (d) => {
                            if (d.y < rSize) return rSize
                            return d.y > svgHeight - rSize ? svgHeight - rSize : d.y
                        });
                    text.attr("x", (d) => {
                        if (d.x < rSize) return rSize
                        return d.x > svgWidth - rSize ? svgWidth - rSize : d.x
                    })
                        .attr("y", (d) => {
                            if (d.y < rSize) return rSize
                            return d.y > svgHeight - rSize ? svgHeight - rSize : d.y
                        });

                    path.attr("d", (d) => {
                        let eSource = d.source
                        let eTarget = d.target
                        let startA = [eSource.x, eSource.y]
                        let endA = [eTarget.x, eTarget.y]
                        let unitVec = getUnitVector(startA, endA)
                        startA[0] += rSize * unitVec[0]
                        startA[1] += rSize * unitVec[1]
                        endA[0] -= rSize * unitVec[0]
                        endA[1] -= rSize * unitVec[1]
                        let middleA = computeControlPoint(startA, endA);
                        let path = d3.path()
                        path.moveTo(startA[0], startA[1])
                        path.quadraticCurveTo(middleA[0], middleA[1], endA[0], endA[1]);
                        return path.toString()
                    })
                    // ntext.attr("x", d => d.x)
                    //     .attr("y", d => d.y);
                    // etext.attr("x", function (d) { return (d.source.x + d.target.x) / 2 })
                    //     .attr("y", function (d) { return (d.source.y + d.target.y) / 2 })

                });

                // .call(drag());
                // setEntityArray(nodes)
            }



        }
    }, [relationshipContext.array, entityContext.array, toolType, layoutType]);

    //更新实体信息
    useEffect(() => {
        entityArray.current = (entityContext.array)
        // updateEntityArray(entityContext.array)
    }, [entityContext.array]);

    // 渲染关系
    // useEffect(() => {
    //     // if (relationshipArray) {
    //     let svgWidth = chart.current.clientWidth
    //     let svgHeight = chart.current.clientHeight
    //     let rSize = 50
    //     var graphsvg = d3.select('#graph').select("#graphSvg").select("#relationshipGraph")
    //     graphsvg.select('#relationshipG').remove()
    //     var svg = graphsvg.append("g")
    //         .attr("id", "relationshipG")
    //         .attr("width", svgWidth)
    //         .attr("height", svgHeight)

    //     var defs = svg.append('defs')

    //     var pat = defs.append('pattern')
    //         .attr('id', 'piC')
    //         // .attr('patternUnits', 'userSpaceOnUse')
    //         // .attr("x", "-10")
    //         // .attr("y", "-10")
    //         .attr('width', 1.2)
    //         .attr('height', 1.2)
    //         .append('svg:image')
    //         .attr('xlink:href', svg_line_url)
    //         .attr("width", 300)
    //         .attr("height", 300)

    //     // }
    // }, [entityArray, relationshipArray])

    // 更新关系
    useEffect(() => {
        // relationshipArray.current = (relationshipContext.array)
    }, [relationshipContext]);

    // 计算布局
    // useEffect(() => {
    //     if (layoutType == 0) {

    //     }
    //     // console.log(layoutType, entityArray, relationshipArray)
    // }, [layoutType, entityContext.array, relationshipContext.array])

    /*获取贝塞尔曲线控制点*/
    const computeControlPoint = (ps, pe, arc = 0.1) => {
        const deltaX = pe[0] - ps[0];
        const deltaY = pe[1] - ps[1];
        const theta = Math.atan(deltaY / deltaX);
        const len = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) / 2 * arc;
        const newTheta = theta - Math.PI / 2;
        return [
            (ps[0] + pe[0]) / 2 + len * Math.cos(newTheta),
            (ps[1] + pe[1]) / 2 + len * Math.sin(newTheta),
        ];
    }
    // 获取单位向量
    const getUnitVector = (pointO, pointA) => {
        var point = [0, 0];
        var distance = Math.sqrt(Math.pow((pointO[0] - pointA[0]), 2) + Math.pow((pointO[1] - pointA[1]), 2));

        point[0] = (pointA[0] - pointO[0]) / distance;
        point[1] = (pointA[1] - pointO[1]) / distance;

        return point;
    }
    //切换布局
    const SetLayOut = (i) => {
        setLayoutType(i)
        if (i == 2) {
            changeToolType(0)
        }
    }

    return (
        <React.StrictMode>
            <div className="graphRoot">
                <div className="graphCantain">

                    {/* <Button type="primary" onClick={() => addEntity()}>更新实体</Button>
                <Button type="primary" onClick={() => addRelationship()}>更新关系</Button>

                <Button type="primary" onClick={() => changeToolType(0)}>实体拖动</Button>
                <Button type="primary" onClick={() => changeToolType(1)}>实体删除</Button>
                <Button type="primary" onClick={() => changeToolType(2)}>实体属性</Button> */}
                    <div className="butContain">
                        <div className="but"><Button path={svg_add_url} event={() => { addEntity() }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_jt_url} event={() => { addRelationship() }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_drop_url} event={() => { changeToolType(0) }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_del_url} event={() => { changeToolType(1) }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_attr_url} event={() => { changeToolType(2) }} alt="import image"></Button></div>
                    </div>
                    <div id="graphDiv">
                        <div className="graphHead">
                            <div className="graphLogo"><h5>Graph Interactions</h5></div>
                            <div className="graphToolsDiv">
                                <div id="graphTools">
                                    <div className="graphTool toolLayout " title="更改布局"><h5 className="layout">布局</h5></div>
                                    <div className="graphTool toolDrop" title="拖拽实体"><h5 className="drop ">拖拽</h5></div>
                                    <div className="graphTool toolEdit" title="编辑图谱"><h5 className="edit">编辑</h5></div>
                                    {/* <div className="graphTool toolAdd " title="增加"><h5 className="add">增加</h5></div> */}
                                    {/* <div className="graphTool toolDel" title="删除"><h5 className="del">删除</h5></div> */}
                                    {/* <div className="graphTool toolUndo" title="撤消"><h5 className="undo">撤消</h5></div> */}
                                    {/* <div className="graphTool toolRedo" title="恢复"><h5 className="redo">恢复</h5></div> */}
                                    <div className="graphTool toolPrint" title="打印图谱"><h5 className="print">打印</h5></div>
                                </div>
                            </div>
                            {/* <div className="graphAssistFeatures">
                                <div className="toolBut layout" onClick={() => { changeLayout() }}></div>
                                <div className="toolBut layout" title="切换布局"><img className="toolImg" src={svg_layout_url} onClick={() => { changeLayout() }} alt="change layout"></img></div>
                            </div> */}
                        </div>

                        <div id="layoutDiv">
                            <div id="layouts">
                                <div className="layoutSet toolCrossLayout focus" title="对照标注位置布局">对应</div>
                                <div className="layoutSet toolForceLayout" title="力引导布局">力导</div>
                                <div className="layoutSet toolDragLayout" title="自定义拖动布局">拖动</div>
                            </div>
                        </div>

                        <div ref={chart} id="graph" >
                        </div>
                    </div>
                    <div id="attributeDiv">
                        {/* <div id="attributeBox"  >
                            {showEntityAttribute(currentEntity)}
                        </div> */}
                        <div id="relationshipBox"  >
                            {showRelationshipAttribute(relationshipContext.array)}
                        </div>
                    </div>
                </div>
            </div>
        </React.StrictMode >
    )
}