import { ElMessage, ElMessageBox } from "element-plus";

// 消息提示
export function messageTip(msg, type) {
    ElMessage({
        showClose: true,  // 是否显示关闭按钮
        center: true,     // 文本是否居中
        duration: 2000,   // 显示时间 ms
        message: msg,     // 显示消息
        type: type        // 消息类型 success ， warning  ， info  ， error
    })
}
export function messageBox(msg) {
    return ElMessageBox.confirm(
        msg,
        '温馨提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
}