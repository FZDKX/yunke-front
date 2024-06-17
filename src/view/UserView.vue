<template>
    <!-- 新增用户 -->
    <el-button type="primary" @click="add">新增用户</el-button>
    <!-- 批量删除 -->
    <el-button type="danger" @click="batchDel">批量删除</el-button>

    <br><br>
    <!-- 表格 -->
    <el-table :data="userData" style="width: 100%" @selection-change="handleSelectionChange" :stripe="true" ref="table">
        <!-- 复选框 type = selection-->
        <el-table-column type="selection" />
        <!-- 序号，type = index , 自动递增 -->
        <el-table-column type="index" label="序号" align="center" width="65" />
        <!-- 其他数据 -->
        <el-table-column property="username" label="账号" align="center" />
        <el-table-column property="name" label="姓名" align="center" show-overflow-tooltip />
        <!-- 角色 -->
        <el-table-column label="角色" align="center" width="400">
            <template #default="scope">
                <el-button type="danger" v-if="scope.row.roles.length === 0" size="small">未分配</el-button>
                <el-button type="primary" v-else v-for="(role, index) in scope.row.roles" size="small" :key="index">
                    {{ role.roleName }}
                </el-button>
            </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column label="状态" align="center">
            <template #default="scope">
                <el-button type="primary" v-if="scope.row.accountEnabled === 1" size="small">启用</el-button>
                <el-button type="danger" v-else size="small">禁用</el-button>
            </template>
        </el-table-column>

        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="primary" @click="show(scope.row.id)" size="small">详情</el-button>
                <el-button type="success" @click="edit(scope.row.id)" size="small">编辑</el-button>
                <el-button type="danger" @click="del(scope.row.id)" size="small">删除</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="loadUsers" />
    <!-- @prev-click="loadUsers"
        @next-click="loadUsers"  -->

    <!-- 用户详情 -->
    <el-dialog v-model="showUserDetail" title="用户详情" width="550">
        <el-form :model="userDetail" label-width="80px" disabled="true">
            <el-form-item label="手机">
                <el-input v-model="userDetail.phone" />
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input v-model="userDetail.email" />
            </el-form-item>
            <el-form-item label="创建人">
                <el-input v-model="userDetail.createName" />
            </el-form-item>
            <el-form-item label="创建时间">
                <el-input v-model="userDetail.createTime" />
            </el-form-item>
            <el-form-item label="编辑人">
                <el-input v-model="userDetail.editName" />
            </el-form-item>
            <el-form-item label="编辑时间">
                <el-input v-model="userDetail.editTime" />
            </el-form-item>
            <el-form-item label="最近登录">
                <el-input v-model="userDetail.lastLoginTime" />
            </el-form-item>
        </el-form>
    </el-dialog>

    <!-- 编辑 或 新增 用户 -->
    <el-dialog v-model="editOrAdd" :title="isEdit ? '编辑用户' : '新增用户'" width="550" @closed="closeDialog">
        <el-form :model="userInfo" label-width="80px" ref="editOrAddRef" :rules="editOrAddRules">
            <el-form-item label="账号" prop="username">
                <el-input v-model.trim="userInfo.username" />
            </el-form-item>
            <!-- 如果是新增，则需要显示密码 -->
            <el-form-item label="密码" prop="password" v-if="!isEdit">
                <el-input type="password" v-model.trim="userInfo.password" />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model.trim="userInfo.name" />
            </el-form-item>
            <el-form-item label="手机" prop="phone">
                <el-input v-model.trim="userInfo.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model.trim="userInfo.email" />
            </el-form-item>
            <el-form-item label="状态" prop="accountEnabled">
                <el-radio-group v-model="userInfo.accountEnabled">
                    <el-radio-button label="启用" :value="1" />
                    <el-radio-button label="禁用" :value="0" />
                </el-radio-group>
            </el-form-item>
            <!-- 权限授予 -->
            <el-form-item label="角色授予">
                <el-select v-model="userInfo.roleIds" multiple placeholder="请选择角色" style="width: 550px">
                    <el-option v-for="role in roles" :key="role.id" :label="role.roleName" :value="role.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="userSubmit">提交</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { messageBox, messageTip } from '../utils/elementUtils';
import { doGetUserDetails, doLoadUsers, doGetUser, doEditUser, doAddUser, doDelUser, doBatchDel, doGetUserAll } from '../api/user';
import { doGetAllRoles } from '../api/role';
// 用户分页列表信息
const userData = ref([])

// 分页信息
// 每页记录条数
const pageSize = ref(10);
// 当前所在页
const currentPage = ref(1);
// 总记录条数
const total = ref(0);

// 页面加载时，加载用户列表
onMounted(() => {
    loadUsers()
})

// 完整
const loadUsers = async () => {
    await doLoadUsers(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            userData.value = res.data.list
            total.value = res.data.total
        } else {
            messageTip(res.message, "error")
        }
    })
}

// 用户详情
const showUserDetail = ref(false);
// 用户详情信息
const userDetail = ref([]);
const show = async (id) => {
    showUserDetail.value = true;
    await doGetUserDetails(id).then((res) => {
        if (res.code === 200) {
            userDetail.value = res.data
            userDetail.value.accountEnabled = userDetail.value.accountEnabled === 1 ? '启用' : '禁用';
        } else {
            messageTip(res.message, "error")
        }
    })
}

// 编辑或新增用户 数据
const userInfo = ref({});
// 是否打开弹窗
const editOrAdd = ref(false);
// 是否是编辑
const isEdit = ref(true);
// 表单ref
const editOrAddRef = ref(null)
// 验证规则
const editOrAddRules = {
    username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码长度为6~16位', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,6}/, message: '姓名为1~6个汉字', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: '邮箱格式不正确', trigger: 'blur' }
    ],
    accountEnabled: [
        { required: true, message: '请选择状态', trigger: 'blur' }
    ]
}
// 编辑用户，查询用户信息
const edit = async (id) => {
    editOrAdd.value = true;
    isEdit.value = true;
    // 获取用户信息
    getUser(id);
    // 加载所有角色
    getRoles();
}
// 获取用户信息
const getUser = async (id) => {
    // 查询用户信息
    await doGetUser(id).then((res) => {
        if (res.code === 200) {
            // 查询用户信息 与 角色
            userInfo.value = res.data;
            // 将已有的角色ID，组成数组
            const idArr = [];
            userInfo.value.roles.forEach(r => idArr.push(r.id))
            userInfo.value.roleIds = idArr;
        }
    })
}

const roles = ref([])
// 加载所有权限
const getRoles = async () => {
    await doGetAllRoles().then((res) => {
        roles.value = res.data;
    })
}

// 点击新增按钮
const add = () => {
    // 不是编辑
    isEdit.value = false;
    // 获取角色数据
    getRoles();
    // 打开弹窗
    editOrAdd.value = true;
}

const cancle = () => {
    editOrAdd.value = false;
}

// 提交 编辑 或 新增表单
// 关闭弹窗
const closeDialog = () => {
    // 清空验证提示
    editOrAddRef.value.resetFields();
    // 用户信息置空
    userInfo.value = {}
    // 权限置空
    roles.value = []
}

const userSubmit = async () => {
    // 如果有id，那么是编辑
    if (userInfo.value.id) {
        await editOrAddRef.value.validate((isValidate) => {
            if (isValidate) {
                doEditUser(userInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        editOrAdd.value = false;
                        loadUsers();
                    } else {
                        messageTip(res.message, 'error')
                    }
                })
            }
        })
    }
    // 如果没有id，那么是新增
    else {
        await editOrAddRef.value.validate((isValidate) => {
            if (isValidate) {
                doAddUser(userInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('新增成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载当前页
                        loadUsers();
                    } else {
                        messageTip(res.message, 'error')
                    }
                })
            }
        })

    }
}

// 删除用户
// 单个删除
const del = (id) => {
    messageBox('您确定要删除吗?').then(async () => {
        await doDelUser(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                // 重新加载当前页
                loadUsers();
            } else {
                messageTip(res.message, 'error')
            }
        })
    })
}

// 批量删除
// 表格组件
const table = ref(null)
// 点击批量删除
const batchDel = () => {
    // 通过表格的方法，获取所有选中的行的id
    const arr = table.value.getSelectionRows()
    if (arr.length > 0) {
        // 确认是否需要删除
        messageBox('您确定要删除吗?').then(async () => {
            // 获取所有的id
            const ids = [];
            arr.forEach(item => {
                ids.push(item.id)
            });
            // 批量删除
            await doBatchDel(ids).then((res) => {
                if (res.code === 200) {
                    messageTip('删除成功', 'success')
                    // 更新列表
                    loadUsers();
                } else {
                    messageTip(res.message, 'error')
                }
            })
        })
    } else {
        messageTip('请选择需要删除的数据?', 'warning')
    }
}
</script>


<style scoped>
.el-pagination {
    margin-top: 20px;
    float: right;
}

.el-form-item {
    width: 400px;
    margin-left: 50px;
}

.el-form {
    text-align: center;
}

.edit-add-button {
    margin-left: 320px;
}

.img {
    width: 500px;
}
</style>