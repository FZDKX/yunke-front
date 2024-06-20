import axios from "axios";
import { getTokenName } from "./tokenUtils";
import { messageTip } from "./elementUtils";

// 封装axios

// 创建axios对象实例
const request = axios.create({
    baseURL: 'http://localhost:8080',   // 基础地址
})

// 给request添加请求拦截器
request.interceptors.request.use(function (config) {
    config.headers['remember'] = false;
    // 发送请求之前，做点什么，请求头携带 token 与 remember
    let token = window.sessionStorage.getItem(getTokenName())
    // 如果session token没有
    if (!token) {
        // 查找 local storage
        token = window.localStorage.getItem(getTokenName())
        // 如果 token 有，那么代表 local storage有
        if (token) {
            config.headers['remember'] = true;
        }
    }
    // 添加请求头
    config.headers['Authorization'] = token;
    return config;
}, (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 给request添加响应拦截器
request.interceptors.response.use(function (response) {
    // 获取响应码
    const code = response.data.code;
    // token问题，直接跳转登录页
    if (code >= 900 && code < 910) {
        messageTip('登录信息失效，请重新登录', 'error')
        setTimeout(function () {
            //1秒后执行刷新
            window.location.href = '/login'
        }, 1500); //单位是毫秒
        return
    }
    else if (code !== 200) {
        messageTip(response.data.message, 'error')
        return
    }
    else {
        return response.data;
    }
}, (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 导出请求实例
export default request;