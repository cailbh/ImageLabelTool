import axios, { AxiosError, AxiosInstance, Method } from 'axios';
import qs from 'qs';
import { notification } from 'antd';
// import { getParams } from '@/utils/tools';
import { rootURL, ServerCode, ServerCodeMap } from './config';
import { RequestConfig, ResponseConfig, ResponseError } from './interface';

let PUBLIC_PATH_HOST = '';
const service: AxiosInstance = axios.create({
    baseURL: PUBLIC_PATH_HOST + rootURL, // api的base_url
    timeout: 200000, // 请求超时时间
    withCredentials: true // 允许携带cookie
});

const source: { [key: string]: any } = {}; // cancelToken存储
let requestList: string[] = []; // 请求url存储

service.interceptors.request.use(
    (config: any) => {
        // header 中增加 32 位签名
        config.url = `/api${config.url}`;
        if (/get/i.test(config.method)) {
            // 检测是否存在该请求
            const requestIndex = requestList.findIndex(el => el === config.url);
            if (requestIndex > -1) {
                source[config.url]('终止请求');
                requestList.splice(requestIndex, 1);
            }
            config.cancelToken = new axios.CancelToken(function executor(c) {
                source[config.url] = c;
            });
            requestList.push(config.url);
        }
        return config;
    },
    error => {
        //请求错误时做些事
        return Promise.reject(error);
    }
);

// response拦截器
service.interceptors.response.use(
    // HTTP的状态码(只有200才走这里)
    response => {
        // 获取请求的api
        const request = response.config.url;
        const method = response.config.method;
        if (/get/i.test(method as Method)) {
            // 请求完成后，将此请求从请求列表中移除
            const requestIndex = requestList.findIndex(el => el === request);
            if (requestIndex > -1) {
                requestList.splice(requestIndex, 1);
                delete source[request as string];
            }
        }
        // 以下判断的是：接口状态码(data.code)
        const res = response.data;
        if (res.code == ServerCode.SUCCESS) return response.data;
        return Promise.reject({ data: res, response });
    },
    err => {
        // 统一错误拦截
        return Promise.reject(err);
    }
);
function isResponseError<R>(x: any): x is ResponseError<R> {
    return x.data;
}
function isAxiosError<R>(x: any): x is AxiosError<R> {
    return x.response;
}
// 错误处理
const errHandle: <R>(err: AxiosError<R> | ResponseError<R>) => Promise<R> = err => {
    // 判断上下文是“接口状态码”还是“HTTP状态码”
    let errResult = {};
    let code = -1;
    let message = '';
    if (isAxiosError(err) && err.response) {
        code = err.response.status;
        message = ServerCodeMap[code];
    }
    if (isResponseError(err)) {
        code = err.data.code;
        message = err.data.message;
    }
    // RedirectMap.hasOwnProperty(code) && window.location.replace(RedirectMap[code]);
    const ERR_MESSAGE = message || ServerCodeMap[code];

    switch (code) {
        case ServerCode.CONTINUE: // code 400 批量操作部分成功
            notification.warning({
                message: ERR_MESSAGE
            });
            break;
        case ServerCode.WRONG_REQUEST: //TODO  // code 402 message弹窗(mbo写的是412，但是后端没有412的处理)
            notification.warning({
                message: message
            });
            break;
        default:
            notification.error({
                message: ERR_MESSAGE
            });
            console.error(message);
    }
    if (isResponseError(err)) {
        errResult = err.data;
    }
    return Promise.reject(errResult);
};

const response: <R>(axiosObj: Promise<ResponseConfig<R>>) => Promise<R> = axiosObj => {
    return axiosObj.then(res => res.data).catch(err => errHandle(err));
};

/**
 * 四种请求方式
 * @param url       接口地址
 * @param data      接口参数（注：get后续将放入“含有params的对象”才能接到url；delete后续将放入“含有data属性的对象”才能通过payload传输）
 * @param headers   接口所需header配置
 * @param baseURL   接口所需网关
 */

export const get: <R>(req: RequestConfig) => Promise<R> = ({ url, data, headers, gateWay }) =>
    response(
        service.get(url, {
            params: data,
            headers,
            // @ts-ignore
            gateWay,
            paramsSerializer: params => {
                return qs.stringify(params, { indices: false });
            }
        })
    );
export const post: <R>(req: RequestConfig) => Promise<R> = ({ url, data, headers, gateWay }) =>
    // @ts-ignore
    response(service.post(url, data, { headers, gateWay }));
export const put: <R>(req: RequestConfig) => Promise<R> = ({ url, data, headers, gateWay }) =>
    // @ts-ignore
    response(service.put(url, data, { headers, gateWay }));
export const del: <R>(req: RequestConfig) => Promise<R> = ({ url, data, headers, gateWay }) =>
    // @ts-ignore
    response(service.delete(url, { data, headers, gateWay }));

export default service;
