<template>

    <el-container>
        <!-- 左侧 -->
        <el-aside :width="isCollapse ? '64px' : '180px'">
            <h3 class="title">{{ title }}</h3>
            <el-menu default-active="1" style="border-right:solid 0px;" background-color="#f7fbfc" unique-opened="true"
                :collapse="isCollapse" :collapse-transition="false" :router="true">
                <!-- 用户管理 -->
                <el-sub-menu :index="index" v-for="(menu, index) in menuList" :key="menu.id">
                    <template #title>
                        <el-icon>
                            <component :is="menu.icon" />
                        </el-icon>
                        <span>{{ menu.name }}</span>
                    </template>
                    <el-menu-item :index="item.url" v-for="(item) in menu.children" :key="item.id">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        {{ item.name }}
                    </el-menu-item>
                </el-sub-menu>
            </el-menu>
        </el-aside>
        <!-- 右侧 -->
        <el-container>
            <!-- 右侧头部 -->
            <el-header>
                <!-- 点击图标，展示菜单 -->
                <el-icon class="show" @click="showMenu">
                    <Fold />
                </el-icon>

                <!-- 用户操作 -->
                <el-dropdown :hide-on-click="false">
                    <!-- 头像 -->
                    <span>
                        <el-avatar :size="30"
                            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                    </span>

                    <!-- 下拉框内容 -->
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>我的资料</el-dropdown-item>
                            <el-dropdown-item>修改密码</el-dropdown-item>
                            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

            </el-header>

            <!-- 右侧主体 -->
            <el-main>
                <router-view />
            </el-main>
            <!-- 右侧底部 -->
            <el-footer>
                @版权所有 2024~2099 发着呆看星 2862219036@qq.com
            </el-footer>
        </el-container>
    </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { doLogout } from '../api/login';
// 组合式api使用 router
import { useRouter } from 'vue-router';
import { removeToken } from '../utils/tokenUtils';
import { messageBox, messageTip } from '../utils/elementUtils';
import { doGetUserAll } from '../api/user';
// 是否折叠菜单
const isCollapse = ref(false);
// 标题
const title = ref("Yun ke");
// 点击按钮，折叠菜单
const showMenu = () => {
    isCollapse.value = !isCollapse.value;
    title.value = (isCollapse.value ? '' : 'Yun Ke');
}
// 退出登录
const router = useRouter();
const logout = () => {
    // 弹框是否确定退出登录
    messageBox("是否确定退出登录?")
        .then(async () => {
            await doLogout().then((response) => {
                if (response.code === 200) {
                    // 清除token
                    removeToken()
                    // 跳转至登录页
                    router.push('/login')
                }
                // 退出登录失败
                else {
                    // 弹出提示
                    messageTip("退出登录失败", "error")
                }
            })
        })
}
// 保存信息
const menuList = ref([])
// 页面加载时，加载用户权限信息
onMounted(async () => {
    await doGetUserAll().then((res) => {
        if (res.code === 200) {
            menuList.value = res.data.tmenuPermissions;
        }
    })
})
</script>

<style scoped>
/* 左侧 */
.el-aside {
    background: #f7fbfc;
    /* height: calc(100vh); */
    min-height: 100vh
}

/* 头部 */
.el-header {
    background: #f8fafa;
    height: calc(6vh);
    line-height: calc(6vh);
}

/* 底部 */
.el-footer {
    background: #f8fafa;
    height: calc(4vh);
    line-height: calc(4vh);
    text-align: center;
    font-size: 10px;
}

/* 标题居中 */
.title {
    text-align: center;
}

/* 鼠标放上变成手 */
.show {
    cursor: pointer;
}

/* 头像下拉框 */
.el-dropdown {
    float: right;
    margin-top: 7px;
    margin-right: 10px;
}

/* 头像下拉框 隐藏黑色边框 */
.el-tooltip__trigger {
    outline: none;
}
</style>