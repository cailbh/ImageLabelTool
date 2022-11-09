import React, { useEffect, useState, useCallback, useRef, useContext } from "react";
import './index.css';
import './graph.css'
import { Button, Card, message, Tag, Alert, Progress, Select } from 'antd';
import ReactDom from 'react-dom'
import LabelImage from '../../lib/webAnnotate'
import Task from '../../lib/tasks'
import AttributeInput from '../AttributeInput'
import svg_input_url from "../../assets/imgs/tool-openField.svg"
import GraphRelationship from "../GraphRelationship"
import png_entity_url from "../../assets/imgs/entity.png"
import { MemoArray, Entity, EntityArray, Relationship, RelationshipArray, Info } from '../../lib/interface'
import { useEntityArray, useRelationshipArray, useEntityArrayUpdate, useRelationshipArrayUpdate, useInfo, useInfoUpdate, useMemoArray, useMemoArrayUpdate } from "../../lib/context";
import uuid from "../../lib/uuid"
// import imgimg from "../img";
import axios from '../../axios/index'

const d3 = require('d3')

export default function LabelDisplay() {


    let imgFiles = useRef(null);
    let imgSum = useRef(0);//图片数量
    let imgIndex = useRef(1);//当前图片下标
    const canvasMain = document.querySelector('.canvasMain');
    const resultGroup = document.querySelector('.resultGroup');

    let update = useRef(null)
    let task = useRef<Task | null>(new Task({}))

    const mcolor= [
        "rgb(255,60,60)",
        "rgb(155,20,100)",
        "rgb(255,83,255)",
        "rgb(200,100,50)",
        "rgb(235,135,162)",
        "rgb(200,200,102)",
        "rgb(255,178,101)",
        "rgb(63,151,134)",
        "rgb(83,155,255)",
        "rgb(50,200,120)",
        "rgb(2,50,200)",
        "rgb(0,122,244)",
        "rgb(150,122,244)",
        "rgb(168,168,255)",
        "rgb(200,200,200)",
      ];
    //实体列表
    let entityArray = useRef(null)
    //实体关系列表
    let relationshipArray = useRef(null)
    //全局实体列表
    const entityContext = useEntityArray();
    const updateEntityArray = useEntityArrayUpdate()
    // 全局关系列表
    const relationshipContext = useRelationshipArray();
    const updateRelationshipArray = useRelationshipArrayUpdate()
    //删除实体列表
    const delEntityArray = useRef(null)
    //删除实体关系列表
    const delRelationshipArray = useRef(null)
    // 全局回收站储存
    const memoContext = useMemoArray();
    const updateMemoArray = useMemoArrayUpdate()
    // 全局信息传递
    const infoContext = useInfo();
    const updateInfo = useInfoUpdate()
    // 下拉框
    const [imagesList, setimagesList] = useState([]);

    // 设置实体名称
    const nameTp = useRef(null);
    // 设置实体属性
    const attributesTp = useRef(null);
    //
    const attrInddex = useRef(null);
    // 关系类型
    let relType = useRef(null);
    // 图像数据
    let imgData = useRef(null);
    // 重叠实体
    let inpolList = useRef(null);
    
    const chart = useRef(null);

    const canvas = document.getElementById('canvas')
    const processIndex = document.getElementById('processIndex')        // 当前标注进度
    const processSum = document.getElementById('processSum');               // 当前标注任务总数

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

     const changeActive = useRef(null)
 
     const focusEntId = useRef(null)
 
     const [layoutType, setLayoutType] = useState(0)

    // const [img, setImgIndex] = useState<Labe>(1);
    let annotate = useRef<LabelImage | null>(null)


    const entityRecognize = ()=>{
        entityRecognizeApi()
    }
    //实体检测接口
    const entityRecognizeApi = async()=>{
        // let data = await axios.entityRecognize.testApi({
            
        // })
        // 将获取到的图像数据去除A通道
        var iData = imgData.current.data
        var imgArr = [];
        for(var i=0; i<iData.length; i += 4){
            imgArr.push(iData[i], iData[i+1], iData[i+2])
        }
        let data = await axios.entityRecognize.entityRecognizeApi({
            width:imgData.current.width,
            height:imgData.current.height,
            image:Array.from(imgArr),
            confidence:0.9
        })
        let boxs = data.bboxs
        console.log(data,boxs)
        for (var i =0;i<boxs.length;i++){
            console.log(boxs[i])
            var value = {}
            value['name'] = data.labels[i]
            CreateNewResultList(boxs[i][2],boxs[i][3] , "recognize", [boxs[i][0],boxs[i][1]],value);
            DrawSavedAnnotateInfoToShow();
            ReplaceAnnotateMemory();
            let index = annotate.current.Arrays.resultIndex - 1;
            RecordOperation('add', '绘制矩形框', index, JSON.stringify(annotate.current.Arrays.imageAnnotateMemory[index]));
        }

    }
 
    const folderBut = () => {
        var input = document.querySelector('.openFolderInput') as HTMLCanvasElement
        input.click()
    }

    // 导入文件夹
    const changeFolder = (e) => {
        let Files = e.target.files
        imgFiles.current = Files
        localStorage.clear()
        setimagesList(Array.from(Files))
        imgSum.current = (Files.length);
        imgIndex.current = (1)
        processSum.innerText = imgSum.current + "";
        // // // processSum.innerText = imgSum;
        selectImage(0);

    }
    //缩略图列表
    const formatScaleListData = (data) => {
        if (!data.length) return <></>;
        return (
            data.map((item, index) => {
                let img = item.name ? window.URL.createObjectURL(item) : item;
                return (
                    < div className="scaleListRow" >
                        <div className="scaleListImgDiv"> <img className="scaleListImg" src={img} onClick={() => { scaleClick(index) }}></img></div>
                        <div className="scaleListRowName">{item.name.split('.')[0]}</div>
                    </div >
                )
            })
        )
        // return <div></div>
    }
    //缩略图切换
    const scaleClick = (e) => {
        let ind = e
        annotate.current.Arrays.imageAnnotateMemory.length > 0 && localStorage.setItem(task.current.name, JSON.stringify(annotate.current.Arrays));  // 保存已标定的图片信息

        imgIndex.current = ind + 1;
        selectImage(imgIndex.current - 1)
    }    
    // 导入json
    const inputJson = (e) => {
        console.log(121231)
        let Files = e.target.files
        let reader = new FileReader();
        // 读取文件(以纯文本的形式返回文件内容)
        reader.readAsText(Files[0], "UTF-8");
        reader.onload = function (e) {
          // 文件内容字符串
        let file_string = e.target.result;
        let json = JSON.parse(JSON.stringify(file_string))
        let jsons = JSON.parse(json)
        annotate.current.Arrays.imageAnnotateMemory.splice(0,annotate.current.Arrays.imageAnnotateMemory.length)
        annotate.current.Arrays.relationshipAnnotateShower.splice(0,annotate.current.Arrays.relationshipAnnotateShower.length)
        annotate.current.Arrays.imageAnnotateMemory = jsons['ent']
        annotate.current.Arrays.relationshipAnnotateShower = jsons['rel']
        ReplaceAnnotateShow()
        updateEntityArrayTp();
        updateRelationshipArrayTp();
        RepaintResultList();
        //   console.log(8888, json,);
        }

    }
    //导入json
    const inputJsonClick = () => {
        var input = document.querySelector('.JsonInput') as HTMLCanvasElement
        input.click()    
    }
    //生成json并保存
    const saveJsonClick = () => {
        console.log("printing")
        let filename = task.current.name.split('.')[0] + '.json';
        annotate.current.Arrays.imageAnnotateMemory.length > 0 ? saveJson(annotate.current.Arrays.imageAnnotateMemory,annotate.current.Arrays.relationshipAnnotateShower, filename) : alert('当前图片未有有效的标定数据');
    }
    //生成json并保存
    const saveJson = (entdata,reldata, filename) => {
        let json =''
        if (!entdata) {
            alert('保存的数据为空');
            return false;
        }
        let data = {"ent":entdata,"rel":reldata}

        if (!filename) {
            filename = 'json.json';
        }
        if (typeof data === 'object') {
            json = JSON.stringify(data, undefined, 4);
        }
        let blob = new Blob([json], { type: 'text/json' }),
            e = document.createEvent('MouseEvent'),
            a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e)
    }

    const selectImage = (index) => {
        // openBox('#loading', true);
        processIndex.innerText = index + 1
        var name = imgFiles.current[index]['name']
        // task.current.name = (name)
        updateEntityArray([])
        updateRelationshipArray([])
        relationshipArray.current = []
        task.current.name = "听琴图" + index
        // task.current.size = "横51.3厘米，纵147.2厘米"
        task.current.time = "北宋"
        task.current.author = "赵佶"
        task.current.texture = "绢本"
        task.current.size = "横51.3厘米，纵147.2厘米"
        task.current.id = "task" + index

        // processIndex.innerText = imgIndex;
        // taskName.innerText = imgFiles.current[index].name || imgFiles.current[index].split('/')[3];
        let content = localStorage.getItem(task.current.name);
        let img = imgFiles.current[index].name ? window.URL.createObjectURL(imgFiles.current[index]) : imgFiles.current[index];
        content ? SetImage(img, JSON.parse(content)) : SetImage(img);
    }

    const SetImage = (src, memory = false) => {
        let _nodes = annotate.current.Nodes;
        _nodes.image = new Image();
        _nodes.image.crossOrigin = 'anonymous';
        _nodes.image.src = src;     

        // console.log(src)
        // //监听图片加载
        // _nodes.image.onload = function () {

        //     console.log(_nodes.image)
        // }
        _nodes.image.addEventListener('load', () => {

            // console.log(_nodes.image)
            annotate.current.iWidth = _nodes.image.width;
            annotate.current.iHeight = _nodes.image.height;

            var canvas = document.getElementById('canvas') as HTMLCanvasElement;
            var canvasContent = document.getElementById('canvasContent') as HTMLCanvasElement;
            canvas.width =canvasContent.clientWidth
            canvas.height = canvasContent.clientHeight
    
            //获取原有节点
            let beforeCanvas = _nodes.scaleCanvas.querySelectorAll('canvas');
            let bodyCanvas = document.querySelector(".bodyCanvas");

            //删除原有节点
            if (beforeCanvas.length > 0) {
                _nodes.scaleCanvas.removeChild(beforeCanvas[0]);
            }
            if (bodyCanvas) {
                document.body.removeChild(bodyCanvas)
            }



            // //初始化上一张图片标注数据
            for (let i = annotate.current.Nodes.resultGroup.children.length - 1; i >= 0; i--) {
                annotate.current.Nodes.resultGroup.removeChild(annotate.current.Nodes.resultGroup.children[i]);
            }
            for (let i = annotate.current.Nodes.historyGroup.children.length - 1; i >= 0; i--) {
                annotate.current.Nodes.historyGroup.removeChild(annotate.current.Nodes.historyGroup.children[i]);
            }
            // document.querySelector('.resultLength').innerHTML = "0";
            annotate.current.Arrays.imageAnnotateShower.splice(0, annotate.current.Arrays.imageAnnotateShower.length);
            annotate.current.Arrays.imageAnnotateMemory.splice(0, annotate.current.Arrays.imageAnnotateMemory.length);
            annotate.current.Arrays.history.splice(0, annotate.current.Arrays.history.length);
            annotate.current.Arrays.relationshipAnnotateShower.splice(0, annotate.current.Arrays.relationshipAnnotateShower.length);
            annotate.current.Arrays.relationshipAnnotateMemory.splice(0, annotate.current.Arrays.relationshipAnnotateMemory.length);

            //创建缩略图画板
            let sCanvas = document.createElement('canvas');
            _nodes.sCtx = sCanvas.getContext('2d');
            sCanvas.style.display = "inline-block;";

            // annotate.current.sWidth = (_nodes.scaleCanvas.getBoundingClientRect().width);
            // annotate.current.sHeight = (annotate.current.sWidth * annotate.current.iHeight / annotate.current.iWidth);
            // if (annotate.current.sHeight > _nodes.scaleCanvas.getBoundingClientRect().height) {
            //     annotate.current.sHeight = (_nodes.scaleCanvas.getBoundingClientRect().height);
            //     annotate.current.sWidth = (annotate.current.sHeight * annotate.current.iWidth / annotate.current.iHeight);
            // }
            let maxLen = 200
            annotate.current.sWidth = maxLen
            annotate.current.sHeight = (annotate.current.sWidth * annotate.current.iHeight / annotate.current.iWidth);
            if (annotate.current.sHeight > maxLen) {
                annotate.current.sHeight = maxLen
                annotate.current.sWidth = (annotate.current.sHeight * annotate.current.iWidth / annotate.current.iHeight);
            }
            sCanvas.width = annotate.current.sWidth;
            sCanvas.height = annotate.current.sHeight;
            _nodes.scaleCanvas.appendChild(sCanvas);


            // 创建数据存储面板
            _nodes.bCanvas = document.createElement('canvas');
            _nodes.bCanvas.width = annotate.current.iWidth;
            _nodes.bCanvas.height = annotate.current.iHeight;
            _nodes.bCanvas.style.display = "none";
            _nodes.bCanvas.className = "bodyCanvas";
            _nodes.bCtx = _nodes.bCanvas.getContext('2d');
            console.log(_nodes.image)
            // _nodes.bCtx.drawImage(_nodes.image, 0, 0, annotate.current.iWidth, annotate.current.iHeight);
            _nodes.bCtx.drawImage(_nodes.image, 100, 200, 100, 100, 0, 0, 100, 100)
            // _nodes.bCtx.translate(0.5, 0.5);
            document.body.appendChild(_nodes.bCanvas);
            // imgData.current =  _nodes.bCtx.getImageData(0, 0, annotate.current.iWidth, annotate.current.iHeight)

            annotate.current.scale = 0.5;
            // 图片初始定位
            // 初始化自适应缩放图片并居中
            if (annotate.current.iWidth > annotate.current.cWidth || annotate.current.iHeight > annotate.current.cHeight) {
                annotate.current.scale = annotate.current.iWidth - annotate.current.cWidth > annotate.current.iHeight - annotate.current.cHeight ? annotate.current.cWidth / annotate.current.iWidth : annotate.current.cHeight / annotate.current.iHeight;
            }
            let initImgX = (annotate.current.cWidth - annotate.current.iWidth * annotate.current.scale) / 2;
            let initImgY = (annotate.current.cHeight - annotate.current.iHeight * annotate.current.scale) / 2;
            SetXY(initImgX, initImgY);

            annotate.current.historyIndex = 0;
            if (memory != false) {
                annotate.current.Arrays = memory;
                // annotate.current.Nodes.resultGroup =null
                ReplaceAnnotateShow();
                updateEntityArrayTp();
                updateRelationshipArrayTp();
                RepaintResultList();
                annotate.current.Arrays.imageAnnotateMemory.forEach((memory, index) => {
                    RecordOperation('add', '绘制', index, JSON.stringify(memory));
                });
            }
            else {

                var tpId = "root" + (imgIndex.current)
                // if (!entityArray.current.some(function (d) { return d.id == tpId })) {
                let ent = new Entity('root')
                // ent.name = ""
                ent.id = tpId
                ent.type = "root"
                ent.color = "#fff"
                ent.visAble = false
                entityContext.array.push(ent)
                updateEntityArray(entityContext.array)
                // annotate.current.Arrays.imageAnnotateShower.push(ent)

                relationshipArray.current = []
                updateRelationshipArray(relationshipArray.current)
                // }
            }

            annotate.current.Nodes = _nodes
        })
    }

    const updateShowerByEntityArray = () => {
        annotate.current.Arrays.imageAnnotateShower.splice(0, annotate.current.Arrays.imageAnnotateShower.length)
        entityContext.array.forEach(element => {
            annotate.current.Arrays.imageAnnotateShower.push(element)
        });
    }

    const updateEntityArrayTp = () => {
        entityContext.array.splice(0, entityContext.array.length);
        annotate.current.Arrays.imageAnnotateShower.map((item, index) => {
            entityContext.array.push(item)
        })

        updateEntityArray(entityContext.array)
    }


    const updateRelationshipArrayTp = () => {
        relationshipArray.current.splice(0, relationshipArray.current.length);
        annotate.current.Arrays.relationshipAnnotateShower.forEach((item, index) => {
            relationshipArray.current.push(item)
        })
        updateRelationshipArray(relationshipArray.current)

    }
    //----设置功能参数
    const SetFeatures = (f, value) => {
        if (f === "crossOn" || f === "labelOn" || f === "layoutOn") {
            annotate.current.Features[f] = value;
        }
        else {
            for (let key in annotate.current.Features) {
                if (key !== "crossOn" && key !== "labelOn" && key !== "layoutOn") {
                    annotate.current.Features[key] = false;
                }
            }
        }
        annotate.current.Features[f] = value;


        // 清空标注结果列表中classList
        let resultList = annotate.current.Nodes.resultGroup.getElementsByClassName("result_list");
        for (let i = 0; i < resultList.length; i++) {
            resultList[i].classList.remove("active");
        }
        annotate.current.Arrays.resultIndex = 0;
        DrawSavedAnnotateInfoToShow(annotate.current.Arrays.resultIndex);
    };

    // const openBox = (e, isOpen) => {
    //     let el = document.querySelector(e);
    //     let maskBox = document.querySelector('.mask_box');
    //     if (isOpen) {
    //         maskBox.style.display = "block";
    //         el.style.display = "block";
    //     }
    //     else {
    //         maskBox.style.display = "none";
    //         el.style.display = "none";
    //     }
    // }

    //----通过已保存的坐标点计算矩形蒙层位置与大小，以及标签位置, 添加至数组列表中
    const CalcRectMask = (arrays) => {
        var len = arrays.length
        if (len >= 2) {

            // 保存边缘矩形框坐标点
            let xMin = arrays[0].x,
                xMax = arrays[0].x,
                yMin = arrays[0].y,
                yMax = arrays[0].y
                ;
            arrays.forEach((item) => {
                xMin = xMin < item.x ? xMin : item.x;
                xMax = xMax > item.x ? xMax : item.x;
                yMin = yMin < item.y ? yMin : item.y;
                yMax = yMax > item.y ? yMax : item.y;
            });
            annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].rectMask = {
                "xMin": xMin,
                "yMin": yMin,
                "width": xMax - xMin,
                "height": yMax - yMin
            };
            annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].centerPoint = ComputerCenterPoint(arrays)
            // 计算已创建的标签居中显示
            let labelX = (xMax - xMin) / 2 + xMin;
            let labelY = (yMax - yMin) / 2 + yMin;
            annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].labelLocation.x = labelX;
            annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].labelLocation.y = labelY;
        }
    };


    //----绘制矩形的方法
    const DrawRect = (ctx, x, y, width, height, color,lineWidth, rgb) => {
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.1
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.globalAlpha = 0.6
        ctx.strokeRect(x, y, width, height);
        ctx.globalAlpha = 1
    };

    //----绘制圆点的方法
    const DrawCircle = (ctx, x, y, color) => {
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(x, y, annotate.current.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, annotate.current.radius / 3, 0, 2 * Math.PI);
        ctx.fill();
    };

    //----绘制标签的方法
    const DrawRectLabel = (ctx, x, y, color, name, index) => {
        ctx.font = "12px Verdana";
        let txtWidth = ctx.measureText(name).width;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6
        ctx.fillRect(x , y - 20, txtWidth + 8, 20);
        ctx.globalAlpha = 1
        ctx.fillStyle = "rgba(255,255,255, 0.7)";
        ctx.fillText(name, x+4 , y - 5);
    };


    //----绘制已保存的标定信息（在数据操作更新时渲染）绘至数据展示画板
    const DrawSavedAnnotateInfoToShow = (resultIndex = 0) => {
        update.current = 0
        let _arrays = annotate.current.Arrays;
        let _nodes = annotate.current.Nodes;
        _nodes.ctx.clearRect(0, 0, annotate.current.cWidth, annotate.current.cHeight);
        _nodes.ctx.drawImage(_nodes.bCanvas, -annotate.current.x / annotate.current.scale, -annotate.current.y / annotate.current.scale, annotate.current.cWidth / annotate.current.scale, annotate.current.cHeight / annotate.current.scale, 0, 0, annotate.current.cWidth, annotate.current.cHeight);
        _nodes.ctx.setLineDash([0, 0]);



        var canvas = document.getElementById('canvas') as HTMLCanvasElement;
        // 画布宽度
        annotate.current.cWidth = canvas.clientWidth;
        // 画布高度
        annotate.current.cHeight = canvas.clientHeight;

        var indexs = []
        _arrays.imageAnnotateShower.forEach((item, index) => {
            if(item.showLabel==true){
            item['trend'] = item.trend
            item.lx = item.centerPoint[0]
            item.ly = item.centerPoint[1]
            item.ix = annotate.current.x
            item.iy = annotate.current.y
            item.iWidth = annotate.current.iWidth
            item.iHeight = annotate.current.iHeight
            item.iScale = annotate.current.scale
            item.trend.forEach((Item, Index) => {
                //绘制贝塞尔曲线
                drawBezierCurve(_nodes.ctx, Item.source, Item.target, Item.controlPoint1, Item.controlPoint2, 10, "#df9abc");
                if (_arrays.resultIndex !== 0 && _arrays.resultIndex - 1 === index) {
                    for (var i in Item) {
                        DrawCircle(_nodes.ctx, Item[i][0], Item[i][1], "#20c3f9");
                    }
                }
            })
            var step = 0 + _nodes.ctx.measureText(item.name).width+8;
            item.children.forEach((Item, Index) => {
                
                let ent = entityContext.array.find(function (d) { return d.id == Item })
                //绘制子标签
                let name = ent.name
                let x = item.rectMask.xMin +step 
                let y = item.rectMask.yMin
                let ctx = _nodes.ctx
                ctx.font = "8px Verdana";
                let txtWidth = ctx.measureText(name).width;
                ctx.fillStyle = item.color;
                ctx.globalAlpha = 0.6
                ctx.fillRect(x , y - 15, txtWidth + 8, 15);
                ctx.globalAlpha = 1
                ctx.fillStyle = "rgba(255,255,255, 0.7)";
                ctx.fillText(name, x+4 , y - 5);
                step = step + txtWidth+8
            })
            if (item.contentType === "polygon") {
                // 绘制闭合线条
                _nodes.ctx.beginPath();
                _nodes.ctx.lineWidth = annotate.current.lineWidth;
                _nodes.ctx.moveTo(item.content[0].x, item.content[0].y);
                item.content.forEach((line) => {
                    _nodes.ctx.lineTo(line.x, line.y);
                });
                // _nodes.ctx.fillStyle = "rgba(" + item.labels.labelColorRGB + "," + annotate.current.opacity + ")";
                // _nodes.ctx.fill();
                _nodes.ctx.strokeStyle = item.rgb
                _nodes.ctx.stroke();
            }
            else if (item.contentType === "rect") {
                DrawRect(_nodes.ctx, item.rectMask.xMin, item.rectMask.yMin, item.rectMask.width, item.rectMask.height, item.color,1, item.rgb);
            }
            if (_arrays.resultIndex !== 0 && _arrays.resultIndex - 1 === index) {
                item.content.forEach((circle) => {
                    // 绘制圆点
                    DrawCircle(_nodes.ctx, circle.x, circle.y, "#20c3f9");
                });
                // DrawCircle(_nodes.ctx, item.centerPoint[0], item.centerPoint[1], "#20c3f9");
            }
            if (item.content.length >= 2
                // && item.labels.visibility
            ) {
                // 绘制标签
                DrawRectLabel(_nodes.ctx,item.rectMask.xMin, item.rectMask.yMin, item.color, item.name, index + 1);
            }
            // 绘制矩形蒙层

            if (item.active) {
                _nodes.ctx.beginPath();
                _nodes.ctx.lineWidth = 3;
                _nodes.ctx.strokeStyle = item.color;
                _nodes.ctx.fillStyle = "rgba(255, 253, 77, 0)";
                _nodes.ctx.strokeRect(item.rectMask.xMin, item.rectMask.yMin, item.rectMask.width, item.rectMask.height);
                _nodes.ctx.fillRect(item.rectMask.xMin, item.rectMask.yMin, item.rectMask.width, item.rectMask.height);
                _nodes.ctx.closePath();
            }
            }
        });
        // indexs.forEach((i, ind) => {
        //     _arrays.imageAnnotateShower.splice(i - ind, 1)
        // })
        var relIndexs = []
        _arrays.relationshipAnnotateShower.forEach((item, index) => {
            let _relT = relationshipArray.current.find(function (i) { return i.id == item.id })
            if (_relT == undefined) {
                relIndexs.push(index)
            }
            else {
                let sourceId = item.sourceId
                let targetId = item.targetId
                // for(let i = 0;i<)
                if ((item.type != "root") && (item.type != "addChild")) {
                    let source = _arrays.imageAnnotateShower.find(function (i) { return i.id == sourceId }).centerPoint
                    let target = _arrays.imageAnnotateShower.find(function (i) { return i.id == targetId }).centerPoint

                    drawArrow(_nodes.ctx, source[0], source[1], target[0], target[1], 10, 10, 1, item.color);
                }
            }
        });
        relIndexs.forEach((i, ind) => {
            _arrays.relationshipAnnotateShower.splice(i - ind, 1)
        })
        ReplaceAnnotateMemory()
        updateEntityArrayTp()
        updateEntityArray(entityContext.array)
    };


    //----绘制已保存的标定信息（只在拖拽和缩放画布时渲染）绘画至数据存储面板
    const DrawSavedAnnotateInfoToMemory = (isRender) => {
        let _arrays = annotate.current.Arrays;
        let _nodes = annotate.current.Nodes;
        _nodes.bCtx.clearRect(0, 0, annotate.current.iWidth, annotate.current.iHeight);
        _nodes.bCtx.drawImage(_nodes.image, 0, 0, annotate.current.iWidth, annotate.current.iHeight);
        if (isRender) {
            _arrays.imageAnnotateMemory.forEach((item, index) => {
                if(item.showLabel==true){
                item.trend.forEach((Item, Index) => {
                    drawBezierCurve(_nodes.bCtx, Item.source, Item.target, Item.controlPoint1, Item.controlPoint2, 20, "#df9abc");
                })
                if (item.contentType === "polygon") {
                    // 绘制闭合线条
                    _nodes.bCtx.beginPath();
                    _nodes.bCtx.lineWidth = annotate.current.lineWidth;
                    _nodes.bCtx.moveTo(item.content[0].x, item.content[0].y);
                    item.content.forEach((line) => {
                        _nodes.bCtx.lineTo(line.x, line.y);
                    });

                    // _nodes.bCtx.strokeStyle = "#00f"
                    // _nodes.bCtx.fillStyle = "rgba(" + item.labels.labelColorRGB + "," + annotate.current.opacity + ")";
                    // _nodes.bCtx.fill();
                    _nodes.bCtx.strokeStyle = item.rgb
                    _nodes.bCtx.stroke();
                }
                else if (item.contentType === "rect") {
                    DrawRect(_nodes.bCtx, item.rectMask.xMin, item.rectMask.yMin, item.rectMask.width, item.rectMask.height, item.color,1, item.rgb);
                }

                _arrays.relationshipAnnotateShower.forEach((item, index) => {
                    // console.log(item, index)
                });
                if (_arrays.resultIndex !== 0 && _arrays.resultIndex - 1 === index) {
                    item.content.forEach((circle) => {
                        // 绘制圆点
                        DrawCircle(_nodes.bCtx, circle.x, circle.y, "#20c3f9");
                    });
                    // DrawCircle(_nodes.bCtx, item.centerPoint[0], item.centerPoint[1], "#20c3f9");
                }
                if (item.content.length >= 2
                    // && item.labels.visibility
                ) {
                    // 绘制标签
                    DrawRectLabel(_nodes.bCtx,item.rectMask.xMin, item.rectMask.yMin, item.color, item.name, index + 1);
                }
            }
            });

            _arrays.relationshipAnnotateShower.forEach((item, index) => {
                let sourceId = item.sourceId
                let targetId = item.targetId
                // for(let i = 0;i<)
                if (item.type != "root") {
                    let source = _arrays.imageAnnotateMemory.find(function (i) { return i.id == sourceId }).centerPoint
                    let target = _arrays.imageAnnotateMemory.find(function (i) { return i.id == targetId }).centerPoint

                    drawArrow(_nodes.bCtx, source[0], source[1], target[0], target[1], 10, 10, 3, "#20c3f9");
                }
            });
        }
        UpdateCanvas();
        !isRender && DrawSavedAnnotateInfoToShow();

    };


    //----缩略图画布点击定位函数
    const ScaleCanvasClick = (e) => {
        let p = CalculateChange(e, annotate.current.Nodes.scaleCanvas);
        let tmpX = annotate.current.cWidth / 2 - annotate.current.iWidth * annotate.current.scale * p.x / annotate.current.sWidth;
        let tmpY = annotate.current.cHeight / 2 - annotate.current.iWidth * annotate.current.scale * p.x / annotate.current.sWidth * p.y / p.x;
        SetXY(tmpX, tmpY);
        ReplaceAnnotateShow();
    };

    //----滚动条缩放事件
    const MouseWheel = (e) => {
        let wd = e.wheelDelta || e.detail;
        let newScale = annotate.current.scale * (1 + (wd > 0 ? annotate.current.scaleStep : -annotate.current.scaleStep));
        newScale = newScale < annotate.current.minScale ? annotate.current.minScale : newScale;
        newScale = newScale > annotate.current.maxScale ? annotate.current.maxScale : newScale;

        if (newScale !== annotate.current.scale) {
            let p = CalculateChange(e, annotate.current.Nodes.canvas);
            let newX = (annotate.current.x - p.x) * newScale / annotate.current.scale + p.x;
            let newY = (annotate.current.y - p.y) * newScale / annotate.current.scale + p.y;
            annotate.current.scale = newScale;
            SetXY(newX, newY);
        }
        clearTimeout(annotate.current.mousewheelTimer);
        annotate.current.mousewheelTimer = setTimeout(() => {
            IsMouseWheelEnd()
        }, 500);
        if (annotate.current.drawFlag) {
            DrawSavedAnnotateInfoToMemory(true);
            annotate.current.drawFlag = false;
        }
    };
    //----监听滚动条缩放是否结束
    const IsMouseWheelEnd = () => {
        ReplaceAnnotateShow();
        DrawSavedAnnotateInfoToMemory(false);
        annotate.current.drawFlag = true;
    };

    const zoom = (type) => {

        let newScale = annotate.current.scale * (1 + (type == "In" ? annotate.current.scaleStep : -annotate.current.scaleStep));
        newScale = newScale < annotate.current.minScale ? annotate.current.minScale : newScale;
        newScale = newScale > annotate.current.maxScale ? annotate.current.maxScale : newScale;

        if (newScale !== annotate.current.scale) {
            let p = { x: 0, y: 0 }
            let newX = (annotate.current.x - p.x) * newScale / annotate.current.scale + p.x;
            let newY = (annotate.current.y - p.y) * newScale / annotate.current.scale + p.y;
            annotate.current.scale = newScale;
            SetXY(newX, newY);
        }

        ReplaceAnnotateShow();
        DrawSavedAnnotateInfoToMemory(false);
        // annotate.current.drawFlag = true;
    }

    //----设置图片位置，防止图片被拖出画布
    const SetXY = (vx, vy) => {
        if (vx < annotate.current.appearSize - annotate.current.iWidth * annotate.current.scale) {
            annotate.current.x = annotate.current.appearSize - annotate.current.iWidth * annotate.current.scale;
        }
        else if (vx > annotate.current.cWidth - annotate.current.appearSize) {
            annotate.current.x = annotate.current.cWidth - annotate.current.appearSize;
        }
        else {
            annotate.current.x = vx;
        }

        if (vy < annotate.current.appearSize - annotate.current.iHeight * annotate.current.scale) {
            annotate.current.y = annotate.current.appearSize - annotate.current.iHeight * annotate.current.scale;
        }
        else if (vy > annotate.current.cHeight - annotate.current.appearSize) {
            annotate.current.y = annotate.current.cHeight - annotate.current.appearSize;
        }
        else {
            annotate.current.y = vy;
        }
        // console.log()
        UpdateCanvas();
    };

    //----更新画板数据, 将存储面板数据绘制到展示面板以及缩略图面板
    const UpdateCanvas = () => {
        let _nodes = annotate.current.Nodes;
        _nodes.ctx.clearRect(0, 0, annotate.current.cWidth, annotate.current.cHeight);
        _nodes.sCtx.clearRect(0, 0, annotate.current.sWidth, annotate.current.sWidth * annotate.current.iHeight / annotate.current.iHeight);

        _nodes.ctx.drawImage(_nodes.bCanvas, -annotate.current.x / annotate.current.scale, -annotate.current.y / annotate.current.scale, annotate.current.cWidth / annotate.current.scale, annotate.current.cHeight / annotate.current.scale, 0, 0, annotate.current.cWidth, annotate.current.cHeight);
        _nodes.sCtx.drawImage(_nodes.bCanvas, 0, 0, annotate.current.iWidth, annotate.current.iHeight, 0, 0, annotate.current.sWidth, annotate.current.sHeight);

        // 将缩略图方框区域绘制到画布
        let width = annotate.current.sWidth * annotate.current.cWidth / annotate.current.iWidth / annotate.current.scale;
        let height = width * annotate.current.cHeight / annotate.current.cWidth;
        let offsetWidth = _nodes.sCtx.canvas.offsetLeft
        let offsetHeight = _nodes.sCtx.canvas.offsetTop
        let left = - annotate.current.x * annotate.current.sWidth / (annotate.current.iWidth * annotate.current.scale);
        let top = -annotate.current.y * annotate.current.sWidth / (annotate.current.iWidth * annotate.current.scale);
        // 将方框宽度固定在缩略图面板中
        if (width + left >= annotate.current.sWidth) {
            width = annotate.current.sWidth - left;
            left = annotate.current.sWidth - width;
            if (width >= annotate.current.sWidth) {
                width = annotate.current.sWidth;
                left = 0;
            }
        }
        else if (left <= 0) {
            width += left;
            left = 0;
        }

        // 将方框高度固定在缩略图面板中
        if (height + top >= annotate.current.sHeight) {
            height = annotate.current.sHeight - top;
            top = annotate.current.sHeight - height;
            if (height >= annotate.current.sHeight) {
                height = annotate.current.sHeight;
                top = 0;
            }
        }
        else if (top <= 0) {
            height += top;
            top = 0;
        }
        annotate.current.Nodes = _nodes
        _nodes.scaleRect.style.left = offsetWidth + left + "px";
        _nodes.scaleRect.style.top = offsetHeight + top + "px";
        if (width !== Number(_nodes.scaleRect.style.width)) {
            _nodes.scaleRect.style.width = width + "px";
            _nodes.scaleRect.style.height = height + "px";
        }

        _nodes.scalePanel.innerText = (annotate.current.scale * 100).toFixed(2) + "%";
    };


    //----Y坐标点装换， 防止绘制到图片外
    const YPointReplace = (y) => {
        if (y < annotate.current.y) {
            y = annotate.current.y
        }
        else if (y > annotate.current.iHeight * annotate.current.scale + annotate.current.y) {
            y = annotate.current.iHeight * annotate.current.scale + annotate.current.y
        }
        return y
    };
    //----X坐标点装换， 防止绘制到图片外
    const XPointReplace = (x) => {
        if (x < annotate.current.x) {
            x = annotate.current.x
        }
        else if (x > annotate.current.iWidth * annotate.current.scale + annotate.current.x) {
            x = annotate.current.iWidth * annotate.current.scale + annotate.current.x
        }
        return x
    };

    //----获取更新鼠标在当前展示画板中的位置
    const GetMouseInCanvasLocation = (e) => {
        annotate.current.mouseX = XPointReplace(e.layerX || e.offsetX);
        annotate.current.mouseY = YPointReplace(e.layerY || e.offsetY);
    };



    //----监听画板鼠标移动
    const CanvasMouseMove = (e) => {
        let _nodes = annotate.current.Nodes;
        let _arrays = annotate.current.Arrays;
        GetMouseInCanvasLocation(e);
        if (_arrays.resultIndex !== 0) {
            let imageIndexShow = _arrays.imageAnnotateShower[_arrays.resultIndex - 1].content;
            if (imageIndexShow.length > 0) {
                for (let i = 0; i < imageIndexShow.length; i++) {
                    // 使用勾股定理计算鼠标当前位置是否处于当前点上
                    let distanceFromCenter = Math.sqrt(Math.pow(imageIndexShow[i].x - annotate.current.mouseX, 2) + Math.pow(imageIndexShow[i].y - annotate.current.mouseY, 2));
                    // 改变圆点颜色动画
                    if (distanceFromCenter <= annotate.current.radius) {
                        _nodes.canvas.style.cursor = "grabbing";
                        return;
                    }
                    else {
                        _nodes.canvas.style.cursor = "crosshair";
                    }
                }
            }

            let curves = _arrays.imageAnnotateShower[_arrays.resultIndex - 1].trend;
            if (curves.length > 0) {
                for (let i = 0; i < curves.length; i++) {
                    for (var c in curves[i]) {
                        if (c != 'id') {
                            let distanceFromCenter = Math.sqrt(Math.pow(curves[i][c][0] - annotate.current.mouseX, 2) + Math.pow(curves[i][c][1] - annotate.current.mouseY, 2));
                            if (distanceFromCenter <= annotate.current.radius) {
                                _nodes.canvas.style.cursor = "grabbing";
                                return;
                            }

                            else {
                                _nodes.canvas.style.cursor = "crosshair";
                            }
                        }
                        // 
                    }
                }
            }
        }
    };

    //----判断点是否在多边形内部
    const inpolygon = (content, point) => {
        let angle = 0
        let len = content.length
        const ang = (x1, y1, x2, y2) => {
            let ans = x1 * x2 + y1 * y2;
            let base = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2);
            ans /= base;
            return Math.acos(ans);
        }
        for (let i = 0; i < len; i++) {
            let x1 = content[i].x - point.x
            let y1 = content[i].y - point.y
            let x2 = content[(i + 1) % len].x - point.x
            let y2 = content[(i + 1) % len].y - point.y
            angle += ang(x1, y1, x2, y2)
        }
        if (Math.abs(angle - 2 * Math.PI) < 0.000001) {
            return true;
        } else {
            return false;
        }

    }
    //选择重叠的实体中具体的某一个
    const chooseEnt = (e)=>{
        let _arrays = annotate.current.Arrays;
        GetMouseInCanvasLocation(e);
        var Rsize = 50;
        var Rstep = Math.PI*2/inpolList.current.length
        let tht = 0
        for(let i=0;i<inpolList.current.length;i++){
            let but = document.createElement('div');
            let canvasArea = document.querySelector('.canvasContent');
            tht = Rstep *i
            let id ="chooseEntBut"+inpolList.current[i]
            let buts = document.getElementById(id)
            console.log(buts)
            if(buts)
            canvasArea.removeChild(buts)
            let ent = _arrays.imageAnnotateShower[inpolList.current[i]-1]
            // canvasArea.appendChild(input);
            but.id = id
            but.style.left = annotate.current.mouseX + Rsize*Math.cos(tht)-Rsize/2 + 'px'
            but.style.top = annotate.current.mouseY + Rsize*Math.sin(tht)-Rsize/2 + 'px'
            but.style.background = ent.color
            but.className = "chooseEntBut"
            but.addEventListener('click',(e)=>{
                _arrays.resultIndex = inpolList.current[i]
                
                let ent = _arrays.imageAnnotateShower[_arrays.resultIndex - 1]
                nameTp.current = ent.name 
                attributesTp.current = ent.attribute
                for(let j=0;j<inpolList.current.length;j++){
                let buts = document.getElementById("chooseEntBut"+inpolList.current[j])
                canvasArea.removeChild(buts)} 
                inpolList.current = []
                annotate.current.Nodes.canvas.removeEventListener('mouseup', chooseEnt);
                DrawSavedAnnotateInfoToShow()
            })
            canvasArea.appendChild(but)
        }
    }

    //----监听画板鼠标点击
    const CanvasMouseDown = (e) => {
        let _nodes = annotate.current.Nodes;
        let _arrays = annotate.current.Arrays;
        GetMouseInCanvasLocation(e);
        if (e.button === 0) {
            annotate.current.isDragCircle = false;
            let list = _arrays.imageAnnotateShower
            if(inpolList.current.length>0){
                for(let j=0;j<inpolList.current.length;j++){
                    let canvasArea = document.querySelector('.canvasContent');  
                    let buts = document.getElementById("chooseEntBut"+inpolList.current[j])
                    if(buts)
                    canvasArea.removeChild(buts)
                }
            }
            inpolList.current = []
            for (let i = 0; i < list.length; i++) {
                if(list[i].showLabel){
                let con = list[i].content
                if (inpolygon(con, { x: annotate.current.mouseX, y: annotate.current.mouseY })) {
                    // _arrays.resultIndex = i + 1
                    inpolList.current.push(i+1)
                }
                }
            }
            if(inpolList.current.length>0 && _arrays.resultIndex == 0){
                annotate.current.Nodes.canvas.addEventListener('mouseup',chooseEnt);
            }
            else if(inpolList.current.length == 0){
                _arrays.resultIndex = 0
            }
            DrawSavedAnnotateInfoToShow()
            if (_arrays.resultIndex !== 0) {
                let imageIndex = _arrays.imageAnnotateShower[_arrays.resultIndex - 1].content;
                let ent = _arrays.imageAnnotateShower[_arrays.resultIndex - 1]
                if (imageIndex.length > 0) {
                    for (let i = 0; i < imageIndex.length; i++) {
                        // 使用勾股定理计算鼠标当前位置是否处于当前点上
                        let distanceFromCenter = Math.sqrt(Math.pow(imageIndex[i].x - annotate.current.mouseX, 2) + Math.pow(imageIndex[i].y - annotate.current.mouseY, 2));
                        if (distanceFromCenter <= annotate.current.radius) {
                            annotate.current.isDragCircle = true;
                            annotate.current.snapCircleIndex = i;
                            if (_arrays.imageAnnotateShower[_arrays.resultIndex - 1].contentType === "rect") {
                                annotate.current.Nodes.canvas.addEventListener('mousemove', DragRectCircleRepaintRect);
                                annotate.current.Nodes.canvas.addEventListener('mouseup', RemoveDragRectCircle);
                            }
                            else if (_arrays.imageAnnotateShower[_arrays.resultIndex - 1].contentType === "polygon") {
                                annotate.current.Nodes.canvas.addEventListener('mousemove', CircleDrag);
                                annotate.current.Nodes.canvas.addEventListener('mouseup', RemoveCircleDrag);
                            }
                            return;
                        }
                        else {
                            annotate.current.isDragCircle = false;
                        }
                    }
                }
                let curves = _arrays.imageAnnotateShower[_arrays.resultIndex - 1].trend;
                if (curves.length > 0) {
                    for (let i = 0; i < curves.length; i++) {
                        for (var c in curves[i]) {
                            if (c != 'id') {

                                let distanceFromCenter = Math.sqrt(Math.pow(curves[i][c][0] - annotate.current.mouseX, 2) + Math.pow(curves[i][c][1] - annotate.current.mouseY, 2));
                                if (distanceFromCenter <= annotate.current.radius) {
                                    annotate.current.isDragCircle = true;
                                    annotate.current.curveCircleType = c
                                    annotate.current.curveIndex = i
                                    annotate.current.Nodes.canvas.addEventListener('mousemove', CurveCircleDrag);
                                    annotate.current.Nodes.canvas.addEventListener('mouseup', RemoveCurveCircleDrag);
                                }

                                else {
                                    annotate.current.isDragCircle = false;
                                }
                            }
                            // 
                        }
                    }
                }

                nameTp.current = ent.name 
                attributesTp.current = ent.attribute

                if(annotate.current.Features.dropTOn){
                let distanceFromLabel = Math.sqrt(Math.pow(ent.lx - annotate.current.mouseX, 2) + Math.pow(ent.ly - annotate.current.mouseY, 2));
                if ((distanceFromLabel <= ent.rectMask.width)&&(distanceFromLabel <= ent.rectMask.height)) {
                    annotate.current.isDragCircle = true;
                    annotate.current.sourceIndex = _arrays.resultIndex
                    annotate.current.Nodes.canvas.addEventListener('mousemove', DragLabel);
                    annotate.current.Nodes.canvas.addEventListener('mouseup', RemoveDragLabel);
                }
                else {
                    annotate.current.isDragCircle = false;
                }
            }
            }
            if (!annotate.current.isDragCircle) {
                if (annotate.current.Features.dragOn) {
                    // 是否开启拖拽模式
                    let prevP = CalculateChange(e, _nodes.canvas);
                    annotate.current.prevX = prevP.x;
                    annotate.current.prevY = prevP.y;
                    _nodes.canvas.addEventListener('mousemove', ImageDrag);
                    _nodes.canvas.addEventListener('mouseup', RemoveImageDrag);
                }
                else if (annotate.current.Features.rectOn) {
                    // 是否开启绘制矩形功能
                    if (annotate.current.Arrays.resultIndex === 0) {
                        _nodes.ctx.lineWidth = 1;
                        _nodes.ctx.strokeStyle = "#df9abc";
                        _nodes.ctx.fillStyle = "rgba(255,0,0," + annotate.current.opacity + ")";
                        annotate.current.rectX = annotate.current.mouseX;
                        annotate.current.rectY = annotate.current.mouseY;
                        annotate.current.Nodes.canvas.addEventListener('mousemove', MouseMoveDrawRect);
                        annotate.current.Nodes.canvas.addEventListener('mouseup', MouseUpRemoveDrawRect);
                    }
                }
                else if (annotate.current.Features.polygonOn) {
                    // 是否开启绘制多边形功能
                    let resultList = _nodes.resultGroup.getElementsByClassName("result_list");
                    let isActive = false;
                    for (let i = 0; i < resultList.length; i++) {
                        // 循环结果列表判断是否点击某一个结果，若是，则改变焦点
                        if (resultList[i].className.indexOf("active") > -1) {
                            _arrays.resultIndex = resultList[i].id;
                            isActive = true;
                        }
                    }
                    if (!isActive) {
                        _arrays.resultIndex = 0;
                    }
                    if (_arrays.resultIndex === 0) {
                        // 未选定标签结果，创建新标签
                        CreateNewResultList(annotate.current.mouseX, annotate.current.mouseY, "polygon");
                    }
                    if (!annotate.current.isDragCircle) {
                        let index = _arrays.resultIndex - 1;
                        // 保存坐标点
                        _arrays.imageAnnotateShower[index].content.push({ x: annotate.current.mouseX, y: annotate.current.mouseY });
                        CalcRectMask(_arrays.imageAnnotateShower[index].content);
                        ReplaceAnnotateMemory();
                        DrawSavedAnnotateInfoToShow();
                        RecordOperation('addPoint', '添加坐标点', index, JSON.stringify(_arrays.imageAnnotateMemory[index]));
                    }
                }
                else if (annotate.current.Features.relationshipOn) {
                    // 是否开启关系标注功能
                    if (annotate.current.Arrays.resultIndex != 0) {

                        _nodes.ctx.lineWidth = 1;
                        _nodes.ctx.strokeStyle = "#df9abc";
                        _nodes.ctx.fillStyle = "rgba(255,0,0," + annotate.current.opacity + ")";
                        annotate.current.sourceIndex = annotate.current.Arrays.resultIndex
                        annotate.current.rectX = annotate.current.mouseX;
                        annotate.current.rectY = annotate.current.mouseY;
                        annotate.current.Nodes.canvas.addEventListener('mousemove', MouseMoveDrawArrow);
                        annotate.current.Nodes.canvas.addEventListener('mouseup', MouseUpRemoveDrawArrow);
                    }
                }
                else if (annotate.current.Features.trendOn) {
                    // 是否开启趋势标注功能
                    if (annotate.current.Arrays.resultIndex != 0) {

                        _nodes.ctx.lineWidth = 1;
                        _nodes.ctx.strokeStyle = "#df9abc";
                        _nodes.ctx.fillStyle = "rgba(255,0,0," + annotate.current.opacity + ")";
                        annotate.current.sourceIndex = annotate.current.Arrays.resultIndex
                        annotate.current.rectX = annotate.current.mouseX;
                        annotate.current.rectY = annotate.current.mouseY;
                        annotate.current.Nodes.canvas.addEventListener('mousemove', MouseMoveDrawCurve);
                        annotate.current.Nodes.canvas.addEventListener('mouseup', MouseUpRemoveDrawCurve);
                    }
                }
            }
        }
        else if (e.button === 2) {
            // 长按右击直接开启拖拽模式
            let prevP = CalculateChange(e, _nodes.canvas);
            annotate.current.prevX = prevP.x;
            annotate.current.prevY = prevP.y;
            _nodes.canvas.addEventListener('mousemove', ImageDrag);
            _nodes.canvas.addEventListener('mouseup', RemoveImageDrag);
        }
    };


    //----圆点拖拽事件，并且重新绘制边缘轨迹点
    const CircleDrag = (e) => {
        GetMouseInCanvasLocation(e);
        let imageIndex = annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].content;
        imageIndex[annotate.current.snapCircleIndex].x = annotate.current.mouseX;
        imageIndex[annotate.current.snapCircleIndex].y = annotate.current.mouseY;
        DrawSavedAnnotateInfoToShow();
    };

    //----移除圆点拖拽事件, 并重新绘制一遍最新状态
    const RemoveCircleDrag = () => {
        let index = annotate.current.Arrays.resultIndex - 1;
        annotate.current.Nodes.canvas.removeEventListener('mousemove', CircleDrag);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveCircleDrag);
        // 移除圆点拖拽事件之后，改变被拖拽圆点在矩形蒙层数据中的坐标
        CalcRectMask(annotate.current.Arrays.imageAnnotateShower[index].content);
        DrawSavedAnnotateInfoToShow();
        ReplaceAnnotateMemory();
        RecordOperation('modify', '拖拽更新多边形边缘点', index, JSON.stringify(annotate.current.Arrays.imageAnnotateMemory[index]));
    };


    //----曲线圆点拖拽事件，并且重新绘制边缘轨迹点
    const CurveCircleDrag = (e) => {
        let i = annotate.current.curveIndex
        let type = annotate.current.curveCircleType
        GetMouseInCanvasLocation(e);
        let imageIndex = annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].trend[i];
        imageIndex[type][0] = annotate.current.mouseX;
        imageIndex[type][1] = annotate.current.mouseY;
        DrawSavedAnnotateInfoToShow();
    };

    //----移除曲线圆点拖拽事件, 并重新绘制一遍最新状态
    const RemoveCurveCircleDrag = () => {
        let index = annotate.current.Arrays.resultIndex - 1;
        annotate.current.Nodes.canvas.removeEventListener('mousemove', CurveCircleDrag);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveCurveCircleDrag);
        DrawSavedAnnotateInfoToShow();
        ReplaceAnnotateMemory();
        RecordOperation('modify', '拖拽更新多边形边缘点', index, JSON.stringify(annotate.current.Arrays.imageAnnotateMemory[index]));
    };


    //----图片拖拽事件函数
    const ImageDrag = (e) => {
        let _nodes = annotate.current.Nodes;
        let p = CalculateChange(e, _nodes.canvas);
        let offsetX = (p.x - annotate.current.prevX);
        let offsetY = (p.y - annotate.current.prevY);
        SetXY(annotate.current.x + offsetX, annotate.current.y + offsetY);
        annotate.current.prevX = p.x;
        annotate.current.prevY = p.y;
        if (annotate.current.drawFlag) {
            DrawSavedAnnotateInfoToMemory(true);
            annotate.current.drawFlag = false;
        }
    };

    //----移除鼠标拖拽图片事件函数, 并将最新数据绘制到存储面板中
    const RemoveImageDrag = () => {
        ReplaceAnnotateShow();
        DrawSavedAnnotateInfoToMemory(false);
        annotate.current.drawFlag = true;
        annotate.current.Nodes.canvas.removeEventListener('mousemove', ImageDrag);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveImageDrag);
    };


    //----鼠标移动绘制矩形事件
    const MouseMoveDrawRect = (e) => {


        GetMouseInCanvasLocation(e);
        // DrawSavedAnnotateInfoToShow();
        annotate.current.moveP.push([annotate.current.mouseX, annotate.current.mouseY])
        // if (ptdata.length > np) {
        //     removeD()
        // };
        pUpdate(annotate.current.Nodes.ctx);
        // annotate.current.Nodes.ctx.strokeStyle = "#df9abc";
        // annotate.current.Nodes.ctx.fillStyle = "rgba(255,0,0," + annotate.current.opacity + ")";
        // annotate.current.Nodes.ctx.strokeRect(annotate.current.rectX, annotate.current.rectY, annotate.current.mouseX - annotate.current.rectX, annotate.current.mouseY - annotate.current.rectY);
        // annotate.current.Nodes.ctx.fillRect(annotate.current.rectX, annotate.current.rectY, annotate.current.mouseX - annotate.current.rectX, annotate.current.mouseY - annotate.current.rectY);
    };



    const pUpdate = (ctx) => {

        let points = annotate.current.moveP
        ctx.lineWidth = 5
        for (var i = 0; i < points.length - 1; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(points[i][0], points[i][1]);
            ctx.lineTo(points[i + 1][0], points[i + 1][1]);
            ctx.strokeStyle = "rgb(0,0,0)"
            ctx.stroke()
        }
    }



    const changeName = (name) => {
        nameTp.current = name
    }
    const changeAttributes = (attr) => {
        attributesTp.current = attr
    }

    //属性修改确定
    const changeAttributeConfirm = ()=>{
        let attributeInputDiv = document.getElementById('attributeInputDiv');
        if(annotate.current.Arrays.resultIndex == 0)
            annotate.current.Arrays.resultIndex = annotate.current.Arrays.imageAnnotateShower.length
        let index = annotate.current.Arrays.resultIndex - 1;
        annotate.current.Arrays.imageAnnotateShower[index].name = nameTp.current
        annotate.current.Arrays.imageAnnotateShower[index].attribute = attributesTp.current
        annotate.current.Arrays.resultIndex = 0
        let id = annotate.current.Arrays.imageAnnotateShower[index].id
        let ent = entityContext.array.find(function (d) { return d.id == id })
        ent.name = nameTp.current
        ent.attribute = attributesTp.current
        ReplaceAnnotateMemory()
        DrawSavedAnnotateInfoToShow()
        // nameTp.current = ""
        // attributesTp.current = []
        // canvasArea.removeChild(input);
        // canvasArea.removeChild(attributeInputDiv)

        attributeInputDiv.style['z-index'] = '-9999'
        attributeInputDiv.style.top = '0px'
        attributeInputDiv.style.left = '0px'
            // attributeInputDiv.removeChild(confirmDiv)
    }

    //----绘制矩形时鼠标抬起后移除监听函数
    const MouseUpRemoveDrawRect = () => {

        var minP = [9999, 9999]
        var maxP = [-9999, -9999]
        var points = annotate.current.moveP
        for (var i = 0; i < points.length; i++) {
            if (points[i][0] > maxP[0]) maxP[0] = points[i][0]
            if (points[i][1] > maxP[1]) maxP[1] = points[i][1]
            if (points[i][0] < minP[0]) minP[0] = points[i][0]
            if (points[i][0] < minP[1]) minP[1] = points[i][1]
        }
        if (maxP[0] - minP[0] >= 5 || maxP[1] - maxP[1] >= 5) {  // 判断矩形绘制距离大于五才认定为有效绘制
            // 保存绘图数据
            CreateNewResultList(maxP[0], maxP[1], "rect", minP);
            DrawSavedAnnotateInfoToShow();
            ReplaceAnnotateMemory();
            let index = annotate.current.Arrays.resultIndex - 1;
            RecordOperation('add', '绘制矩形框', index, JSON.stringify(annotate.current.Arrays.imageAnnotateMemory[index]));
        }
        annotate.current.moveP = []
        annotate.current.Nodes.canvas.removeEventListener('mousemove', MouseMoveDrawRect);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', MouseUpRemoveDrawRect);

        attributesTp.current = []
        nameTp.current = ''
        let attributeInputDiv = document.getElementById('attributeInputDiv');
        // let canvasArea = document.querySelector('.canvasContent');
        // canvasArea.appendChild(attributeInputDiv);
        attributeInputDiv.style['z-index'] = '9999'
        attributeInputDiv.style.position = "absolute";
        attributeInputDiv.style.left = maxP[0] + 'px'
        attributeInputDiv.style.top = minP[1] + 'px'
        attributeInputDiv.style.width = '250px'
        attributeInputDiv.style.height = '300px'

    };




    const drawArrow = (ctx, fromX, fromY, toX, toY, theta = 30, headlen = 10, width = 1, color = '#f00') => {

        // 计算各角度和对应的P2,P3坐标
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
            angle1 = (angle + theta) * Math.PI / 180,
            angle2 = (angle - theta) * Math.PI / 180,
            topX = headlen * Math.cos(angle1),
            topY = headlen * Math.sin(angle1),
            botX = headlen * Math.cos(angle2),
            botY = headlen * Math.sin(angle2);

        ctx.save();
        ctx.beginPath();

        var arrowX = fromX - topX,
            arrowY = fromY - topY;

        ctx.moveTo(arrowX, arrowY);
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        arrowX = toX + topX;
        arrowY = toY + topY;
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(toX, toY);
        arrowX = toX + botX;
        arrowY = toY + botY;
        ctx.lineTo(arrowX, arrowY);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.restore();
    }


    //----鼠标移动绘制箭头事件
    const MouseMoveDrawArrow = (e) => {
        GetMouseInCanvasLocation(e);
        DrawSavedAnnotateInfoToShow();
        annotate.current.Nodes.ctx.strokeStyle = 'rgb(255,0,0,0.5)';
        drawArrow(annotate.current.Nodes.ctx, annotate.current.rectX, annotate.current.rectY, annotate.current.mouseX, annotate.current.mouseY, 30, 10, 5, 'rgb(255,0,0,0.5)');
    };

    //----绘制箭头时鼠标抬起后移除监听函数
    const MouseUpRemoveDrawArrow = () => {
        var targetIndex = -1

        let _arrays = annotate.current.Arrays;
        let ent =  annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1]
        let list = _arrays.imageAnnotateShower
        // if ((annotate.current.mouseX - annotate.current.rectX >= 5 || annotate.current.rectX - annotate.current.mouseX >= 5) && (targetIndex != -1)) {  // 判断绘制距离大于五才认定为有效绘制

        // 清空记录重叠实体列表
        if(inpolList.current.length>0){
            for(let j=0;j<inpolList.current.length;j++){
                let canvasArea = document.querySelector('.canvasContent');  
                let buts = document.getElementById("chooseEntBut"+inpolList.current[j])
                if(buts)
                canvasArea.removeChild(buts)
            }
        }
        inpolList.current = []
        // 记录重叠实体
        for (let i = 0; i < list.length; i++) {
            if(list[i].showLabel){
            let con = list[i].content
            if (inpolygon(con, { x: annotate.current.mouseX, y: annotate.current.mouseY })) {
                inpolList.current.push(i+1)
            }
        }
        }


        if(inpolList.current.length>0){

            var Rsize = 50;
            var Rstep = Math.PI*2/inpolList.current.length
            let tht = 0
            for(let i=0;i<inpolList.current.length;i++){
                let but = document.createElement('div');
                let canvasArea = document.querySelector('.canvasContent');
                tht = Rstep *i
                let id ="chooseEntBut"+inpolList.current[i]
                let buts = document.getElementById(id)
                if(buts)
                    canvasArea.removeChild(buts)
                let entT = _arrays.imageAnnotateShower[inpolList.current[i]-1]
                // canvasArea.appendChild(input);
                but.id = id
                but.style.left = annotate.current.mouseX + Rsize*Math.cos(tht)-Rsize/2 + 'px'
                but.style.top = annotate.current.mouseY + Rsize*Math.sin(tht)-Rsize/2 + 'px'
                but.style.background = entT.color
                but.className = "chooseEntBut"
                but.addEventListener('click',(e)=>{
                    targetIndex = inpolList.current[i]
                    for(let j=0;j<inpolList.current.length;j++){
                    let buts = document.getElementById("chooseEntBut"+inpolList.current[j])
                    canvasArea.removeChild(buts)} 

                    if ((targetIndex!=-1)&&(targetIndex != parseInt(annotate.current.sourceIndex) )) {  // 判断绘制距离大于五才认定为有效绘制
                       
                        let sourceId = _arrays.imageAnnotateShower[parseInt(annotate.current.sourceIndex) - 1]['id']
                        let targetId = _arrays.imageAnnotateShower[targetIndex - 1]['id']
                        // 保存绘图数据
                        CreateNewRelationshipResultList(sourceId, targetId, "ralationship");
                        DrawSavedAnnotateInfoToShow();
                        let index = annotate.current.Arrays.relationshipIndex - 1;
                        RecordOperation('add', '绘制箭头', index, JSON.stringify(annotate.current.Arrays.relationshipAnnotateMemory[index]));
                    
            
                        let input = document.createElement('input');
                        let canvasArea = document.querySelector('.canvasContent');
                        canvasArea.appendChild(input);
                        input.focus()
                        input.style.position = "absolute";
                        input.style.left = annotate.current.rectX + (annotate.current.mouseX - annotate.current.rectX) / 2 - 50 + 'px'
                        input.style.top = annotate.current.rectY + (annotate.current.mouseY - annotate.current.rectY) / 2 - 25 + 'px'
                        input.style.width = '100px'
                        input.style.height = '50px'
                        input.style.fontSize = `${parseInt(input.style.height) / 2}px`;
                        input.style.border = "0px";
                        input.style.background = "rgb(0,0,0,0)"
                        input.style.outline = 'none'
                        window.addEventListener("keyup", (e) => {
                            if ("Enter" === e.key) {
                                input.blur()
                                window.onkeyup = null
                            }
                        })
                        input.addEventListener('input', (e) => {
                            const target = e.target as HTMLTextAreaElement;
                            annotate.current.inputs = target.value
                        })
                        input.addEventListener('blur', () => {
                            let index = annotate.current.Arrays.relationshipAnnotateShower.length - 1
                            annotate.current.Arrays.relationshipAnnotateShower[index].name = annotate.current.inputs
                            let id = annotate.current.Arrays.relationshipAnnotateShower[index].id
                            relationshipArray.current.find(function (d) { return d.id == id }).name = annotate.current.inputs
                            ReplaceAnnotateMemory()
                            DrawSavedAnnotateInfoToShow()
                            annotate.current.inputs = ""
                            canvasArea.removeChild(input);
            
                        })
                    }
                    
                    inpolList.current = []
                    annotate.current.Nodes.canvas.removeEventListener('mousemove', DragLabel);
                    annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveDragLabel);
                    DrawSavedAnnotateInfoToShow()
                })
                canvasArea.appendChild(but)
            }

        }

    // }
        annotate.current.Nodes.canvas.removeEventListener('mousemove', MouseMoveDrawArrow);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', MouseUpRemoveDrawArrow);

    };

    //--绘制贝塞尔曲线
    const drawBezierCurve = (ctx, startP, endP, cp1, cp2, width = 2, color = '#f00') => {
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.beginPath();
        // 绘制贝塞尔曲线
        ctx.moveTo(startP[0], startP[1]); // 画笔先落到曲线的起点位置
        ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], endP[0], endP[1]);
        ctx.stroke();
    }

    /*获取贝塞尔曲线控制点*/
    const computeControlPoint = (ps, pe, arc = 0.1) => {
        const deltaX = pe[0] - ps[0];
        const deltaY = pe[1] - ps[1];
        return [
            ps[0] + arc * deltaX, ps[1] + arc * deltaY
        ];
    }

    //----鼠标移动绘制曲线事件
    const MouseMoveDrawCurve = (e) => {
        GetMouseInCanvasLocation(e);
        DrawSavedAnnotateInfoToShow();
        let _arrays = annotate.current.Arrays;
        let list = _arrays.imageAnnotateShower
        let i = parseInt(_arrays.resultIndex) - 1
        let con = list[i].content
        annotate.current.Nodes.ctx.strokeStyle = "#df9abc";
        let startP = [annotate.current.rectX, annotate.current.rectY]
        let endP = [annotate.current.mouseX, annotate.current.mouseY]
        let cp1 = computeControlPoint(startP, endP, 0.3)
        let cp2 = computeControlPoint(startP, endP, 0.7)
        if (inpolygon(con, { x: annotate.current.mouseX, y: annotate.current.mouseY })) {

            annotate.current.endX = annotate.current.mouseX
            annotate.current.endY = annotate.current.mouseY
        }
        else {
            endP = [annotate.current.endX, annotate.current.endY]
            cp1 = computeControlPoint(startP, endP, 0.3)
            cp2 = computeControlPoint(startP, endP, 0.7)
        }
        drawBezierCurve(annotate.current.Nodes.ctx, startP, endP, cp1, cp2, 5, "#df9abc");


    };

    //----绘制曲线时鼠标抬起后移除监听函数
    const MouseUpRemoveDrawCurve = () => {
        var targetIndex = -1

        let _arrays = annotate.current.Arrays;
        let list = _arrays.imageAnnotateShower
        let i = parseInt(_arrays.resultIndex) - 1
        let con = list[i].content
        let cp1 = []
        let cp2 = []
        if (inpolygon(con, { x: annotate.current.mouseX, y: annotate.current.mouseY })) {
            if (annotate.current.mouseX - annotate.current.rectX >= 5 || annotate.current.rectX - annotate.current.mouseX >= 5) {  // 判断绘制距离大于五才认定为有效绘制
                let startP = [annotate.current.rectX, annotate.current.rectY]
                let endP = [annotate.current.mouseX, annotate.current.mouseY]

                cp1 = computeControlPoint(startP, endP, 0.3)
                cp2 = computeControlPoint(startP, endP, 0.7)
                // 保存绘图数据
                CreateNewCurveResultList(i, startP, endP, cp1, cp2);
                DrawSavedAnnotateInfoToShow();
                RecordOperation('add', '绘制弧线', i, JSON.stringify(annotate.current.Arrays.imageAnnotateMemory[i]));
            }
            annotate.current.Nodes.canvas.removeEventListener('mousemove', MouseMoveDrawCurve);
            annotate.current.Nodes.canvas.removeEventListener('mouseup', MouseUpRemoveDrawCurve);
        }


    };



    //----拖拽矩形圆点时改变矩形十个点坐标
    const DragRectCircleChangeLocation = (content, circleIndex) => {
        switch (circleIndex) {
            case 0:
                content[1].y = annotate.current.mouseY;
                content[3].x = annotate.current.mouseX;
                break;
            case 1:
                content[0].y = annotate.current.mouseY;
                content[2].x = annotate.current.mouseX;
                break;
            case 2:
                content[1].x = annotate.current.mouseX;
                content[3].y = annotate.current.mouseY;
                break;
            case 3:
                content[0].x = annotate.current.mouseX;
                content[2].y = annotate.current.mouseY;
                break;
            default:
                break;
        }
    };

    //----拖拽矩形圆点时重新绘制矩形事件
    const DragRectCircleRepaintRect = (e) => {
        GetMouseInCanvasLocation(e);
        let imageIndex = annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].content;
        annotate.current.Nodes.ctx.fillStyle = "rgba(" + annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].rgb + "," + annotate.current.opacity + ")";
        imageIndex[annotate.current.snapCircleIndex].x = annotate.current.mouseX;
        imageIndex[annotate.current.snapCircleIndex].y = annotate.current.mouseY;
        DragRectCircleChangeLocation(imageIndex, annotate.current.snapCircleIndex);
        CalcRectMask(imageIndex);
        DrawSavedAnnotateInfoToShow();

        // DrawSavedAnnotateInfoToMemory(false);
    };

    //----移除矩形圆点拖拽事件，并将最新数据绘制到存储面板中
    const RemoveDragRectCircle = () => {
        ReplaceAnnotateMemory();
        DrawSavedAnnotateInfoToMemory(false);
        updateEntityArray(entityContext.array)
        annotate.current.drawFlag = true;
        annotate.current.Nodes.canvas.removeEventListener('mousemove', DragRectCircleRepaintRect);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveDragRectCircle);
        let index = annotate.current.Arrays.resultIndex - 1;
        RecordOperation('modify', '拖拽更新矩形框', index, JSON.stringify(annotate.current.Arrays.imageAnnotateMemory[index]));
    };
    //--绘制移动标签
    //----绘制标签的方法
    const DrawMoveLabel = (ctx, x, y, color, name) => {
        console.log(name)
        ctx.font = "22px Verdana";
        let txtWidth = ctx.measureText(name).width;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6
        ctx.fillRect(x , y - 20, txtWidth + 8, 20);
        ctx.globalAlpha = 1
        ctx.fillStyle = "rgba(255,255,255, 0.7)";
        ctx.fillText(name, x+4 , y - 5);
    };
    //----拖拽矩形标签时重新绘制矩形事件
    const DragLabel = (e) => {
        let _nodes = annotate.current.Nodes;
        GetMouseInCanvasLocation(e);
        let ent =  annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1]
        // ent.showLabel=false
        annotate.current.Nodes.ctx.fillStyle = "rgba(" + annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1].rgb + "," + annotate.current.opacity + ")";
        // DrawRectLabel(_nodes.ctx,item.rectMask.xMin, item.rectMask.yMin, item.color, item.name, index + 1);
        DrawSavedAnnotateInfoToShow();
        DrawMoveLabel(annotate.current.Nodes.ctx,annotate.current.mouseX, annotate.current.mouseY, ent.color, ent.name);

        // DrawSavedAnnotateInfoToMemory(false);
    };

    //----移除矩形标签拖拽事件，并将最新数据绘制到存储面板中
    const RemoveDragLabel = () => {
        annotate.current.targetIndex = -1
        var targetIndex = -1
        let _arrays = annotate.current.Arrays;
        let ent =  annotate.current.Arrays.imageAnnotateShower[annotate.current.Arrays.resultIndex - 1]
        let list = _arrays.imageAnnotateShower

        if(inpolList.current.length>0){
            for(let j=0;j<inpolList.current.length;j++){
                let canvasArea = document.querySelector('.canvasContent');  
                let buts = document.getElementById("chooseEntBut"+inpolList.current[j])
                if(buts)
                canvasArea.removeChild(buts)
            }
        }
        inpolList.current = []
        for (let i = 0; i < list.length; i++) {
            if(list[i].showLabel){
            let con = list[i].content
            if (inpolygon(con, { x: annotate.current.mouseX, y: annotate.current.mouseY })) {
                // _arrays.resultIndex = i + 1
                inpolList.current.push(i+1)
            }
            }
        }
        if(inpolList.current.length>0){
           
            let _arrays = annotate.current.Arrays;
            var Rsize = 50;
            var Rstep = Math.PI*2/inpolList.current.length
            let tht = 0
            for(let i=0;i<inpolList.current.length;i++){
                let but = document.createElement('div');
                let canvasArea = document.querySelector('.canvasContent');
                tht = Rstep *i
                let id ="chooseEntBut"+inpolList.current[i]
                let buts = document.getElementById(id)
                if(buts)
                    canvasArea.removeChild(buts)
                let entT = _arrays.imageAnnotateShower[inpolList.current[i]-1]
                // canvasArea.appendChild(input);
                but.id = id
                but.style.left = annotate.current.mouseX + Rsize*Math.cos(tht)-Rsize/2 + 'px'
                but.style.top = annotate.current.mouseY + Rsize*Math.sin(tht)-Rsize/2 + 'px'
                but.style.background = entT.color
                but.className = "chooseEntBut"
                but.addEventListener('click',(e)=>{
                    targetIndex = inpolList.current[i]
                    for(let j=0;j<inpolList.current.length;j++){
                    let buts = document.getElementById("chooseEntBut"+inpolList.current[j])
                    canvasArea.removeChild(buts)} 

                    if ((targetIndex!=-1)&&(targetIndex != parseInt(annotate.current.sourceIndex) )) {  // 判断绘制距离大于五才认定为有效绘制
                        let sourceId = _arrays.imageAnnotateShower[parseInt(annotate.current.sourceIndex) - 1]['id']
                        let targetId = _arrays.imageAnnotateShower[targetIndex - 1]['id']
                        ent.visAble = false
                        ent.showLabel=false
                        // 保存绘图数据
                        CreateNewRelationshipResultList(sourceId, targetId, "addChild");
                        _arrays.resultIndex  = 0
                        annotate.current.sourceIndex = '0'
                        DrawSavedAnnotateInfoToShow();
                        let index = annotate.current.Arrays.relationshipIndex - 1;
                        RecordOperation('add', '附属关系', index, JSON.stringify(annotate.current.Arrays.relationshipAnnotateMemory[index]));
                    }
                    
                    inpolList.current = []
                    annotate.current.Nodes.canvas.removeEventListener('mousemove', DragLabel);
                    annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveDragLabel);
                    DrawSavedAnnotateInfoToShow()
                })
                canvasArea.appendChild(but)
            }

        }else{
            ent.showLabel=true
            }
        ReplaceAnnotateMemory();
        annotate.current.Nodes.canvas.removeEventListener('mousemove', DragLabel);
        annotate.current.Nodes.canvas.removeEventListener('mouseup', RemoveDragLabel);

    };


    //----计算更新鼠标相对容器的位置
    const CalculateChange = (e, container) => {
        // !skip && e.preventDefault();
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
        const y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
        let left = x - (container.getBoundingClientRect().left + window.pageXOffset);
        let top = y - (container.getBoundingClientRect().top + window.pageYOffset);

        if (left < 0) {
            left = 0
        }
        else if (left > containerWidth) {
            left = containerWidth
        }

        if (top < 0) {
            top = 0;
        }
        else if (top > containerHeight) {
            top = containerHeight;
        }

        return {
            x: left,
            y: top
        }
    };
    //----计算标签相对于当前标定范围的位置
    const ComputerLabelLocation = (rectMask) => {
        let x = rectMask.width / 2 + rectMask.xMin;
        let y = rectMask.height / 2 + rectMask.yMin;
        return { x, y }
    };

    const Area = (p0, p1, p2) => {
        var area = 0
        area = p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p1.x * p0.y - p2.x * p1.y - p0.x * p2.y;
        return area / 2;
    }
    //----计算重心
    const ComputerCenterPoint = (points) => {
        var X = 0, Y = 0, Z = 0;
        var sum_y = 0
        var sum_x = 0;
        var sum_area = 0;
        var p1 = points[1];
        var p2
        for (var i = 2; i < points.length; i++) {
            p2 = points[i];
            var area = Area(points[0], p1, p2);
            sum_area += area;
            sum_x += (points[0].x + p1.x + p2.x) * area;
            sum_y += (points[0].y + p1.y + p2.y) * area;
            p1 = p2;
        }
        var xx = sum_x / sum_area / 3;
        var yy = sum_y / sum_area / 3;
        return [xx, yy]
    };


    //----按缩放程度修改数据存储面板数据（坐标点转换过程）
    const ReplaceAnnotateMemory = () => {
        annotate.current.Arrays.imageAnnotateMemory.splice(0, annotate.current.Arrays.imageAnnotateMemory.length);
        annotate.current.Arrays.imageAnnotateShower.map((item) => {
            let content = [];
            let trend = []
            let x = annotate.current.x
            let y = annotate.current.y
            let sca = annotate.current.scale
            item.content.forEach(contents => {
                content.push({
                    "x": (contents.x - x) / sca,
                    "y": (contents.y - y) / sca,
                })
            });
            let rectMask = {
                "xMin": (item.rectMask.xMin - x) / sca,
                "yMin": (item.rectMask.yMin - y) / sca,
                "width": item.rectMask.width / sca,
                "height": item.rectMask.height / sca,
            };
            item.trend.forEach(trends => {
                let tp = {
                    id: trends.id,
                    source: [(trends.source[0] - x) / sca, (trends.source[1] - y) / sca],
                    target: [(trends.target[0] - x) / sca, (trends.target[1] - y) / sca],
                    controlPoint1: [(trends.controlPoint1[0] - x) / sca, (trends.controlPoint1[1] - y) / sca],
                    controlPoint2: [(trends.controlPoint2[0] - x) / sca, (trends.controlPoint2[1] - y) / sca],
                }
                trend.push(tp)
            })
            let id = item.id
            let imageShow = {
                id: item.id,
                name: item.name,
                x,
                y,
                lx: item.lx,
                ly: item.ly,
                ix: item.ix,
                iy: item.iy,
                type: item.type,
                iWidth: item.iWidth,
                iHeight: item.iHeight,
                iScale: item.iScale,
                visAble: item.visAble,
                rgb: item.rgb,
                visibility: item.visibility,
                active: item.active,
                describe: item.describe,
                labels: item.labels,
                attribute: item.attribute,
                content,
                showLabel:item.showLabel,
                children:item.children,
                rectMask,
                trend,
                color: item.color,
                trendIndex: item.trendIndex,
                centerPoint: ComputerCenterPoint(content),
                labelLocation: ComputerLabelLocation(rectMask),
                contentType: item.contentType,

            }
            annotate.current.Arrays.imageAnnotateMemory.push(imageShow);
        });
    };
    //----按缩放程度修改数据展示面板数据（坐标点转换过程）
    const ReplaceAnnotateShow = () => {
        annotate.current.Arrays.imageAnnotateShower.splice(0, annotate.current.Arrays.imageAnnotateShower.length);
        annotate.current.Arrays.imageAnnotateMemory.map((item, index) => {
            console.log(item)
            let content = [];
            let trend = []
            let x = annotate.current.x
            let y = annotate.current.y
            let sca = annotate.current.scale
            item.content.forEach(contents => {
                content.push({
                    "x": contents.x * sca + x,
                    "y": contents.y * sca + y,
                })
            });
            item.trend.forEach(trends => {
                let tp = {
                    id: trends.id,
                    source: [trends.source[0] * sca + x, trends.source[1] * sca + y],
                    target: [trends.target[0] * sca + x, trends.target[1] * sca + y],
                    controlPoint1: [trends.controlPoint1[0] * sca + x, trends.controlPoint1[1] * sca + y],
                    controlPoint2: [trends.controlPoint2[0] * sca + x, trends.controlPoint2[1] * sca + y],
                }
                trend.push(tp)
            })
            let rectMask = {
                "xMin": item.rectMask.xMin * sca + x,
                "yMin": item.rectMask.yMin * sca + y,
                "width": item.rectMask.width * sca,
                "height": item.rectMask.height * sca,
            };
            let imgMemory = {
                id: item.id,
                name: item.name,
                lx: item.lx,
                ly: item.ly,
                x,
                y,
                ix: item.ix,
                iy: item.iy,
                type: item.type,
                iWidth: item.iWidth,
                iHeight: item.iHeight,
                iScale: item.iScale,
                visAble: item.visAble,
                rgb: item.rgb,
                visibility: item.visibility,
                active: item.active,
                describe: item.describe,
                labels: item.labels,
                attribute: item.attribute,
                content,
                showLabel:item.showLabel,
                children:item.children,
                rectMask,
                trend,
                color: item.color,
                trendIndex: item.trendIndex,
                centerPoint: ComputerCenterPoint(content),
                labelLocation: ComputerLabelLocation(rectMask),
                contentType: item.contentType,
            }
            annotate.current.Arrays.imageAnnotateShower.push(imgMemory);
        });

    };

    //----重新绘制已保存的图像标注记录与标签（删除修改之后重新渲染整体模块）
    const RepaintResultList = () => {
        // 先清空标签, 之后再重新渲染
        annotate.current.Arrays.resultIndex = 0;
        DrawSavedAnnotateInfoToShow();
        ReplaceAnnotateMemory();
        annotate.current.Nodes.resultGroup.innerHTML = "";
        if (annotate.current.Arrays.imageAnnotateShower.length > 0) {
            let _index = 0;
            annotate.current.Arrays.imageAnnotateShower.forEach((item, index) => {
                // 创建结果标签
                _index = ++index;
                let eyeIconClass = item.labels.visibility ? "icon-eye-open" : "icon-eye-close";
                let resultListBody = document.createElement('div');
                resultListBody.className = "result_list";
                resultListBody.id = _index + "";
                resultListBody.innerHTML = '<span className="result_no">' + _index + '</span>' +
                    '<span className="result_color" style="background: ' + item.labels.labelColor + ';"></span>' +
                    '<input className="result_Name" value="' + item.labels.labelName + '" disabled>' +
                    '<i className="editLabelName icon-pencil"></i>' +
                    '<i className="deleteLabel icon-trash"></i>' +
                    '<i className="isShowLabel ' + eyeIconClass + '"></i>';
                annotate.current.Nodes.resultGroup.appendChild(resultListBody);
            });
            // document.querySelector('.resultLength').innerHTML = _index;
        }
    };

    //----创建新的标定结果标签
    const CreateNewResultList = (lx, ly, contentType, p = [],data = {}) => {
        let _nodes = annotate.current.Nodes;
        let _arrays = annotate.current.Arrays;
        let id = uuid()
        let color = coloring()
        let ent = new Entity("")
        if(contentType === 'recognize'){
            let x = annotate.current.x
            let y = annotate.current.y
            let sca = annotate.current.scale
            // let sca = 1
            
            // let x = 0
            // let y = 0
            let rectMask = {
                xMin: (p[0])*sca+x,
                yMin: (p[1])*sca+y,
                width: (lx - p[0])*sca,
                height: (ly - p[1])*sca
            };
           let  content = [
                { x: (p[0]) *sca+x, y: (p[1] ) *sca+y },
                { x: (lx) *sca+x, y: (p[1] ) *sca+y },
                { x: (lx) *sca+x, y: (ly ) *sca+y },
                { x: (p[0]) *sca+x, y: (ly ) *sca+y },
            ]
            let centerP = ComputerCenterPoint(content)
            let tp = {
                id: id,
                content: content,
                lx: (lx) *sca+x,
                ly: (ly ) *sca+y,
                ix: 0,
                iy: 0,
                name: data['name'],
                iWidth: annotate.current.iWidth,
                iHeight: annotate.current.iHeight,
                iScale: annotate.current.scale,
                visAble: true,
                rgb: color,
                visibility: _nodes.labelShower.children[0].checked,
                active: false,
                describe: "",
                labels: {
                    labelName: "",
                    labelColor: color,
                    labelColorRGB: color,
                    visibility: _nodes.labelShower.children[0].checked,
                },
                attribute: [],
                trend: [],
                showLabel:true,
                children:[],
                color: color,
                type: "",
                trendIndex: 0,
                centerPoint: centerP,
                labelLocation: ComputerLabelLocation(rectMask),
                rectMask,
                contentType: "rect",
            }

            ent.labels = {
                labelName: data['name'],
                labelColor: color,
                labelColorRGB: color,
                visibility: _nodes.labelShower.children[0].checked,
            }
            ent.centerPoint = centerP
            ent.x = centerP[0]
            ent.y = centerP[1]
            ent.content = content
            ent.labelLocation = ComputerLabelLocation(rectMask)
            ent.rectMask = rectMask
            annotate.current.Arrays.imageAnnotateShower.push(tp)
            ReplaceAnnotateMemory();
        }
        if (contentType === "rect") {

            let rectMask = {
                xMin: p[0],
                yMin: p[1],
                width: lx - p[0],
                height: ly - p[1]
            };
            let content = [
                { x: p[0], y: p[1] },
                { x: lx, y: p[1] },
                { x: lx, y: ly },
                { x: p[0], y: ly },
            ]
            let centerP = ComputerCenterPoint(content)
            let tp = {
                id: id,
                content: content,
                lx: lx,
                ly: ly,
                ix: 0,
                iy: 0,
                name: "",
                iWidth: annotate.current.iWidth,
                iHeight: annotate.current.iHeight,
                iScale: annotate.current.scale,
                visAble: true,
                rgb: color,
                visibility: _nodes.labelShower.children[0].checked,
                active: false,
                describe: "",
                labels: {
                    labelName: "",
                    labelColor: color,
                    labelColorRGB: color,
                    visibility: _nodes.labelShower.children[0].checked,
                },
                attribute: [],
                trend: [],
                showLabel:true,
                children:[],
                color: color,
                type: "",
                trendIndex: 0,
                centerPoint: centerP,
                labelLocation: ComputerLabelLocation(rectMask),
                rectMask,
                contentType: contentType,
            }

            ent.labels = {
                labelName: "",
                labelColor: color,
                labelColorRGB: color,
                visibility: _nodes.labelShower.children[0].checked,
            }
            ent.centerPoint = centerP
            ent.x = centerP[0]
            ent.y = centerP[1]
            ent.content = content
            ent.labelLocation = ComputerLabelLocation(rectMask)
            ent.rectMask = rectMask
            annotate.current.Arrays.imageAnnotateShower.push(tp)
            ReplaceAnnotateMemory();
        }
        else if (contentType === "polygon") {
            annotate.current.Arrays.imageAnnotateShower.push(
                {
                    "id": id,
                    "labels": {
                        labelName: "",
                        labelColor: color,
                        labelColorRGB: color,
                        visibility: _nodes.labelShower.children[0].checked,
                    },
                    "labelLocation": {
                        x: lx,
                        y: ly
                    },
                    "attribute": [],
                    "name": "",
                    "type": "",
                    "contentType": contentType,
                    "content": [],
                    "rectMask": {},
                    "centerPoint": [10, 10],
                    "trend": [],
                    "showLabel":true,
                    "children":[],
                    "color": color,
                    "trendIndex": 0,
                    "lx": lx,
                    "ly": ly,
                    "ix": 0,
                    "iy": 0,
                    "iWidth": annotate.current.iWidth,
                    "iHeight": annotate.current.iHeight,
                    "iScale": annotate.current.scale,
                    "visAble": true,
                    "rgb": color,
                    "visibility": _nodes.labelShower.children[0].checked,
                    "active": false,
                    "describe": ""
                }
            );
            ent.labels = {
                labelName: "",
                labelColor: color,
                labelColorRGB: color,
                visibility: _nodes.labelShower.children[0].checked,
            }
            ent.centerPoint = [10, 10]
            ent.x = lx
            ent.y = ly

            ent.content = []
            ent.labelLocation = []
            ent.rectMask = {}
        }
        ent.lx = lx
        ent.ly = ly
        ent.ix = 0
        ent.iy = 0
        ent.iWidth = annotate.current.iWidth
        ent.iHeight = annotate.current.iHeight
        ent.iScale = annotate.current.scale
        ent.visAble = true
        ent.rgb = color
        ent.visibility = _nodes.labelShower.children[0].checked
        ent.active = false
        ent.describe = ""
        ent.trend = []
        ent.trendIndex = 0
        ent.contentType = contentType
        ent.name = ""
        ent.id = id
        ent.attribute = []
        ent.type = "未指定"
        ent.color = color
        ent.visAble = true
        entityContext.array.push(ent)
        updateEntityArray(entityContext.array)
        CreateNewRelationshipResultList(id, "root" + imgIndex.current, "root");
    };

    //----删除某个已标定结果标签
    const DeleteSomeResultLabel = (index) => {
        let _arrays = annotate.current.Arrays
        let ent = _arrays.imageAnnotateShower[index]
        console.log(ent)
        DeleteSomeRelationshipResultLabel(ent.id)
        annotate.current.Arrays.imageAnnotateShower.splice(index, 1);
        ReplaceAnnotateMemory();
        RecordOperation('delete', '删除标定标签', index, JSON.stringify(_arrays.imageAnnotateMemory[index]));
        entityContext.array.splice(index, 1);
        RepaintResultList();
    };

    //----创建新的关系
    const CreateNewRelationshipResultList = (source, target, contentType) => {
        let id = uuid()
    if (contentType === "addChild") {
            // let eSource = entityContext.array.find(function (item, index, arr) {
            //     return item.id === ids[3]
            // })
            let eTarget = entityContext.array.find(function (item, index, arr) {
                return item.id === target
            })
            eTarget['children'].push(source)
    }
    // else{

        let color = coloring()
        if (relType.current) {
            color = relType.current.color
        }
        let weight = 1
        let tp = {
            id: id,
            name: "",
            sourceId: source,
            targetId: target,
            type: contentType,
            color: color,
            weight: weight,
        }
        annotate.current.Arrays.relationshipAnnotateShower.push(tp)
        annotate.current.Arrays.relationshipAnnotateMemory.push(tp)
        // ReplaceAnnotateMemory();
        let rel = new Relationship()
        rel.name = ""
        rel.id = id
        rel.type = contentType
        rel.sourceId = source
        rel.targetId = target
        rel.color = color
        rel.weight = 1
        if (contentType == "root") {
            rel.name = "方位"
        }
        relationshipArray.current = [...relationshipArray.current, rel]
        updateRelationshipArray(relationshipArray.current)
    // }
    };

    //----删除某个已标定关系结果
    const DeleteSomeRelationshipResultLabel = (id) => {
        console.log(id)
        let _arrays = annotate.current.Arrays
        let indexs = []
        _arrays.relationshipAnnotateShower.forEach((item, index) => {
            let sourceId = item.sourceId
            let targetId = item.targetId
            if((sourceId == id)||(targetId == id)){
                indexs.push(index)
            }
        })
        for(let i=0;i<indexs.length;i++){
            annotate.current.Arrays.relationshipAnnotateShower.splice(indexs[i]-i, 1);
            relationshipArray.current.splice(indexs[i]-i, 1);
        } 
        updateRelationshipArrayTp()
        RecordOperation('delete', '删除标定关系', indexs, JSON.stringify(_arrays.relationshipAnnotateMemory))
        RepaintResultList();
    };


    //----更新曲线信息
    const CreateNewCurveResultList = (index, source, target, cP1, cP2) => {
        let id = uuid()
        let tp = {
            id: id,
            source: source,
            target: target,
            controlPoint1: cP1,
            controlPoint2: cP2,
        }
        // console.log(i,_arrays,_arrays.trend)
        annotate.current.Arrays.imageAnnotateShower[index].trend.push(tp)
        ReplaceAnnotateMemory();
    };

    //----删除某个已标定关系结果
    const DeleteSomeCurveResultLabel = (index, i) => {
        ReplaceAnnotateMemory();
        RecordOperation('delete', '删除标定曲线', index, JSON.stringify(this.Arrays.relationshipAnnotateMemory[index]));
        annotate.current.Arrays.relationshipAnnotateShower[index].trend.splice(i, 1);
        RepaintResultList();
    };
    //----历史记录类型判断处理
    const HistoryTypeOperation = (type, index, content) => {
        switch (type) {
            case "add":
                annotate.current.Arrays.imageAnnotateMemory.splice(index, 0, JSON.parse(content));
                break;
            case "addPoint":
                annotate.current.Arrays.imageAnnotateMemory[index] = JSON.parse(content);
                break;
            case "delete":
                annotate.current.Arrays.imageAnnotateMemory.splice(index, 1);
                break;
            default:
                annotate.current.Arrays.imageAnnotateMemory[index] = JSON.parse(content);
                break;
        }
    };

    //----记录每步操作存储在内存中
    const RecordOperation = (type, desc, index, content) => {
        // 渲染到页面上
        if (annotate.current.historyIndex < annotate.current.Arrays.history.length) {
            // RenderHistory(type, desc, annotate.current.historyIndex + 1);
            annotate.current.Arrays.history.splice(annotate.current.historyIndex + 1, annotate.current.Arrays.history.length);
        }
        else {
            // RenderHistory(type, desc, annotate.current.historyIndex);
            annotate.current.Arrays.history.splice(annotate.current.historyIndex, annotate.current.Arrays.history.length);
        }
        let historyData = {
            type: type,
            desc: desc,
            index: index,
            content: content,
        };
        annotate.current.Arrays.history.push(historyData);
        annotate.current.historyIndex++;
    };

    //----将历史记录渲染到页面上
    const RenderHistory = (type, desc, index) => {
        let children = annotate.current.Nodes.historyGroup.children;
        children.length > 0 && children[index - 1].classList.remove('active');
        for (let i = children.length - 1; i >= 0; i--) {
            children[i].classList.value.indexOf('record') > -1 && annotate.current.Nodes.historyGroup.removeChild(children[i]);
        }
        let history = document.createElement('p');
        history.setAttribute("data-type", type);
        history.setAttribute("data-index", index);
        history.innerText = desc;
        history.classList.add('active');
        annotate.current.Nodes.historyGroup.appendChild(history);
    };


    //---- 随机颜色
    const coloring = () => {
        let r = Math.floor(Math.random() * 255)
        let g = Math.floor(Math.random() * 255)
        let b = Math.floor(Math.random() * 255)
        return `rgb(${r}, ${g}, ${b})`
    }



    const imagesChange = (e) => {
        let ind = e.target.options.selectedIndex
        annotate.current.Arrays.imageAnnotateMemory.length > 0 && localStorage.setItem(task.current.name, JSON.stringify(annotate.current.Arrays));  // 保存已标定的图片信息

        imgIndex.current = ind + 1;
        selectImage(imgIndex.current - 1)
    }

    const preImg = (e) => {

        annotate.current.Arrays.imageAnnotateMemory.length > 0 && localStorage.setItem(task.current.name, JSON.stringify(annotate.current.Arrays));  // 保存已标定的图片信息
        if (imgIndex.current == 1) {
            imgIndex.current = (imgSum.current);
            selectImage(imgIndex.current - 1)
        }
        else {
            imgIndex.current = (imgIndex.current - 1)
            selectImage(imgIndex.current - 1)
        }
    }

    const nextImg = (e) => {
        annotate.current.Arrays.imageAnnotateMemory.length > 0 && localStorage.setItem(task.current.name, JSON.stringify(annotate.current.Arrays));  // 保存已标定的图片信息
        if (imgIndex.current >= imgSum.current) {
            imgIndex.current = (1);
            selectImage(0)
        }
        else {
            imgIndex.current = (imgIndex.current + 1)
            selectImage(imgIndex.current - 1)
        }
    }

    const objectDetectionChange = (e) => {

    }

    const showRelationshipAttribute = (relationships) => {

        // if (relationships.length == 0) return <>暂无数据</>;
        // return relationships.map((relationship) => {
        return (
            <GraphRelationship relationship={relationships} ></GraphRelationship >
        )
        // })


    }

    const toolClick = (e) => {
        var tar = (e.target as any)
        console.log(tar.className)
        switch (true) {
            case tar.className.indexOf('toolDrag') > -1:  // 拖拽
                SetFeatures('dragOn', true);
                break;
            case tar.className.indexOf('toolRect') > -1:  // 矩形
                SetFeatures('rectOn', true);
                break;
            case tar.className.indexOf('toolPolygon') > -1:  // 多边形
                SetFeatures('polygonOn', true);
                break;
            case tar.className.indexOf('toolChangeLayout') > -1:  // 改变布局
                SetFeatures('layoutOn', true);    
                changeGeneralLayout();
                break;
            case tar.className.indexOf('toolDropTree') > -1:  // 改变层级
                SetFeatures('dropTOn', true);
                break;
            case tar.className.indexOf('toolCombinTree') > -1:  // 改变层级
                SetFeatures('toolCombinOn', true);
                break;
            case tar.className.indexOf('toolTagsManager') > -1:  // 标签管理工具
                SetFeatures('tagsOn', true);
                break;
            case tar.className.indexOf('toolRelationship') > -1:  // 标签管理工具
                let type = tar.className.split(" ")[1]
                SetRelType(type)
                SetFeatures('relationshipOn', true);
                break;
            case tar.className.indexOf('toolTrend') > -1:  // 标签管理工具
                SetFeatures('trendOn', true);
                break;
            default:
                break;
        }
    }
    const SetRelType = (t) => {
        switch (true) {
            case t == 'eve':
                relType.current = ({ type: "event", color: "rgb(255,0,0)" })
                break;
            case t == 'pos':
                relType.current = ({ type: "position", color: "rgb(0,255,0)" })
                break;
            case t == 'att':
                relType.current = ({ type: "attribute", color: "rgb(0,0,255)" })
                break;
        }
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
        let entityId = ent.target.id
        attrInddex.current = -1;

        let vis = true;
        if (layoutType == 0) {
            entityContext.array.forEach(function (element, index, arr) {
                if (element.id === entityId) {
                    arr[index].active = true
                }
                else
                    arr[index].active = false
            })

            let element = entityContext.array.find(function (_item, index, arr) {
                return _item.id === entityId
            })
            let k = 0;
            var elementChild = element.children
            var childLen = elementChild.length
            while (k < childLen) {
                console.log(elementChild[k])
                let eTarget = entityContext.array.find(function (item, index, arr) {
                    return item.id === elementChild[k]
                })
                if( k == 0){
                    vis = !eTarget.visAble
                }
                eTarget.visAble = vis
                k++
            }

            if (changeActive.current == 0) {
                // setEntityArray([...entityArray])
                updateEntityArray(entityContext.array)
                updateInfo({ changeState: 1 })
                changeActive.current = 1
            }
        }
        if (toolType == 1) {
            d3.select('#graph').select('svg').selectAll(".text_" + entityId).remove()
            d3.select('#graph').select('svg').selectAll("." + entityId).remove()
            delEntityById(entityId)
        }
        if (toolType == 2) {
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
        attrInddex.current = -1;
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

            let element = entityContext.array.find(function (_item, index, arr) {
                return _item.id === item.id
            })
            let k = 0;
            var elementChild = element.children
            var childLen = elementChild.length
            while (k < childLen) {
                console.log(elementChild[k])
                let eTarget = entityContext.array.find(function (item, index, arr) {
                    return item.id === elementChild[k]
                })
                // eTarget.visAble = true
                k++
            }

            if (changeActive.current == 0) {
                // setEntityArray([...entityArray])
                updateEntityArray(entityContext.array)
                updateInfo({ changeState: 1 })
                changeActive.current = 1
            }
        }

        // var sPathD = d3
        //     .selectAll("[class*=" + "sD-" + item.id + "]")
        //     .style("display", "block")

        // var tPathD = d3
        //     .selectAll("[class*=" + "tD-" + item.id + "]")
        //     .style("display", "block")


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
        var item = ent.target
        entityContext.array.forEach(function (i, index, arr) {
            arr[index].active = false
        })
        let element = entityContext.array.find(function (_item, index, arr) {
            return _item.id === item.id
        })


        // let k = 0;
        // var elementChild = element.children
        // var childLen = elementChild.length
        // while (k < childLen) {
        //     console.log(elementChild[k])
        //     let eTarget = entityContext.array.find(function (item, index, arr) {
        //         return item.id === elementChild[k]
        //     })
        //     eTarget.visAble = false
        //     k++
        // }

        if (changeActive.current == 1) {
            // setEntityArray([...entityArray])
            updateEntityArray(entityContext.array)
            updateInfo({ changeState: 1 })
            changeActive.current = 0
        }
        // }


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

         // 获取单位向量
    const getUnitVector = (pointO, pointA) => {
        var point = [0, 0];
        var distance = Math.sqrt(Math.pow((pointO[0] - pointA[0]), 2) + Math.pow((pointO[1] - pointA[1]), 2));

        point[0] = (pointA[0] - pointO[0]) / distance;
        point[1] = (pointA[1] - pointO[1]) / distance;

        return point;
    }
    //切换图谱布局
    const SetLayOut = (i) => {
        setLayoutType(i)
        if (i == 2) {
            changeToolType(0)
        }
    }
    
    //绘制图谱
    const drawGraph = ()=>{
            let divWidth = chart.current.clientWidth
            let divHeight = chart.current.clientHeight
            
            let svgWidth = annotate.current.iWidth
            let svgHeight = annotate.current.iHeight
            if (svgHeight> svgWidth){
                svgHeight = svgHeight*(svgWidth/divWidth)
                svgWidth = divWidth
            }
            else{
                svgWidth = svgWidth*(svgHeight/divHeight)
                svgHeight = divHeight
            }
            let rSize = 60
            var graphsvg =  d3.select('#graph').select("#graphSvg")
            var entSvg = graphsvg.select("#entityGraph")
            entSvg.select('#entityG').remove()
            entSvg.select('#attrG').remove()
            var attrSvg = entSvg.append("g")
                .attr("id", "attrG")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
            var svg = entSvg.append("g")
                .attr("id", "entityG")
                .attr("width", svgWidth)
                .attr("height", svgHeight)


            var relGraphsvg = graphsvg.select("#relationshipGraph")
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

            var graphZoom = d3.zoom()
                .scaleExtent([0.1, 10])
                .on('zoom', (e) => {
                   entSvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')'
                    )
                   relGraphsvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')'
                    )
                })
                .on('end', (e) => {
                    entSvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')'
                    )
                    relGraphsvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')'
                    )
                });
            var graphDrag = d3.drag()
                .on('drag', (e) => {
                    entSvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ')'
                    )
                    relGraphsvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ')'
                    )
                })
                .on('end', (e) => {
                    entSvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ')'
                    )
                    relGraphsvg.attr('transform',
                        'translate(' + e.transform.x + ',' + e.transform.y + ')'
                    )
                });
            
                graphsvg.call(graphZoom).call(graphDrag)
                // .call(graphZoom.transform, d3.zoomIdentity.scale(1))


            if (layoutType == 0 || layoutType == 2) {
                for (let i = 0; i < entityContext.array.length; i++) {
                    const element = entityContext.array[i];
                    if (element.visAble) {
                        if (layoutType == 0) {
                            element.x = svgWidth * (element.lx - element.ix) / (element.iScale * element.iWidth)
                            element.y = svgHeight * (element.ly - element.iy) / (element.iScale * element.iHeight)
                        }
                        
                        if (focusEntId.current == element.id) {
                            //显示属性
                            
                        var smallR = 10
                        var k = 0
                        var attrStartR = -Math.PI / 2
                        var elementAttribute = element.attribute
                        var attrLen = elementAttribute.length
                        var attrStepR = Math.PI *2 / attrLen
                            while (k < attrLen) {
                                var t = attrStartR + k * attrStepR
                                var dataset = { startAngle: attrStartR + (k-1) * attrStepR , endAngle: t}; //创建一个弧生成器
                                var arcPath = d3.arc()
                                    .innerRadius(rSize)
                                    .outerRadius(rSize+5);
                                var x = element.x + (rSize + smallR) * Math.cos(t)
                                var y = element.y + (rSize + smallR) * Math.sin(t)
                                var attr = attrSvg.append("path")
                                    .attr("d",arcPath(dataset))	
                                    .attr("transform","translate("+element.x+","+element.y+")")
                                    .attr("stroke",mcolor[k])
                                    .attr("id","attr "+k)
                                    .attr("stroke-linejoin","round")
                                    .attr("stroke-width",function(){
                                        if(attrInddex.current==k)return"5.5px";
                                        return "1.5px";
                                    })
                                    .attr("fill",mcolor[k])
                                    .on("click", (d) => {
                                        let str = (""+d.target.id).split(' ')
                                        attrInddex.current = str[1]
                                        drawGraph()
                                        d3.select(this).attr("stroke-width","5.5px")
                                    })
                                    .on("mouseover", function (d) {
                                        d3.select(this).attr("stroke-width","5.5px")
                                    })
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
                            .attr("stroke-width", "0")
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

                        svg.append("foreignObject")
                            .attr("id", "input_" + element.id)
                            .attr("class", "input_" + element.id)
                            .attr("x", element.x)
                            .attr("y",  element.y+10)
                            .attr('width',rSize*2-20)
                            .attr('height','20')
                            .attr("transform",function(d){
                                 let bbox = this.getBBox()
                                return "translate("+(-bbox.width/2)+","+(-20)+")"
                            })      

                        let inputKey = document.createElement('input');
                        inputKey.className = "entInput"
                        inputKey.setAttribute('id','inKey_'+element.id)
                        inputKey.style.color = element.color
                        if(attrInddex.current==-1||(focusEntId.current != element.id) ){
                            inputKey.style.width = "0%"
                        }
                       else{
                        inputKey.setAttribute('value', element.attribute[attrInddex.current]['attrKey'])
                       }
                        
                        let textArea = document.getElementById("input_" + element.id)
                        textArea.appendChild(inputKey)
                        


                        inputKey.addEventListener('input', (d) => {
                            const target = d.target as HTMLTextAreaElement;
                            entityContext.array.forEach(function (item, index, arr) {
                                if (element.id === item.id) {
                                    if(attrInddex.current==-1||(focusEntId.current != element.id)){
                                    arr[index].name = target.value
                                    }
                                    else{
                                    arr[index].attribute[attrInddex.current]['attrKey'] = target.value
                                    }
                                }
                            })
                        })
                        
                        let input = document.createElement('input');
                        input.className = "entInput"
                        input.setAttribute('id','inValue_'+element.id)
                        input.style.color = element.color
                        if(attrInddex.current==-1||(focusEntId.current != element.id) ){
                            input.style.width = "100%"
                             input.setAttribute('value', element.name)
                        }
                       else{
                        input.setAttribute('value', element.attribute[attrInddex.current]['attrValue'])
                       }

                        textArea.appendChild(input)
                        

                        window.addEventListener("keyup", (e) => {
                            if ("Enter" === e.key) {
                                input.blur()
                                window.onkeyup = null
                            }
                        })
                        input.addEventListener('input', (d) => {
                            const target = d.target as HTMLTextAreaElement;
                            console.log(d)
                            entityContext.array.forEach(function (item, index, arr) {
                                if (element.id === item.id||(focusEntId.current != element.id) ) {
                                    if(attrInddex.current==-1){
                                    arr[index].name = target.value
                                    }
                                    else{
                                    arr[index].attribute[attrInddex.current]['attrValue'] = target.value
                                    }
                                }
                            })
                        })
                        // input.addEventListener("blur",()=>{textArea.removeChild(input)})
                        
                        // var text = svg.append("text")
                        //     .attr("id", "text_" + element.id)
                        //     .attr("class", "text_" + element.id)
                        //     .attr("x", element.x)
                        //     .attr("y",  element.y)
                        //     .text(element.name)
                        //     .attr("transform",function(d){
                        //          let bbox = this.getBBox()
                        //         return "translate("+(-bbox.width/2)+","+(0)+")"
                        //     })
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
                        if(eSource.visAble&&eTarget.visAble){
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

    const initGraphSvg = ()=>{
        let svgWidth = chart.current.clientWidth
        let svgHeight = chart.current.clientHeight
        let rSize = 30
        attrInddex.current = -1;
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
    }
    
    //图谱初始化
    const init = () => {
        entityArray.current = []
        relationshipArray.current = []

        delEntityArray.current = []
        delRelationshipArray.current = []

        // setToolType(-1)
       initGraphSvg()


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
                        // addRelationship()
                        break;
                    case tar.className.indexOf('del') > -1:
                        changeToolType(1)
                        break;
                    case tar.className.indexOf('undo') > -1:
                        // history('undo')
                        break;
                    case tar.className.indexOf('toolPrint') > -1:
                        // history('redo')
                        saveJsonClick()
                        break;
                    case tar.className.indexOf('toolInputJson') > -1:
                        console.log("asdasd")
                        inputJsonClick()
                        break;
                    
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
    }
    const formatAttr = (name,attrs)=>{
        return(
            <AttributeInput name={name} attributes={attrs} changeName={changeName} changeAttributes={changeAttributes} confirm ={changeAttributeConfirm} ></AttributeInput>   
        )
    }


    //切换页面布局
    const changeGeneralLayout =()=>{
        var canvas = document.getElementById('canvas') as HTMLCanvasElement;
        var canvasContent = document.getElementById('canvasContent') as HTMLCanvasElement;
        canvas.style.width = ""+canvasContent.clientWidth
        canvas.style.height = ""+canvasContent.clientHeight
        
        canvas.width =canvasContent.clientWidth
        canvas.height =canvasContent.clientHeight
        console.log(canvas,canvasContent)
        // // 画布宽度
        annotate.current.cWidth = canvas.clientWidth;
        // 画布高度
        annotate.current.cHeight = canvas.clientHeight;

        let imgWin = document.getElementById('imagDiv');
        imgWin.className = 'horizontal_imagDiv'
        let graphWin = document.getElementById('graphRoot');
        graphWin.className = 'horizontal_graphRoot'
        let graphDiv = document.getElementById('graphDiv');
        graphDiv.className = 'horizontal_graphDiv'
        let AttrDiv = document.getElementById('attributeDiv');
        AttrDiv.className = 'horizontal_attributeDiv'

        initGraphSvg()

        annotate.current.Arrays.imageAnnotateMemory.length > 0 && localStorage.setItem(task.current.name, JSON.stringify(annotate.current.Arrays));  // 保存已标定的图片信息

        selectImage(imgIndex.current - 1)
        DrawSavedAnnotateInfoToShow()
        drawGraph()
    }

    //初始化
    useEffect(() => {

        // changeGeneralLayout()
         
        var annotateTp = new LabelImage({})
        var entityArrayTp = new EntityArray()
        var relationshipArrayTp = new RelationshipArray()

        var scaleCanvas = document.querySelector('.scaleCanvas') as HTMLCanvasElement;
        // 设置画布宽高背景色
        var canvas = document.getElementById('canvas') as HTMLCanvasElement;
        var canvasContent = document.getElementById('canvasContent') as HTMLCanvasElement;
        canvas.width =canvasContent.clientWidth
        canvas.height = canvasContent.clientHeight

        let _nodes = annotateTp.Nodes;
        _nodes.scaleRect = document.getElementById('scaleWindow') as HTMLCanvasElement;
        inpolList.current = []

        updateInfo({ changeState: 0 })


        // _nodes.scaleRect.className = "scaleWindow";
        // _nodes.scaleRect.id = "scaleWindow"
        // _nodes.scaleRect = document.createElement('div');
        _nodes.canvas = canvas
        _nodes.scalePanel = document.querySelector('.scalePanel')
        _nodes.labelShower = document.querySelector('.labelShower')
        _nodes.annotateState = document.querySelector('.annotateState')
        _nodes.canvasMain = document.querySelector('.canvasMain')
        _nodes.resultGroup = document.querySelector('.resultGroup')
        _nodes.crossLine = document.querySelector('.crossLine')
        _nodes.labelShower = document.querySelector('.labelShower')
        _nodes.screenShot = document.querySelector('.screenShot')
        _nodes.screenFull = document.querySelector('.screenFull')
        _nodes.colorHex = document.querySelector('#colorHex')
        _nodes.toolTagsManager = document.querySelector('.toolTagsManager')
        _nodes.historyGroup = document.querySelector('.historyGroup')
        _nodes.ctx = canvas.getContext('2d')
        _nodes.scaleCanvas = scaleCanvas

        Object.assign(_nodes.scaleRect.style, { position: "absolute", border: "1px solid red", boxSizing: "border-box" });
        _nodes.scaleCanvas.appendChild(_nodes.scaleRect);

        //绑定各个监听事件
        _nodes.canvas.addEventListener('mousedown', CanvasMouseDown);
        _nodes.canvas.addEventListener('mousewheel', MouseWheel);
        _nodes.canvas.addEventListener("DOMMouseScroll", MouseWheel); // 兼容Firefox 滚动条事件
        _nodes.canvas.addEventListener('contextmenu', (e => { e.preventDefault(); }));
        _nodes.scaleCanvas.addEventListener('click', ScaleCanvasClick);
        _nodes.canvas.addEventListener('mousemove', CanvasMouseMove);

        // 画布宽度
        annotateTp.cWidth = canvas.clientWidth;
        // 画布高度
        annotateTp.cHeight = canvas.clientHeight;
        // canvas.style.background = "#8c919c";     

        let tool = document.getElementById('labelTools');
        tool.addEventListener('click', function (e) {
            for (let i = 0; i < tool.children.length; i++) {
                tool.children[i].classList.remove('focus');
            }
            var tar = (e.target as any)
            tar.classList.add('focus');
        })

        const prevBtn = document.querySelector('.pagePrev');                    // 上一张
        const nextBtn = document.querySelector('.pageNext');                    // 下一张
        const pageName = document.querySelector('.pageName');                   // 标注任务名称

        // const toolEntity = document.querySelector('.toolEntity');
        // const toolEntityDiv = document.getElementById('toolEntityDiv')



        // toolEntity.addEventListener("mouseover", (e) => {
        //     toolEntityDiv.style['z-index'] = 9999
        //     toolRelationshipDiv.style['z-index'] = -9999
        //     toolAttributeDiv.style['z-index'] = -9999

        // })
        // toolEntityDiv.addEventListener("mouseleave", (e) => {
        //     toolEntityDiv.style['z-index'] = -9999
        // })

        // const toolRelationship = document.querySelector('.toolRelationships');
        // const toolRelationshipDiv = document.getElementById('toolRelationshipDiv')
        // toolRelationship.addEventListener("mouseover", (e) => {
        //     toolRelationshipDiv.style['z-index'] = 9999
        //     toolEntityDiv.style['z-index'] = -9999
        //     toolAttributeDiv.style['z-index'] = -9999

        // })
        // toolRelationshipDiv.addEventListener("mouseleave", (e) => {
        //     toolRelationshipDiv.style['z-index'] = -9999
        // })

        // const toolAttribute = document.querySelector('.toolAttribute');
        // const toolAttributeDiv = document.getElementById('toolAttributeDiv')
        // toolAttribute.addEventListener("mouseover", (e) => {
        //     toolAttributeDiv.style['z-index'] = 9999
        //     toolEntityDiv.style['z-index'] = -9999
        //     toolRelationshipDiv.style['z-index'] = -9999

        // })
        // toolAttributeDiv.addEventListener("mouseleave", (e) => {
        //     toolAttributeDiv.style['z-index'] = -9999
        // })

        window.addEventListener("keyup", (e) => {
            let _arrays = annotate.current.Arrays;
            if (("Delete" === e.key) ) {
                console.log(_arrays.resultIndex,_arrays.imageAnnotateShower,_arrays.imageAnnotateShower[_arrays.resultIndex - 1])
                DeleteSomeResultLabel(_arrays.resultIndex - 1)
            }
        })

        annotate.current = annotateTp
        relationshipArray.current = relationshipArrayTp


        let imgTool = document.getElementById('labelHeadTools');
        imgTool.addEventListener('click', function (e) {
            var tar = (e.target as any)
            switch (true) {
                case tar.className.indexOf('toolZoomIn') > -1:  // 放大
                    zoom('In');
                    break;
                case tar.className.indexOf('toolZoomOut') > -1:  // 缩小
                    zoom('Out');
                    break;
                case tar.className.indexOf('toolRotate') > -1:  // 旋转
                    // 
                    break;
                default:
                    break;
            }
        })


        init()

    }, []);//初始化
    useEffect(() => {
        let _arrays = annotate.current.Arrays;
        if ((infoContext != undefined) && (infoContext.changeState == 1)) {
            updateShowerByEntityArray()
            updateInfo({ changeState: 0 })
            update.current = 1
        }
    }, [entityContext, infoContext])
    useEffect(() => {
        if (update.current == 1) {
            DrawSavedAnnotateInfoToShow()
            drawGraph()
        }
    }, [update.current])
    useEffect(()=>{
        drawGraph()
    }, [relationshipContext.array, entityContext.array, toolType, layoutType]);
    useEffect(() => {
        let _arrays = annotate.current.Arrays;
        relationshipArray.current = (relationshipContext.array)
    }, [relationshipContext])


    return (
        <React.StrictMode>
            <div className="Root">
                <div className="canvasMain">
                    {/* <!--标注功能工具集--> */}
                    <div id="sideBar" className="toolFeatures">

                            <div className="baseInformationHead">
                                <div className="logo"></div>
                                <h5>Visual Painting Annotation</h5>
                            </div>
                            {/* <div className="LabelType"> */}
                        <div className="baseInformation">
                            <div className="infoTitle">古  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;画：
                                <select className="imgSelect" onChange={imagesChange.bind(this)}>
                                    {imagesList.map((item, index) => {
                                        // console.log(item)
                                        return (
                                            <option value={item.id} key={index}>
                                                {item.name.split(".")[0]}
                                            </option>
                                        )
                                    })

                                    }
                                </select>
                                <div className="openFolder" title="打开文件夹"><img className="toolImg" src={svg_input_url} onClick={() => { folderBut() }} alt="import image"></img></div>
                                {/* <div className="toolBut saveJson" title="生出Json并保存到本地" onClick={(e) => saveJsonClick(e)}><img className="toolImg" src={svg_download_url} onClick={() => { SetFeatures('rectOn', true) }} alt="import image"></img></div> */}
                                <input className="openFolderInput" type="file" multiple onChange={(e) => changeFolder(e)} />
                            </div>
                            <div className="infoAuthor">作  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;者：<a>{task.current.author}</a></div>
                            <div className="infoTime">创作时间：<a>{task.current.time}</a></div>
                            <div className="infoTexture">材&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;质：<a>{task.current.texture}</a></div>
                            
                            <div className="infoSize">尺&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;寸：<a>{task.current.size}</a></div>
                            {/* <div className="assistFeatures">
                                <div className="toolBut openFolder" title="打开文件夹"><img className="toolImg" src={svg_input_url} onClick={() => { folderBut() }} alt="import image"></img></div>
                                <div className="toolBut saveJson" title="生出Json并保存到本地" onClick={(e) => saveJsonClick(e)}><img className="toolImg" src={svg_download_url} onClick={() => { SetFeatures('rectOn', true) }} alt="import image"></img></div>
                                <input className="openFolderInput" type="file" multiple onChange={(e) => changeFolder(e)} />

                                <div className="pageControl">
                                    <div className="pagePrev pageSwitch inline-block" title="上一张" onClick={(e) => preImg(e)}></div>
                                    <div className="pageInfo inline-block">
                                        <p className="nameProcess" title="图片位置"><span className="processIndex">0</span> / <span className="processSum">0</span></p>
                                    </div>
                                    <div className="pageNext pageSwitch inline-block" title="下一张" onClick={(e) => nextImg(e)}></div>
                                </div>
                            </div> */}
                        {/* </div> */}
                        </div>
                        {/* <div className="separator"></div> */}
                        {/* <div id="tools">


                            <div className="toolsHead">
                                <div className="toolsLogo"></div>
                                <h5>AI-Assisted Annotation</h5>
                            </div>
                            <div className="AITools">
                            <div className="objectDetection">目标检测：
                                <select className="AIInterfaceSelect" onChange={objectDetectionChange.bind(this)}>
                                    <option value={"Faster-rnn"} key={0}>
                                        {"Faster-rnn"}
                                    </option>
                                </select>
                               <div id="entityRecognize" onClick={() => { entityRecognize() }} title="打开文件夹"></div>
                            </div>
                            <div className="relationshipPrediction">关系预测：
                                <select className="AIInterfaceSelect" onChange={objectDetectionChange.bind(this)}>
                                    <option value={"Graph RCNN"} key={0}>
                                        {"Graph RCNN"}
                                    </option>
                                </select>
                            </div>
                            <div className="modelOptimization">模型优化：
                                <select className="AIInterfaceSelect" onChange={objectDetectionChange.bind(this)}>
                                    <option value={"Active Learing"} key={0}>
                                        {"Active Learing"}
                                    </option>
                                </select>
                            </div>
                            <div className="AISelect">图片检索：
                            <input className="AIInterfaceInput"></input>
                            </div>
                            </div>

                            <div className="generalFeatures">
                                <p className="featureList crossLine" title="十字线开关">
                                    <input className="mui-switch mui-switch-anim" type="checkbox" />
                                </p>
                                <p className="featureList labelShower focus" title="标注结果显示开关">
                                    <input className="mui-switch mui-switch-anim" type="checkbox" />
                                </p>
                                <p className="featureList screenShot" title="标注内容截图">
                                    <i className="bg"></i>
                                </p>
                                <p className="featureList screenFull" title="全屏开关">
                                    <i className="bg"></i>
                                </p>
                            </div>

                        </div> */}
                        <div id="attrDiv">
        
                                <p className="featureList labelShower focus" title="标注结果显示开关">
                                    <input className="mui-switch mui-switch-anim" type="checkbox" />
                                </p>
                            {formatAttr(nameTp.current,attributesTp.current)}
                            {/* <AttributeInput name={nameTp.current} attributes={attributesTp.current} changeName={changeName} changeAttributes={changeAttributes}></AttributeInput> */}
                        </div>
                        <div className="scaleList">
                            {/* <div className="scaleListHead">
                                <div className="scaleListLogo"></div>
                                <h5>Scale List</h5>
                            </div> */}
                            <div></div>
                            <div id="scaleListContain">{formatScaleListData(imagesList)}</div>
                            {/* <div className="scaleCanvas"></div>
                            <div className="scalePanel"></div> */}
                        </div>
                        <div className="version">v1.0.1</div>
                        <div className="resultGroup"></div>

                        <div className="historyGroup">
                        </div>

                    </div>
                    <div id="imagDiv" className="imagDiv">

                        <div className="labelHead">

                            <div className="labelToolLogo"><h5>Annotation Tools</h5></div>
                            <div className="labelHeadToolDiv">

                                <div id="labelHeadTools">
                                <div className="toolSet toolRect" title="矩形工具" onClick={(e) => toolClick(e)}>圈选</div>
                                <div className="toolSet toolPolygon" title="多边形工具" onClick={(e) => toolClick(e)}>多边形</div>
                                <div className="toolSet toolChangeLayout" title="改变布局工具" onClick={(e) => toolClick(e)}>布局</div>
                                <div className="toolSet toolDropTree" title="添加层级工具" onClick={(e) => toolClick(e)}>层级</div>
                                <div className="toolSet toolCombinTree" title="组合层级工具" onClick={(e) => toolClick(e)}>组合</div>
                                <div className="toolSet toolRelationship relEvent" title="事件关系" onClick={(e) => toolClick(e)}>关系</div>
                                {/* <div className="toolSet toolRelationship relPosition" title="方位关系" onClick={(e) => toolClick(e)}>方位</div>
                                <div className="toolSet toolRelationship relAttribute" title="属性关系" onClick={(e) => toolClick(e)}>属性</div> */}
                                   
                                {/* <div className="labelTool toolEntity"><h5>标记实体</h5></div>
                                <div className="labelTool toolRelationships"><h5>添加关系</h5></div> */}
                                {/* <div className="toolSet toolAttribute"><h5>属性工具</h5></div> */}
                                <div  className="toolSet" id="entityRecognize" onClick={() => { entityRecognize() }} title="目标检测">检测</div>
                                </div>
                            </div>
                        </div>
                        <div id="canvasContent" className="canvasContent">
                            <canvas  id="canvas"></canvas>
                            <div id="attributeInputDiv">
                                <AttributeInput name={nameTp.current} attributes={attributesTp.current} changeName={changeName} changeAttributes={changeAttributes} confirm = {changeAttributeConfirm}></AttributeInput>
                            </div>
                            <div className="scaleBox">

                                <div className="scaleCanvas">
                                    <div className="scaleWindow" id="scaleWindow"></div>
                                </div>
                                <div className="scalePanel"></div>
                            </div>

                            <div className="labelToolDiv">

                                <div id="labelTools">
                                    {/* <div className="labelTool toolEntity"><h5>标记实体</h5></div>
                                    <div className="labelTool toolRelationships"><h5>添加关系</h5></div>
                                    <div className="labelTool toolAttribute"><h5>属性工具</h5></div> */}
                                    {/* <div className="toolSet toolDrag focus" title="图片拖拽">拖拽</div> */}
                                    {/* <div className="toolSet toolTagsManager"><span className="icon-tags">取色</span></div> */}
                                    {/* <div className="toolSet toolRelationship" title="关系标注">关系</div> */}
                                    {/* <div className="toolSet toolTrend" title="实体趋势标注">趋势</div> */}
                                    {/* <div className="toolSet toolColor" title="取色器"></div> */}
                                    <div className="labelHeadTool toolZoomIn"></div>
                                    <div className="labelHeadTool toolZoomOut"></div>
                                    <div className="labelHeadTool toolRotate"></div>
                                </div>
                                <div id="pageControl">
                                    <div className="pageControl">
                                        <div className="pagePrev pageSwitch inline-block" title="上一张" onClick={(e) => preImg(e)}></div>
                                        <div className="pageInfo inline-block">
                                            <span id="processIndex">0</span> <span>/</span> <span id="processSum">0</span>
                                        </div>
                                        <div className="pageNext pageSwitch inline-block" title="下一张" onClick={(e) => nextImg(e)}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="toolEntityDiv">
                            <div className="toolEntitySet toolRect" title="矩形工具" onClick={(e) => toolClick(e)}>圈选</div>
                            <div className="toolEntitySet toolPolygon" title="多边形工具">多边形</div>
                        </div>
                        <div id="toolRelationshipDiv">
                            <div className="toolRelationshipSet toolRelationship relEvent" title="事件关系" onClick={(e) => toolClick(e)}><div id="event" className="toolRelationship"></div><h6 className="toolRelationship eve">事件</h6></div>
                            <div className="toolRelationshipSet toolRelationship relPosition" title="方位关系" onClick={(e) => toolClick(e)}><div id="position" className="toolRelationship"></div><h6 className="toolRelationship pos">方位</h6></div>
                            <div className="toolRelationshipSet toolRelationship relAttribute" title="属性关系" onClick={(e) => toolClick(e)}><div id="attribute" className="toolRelationship"></div><h6 className="toolRelationship att">属性</h6></div>
                        </div>
                        <div id="toolAttributeDiv">
                            <div className="toolAttributeSet toolPickColor"><span className="icon-tags">取色</span></div>
                            <div className="toolAttributeSet toolTrend" title="实体趋势标注">趋势</div>
                        </div>

                    </div>            
                    <div id="graphRoot" className="graphRoot">
                <div className="graphCantain">

                    {/* <Button type="primary" onClick={() => addEntity()}>更新实体</Button>
                <Button type="primary" onClick={() => addRelationship()}>更新关系</Button>

                <Button type="primary" onClick={() => changeToolType(0)}>实体拖动</Button>
                <Button type="primary" onClick={() => changeToolType(1)}>实体删除</Button>
                <Button type="primary" onClick={() => changeToolType(2)}>实体属性</Button> */}
                    {/* <div className="butContain">
                        <div className="but"><Button path={svg_add_url} event={() => { addEntity() }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_jt_url} event={() => { addRelationship() }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_drop_url} event={() => { changeToolType(0) }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_del_url} event={() => { changeToolType(1) }} alt="import image"></Button></div>
                        <div className="but"><Button path={svg_attr_url} event={() => { changeToolType(2) }} alt="import image"></Button></div>
                    </div> */}
                    <div id="graphDiv" className="graphDiv">
                        <div className="graphHead">
                            <div className="graphLogo"><h5>Graph Interactions</h5></div>
                            <div className="graphToolsDiv">
                                <div id="graphTools">
                                    <div className="graphTool toolLayout " title="更改布局">布局</div>
                                    <div className="graphTool toolDrop" title="拖拽实体">拖拽</div>
                                    <div className="graphTool toolEdit" title="编辑图谱">编辑</div>
                                    {/* <div className="graphTool toolAdd " title="增加"><h5 className="add">增加</h5></div> */}
                                    {/* <div className="graphTool toolDel" title="删除"><h5 className="del">删除</h5></div> */}
                                    {/* <div className="graphTool toolUndo" title="撤消"><h5 className="undo">撤消</h5></div> */}
                                    {/* <div className="graphTool toolRedo" title="恢复"><h5 className="redo">恢复</h5></div> */}
                                    <div className="graphTool toolPrint" title="打印图谱">打印</div>
                                    <div className="graphTool toolInputJson" title="导入图谱">导入</div>
                                    <input className="JsonInput" type="file" multiple onChange={(e) => inputJson(e)} />
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
                    <div id="attributeDiv" className="attributeDiv">
                        {/* <div id="attributeBox"  >
                            {showEntityAttribute(currentEntity)}
                        </div> */}
                        <div id="relationshipBoxHead">
                            <div className="headName">Relationship Information</div>
                            </div>
                        <div id="relationshipBox"  >
                            {showRelationshipAttribute(relationshipContext.array)}
                        </div>
                    </div>
                </div>
            </div>
                </div>
            </div>


        </React.StrictMode>
    )
}
