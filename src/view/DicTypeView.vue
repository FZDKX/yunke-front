<template>
    <!-- 新增用户 -->
    <el-button type="primary" @click="addOrEditDictype(null)" v-if="buttonList.has('dictype:add')">新增字典类型</el-button>

    <br><br>
    <!-- 表格 -->
    <el-table :data="dictypeList" style="width: 100%" border ref="table" v-if="buttonList.has('dictype:list')">
        <!-- 序号，type = index , 自动递增 -->
        <el-table-column type="index" label="序号" align="center" width="100" />
        <!-- 其他数据 -->
        <el-table-column property="typeCode" label="类型值" align="center" />
        <el-table-column property="typeName" label="类型名称" align="center" />
        <el-table-column property="remark" label="备注" align="center" show-overflow-tooltip/>
        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="success" @click="addOrEditDictype(scope.row.id)" size="small"
                    v-if="buttonList.has('dictype:edit')">编辑</el-button>
                <el-button type="danger" @click="del(scope.row.id)" size="small"
                    v-if="buttonList.has('dictype:delete')">删除</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getDictypeList" />

    <!-- 编辑 或 新增 字典类型 -->
    <el-dialog v-model="editOrAdd" :title="isEdit ? '编辑字典类型' : '新增字典类型'" width="550" @closed="closeDialog">
        <el-form :model="dictypeInfo" label-width="100px" ref="editOrAddRef" :rules="editOrAddRules">
            <el-form-item label="字典值" prop="typeCode">
                <el-input v-model.trim="dictypeInfo.typeCode" />
            </el-form-item>
            <el-form-item label="字典名称" prop="typeName">
                <el-input v-model.trim="dictypeInfo.typeName" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="dictypeInfo.remark" style="width: 450px" :rows="3" type="textarea"
                    placeholder="请输入备注 " maxlength="100" show-word-limit="true" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="dictypeSubmit">提交</el-button>
        </div>
    </el-dialog>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { messageBox, messageTip } from '../utils/elementUtils';
import { doGetUserPerm } from '../api/user';
import { doAddDictype, doDelDictype, doEditDictype, doGetDictype, doGetDictypeList } from '../api/dictype';
// 用户分页列表信息
const dictypeList = ref([])
// 分页信息
// 每页记录条数
const pageSize = ref(10);
// 当前所在页
const currentPage = ref(1);
// 总记录条数
const total = ref(0);
// 按钮权限
const buttonList = ref(new Set())
// 页面加载时，加载用户列表
onMounted(() => {
    // 加载权限信息
    getUserPerm();
    // 加载用户列表
    getDictypeList();
})

const getUserPerm = async () => {
    await doGetUserPerm().then((res) => {
        if (res.code === 200) {
            buttonList.value = new Set(res.data)
        }
    })
}

// 加载列表信息
const getDictypeList = async () => {
    await doGetDictypeList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            dictypeList.value = res.data.list
            total.value = res.data.total
        }
    })
}



// 编辑或新增用户 数据
const dictypeInfo = ref({});
// 是否打开弹窗
const editOrAdd = ref(false);
// 是否是编辑
const isEdit = ref(true);
// 表单ref
const editOrAddRef = ref(null)
// 验证规则
const editOrAddRules = {
    typeCode: [
        { required: true, message: '请输入字典值', trigger: 'blur' },
        { pattern: /[a-zA-Z]/, message: '字典值应为英文字母组成', trigger: 'blur' }
    ],
    typeName: [
        { required: true, message: '请输入字典名称', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,10}/, message: '字典名称应为1~10个汉字组成', trigger: 'blur' }
    ]
}

// 点击新增 或 编辑字典类型
const addOrEditDictype = (id) => {
    if (id) {
        isEdit.value = true;
        // 加载字典类型信息
        getDictype(id);
    } else {
        isEdit.value = false;
    }
    // 打开弹窗
    editOrAdd.value = true;
}

// 加载单个字典类型信息
const getDictype = async (id) => {
    await doGetDictype(id).then((res) => {
        if (res.code === 200) {
            dictypeInfo.value = res.data;
        }
    })
}

// 关闭弹窗事件
const closeDialog = () => {
    dictypeInfo.value = {}
     // 清空校验提示
     editOrAddRef.value.resetFields();
}

// 取消
const cancle = () => {
    editOrAdd.value = false;
}

// 点击提交表单
const dictypeSubmit = async () => {
    // 校验数据
    await editOrAddRef.value.validate((isValidate) => {
        if (isValidate) {
            // 如果有id，那么就是编辑
            if (dictypeInfo.value.id) {
                doEditDictype(dictypeInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载列表
                        getDictypeList(currentPage.value);
                    }
                })
            } else {
                doAddDictype(dictypeInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('录入成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载列表
                        getDictypeList(currentPage.value);
                    }
                })
            }
        }
    })
}


// 点击删除按钮
const del = (id) => {
    messageBox('您确定要删除吗?').then(async () => {
        await doDelDictype(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                getDictypeList()
            } else {
                messageTip(res.message, 'error')
            }
        })
    })
}
</script>


<style scoped>
.el-pagination {
    margin-top: 20px;
    float: right;
}

.el-form-item {
    width: 400px;
    margin-left: 40px;
}

.el-form {
    text-align: center;
}

.edit-add-button {
    margin-top: 40px;
    margin-left: 360px;
}

.img {
    width: 500px;
}
</style>