
import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
import { Entity } from '../../lib/interface'
import { useEntityArray, useEntityArrayUpdate } from "../../lib/context";
import { Button, Divider } from 'antd';
import ColorPicker from "../ColorPicker"
import './index.css';
import { changeConfirmLocale } from "antd/lib/modal/locale";
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/dist/css/rsuite-table.css';

export default function GraphEntity(props) {

    //编辑实体
    const [tempEntity, setTempEntity] = useState<Entity>();
    //全局实体列表
    const entityContext = useEntityArray();
    const updateEntityArray = useEntityArrayUpdate()
    const nameChange = (event, attr) => {
        if (attr == 'name') {
            tempEntity.name = event.target.value
        }
        else if (attr == "type") {
            tempEntity.type = event.target.value
        }
        else if (attr == "describe") {
            tempEntity.describe = event.target.value
        }
        else if (attr == "color") {
            tempEntity.color = event.target.value
        }
        setTempEntity(tempEntity)
    }
    let dataList = useRef(null)
    dataList.current = [
    ];
    let data = []
    let ent = props.entity
    data.push(ent)
    dataList.current = data

    const ImageCell = ({ rowData, dataKey, ...rest }) => (
        <Cell {...rest}>
            <img src={rowData[dataKey]} width="50" />
        </Cell>
    );
    const changeColor = (c) => {
        let rgb = c.rgb
        tempEntity.color = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")"
        setTempEntity(tempEntity)
    }
    const confirmAttr = () => {
        let entityTempId = tempEntity.id
        //     let entityPre = entityContext.array.find(function (item, index, arr) {
        //         return item.id === entityId
        //     })
        entityContext.array.forEach(function (item, index, arr) {
            if (item.id == entityTempId) {
                arr[index] = tempEntity
            }
        })
        updateEntityArray([...entityContext.array])

    }
    //初始化
    useEffect(() => {
        console.log(props)
        setTempEntity(props.entity)
        let data = []
        // props.entity.forEach((ent)=>{
        //     let tp = {}
        //     tp.name = ent.name

        // })
        let ent = props.entity
        data.push(ent)
        dataList.current = data
        console.log(dataList.current)

    }, []);//初始化
    useEffect(() => {

        setTempEntity(props.entity)

    }, [props.entity]);
    return (
        <div id="entity-table" >
            {/* 名称：{props.entity.name}<input type="text" id="smallInput" placeholder={props.entity.name} onChange={(e) => nameChange(e, "name")} />
            类型：{props.entity.type}<input type="text" id="smallInput" placeholder={props.entity.type} onChange={(e) => nameChange(e, "type")} />
            描述：{props.entity.describe}<input type="text" id="bigInput" placeholder={props.entity.describe} onChange={(e) => nameChange(e, "describe")} /> */}
            {/* 名称：{props.entity.name}<input type="text" id="smallInput" placeholder={props.entity.name} onChange={(e) => nameChange(e, "name")} />
            类型：{props.entity.type}<input type="text" id="smallInput" placeholder={props.entity.type} onChange={(e) => nameChange(e, "type")} />
            颜色：{props.entity.color}<input type="text" id="smallInput" placeholder={props.entity.color} onChange={(e) => nameChange(e, "color")} />
            <ColorPicker color={props.entity.color} changeColor={changeColor} ></ColorPicker> */}
            {/* <Button type="primary" onClick={() => confirmAttr()}>确定</Button> */}
            <Table data={dataList.current} className="tableEntity" rowClassName="tableEntityRow">

                <Column width={70} resizable>
                    <HeaderCell>实体</HeaderCell>
                    <Cell>
                        {(rowData, rowIndex) => {
                            return <input type="text" id="smallInput" placeholder={rowData.id + ""} onChange={(e) => nameChange(e, "index")} />
                        }}</Cell>
                </Column>
                <Column width={70} resizable>
                    <HeaderCell>名称</HeaderCell>
                    {/* <Cell dataKey="name" /> */}
                    <Cell><input type="text" id="smallInput" placeholder={props.entity.name} onChange={(e) => nameChange(e, "name")} /></Cell>
                </Column>

                <Column width={70} resizable>
                    <HeaderCell>类型</HeaderCell>
                    {/* <Cell dataKey="type" /> */}
                    <Cell><input type="text" id="smallInput" placeholder={props.entity.type} onChange={(e) => nameChange(e, "type")} /></Cell>
                </Column>

                <Column width={70} resizable>
                    <HeaderCell>颜色</HeaderCell>
                    {/* <Cell dataKey="type" /> */}
                    {/* <Cell><ColorPicker color={props.entity.color} changeColor={changeColor} ></ColorPicker></Cell> */}
                    <Cell><input type="text" id="smallInput" placeholder={props.entity.color} onChange={(e) => nameChange(e, "color")} /></Cell>
                </Column>

                <Column width={70} resizable>
                    <HeaderCell> </HeaderCell>
                    {/* <Cell dataKey="type" /> */}
                    <Cell> <Button type="primary" onClick={() => confirmAttr()}>确定</Button></Cell>
                </Column>
            </Table>
        </div >
    )
}