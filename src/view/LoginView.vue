<template>
    <el-container>
        <el-aside>
            <img src="../assets/loginBox.svg" class="img" />
            <p class="aside-title">云客</p>
        </el-aside>
        <el-main>
            <div class="mainTitle">欢迎</div>
            <div class="mainForm">
                <el-form ref="loginForm" :model="user" :rules="loginRules" label-width="100px">
                    <el-form-item label="账号" prop="username">
                        <el-input v-model.trim="user.username" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model.trim="user.password" />
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox label="记住密码" v-model="user.remember" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size="default" @click="login" round>登录</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { doAutoLogin, doLogin } from '../api/login';
import { messageTip } from '../utils/elementUtils';
import { getTokenName, removeToken } from '../utils/tokenUtils';
import { useRouter } from 'vue-router';
// form表单数据，需要响应式对象
const loginForm = ref(null);
const user = ref({
    username: '',
    password: '',
    remember: false
});
// 验证无需响应式对象
const loginRules = {
    username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度为6~16位', trigger: 'blur' }
    ]
}
// 登录方法
// 函数需要使用箭头函数
const login = async () => {
    await loginForm.value.validate((isValid) => {
        // 验证成功
        if (isValid) {
            // 创建 FormData
            let formData = new FormData();
            formData.append("username", user.value.username);
            formData.append("password", user.value.password);
            formData.append("remember", user.value.remember);
            // 发起请求
            doLogin(formData).then((response) => {
                // 登录成功
                if (response.code === 200) {
                    // 删除历史token
                    removeToken();
                    // 获取新token
                    if (user.value.remember === true) {
                        window.localStorage.setItem(getTokenName(), response.data);
                    } else {
                        window.sessionStorage.setItem(getTokenName(), response.data);
                    }
                    // 跳转到主页面 /dashboard
                    window.location.href = '/dashboard'
                }
                // 登录失败
                else {
                    // 提示
                    messageTip(response.message, "error")
                }
            })
        }
    })
}

const router = useRouter();
const autoLogin = async () => {
    // 判断是否选择记住我
    var token = window.localStorage.getItem(getTokenName());
    // 如果有值，尝试免密登录
    if (token) {
        await doAutoLogin().then((response) => {
            if (response.code === 200) {
                // 跳转到主页面 /dashboard
                router.push('/dashboard')
            } else {
                messageTip("请重新登录", "info")
            }
        })
    }
}
// 当进入登录页面时，如果选择了记住我(localStorage) 不为null，那么就尝试自动登录
onMounted(() => {
    autoLogin();
})

</script>

<style scoped>
/* 左侧 */
.el-aside {
    /* 背景颜色 */
    background: #ECF5FF;
    /* 居中 */
    text-align: center;
    /* 占用屏幕宽度 */
    width: 55%;
}

/* 右侧 */
.el-main {
    /* 占用屏幕高度，满屏 */
    height: calc(100vh);
}

/* 图片大小 */
.img {
    width: 400px;
    margin-top: 100px;
}

/* 图片下文字 */
.aside-title {
    /* 居中 */
    text-align: center;
    /* 加粗 */
    font-weight: bold;
    /* 字体大小 */
    font-size: 25px;
}

/* form表单 */
.mainForm {
    text-align: center;
    margin: auto;
    width: 60%;
}

.mainTitle {
    /* 距离上210 */
    margin-top: 210px;
    /* 距离下20 */
    margin-bottom: 20px;
    /* 距离左20 */
    margin-left: 327px;
    /* 文本加粗 */
    font-weight: bold;
    /* 文本大小 */
    font-size: 25px;
}

.el-button {
    /* 按钮宽度 100% */
    width: 100%;
}
</style>
