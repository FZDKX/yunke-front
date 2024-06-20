// 使用 event-bus 创建事件总线
import mitt from "mitt";
// 创建
const EventBus = mitt();
// 导出，后续直接使用
export default EventBus;

/**
 * 发送事件 ： EventBus.emit('key', msg)
 * 监听事件 ： EventBus.on('key' , (msg) => {
 *                    // 得到消息后的逻辑
 *            })
 * 取消监听 ： EventBus.off('key')
 * 全部取消 ： EventBus.all.clear()
 */