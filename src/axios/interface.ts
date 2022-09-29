import { AxiosResponse } from 'axios';

export interface RequestConfig {
    url: string;
    data?: any;
    headers?: any;
    gateWay?: string;
}

export interface ResponseConfig<T> {
    message: string;
    code: number;
    data: T;
    subCode: number;
    msg: string;
}

export interface ResponseError<T> {
    data: ResponseConfig<T>;
    response: AxiosResponse<ResponseConfig<T>>;
}

export interface AppendixItem {
    nosKey: string;
    name: string;
    url?: string;
    uid?: string;
}
