<template>
    <!-- 新增菜单 -->
    <el-button type="primary" @click="showAddTop">新增一级菜单</el-button>
    <!-- 批量删除 -->
    <el-button type="danger" @click="batchDel">批量删除</el-button>

    <br><br>

    <el-table :data="permData" style="width: 100%" row-key="id" border lazy :load="loadSon" :indent="25" ref="table"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @expand-change="permExpandChange">
        <!-- 复选框 type = selection-->
        <el-table-column type="selection" />
        <!-- 数据 -->
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="type" label="权限类型" align="center" :formatter="typeFormat" />
        <el-table-column prop="info" label="路由/权限" align="center" />
        <el-table-column label="图标" align="center">
            <template #default="scpoe">
                <el-icon size="20">
                    <component :is="scpoe.row.icon"></component>
                </el-icon>
            </template>
        </el-table-column>
        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scpoe">
                <el-button type="primary" size="small" @click="showAdd(scpoe.row)"
                    v-if="scpoe.row.type === 'menu'">新增子节点</el-button>
                <el-button type="success" size="small" @click="showEdit(scpoe.row)">编辑</el-button>
                <el-button type="danger" size="small" @click="del(scpoe.row)">删除</el-button>
            </template>
        </el-table-column>
        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="loadPermList" />

    <!-- 编辑 -->
    <el-dialog v-model="edit" title="编辑权限" width="450" @close="closeDialog">
        <el-form :model="permInfo" label-width="80px" ref="editRef" :rules="permRules">
            <el-form-item label="权限名称" prop="name">
                <el-input v-model.trim="permInfo.name" />
            </el-form-item>
            <!-- 路由：二级菜单显示 -->
            <el-form-item label="路由" prop="url" v-if="typeCode === 2">
                <el-input v-model.trim="permInfo.url" />
            </el-form-item>
            <!-- 权限值：按钮显示 -->
            <el-form-item label="权限" prop="code" v-if="typeCode === 3">
                <el-input v-model.trim="permInfo.code" />
            </el-form-item>
            <el-form-item label="图标" prop="icon" v-if="typeCode === 1 || typeCode === 2">
                <ElIconPicker v-model="permInfo.icon" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancleEdit">取消</el-button>
            <el-button type="primary" @click="submitEdit">提交</el-button>
        </div>
    </el-dialog>


    <!-- 新增 -->
    <el-dialog v-model="add" title="新增权限" width="450" @close="closeDialog">
        <el-form :model="permInfo" label-width="80px" ref="addRef" :rules="permRules">
            <el-form-item label="权限名称" prop="name">
                <el-input v-model.trim="permInfo.name" />
            </el-form-item>
            <!-- 路由：点击一级菜单显示 -->
            <el-form-item label="路由" prop="url" v-if="typeCode === 1">
                <el-input v-model.trim="permInfo.url" />
            </el-form-item>
            <!-- 权限值：点击二级菜单显示 -->
            <el-form-item label="权限" prop="code" v-if="typeCode === 2">
                <el-input v-model.trim="permInfo.code" />
            </el-form-item>
            <!-- 路由：点击一级菜单显示 -->
            <el-form-item label="图标" prop="icon" v-if="typeCode === 1">
                <ElIconPicker v-model="permInfo.icon" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancleAdd">取消</el-button>
            <el-button type="primary" @click="submitAdd">提交</el-button>
        </div>
    </el-dialog>

    <!-- 新增一级菜单 -->
    <el-dialog v-model="top" title="新增一级菜单" width="450" @close="closeDialog">
        <el-form :model="permInfo" label-width="80px" ref="topRef" :rules="permRules">
            <el-form-item label="权限名称" prop="name">
                <el-input v-model.trim="permInfo.name" />
            </el-form-item>
            <el-form-item label="图标" prop="icon">
                <ElIconPicker v-model="permInfo.icon" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancleAddTop">取消</el-button>
            <el-button type="primary" @click="submitAddTop">提交</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import ElIconPicker from '../components/ElIconPicker.vue';
import { onMounted, ref } from 'vue';
import { doAddPerm, doBatchDel, doDel, doEditPerm, doLoadChildren, doLoadPerm, doLoadPermList } from '../api/permission';
import { messageBox, messageTip } from '../utils/elementUtils';
const permData = ref([]);
const pageSize = ref(10);
const currentPage = ref(1);
const total = ref(0);

// 页面加载时，加载顶层菜单
onMounted(() => {
    loadPermList();
})

// 类型格式化
const typeFormat = (row) => {
    if (row.type === 'button') {
        return '权限';
    } else if (row.type === 'menu') {
        if (row.url) {
            return '二级菜单';
        } else {
            return '一级菜单';
        }

    }
}

// 加载顶层菜单
const loadPermList = async () => {
    await doLoadPermList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            permData.value = res.data.list;
            for (var i = 0; i < permData.value.length; i++) {
                const temp = permData.value[i]
                if (temp.count > 0) {
                    temp.hasChildren = true;
                } else {
                    temp.hasChildren = false;
                }
            }
            total.value = res.data.total;
        }
    })
}

// 懒加载 map
const tableTreeRefreshTool = {}
// 加载子节点，为maps赋值
const loadSon = (row, treeNode, resolve) => {
    // 记录id为{}
    tableTreeRefreshTool[row.id] = {}
    // 记录设置数据的函数
    tableTreeRefreshTool[row.id].resolve = resolve
    // 上一次的状态 展开：true ，收起：false
    tableTreeRefreshTool[row.id].prevStatus = false
    // 记录展开次数
    tableTreeRefreshTool[row.id].expandCount = 0
    console.log(tableTreeRefreshTool)
    loadPerm(row.id)
}

// 加载当前行 及 子行数据
const loadPerm = async (id) => {
    const cur = tableTreeRefreshTool[id];
    if (cur) {
        // 获取该行的 id ，查询以该id为父的权限
        await doLoadChildren(id).then((res) => {
            const arr = res.data
            for (var i = 0; i < arr.length; i++) {
                const temp = arr[i]
                if (temp.count > 0) {
                    temp.hasChildren = true;
                } else {
                    temp.hasChildren = false;
                }
                if (temp.code) {
                    temp.info = temp.code
                } else if (temp.url) {
                    temp.info = temp.url
                }
            }
            cur.resolve(arr)
        })
    } else {
        loadPermList();
    }

}

const permExpandChange = (row, expanded) => {
    // 获取当前的对象
    const cur = tableTreeRefreshTool[row.id];
    // 次数+1
    cur.expandCount++;
    // 如果是展开状态，那么就更新数据
    if (expanded && cur.expandCount > 1 && !cur.prevStatus) {
        cur.prevStatus = true;
        // 请求数据
        loadPerm(row.id)
    }
}

// 编辑弹窗开关
const edit = ref(false)
// 编辑 增加 数据
const permInfo = ref({})
// 编辑组件
const editRef = ref(null)
// 编辑验证规则
const permRules = {
    name: [
        { required: true, message: '请输入权限名称', trigger: 'blur' }

    ],
    url: [
        { required: true, message: '请输入路由', trigger: 'blur' },
        { pattern: /[a-zA-Z]/, message: '路由应为英文字母组成', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入权限', trigger: 'blur' }
    ],
    icon: [
        { required: true, message: '请选择图标', trigger: 'blur' }
    ],
}


// 当前编辑类型
// 1: 一级菜单 ， 2：二级菜单 ，3：按钮
const typeCode = ref(null)
// 点击编辑
const showEdit = async (row) => {
    // 设置按钮类型
    setTypeCode(row)
    // 查询数据
    await doLoadPerm(row.id).then((res) => {
        if (res.code === 200) {
            permInfo.value = res.data
        } 
    })
    edit.value = true;
}
// 编辑 取消按钮
const cancleEdit = () => {
    edit.value = false;
}
// 编辑 提交按钮
const submitEdit = async () => {
    await editRef.value.validate((isValidate) => {
        if (isValidate) {
            doEditPerm(permInfo.value).then((res) => {
                if (res.code === 200) {
                    messageTip('编辑成功', 'success')
                    table.value.store.states.lazyTreeNodeMap.value[permInfo.value.parentId] = []
                    // 刷新父
                    loadPerm(permInfo.value.parentId)
                    // 关闭窗口
                    edit.value = false;
                } 
            })
        }
    })
}

// 新增一级菜单开关
const top = ref(false);
// 点击新增一级菜单
const showAddTop = () => {
    // 清空数据
    permInfo.value = {}
    // 设置父节点Id
    permInfo.value.parentId = 0;
    // 设置新增权限类型
    permInfo.value.type = 'menu'
    // 打开弹窗
    top.value = true;
}
const topRef = ref(null);

// 新增一级菜单 取消按钮
const cancleAddTop = () => {
    top.value = false;
}
// 新增一级菜单 提交按钮
const submitAddTop = async () => {
    await topRef.value.validate((isValidate) => {
        // 表单校验通过，并且父节点存在
        if (isValidate && (permInfo.value.parentId || permInfo.value.parentId === 0)) {
            doAddPerm(permInfo.value).then((res) => {
                if (res.code === 200) {
                    messageTip('新增成功', 'success')
                    top.value = false;
                    loadPermList();
                }
            })
        }
    })
}

const add = ref(false);
// 点击新增
const showAdd = (row) => {
    if (row && row.id) {
        // 清空数据
        permInfo.value = {}
        // 设置父节点Id
        permInfo.value.parentId = row.id;
        // 祖父id
        permInfo.value.ppId = row.parentId;
        // 设置当前行类型
        setTypeCode(row);
        // 设置新增权限类型
        if (typeCode.value === 1) {
            permInfo.value.type = 'menu'
        } else if (typeCode.value === 2) {
            permInfo.value.type = 'button'
        }
        // 打开弹窗
        add.value = true;
    }
}
const addRef = ref(null);

// 新增 取消按钮
const cancleAdd = () => {
    add.value = false;
}
// 新增 提交按钮
const submitAdd = async () => {
    await addRef.value.validate((isValidate) => {
        // 表单校验通过，并且父节点存在
        if (isValidate && permInfo.value.parentId) {
            doAddPerm(permInfo.value).then((res) => {
                if (res.code === 200) {
                    messageTip('新增成功', 'success')
                    add.value = false;
                    // 刷新数据
                    // 清空父的 row-key 
                    table.value.store.states.lazyTreeNodeMap.value[permInfo.value.parentId] = []
                    const cur = tableTreeRefreshTool[permInfo.value.parentId];
                    // 父有子
                    if (cur) {
                        // 刷新父
                        loadPerm(permInfo.value.parentId)
                    }
                    // 父没有子，刷新祖父
                    else {
                        table.value.store.states.lazyTreeNodeMap.value[permInfo.value.ppId] = []
                        // 刷新祖父
                        loadPerm(permInfo.value.ppId)
                    }

                }
            })
        }
    })
}

// 关闭新增弹窗之后
const closeDialog = () => {
    permInfo.value = {}
}


// 查询当前行按钮类型
const setTypeCode = (row) => {
    // 菜单
    if (row.type === 'menu') {
        // 二级菜单
        if (row.url) {
            typeCode.value = 2;
        }
        // 一级菜单
        else {
            typeCode.value = 1;
        }
    }
    // 按钮
    else if (row.type === 'button') {
        typeCode.value = 3;
    }
}
const table = ref(null);
// 删除
const del = (row) => {
    messageBox('是否确认删除?').then(async () => {
        await doDel(row.id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                // 清空父的 row-key 
                table.value.store.states.lazyTreeNodeMap.value[row.parentId] = []
                // 刷新父
                loadPerm(row.parentId)
            }
        })
    })
}

// 批量删除
const batchDel = () => {
    // 获取所有选择行id
    const arr = table.value.getSelectionRows();
    // console.log(arr)
    if (arr.length > 0) {
        // 获取所有id
        const ids = [];
        arr.forEach(item => {
            ids.push(item.id);
        });
        // 调用接口删除
        messageBox('是否确认删除?').then(async () => {
            await doBatchDel(ids).then((res) => {
                if (res.code === 200) {
                    messageTip('批量删除成功', 'success')
                    //对arr，进行获取，进行刷新
                    arr.forEach(item => {
                        // 清空父的 row-key 
                        table.value.store.states.lazyTreeNodeMap.value[item.parentId] = []
                        // 刷新父
                        loadPerm(item.parentId)
                    });
                }
            })
        })
    } else {
        messageTip('请选择需要删除的数据?', 'warning')
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

.el-icon {
    margin-top: 8px;
}

.el-form-item {
    width: 300px;
    margin-left: 50px;
}

.edit-add-button {
    margin-top: 30px;
    margin-left: 220px;
}
</style>