// 导入请求实例
import request from "../utils/request";

// 表单提交登录
export function doLogin(formData) {
    return request.post('/api/login', formData)
}

// 自动免密登录
export function doAutoLogin() {
    return request.get('/api/login/auto')
}

// 退出登录
export function doLogout() {
    return request.get('/api/logout')
}