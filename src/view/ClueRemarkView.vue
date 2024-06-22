<template>
    <!-- 返回 -->
    <el-button type="success" @click="goBack">返回</el-button>
    <!-- 新增备注 -->
    <el-button type="primary" @click="openEditOrAdd(null)" class="addButton">新增备注</el-button>
    <br><br>

    <!-- 表格 -->
    <el-table :data="remarkList" style="width: 100%" ref="table">
        <!-- 备注内容 -->
        <el-table-column type="expand">
            <template #default="props">
                <div class="dl">
                    <p>{{ props.row.noteContent }}</p>
                </div>
            </template>
        </el-table-column>
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center" width="65" />
        <!-- 其他数据 -->
        <el-table-column property="noteWayName" label="跟踪方式" align="center" />
        <el-table-column property="createTime" label="跟踪时间" align="center" />
        <el-table-column property="createName" label="跟踪人" align="center" />
        <el-table-column property="editTime" label="编辑时间" align="center" />
        <el-table-column property="editName" label="编辑人" align="center" />
        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="success" @click="openEditOrAdd(scope.row.id)" size="small">编辑</el-button>
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
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="loadClueRemarkList" />

    <!-- 添加 或 编辑 弹窗 -->
    <el-dialog v-model="editOrAddDialog" :title="isEdit ? '编辑备注' : '新增备注'" width="550" @closed="closEeditOrAddDialog">
        <!-- 表单 -->
        <el-form class="editOrAddForm" :model="remarkInfo" ref="editOrAddRef" :rules="editOrAddRules" label-width="80">
            <!-- 跟踪方式 -->
            <el-form-item label="跟踪方式" prop="noteWay">
                <el-select v-model="remarkInfo.noteWay" placeholder="选择跟踪方式">
                    <el-option v-for="item in dic.noteWayList" :key="item.id" :label="item.typeValue"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <!-- 备注 -->
            <el-form-item label="备注" prop="noteContent">
                <el-input v-model="remarkInfo.noteContent" style="width: 450px" :rows="8" type="textarea"
                    placeholder="请输入活动备注 " maxlength="300" show-word-limit="true" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="editOrAddSubmit">提交</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { messageTip } from "../utils/elementUtils.js";
import { doAddClueRemark, doDelClueRemark, doEditClueRemark, doGetClueRemark, doLoadClueRemarkList } from "../api/clueRemark.js";
import { doLoadClueRemarkDic } from "../api/dic.js";

// 路由
const route = useRoute();
// 活动id
const clueId = ref(0)
// 备注列表
const remarkList = ref([]);
// 每页记录条数
const pageSize = ref(10);
// 当前页
const currentPage = ref(1);
// 总记录条数
const total = ref(0);
// 页面加载时
onMounted(() => {
    // 保存线索id
    clueId.value = route.params.id;
    // 加载备注列表
    loadClueRemarkList();
})
// 加载备注列表
const loadClueRemarkList = async () => {
    await doLoadClueRemarkList(clueId.value, currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            remarkList.value = res.data.list;
            total.value = res.data.total;
        }
    })
}


// 新增或编辑备注
// 字典列表
const dic = ref({})
// 表单数据
const remarkInfo = ref({});
// 弹窗开关
const editOrAddDialog = ref(false);
// 表单组件
const editOrAddRef = ref(null)
// 当前是否是编辑
const isEdit = ref(false)
// 表单校验
const editOrAddRules = {
    noteContent: { required: true, message: '请输入跟踪内容', trigger: 'blur' },
    noteWay: { required: true, message: '请选择跟踪方式', trigger: 'blur' }
    
}
// 点击新增或编辑备注
const openEditOrAdd = (id) => {
    // 加载字典
    loadClueRemarkDic();
    if (id) {
        isEdit.value = true;
        getClueRemark(id);
    } else {
        isEdit.value = false;
    }
    editOrAddDialog.value = true;
}

// 获取字典信息
const loadClueRemarkDic = async () => {
    await doLoadClueRemarkDic().then((res) => {
        if (res.code === 200) {
            dic.value = res.data;
        }
    })
}


// 获取单个备注信息
const getClueRemark = async (id) => {
    await doGetClueRemark(id).then((res) => {
        if (res.code === 200) {
            remarkInfo.value = res.data;
        }
    })
}

// 提交表单
const editOrAddSubmit = async () => {
    // 校验数据
    await editOrAddRef.value.validate((isValidate) => {
        if (isValidate) {
            // 如果有id，那么就是编辑
            if (remarkInfo.value.id) {
                doEditClueRemark(remarkInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        editOrAddDialog.value = false;
                        // 重新加载活动信息
                        loadClueRemarkList();
                    }
                })
            } else {
                // 设置关联的市场活动
                remarkInfo.value.clueId = clueId.value;
                doAddClueRemark(remarkInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('录入成功', 'success')
                        editOrAddDialog.value = false;
                        // 重新加载活动信息
                        loadClueRemarkList();
                    }
                })
            }
        }
    })
}

// 取消按钮
const cancle = () => {
    editOrAddDialog.value = false;
}

// 关闭编辑或新增弹窗
const closEeditOrAddDialog = () => {
    // 表单置空
    remarkInfo.value = {};
    // 清空校验提示
    editOrAddRef.value.resetFields();
}


// 删除
const del = async (id) => {
    await doDelClueRemark(id).then((res) => {
        if (res.code === 200) {
            messageTip('删除成功', 'success')
            // 重新加载活动信息
            loadClueRemarkList();
        }
    })
}

const router = useRouter();
// 返回上一级
const goBack = () => {
    router.back();
}
</script>

<style scoped>
.img {
    width: 500px;
}

.dl {
    margin-left: 50px;
    letter-spacing: 1px;
    text-indent: 30px;
    width: 700px;
}

.addButton {
    float: right;
}

.edit-add-button {
    margin-left: 360px;
    margin-top: 40px;
}

.el-pagination {
    margin-top: 20px;
    float: right;
}

.editOrAddForm {
    margin-left: 10px;
}
</style>