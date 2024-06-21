//从vue-router这个依赖库中导入createRouter()函数, createWebHistory()函数
import { createRouter, createWebHistory } from "vue-router";
import LoginViewVue from "../view/LoginView.vue";
import DashboardViewVue from "../view/DashboardView.vue";
import UserViewVue from "../view/UserView.vue";
import PermissionViewVue from "../view/PermissionView.vue"
import RoleViewVue from "../view/RoleView.vue";
import ActivityViewVue from "../view/ActivityView.vue";
import RemarkViewVue from "../view/RemarkView.vue";
import ClueViewVue from "../view/ClueView.vue";


//定义一个变量
let router = createRouter({
    //路由历史
    history: createWebHistory(),

    //配置路由，是一个数组，里面可以配置多个路由
    routes: [
        {
            //路由路径
            path: '/',
            //路由路径所对应的页面
            redirect: '/dashboard'
        },
        {
            //路由路径，配置动态路由，传递参数
            path: '/dashboard',
            //路由路径所对应的页面
            component: DashboardViewVue,
            children: [
                { path: 'user', component: UserViewVue },
                { path: 'permission', component: PermissionViewVue},
                { path: 'role', component: RoleViewVue},
                { path: 'activity', component: ActivityViewVue},
                { path: 'activity/remark/:id', component: RemarkViewVue},   // 备注页面，动态路由传参
                { path: 'clue', component: ClueViewVue}

            ]
        },
        {
            //路由路径
            path: '/login',
            //路由路径所对应的页面
            component: LoginViewVue
        }
    ]
})
//导出创建的路由对象
export default router;