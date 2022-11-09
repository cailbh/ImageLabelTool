// // 获取url中的参数
// export const getParams: () => { [index: string]: string } = () => {
//     const search = location.search;
//     var reg = /(\w+)=([^&]+)/g,
//         params: { [index: string]: string } = {},
//         result: RegExpExecArray | null = null;

//     while ((result = reg.exec(search))) {
//         params[result[1]] = decodeURI(result[2]);
//     }
//     return params;
// };

// // 是否为Promise函数
// export const isPromise = str => Object.prototype.toString.call(str) === '[object Promise]';

// /**
//  * 深拷贝
//  */
// export const deepClone = (source: any) => {
//     if (!source || typeof source !== 'object') {
//         return source;
//     }
//     var targetObj: any[] | { [index: string]: any } = source.constructor === Array ? [] : {};
//     for (var keys in source) {
//         if (source.hasOwnProperty(keys)) {
//             if (source[keys] && typeof source[keys] === 'object') {
//                 // @ts-ignore
//                 targetObj[keys] = source[keys].constructor === Array ? [] : {};
//                 // @ts-ignore
//                 targetObj[keys] = deepClone(source[keys]);
//             } else {
//                 // @ts-ignore
//                 targetObj[keys] = source[keys];
//             }
//         }
//     }
//     return targetObj;
// };

// // 去除前后空格
// export const empty = (str: string) => str.replace(/^\s+|\s+$/g, '');

// // 去除所有空格
// export const emptyAll = (str: string) => str.replace(/\s/g, '');

// // 是否包含英文
// export const includeEn = (str: string) => str.search(/[a-zA-Z]+/) > -1;

// // 函数防抖 (只执行最后一次点击)
// export const debounce = (fn: Function, delay = 300) => {
//     let timer: NodeJS.Timeout | null;
//     return function(...args: any) {
//         timer && clearTimeout(timer);
//         timer = setTimeout(() => {
//             timer = null;
//             // @ts-ignore
//             fn.apply(this, args);
//         }, delay);
//     };
// };

// // 节流（n秒内只下执行一次）
// export const throttle = (fn: any, delay = 500) => {
//     let flag = false;
//     return function(...args: any) {
//         if (!flag) {
//             flag = true;
//             setTimeout(() => {
//                 console.log(flag);

//                 flag = false;
//                 // @ts-ignore
//                 fn.apply(this, args);
//             }, delay);
//         }
//     };
// };

// // 转化成百分比
// export const getPercent = (num: number | undefined, count = 1) => {
//     if (typeof num !== 'number') {
//         return '';
//     }
//     return `${parseFloat((num * 100).toFixed(count))}%`;
// };

// // 柯里化
// export const curry = (fn: Function) => {
//     if (typeof fn !== 'function') {
//         throw Error('No function provided');
//     }
//     return function curriedFn(...args: any[]) {
//         if (args.length < fn.length) {
//             return (...argus: any[]) => curriedFn(...args, ...argus);
//         }
//         return fn(...args);
//     };
// };

// // form表单 input只填空格 回车 相当于没填
// export const validateEmpty = (errInfo: string) => {
//     return () => ({
//         validator(rule: any, value: any) {
//             if (!value) {
//                 return Promise.reject('');
//             }
//             const tempValue = value.replace(/[\r\n\s]/g, '');
//             if (tempValue) {
//                 return Promise.resolve();
//             }
//             return Promise.reject(errInfo);
//         }
//     });
// };

// export const flatten = (arr, depth = 1) => arr.reduce((a, v) => a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v), []);
