//从vue-router这个依赖库中导入createRouter()函数, createWebHistory()函数
import { createRouter, createWebHistory } from "vue-router";
import LoginViewVue from "../view/LoginView.vue";
import DashboardViewVue from "../view/DashboardView.vue";
import UserViewVue from "../view/UserView.vue";
import PermissionViewVue from "../view/PermissionView.vue"
import RoleViewVue from "../view/RoleView.vue";
import ActivityViewVue from "../view/ActivityView.vue";
import ClueViewVue from "../view/ClueView.vue";
import { hasToken } from "../utils/tokenUtils";
import ActivityRemarkViewVue from "../view/ActivityRemarkView.vue";
import ClueOperateVue from "../view/ClueOperate.vue";
import ClueRemarkViewVue from "../view/ClueRemarkView.vue";
import CustomerViewVue from "../view/CustomerView.vue";
import CustomerRemarkViewVue from "../view/CustomerRemarkView.vue";
import TranViewVue from "../view/TranView.vue";
import TranRemarkViewVue from "../view/TranRemarkView.vue";
import ProductViewVue from "../view/ProductView.vue";


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
            name : 'dashboard',
            meta: {
                title: '首页',
                keepAlive: false // 此组件 不需要 被缓存
            },
            children: [
                {
                    path: 'user',
                    component: UserViewVue,
                    name : 'user',
                    meta: {
                        title: '用户页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'permission',
                    component: PermissionViewVue,
                    name : 'permission',
                    meta: {
                        title: '权限页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'role',
                    component: RoleViewVue,
                    name : 'role',
                    meta: {
                        title: '角色页',
                        keepAlive: false // 此组件不需要被缓存
                    }
                },
                {
                    path: 'activity',
                    component: ActivityViewVue,
                    name: 'activity',
                    meta: {
                        title: '活动页',
                        keepAlive: true // 此组件 可能需要 被缓存
                    }
                },
                {
                    path: 'activity/remark/:id',
                    component: ActivityRemarkViewVue,
                    name: 'activityRemark',
                    meta: {
                        title: '活动备注页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'clue',
                    component: ClueViewVue,
                    name: 'clue',
                    meta: {
                        title: '线索页',
                        keepAlive: true // 此组件 可能需要 被缓存
                    }
                },
                {
                    path: 'clue/operate/:id',
                    component: ClueOperateVue,
                    name: 'clueOperate',
                    meta: {
                        title: '线索操作页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'clue/remark/:id',
                    component: ClueRemarkViewVue,
                    name: 'clueRemark',
                    meta: {
                        title: '线索备注页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'customer',
                    component: CustomerViewVue,
                    name: 'customer',
                    meta: {
                        title: '客户管理页',
                        keepAlive: true // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'customer/remark/:id',
                    component: CustomerRemarkViewVue,
                    name: 'customerRemark',
                    meta: {
                        title: '客户备注页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'tran',
                    component: TranViewVue,
                    name: 'tran',
                    meta: {
                        title: '交易页',
                        keepAlive: true // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'tran/remark/:id',
                    component: TranRemarkViewVue,
                    name: 'tranRemark',
                    meta: {
                        title: '交易页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                },
                {
                    path: 'product',
                    component: ProductViewVue,
                    name: 'product',
                    meta: {
                        title: '产品页',
                        keepAlive: false // 此组件 不需要 被缓存
                    }
                }

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

// 配置路由前置首位
router.beforeEach((to, from, next) => {
    if (hasToken()) {
        //如果存在token，那么放行
        next()
    } else {
        //如果用户token不存在则跳转到login页面
        if (to.path === '/login') {
            next()
        } else {
            next('/login')
        }
    }
})

// 配置路由后置首位，进行组件缓存
// 一定要再afterEach中判断而不是beforeEach
// 因为beforeEach在点击返回之后获取到的值不准确，每返回一次，会获取到延后一次的to、history
router.afterEach((to) => {
    // 或者判断 to.forward , window.history.state.forward 是vue-router写入的，当返回或前进的时候才会有值
    if (window.history.state && window.history.state.forward) {
        to.meta.isBack = true;
    } else {
        to.meta.isBack = false;
    }
});
//导出创建的路由对象
export default router;