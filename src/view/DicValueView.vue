<template>
    <!-- 新增用户 -->
    <el-button type="primary" @click="addOrEditDicvalue(null)" v-if="buttonList.has('dicvalue:add')">新增字典值</el-button>

    <br><br>
    <!-- 表格 -->
    <el-table :data="dicvalueList" style="width: 100%" border ref="table" v-if="buttonList.has('dicvalue:list')">
        <!-- 序号，type = index , 自动递增 -->
        <el-table-column type="index" label="序号" align="center" width="100" />
        <!-- 其他数据 -->
        <el-table-column property="typeName" label="字典类型" align="center" />
        <el-table-column property="typeValue" label="字典值" align="center" />
        <el-table-column property="remark" label="备注" align="center" show-overflow-tooltip />
        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="success" @click="addOrEditDicvalue(scope.row.id)" size="small"
                    v-if="buttonList.has('dicvalue:edit')">编辑</el-button>
                <el-button type="danger" @click="del(scope.row.id)" size="small"
                    v-if="buttonList.has('dicvalue:delete')">删除</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getDicvalueList" />

    <!-- 编辑 或 新增 字典值 -->
    <el-dialog v-model="editOrAdd" :title="isEdit ? '编辑字典值' : '新增字典值'" width="550" @closed="closeDialog">
        <el-form :model="dicvalueInfo" label-width="100px" ref="editOrAddRef" :rules="editOrAddRules">
            <el-form-item label="字典类型" prop="typeCode">
                <el-select v-model="dicvalueInfo.typeCode" placeholder="选择字典类型">
                    <el-option v-for="dictype in dictypeList" :key="dictype.id" :label="dictype.typeName"
                        :value="dictype.typeCode" />
                </el-select>
            </el-form-item>
            <el-form-item label="字典值" prop="typeValue">
                <el-input v-model.trim="dicvalueInfo.typeValue" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="dicvalueInfo.remark" style="width: 450px" :rows="3" type="textarea"
                    placeholder="请输入备注 " maxlength="100" show-word-limit="true" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="dicvalueSubmit">提交</el-button>
        </div>
    </el-dialog>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { messageBox, messageTip } from '../utils/elementUtils';
import { doGetUserPerm } from '../api/user';
import { doAddDicvalue, doDelDicvalue, doEditDicvalue, doGetDicvalue, doGetDicvalueList } from '../api/dicvalue';
import { doGetAllDicType } from '../api/dictype';
// 用户分页列表信息
const dicvalueList = ref([])
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
    getDicvalueList();
})

const getUserPerm = async () => {
    await doGetUserPerm().then((res) => {
        if (res.code === 200) {
            buttonList.value = new Set(res.data)
        }
    })
}

// 加载列表信息
const getDicvalueList = async () => {
    await doGetDicvalueList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            dicvalueList.value = res.data.list
            total.value = res.data.total
        }
    })
}



// 编辑或新增用户 数据
const dicvalueInfo = ref({});
// 是否打开弹窗
const editOrAdd = ref(false);
// 是否是编辑
const isEdit = ref(true);
// 表单ref
const editOrAddRef = ref(null)
// 验证规则
const editOrAddRules = {
    typeCode: [
        { required: true, message: '请选择字典类型', trigger: 'blur' }
    ],
    typeValue: [
        { required: true, message: '请输入字典值', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,10}/, message: '字典值应为1~10个汉字组成', trigger: 'blur' }
    ]
}

// 点击新增 或 编辑字典值
const addOrEditDicvalue = (id) => {
    // 加载字典类型列表
    getAllDicType();
    if (id) {
        isEdit.value = true;
        // 加载字典值信息
        getDicvalue(id);
    } else {
        isEdit.value = false;
    }
    // 打开弹窗
    editOrAdd.value = true;
}

const dictypeList = ref([])
const getAllDicType = async () => {
    await doGetAllDicType().then((res) => {
        if (res.code === 200) {
            dictypeList.value = res.data;
            console.log(dictypeList.value)
        }
    })
}

// 加载单个字典值信息
const getDicvalue = async (id) => {
    await doGetDicvalue(id).then((res) => {
        if (res.code === 200) {
            dicvalueInfo.value = res.data;
        }
    })
}

// 关闭弹窗事件
const closeDialog = () => {
    dicvalueInfo.value = {}
    dictypeList.value = []
    // 清空校验提示
    editOrAddRef.value.resetFields();
}

// 取消
const cancle = () => {
    editOrAdd.value = false;
}

// 点击提交表单
const dicvalueSubmit = async () => {
    // 校验数据
    await editOrAddRef.value.validate((isValidate) => {
        if (isValidate) {
            // 如果有id，那么就是编辑
            if (dicvalueInfo.value.id) {
                doEditDicvalue(dicvalueInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载列表
                        getDicvalueList(currentPage.value);
                    }
                })
            } else {
                doAddDicvalue(dicvalueInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('录入成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载列表
                        getDicvalueList(currentPage.value);
                    }
                })
            }
        }
    })
}


// 点击删除按钮
const del = (id) => {
    messageBox('您确定要删除吗?').then(async () => {
        await doDelDicvalue(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                getDicvalueList()
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