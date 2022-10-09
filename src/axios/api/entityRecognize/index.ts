import { get, put, post, del } from '../../http';
import axios from 'axios'
import{base} from '../config'
import {message} from 'antd'
import cookie from 'react-cookies'
export const getImg = (data: any) => get({ url: '/recognize/', data }); // 
export const postImg = (data: any) => post({ url: '/recognize/', data }); // 
export const updateImg = (data: any) => put({ url: '/recognize/', data }); 

export default{
    //测试
    async testApi(params){   
        return await axios.get(`${base}/hi`,params) .then((res)=>{  
            return res.data;
        }).catch((error)=>{
            message.error("服务器出错")
        })
    },
    //目标检测
    async entityRecognizeApi(params){
        return await axios.post(`${base}/predict_bbx`,params).then((res)=>{
            return res.data;
        }).catch((error)=>{
            message.error("服务器出错")
        })
    },
    
}