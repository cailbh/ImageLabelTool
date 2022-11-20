
import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
import { Entity, Relationship } from '../../lib/interface'
import { useEntityArray, useEntityArrayUpdate, useRelationshipArray, useRelationshipArrayUpdate } from "../../lib/context";
import { Button, Divider } from 'antd';
import './index.css';
import { EntityArray, RelationshipArray } from "../../lib/interface";
import ColorPicker from "../ColorPicker"
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/dist/css/rsuite-table.css';
// import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.css';
export default function GraphRelationship(props) {

    //编辑实体
    const [tempRelationship, setTempRelationship] = useState<Relationship>();
    //全局实体列表
    const relationshipContext = useRelationshipArray();

    const updateRelationshipArray = useRelationshipArrayUpdate()

    const entityContext = useEntityArray();
    const updateEntityArray = useEntityArrayUpdate()
    let dataList = useRef(null)
    dataList.current = [
    ];
    let data = []
    let rel = props.relationship
    // data.push(rel)
    dataList.current = rel
    const nameChange = (event, id, attr) => {
        // let relationshipTp = props.relationship.find((rel) => { return rel.id == id })
        // if (attr == 'name') {
            // relationshipTp.name = event.target.value
        // }
        // else if (attr == "color") {
        //     relationshipTp.color = event.target.value
        // }
        // event.target.value = event.target.value
        // // else if (attr == "describe") {
        // //     tempRelationship.describe = event.target.value
        // // }
        let name = event.target.value
        // setTempRelationship(relationshipTp)
            window.addEventListener("keyup", (e) => {
                if ("Enter" === e.key) {
                    relationshipContext.array.forEach(function (item, index, arr) {
                        if (item.id == id) {
                            arr[index].name = name
                            event.target.value = null
                            }
                        })
                event.target.blur()
                window.onkeyup = null
                updateRelationshipArray([...relationshipContext.array])
                }
            })
        }
    const changeColor = (c) => {
        let rgb = c.rgb
        tempRelationship.color = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")"
        setTempRelationship(tempRelationship)
    }
    const confirmAttr = () => {
        console.log(tempRelationship)
        let relationshipTempId = tempRelationship.id
        //     let relationshipPre = relationshipContext.array.find(function (item, index, arr) {
        //         return item.id === relationshipId
        //     })
        relationshipContext.array.forEach(function (item, index, arr) {
            if (item.id == relationshipTempId) {
                arr[index] = tempRelationship
            }
        })
        updateRelationshipArray([...relationshipContext.array])
        // this.forceUpdate();

    }
    const deleteAttr = (e,id) => {
        let i = -1
        relationshipContext.array.forEach(function (item, index, arr) {
            if (item.id == id) {
                i = index
            }
        })
        relationshipContext.array.splice(i,1)
        let inps = document.getElementById("smallInput_name")
        inps.blur()
        updateRelationshipArray([...relationshipContext.array])

    }

    const rowData=(data)=>{
        return (
            data.map((item, index) => {
                let source = entityContext.array.find((d) => { return d.id == item.sourceId })
                let target = {name:""}
                if (item.type != 'root') {
                source = entityContext.array.find((d) => { return d.id == item.sourceId })
                target = entityContext.array.find((d) => { return d.id == item.targetId })
                }
                    //                         return <input type="text" className = "smallInput" placeholder={'root'} />
                    //                     }
                    //                     let source = entityContext.array.find((d) => { return d.id == rowData.sourceId })
            
                    //                     return <input type="text" className = "smallInput" placeholder={source.name} onChange={(e) => nameChange(e, rowData.id, "source")} />
                    //                     // return <p>{source.name} </p>
                return (
                    <div className="relRowR">
                        <div  className="relRow relHead">
                            <input type="text" className = "smallInput" placeholder={source.name} onChange={(e) => nameChange(e, item.id, "source")} />
                        </div>
                        <div  className="relRow relType">
                        <input type="text" id="smallInput_name" className = "smallInput" placeholder={item.name} onChange={(e) => nameChange(e, item.id, "name")} />
                        </div>
                        <div  className="relRow relTail">
                            <input type="text" className = "smallInput" placeholder={target.name} onChange={(e) => nameChange(e,item.id, "target")} />
                        </div>
                        <div  className="relRow relTail">
                            <input type="text" className = "smallInput" placeholder={item.divor} onChange={(e) => nameChange(e,item.id, "divor")} />
                        </div>
                        {/* <div  className="relBut">
                        <Button type="primary" className="confirmButton" onClick={() => confirmAttr()}>
                            确定
                        </Button>
                        </div>
                        <div  className="relBut">
                        <Button type="primary" className="deleteButton" onClick={(e) => deleteAttr(e,item.id)}>
                            删除
                        </Button>
                        </div> */}
                    </div>
                )
            })
        )
    }

    //初始化
    useEffect(() => {
        setTempRelationship(props.relationship)
    }, []);//初始化
    useEffect(() => {
        setTempRelationship(props.relationship)
    }, [props.relationship]);
    useEffect(() => {
        dataList.current = relationshipContext.array
    }, [relationshipContext.array]);
    useEffect(() => {
    }, [dataList.current]);
    return (
            <div id="relationship-table">
                <div className="relationship-table-head">
                    <div className="relationship-table-head-co">Head</div>
                    <div className="relationship-table-head-co">Relationship</div>
                    <div className="relationship-table-head-co">Tail</div>
                    <div className="relationship-table-head-co">Type</div>
                </div>
                <div className="relationship-table-body">
                {rowData(dataList.current)}
                </div>
            </div>
    )
}