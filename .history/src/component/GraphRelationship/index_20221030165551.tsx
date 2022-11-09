
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
        let relationshipTp = props.relationship.find((rel) => { return rel.id == id })
        if (attr == 'name') {
            relationshipTp.name = event.target.value
        }
        else if (attr == "color") {
            relationshipTp.color = event.target.value
        }
        // else if (attr == "describe") {
        //     tempRelationship.describe = event.target.value
        // }
        setTempRelationship(relationshipTp)
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

    }
    const deleteAttr = (e,id) => {
        let i = -1
        relationshipContext.array.forEach(function (item, index, arr) {
            if (item.id == id) {
                i = index
            }
        })
        relationshipContext.array.splice(i,1)
        let inps = document.querySelectorAll(".smallInput") as NodeListOf<HTMLElement>;
        console.log(inps)
        for(let inp in inps ){
            inps[inp].blur()
        }
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
                    <Row className="align-items-center">
                        <Col xs="auto" className="relRow relHead">
                            <input type="text" className = "smallInput" placeholder={source.name} onChange={(e) => nameChange(e, item.id, "source")} />
                        </Col>
                        <Col xs="auto" className="relRow relType">
                        <input type="text" className = "smallInput" placeholder={item.name} onChange={(e) => nameChange(e, item.id, "name")} />
                        </Col>
                        <Col xs="auto" className="relRow relTail">
                            <input type="text" className = "smallInput" placeholder={target.name} onChange={(e) => nameChange(e,item.id, "target")} />
                        </Col>
                        <Col xs="auto" className="relRow relTail">
                            <input type="text" className = "smallInput" placeholder={item.color} onChange={(e) => nameChange(e,item.id, "color")} />
                        </Col>
                        <Col xs="auto" className="relBut">
                        <Button type="primary" className="confirmButton" onClick={() => confirmAttr()}>
                            确定
                        </Button>
                        </Col>
                        <Col xs="auto" className="relBut">
                        <Button type="primary" className="deleteButton" onClick={(e) => deleteAttr(e,item.id)}>
                            删除
                        </Button>
                        </Col>
                    </Row>
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
    return (
<div id="relationship-table">
    <div className="relationship-table-head">
        <div className="relationship-table-head-co">Head</div>
        <div className="relationship-table-head-co">Relationship</div>
        <div className="relationship-table-head-co">Tail</div>
        <div className="relationship-table-head-co">Type</div>
    </div>
    <div className="relationship-table-body">
    <Form>
      {rowData(dataList.current)}
    </Form>
    </div>
</div>
        // <div id="relationship-table">
        //     {/* <ColorPicker></ColorPicker> */}
        //     <Table data={dataList.current} className="tableRelationship">
        //         <Column width={70} resizable>
        //             <HeaderCell>头</HeaderCell>
        //             {/* <Cell dataKey="name" /> */}
        //             <Cell>
        //                 {(rowData, rowIndex) => {

        //                     if (rowData.type == 'root') {
        //                         return <input type="text" className = "smallInput" placeholder={'root'} />
        //                     }
        //                     let source = entityContext.array.find((d) => { return d.id == rowData.sourceId })

        //                     return <input type="text" className = "smallInput" placeholder={source.name} onChange={(e) => nameChange(e, rowData.id, "source")} />
        //                     // return <p>{source.name} </p>
        //                 }}
        //             </Cell>
        //         </Column>
        //         <Column width={70} resizable>
        //             <HeaderCell>关系</HeaderCell>
        //             {/* <Cell dataKey="name" /> */}
        //             <Cell>
        //                 {(rowData, rowIndex) => {
        //                     return <input type="text" className = "smallInput" placeholder={rowData.name} onChange={(e) => nameChange(e, rowData.id, "name")} />
        //                 }}
        //             </Cell>
        //         </Column>
        //         <Column width={70} resizable>
        //             <HeaderCell>尾</HeaderCell>
        //             {/* <Cell dataKey="name" /> */}
        //             <Cell>
        //                 {(rowData, rowIndex) => {

        //                     if (rowData.type == 'root') {
        //                         return <input type="text" className = "smallInput" placeholder={'root'} />
        //                     }
        //                     console.log(rowData, entityContext)
        //                     let target = entityContext.array.find((d) => { return d.id == rowData.targetId })
        //                     return <input type="text" className = "smallInput" placeholder={target.name} onChange={(e) => nameChange(e, rowData.id, "target")} />
        //                 }}
        //             </Cell>
        //         </Column>
        //         <Column width={70} resizable>
        //             <HeaderCell>颜色</HeaderCell>
        //             {/* <Cell dataKey="name" /> */}
        //             <Cell>
        //                 {(rowData, rowIndex) => {
        //                     return <input type="text" className = "smallInput" placeholder={rowData.color} onChange={(e) => nameChange(e, rowData.id, "color")} />
        //                 }}
        //             </Cell>
        //         </Column>

        //         <Column width={100} resizable>
        //             <HeaderCell> </HeaderCell>
        //             {/* <Cell dataKey="type" /> */}
        //             <Cell> <Button type="primary" onClick={() => confirmAttr()}>确定</Button></Cell>
        //         </Column>
        //     </Table>
        // </div >
    )
}