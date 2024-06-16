// 导入vue中的 createApp函数
import { createApp } from 'vue'
// 导入App.vue中的App组件
import App from './App.vue'
// 导入element组件
import ElementPlus from 'element-plus'
// 导入样式
import 'element-plus/dist/index.css'
// 路由
import router from './router'
// 导入element图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建以 App 组件为 根的应用
const app = createApp(App);
app.use(ElementPlus)
app.use(router)
// 全局挂载和注册 element-plus 的所有 icon
app.config.globalProperties.$icons = []
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.config.globalProperties.$icons.push(key)
    app.component(key, component)
}
// 挂载
app.mount('#app');
