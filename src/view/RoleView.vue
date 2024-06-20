<template>
    <!-- 新增菜单 -->
    <el-button type="primary" @click="add" v-if="buttonList.has('role:add')">新增角色</el-button>
    <!-- 批量删除 -->
    <el-button type="danger" @click="delBatch" v-if="buttonList.has('role:delete')">批量删除</el-button>

    <br><br>

    <!-- 角色信息 -->
    <el-table :data="roleData" style="width: 100%" row-key="id" border ref="table" v-if="buttonList.has('role:list')">
        <!-- 复选框 type = selection-->
        <el-table-column type="selection"/>
        <!-- 数据 -->
        <el-table-column prop="roleName" label="角色名称" align="center" />
        <el-table-column prop="role" label="角色代码" align="center" />

        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="primary" size="small" @click="detail(scope.row.id)" v-if="buttonList.has('role:view')">权限详情</el-button>
                <el-button type="success" size="small" @click="edit(scope.row.id)" v-if="buttonList.has('role:edit')">编辑角色</el-button>
                <el-button type="danger" size="small" @click="del(scope.row.id)" v-if="buttonList.has('role:delete')">删除角色</el-button>
            </template>
        </el-table-column>
        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="loadRole" />


    <!-- 权限详情 -->
    <el-dialog v-model="showRolePerm" title="角色权限详情" width="500" @close="showClose">
        <div class="dialogTree">
            <!-- 树形控件 -->
            <el-tree style="max-width: 300px" :data="rolePermData" :props="defaultProps" :indent="25" :accordion="true"
                :icon="SetUp" empty-text="暂无权限" />
        </div>
    </el-dialog>

    <!-- 编辑权限 -->
    <el-dialog v-model="editRolePerm" :title="isEdit ? '编辑角色' : '新增角色'" width="500" @closed="dialogClose">
        <el-form :model="roleInfo" label-width="80px" ref="editOrAddRef" :rules="editOrAddRules">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model.trim="roleInfo.roleName" />
            </el-form-item>
            <el-form-item label="角色代码" prop="role">
                <el-input v-model.trim="roleInfo.role" />
            </el-form-item>
        </el-form>

        <!-- 选择权限 -->
        <div class="dialogTree">
            <el-tree ref="editTree" style="max-width: 280px" :data="allPerm" show-checkbox node-key="id"
                :default-checked-keys="ids" :props="defaultProps" accordion="true" :indent="25" :icon="SetUp"
                @check="changeIds" :check-strictly="checkStrictly" empty-text="暂无权限" />
        </div>

        <!-- 按钮 -->
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="editAndAdd">提交</el-button>
        </div>
    </el-dialog>


</template>

<script setup>
import { onMounted, ref } from 'vue';
import { doAddRole, doDelBatchRole, doDelRole, doEditRolePerm, doLoadEdit, doLoadRole, doLoadRolePerm } from '../api/role';
import { messageBox, messageTip } from '../utils/elementUtils';
import { SetUp } from '@element-plus/icons-vue';
import { doLoadPermAll } from '../api/permission';
import { doGetUserPerm } from '../api/user';
const roleData = ref([]);
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0);

// 页面加载时，加载顶层菜单
// 按钮权限
const buttonList = ref(new Set())
onMounted(() => {
    loadRole();
    getUserPerm();
})

const getUserPerm = async () => {
    await doGetUserPerm().then((res) => {
        if(res.code === 200) {
            buttonList.value = new Set(res.data)
        }
    })
}
const loadRole = async () => {
    await doLoadRole(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            roleData.value = res.data.list;
            total.value = res.data.total
        }
    })
}

// 页面该变

// 用户详情
const showRolePerm = ref(false);
// 自动属性
const defaultProps = {
    // 子树 使用 children属性
    children: 'children',
    // 子节点标签 使用 label属性
    label: 'name',
}

const rolePermData = ref([])

const detail = async (id) => {
    showRolePerm.value = true;
    // 查询权限信息数据
    await doLoadRolePerm(id).then((res) => {
        if (res.code === 200) {
            rolePermData.value = res.data;
        }
    })
}
// 关闭详情弹出
const showClose = () => {
    rolePermData.value = []
}

// 编辑权限或新增角色
// 打开弹窗
const editRolePerm = ref(false);
// 所有权限
const allPerm = ref([])
// 默认勾选id
const ids = ref([])
// 是否父子关联，当我们拿到后端返回的数据时，我们需要渲染页面，不想它进行关联
// 当页面渲染完成后，我们希望它关系，进行联动选则
const checkStrictly = ref(true);
// 当前弹窗角色id
const isEdit = ref(null)
// 打开编辑弹窗
const edit = async (id) => {
    // 打开
    editRolePerm.value = true;
    // 关联锁定
    checkStrictly.value = true;
    isEdit.value = true;
    // 加载数据
    await doLoadEdit(id).then((res) => {
        if (res.code === 200) {
            // 已有权限id
            ids.value = res.data.ids;
            // 所有权限集合
            allPerm.value = res.data.rolePermAllVOList;
            // 角色信息
            roleInfo.value = res.data.role;
            console.log(ids.value)
            console.log(allPerm.value)
        }
        permIds.value = ids.value
    })
    // 关联解锁：可以联动
    checkStrictly.value = false;
}

// 提交编辑 , 或提交
// tree组件
const editTree = ref(null)
// 提交id
const permIds = ref([])
// 改变选择的id
const changeIds = (node, tree) => {
    permIds.value = tree.checkedKeys;
    tree.halfCheckedKeys.forEach(id => permIds.value.push(id))
}

// 提交编辑 或 新增
const editAndAdd = async () => {
    const data = {
        role: roleInfo.value,
        ids: permIds.value
    }
    // 有id,编辑
    if (roleInfo.value.id) {
        await doEditRolePerm(data).then((res) => {
            if (res.code === 200) {
                messageTip('编辑成功', 'success')
                editRolePerm.value = false;
            } else {
                messageTip(res.message, 'error')
            }
        })
    }
    // 无id,新增
    else {
        await doAddRole(data).then((res) => {
            if (res.code === 200) {
                messageTip('编辑成功', 'success')
                editRolePerm.value = false;
            } else {
                messageTip(res.message, 'error')
            }
        })
    }
    // 加载当前页
    loadRole();
}

const cancle = () => {
    // 打开
    editRolePerm.value = false;
}

// 关闭编辑或新增弹窗 或 点击取消
const dialogClose = () => {
    // 所有权限置为空
    allPerm.value = [];
    // 默认勾选id置空
    ids.value = [];
    // 提交的id置空
    permIds.value = []
    // 新增角色置空
    roleInfo.value = {}
}

// 新增角色
// 表单角色数据
const roleInfo = ref({})
// 表单组件
const editOrAddRef = ref(null)
// 验证表单
const editOrAddRules = {
    roleName: [
        { required: true, message: '请输入角色名', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,8}/, message: '角色为1~6个汉字', trigger: 'blur' }
    ],
    role: [
        { required: true, message: '请输入角色代码', trigger: 'blur' }
    ]
}
// 打开新增弹窗
const add = async () => {
    // 当前是新增
    isEdit.value = false;
    // 打开弹窗
    editRolePerm.value = true;
    // 关联解锁：可以联动
    checkStrictly.value = false;
    // 发送请求
    await doLoadPermAll().then((res) => {
        if (res.code === 200) {
            allPerm.value = res.data;
        } else {
            messageTip(res.message, 'error')
        }
    })
}

// 删除一条
const del = (id) => {
    messageBox('您确定要删除吗?').then(async () => {
        await doDelRole(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                loadRole()
            } else {
                messageTip(res.message, 'error')
            }
        })
    })
}

const table = ref(null)
// 批量删除 doDelBatchRole
const delBatch = () => {
    // 获取组件
    var arr = table.value.getSelectionRows();
    if (arr.length > 0) {
        messageBox('您确定要删除吗?').then(async () => {
            const ids = [];
            arr.forEach(item => {
                ids.push(item.id)
            })
            await doDelBatchRole(ids).then((res) => {
                if (res.code === 200) {
                    messageTip('删除成功', 'success')
                    loadRole()
                } else {
                    messageTip(res.message, 'error')
                }
            })
        })
    } else {
        messageTip('未选择数据', 'warning')
    }

}
</script>


<style scoped>
.img {
    width: 500px;
}

.el-pagination {
    margin-top: 20px;
    float: right;
}

.dialogTree {
    margin-left: 100px;
}

.edit-add-button {
    margin-top: 20px;
    margin-left: 320px;
}

.el-form-item {
    width: 280px;
    margin-left: 100px;
}
</style>