<template>

    <!-- 录入市场活动 -->
    <el-button type="primary" @click="openEditOrAdd(null)" v-if="buttonList.has('activity:add')">录入</el-button>
    <!-- 批量删除 -->
    <el-button type="danger" @click="batchDel" v-if="buttonList.has('activity:delete')">批量删除</el-button>
    <!-- 条件查询 -->
    <el-button class="searchButton" type="success" @click="openSearch"
        v-if="buttonList.has('activity:search')">条件查询</el-button>

    <br><br>
    <!-- 表格 -->
    <el-table :data="activityList" style="width: 100%" :stripe="true" ref="table"
        v-if="buttonList.has('activity:list')">
        <!-- 复选框 type = selection-->
        <el-table-column type="selection" />
        <!-- 序号，type = index , 自动递增 -->
        <el-table-column type="index" label="序号" align="center" width="65" />

        <!-- 其他数据 -->
        <el-table-column property="ownerName" label="负责人" align="center" width="100" />
        <el-table-column property="name" label="活动名称" align="center" show-overflow-tooltip />
        <el-table-column property="cost" label="活动预算" align="center" show-overflow-tooltip width="100" />
        <el-table-column property="startTime" label="开始时间" align="center" show-overflow-tooltip />
        <el-table-column property="endTime" label="结束时间" align="center" show-overflow-tooltip />


        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="primary" @click="openView(scope.row.id)" size="small"
                    v-if="buttonList.has('activity:view')">备注</el-button>
                <el-button type="success" @click="openEditOrAdd(scope.row.id)" size="small"
                    v-if="buttonList.has('activity:edit')">编辑</el-button>
                <el-button type="danger" @click="del(scope.row.id)" size="small"
                    v-if="buttonList.has('activity:delete')">删除</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getActivityList" />

    <!-- 搜索弹窗 -->
    <el-dialog v-model="searchDialog" title="条件查询" width="550">
        <!-- 搜索表单 -->
        <el-form :model="activitySearchData" label-width="80px" class="demo-form-inline" ref="searchForm"
            :rules="searchFormRules">
            <el-form-item label="负责人">
                <el-select v-model="activitySearchData.ownerId" placeholder="选择负责人" style="width: 200px;" clearable>
                    <el-option v-for="owner in ownerList" :key="owner.id" :label="owner.name" :value="owner.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="活动名称">
                <el-input v-model="activitySearchData.name" style="width: 200px;" clearable />
            </el-form-item>

            <el-form-item label="预算范围" prop="cost">
                <el-input v-model="activitySearchData.minCost" type="number" style="width: 200px;" clearable /> ~
                <el-input v-model="activitySearchData.maxCost" type="number" style="width: 200px;" clearable />
            </el-form-item>
            <el-form-item label="活动时间" style="width: 490px;">
                <el-date-picker v-model="activitySearchData.activityTime" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button type="primary" @click="reset">重置</el-button>
        </div>
    </el-dialog>

    <!-- 添加 或 编辑 弹窗 -->
    <el-dialog v-model="editOrAddDialog" :title="isEdit ? '编辑市场活动' : '录入市场活动'" width="550"
        @closed="closEeditOrAddDialog">
        <!-- 搜索表单 -->
        <el-form class="editOrAddForm" :model="activityData" label-width="80px" ref="editOrAddRef"
            :rules="editOrAddRules">
            <el-form-item label="负责人" prop="ownerId">
                <el-select v-model="activityData.ownerId" placeholder="选择负责人" style="width: 200px;">
                    <el-option v-for="owner in ownerList" :key="owner.id" :label="owner.name" :value="owner.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="活动名称" prop="name">
                <el-input v-model="activityData.name" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="预算" prop="cost">
                <el-input v-model="activityData.cost" type="number" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="活动时间" style="width: 450px;" prop="activityTime">
                <el-date-picker v-model="activityData.activityTime" type="daterange" range-separator="To"
                    start-placeholder="开始日期" end-placeholder="结束日期" />
            </el-form-item>
            <el-form-item label="备注" prop="description">
                <el-input v-model="activityData.description" style="width: 370px" :rows="3" type="textarea"
                    placeholder="请输入活动信息 " />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="editOrAddSubmit">提交</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import { doGetAllOwner, doGetUserPerm } from '../api/user';
import { doAddActivity, doDelActivity, doDelBatchActivity, doEditActivity, doLoadActivity, doSearch } from '../api/activity';
import { messageBox, messageTip } from '../utils/elementUtils';
import { formatDateTime } from '../utils/date';
import { useRouter, useRoute } from 'vue-router';

// 加载活动列表
// 列表数据
const activityList = ref([])
// 分页信息
// 每页记录条数
const pageSize = ref(10);
// 当前所在页
const currentPage = ref(1);
// 总记录条数
const total = ref(0);

// 方法
// 按钮权限
const buttonList = ref(new Set())
// 页面加载时，加载用户列表
onMounted(() => {
    // 加载当前用户权限信息
    getUserPerm();
    // 加载市场活动列表信息
    getActivityList(1);
})

// 当前页面是否是第一次加载
const isInit = ref(true)
const route = useRoute();
// 当组件被激活时触发
onActivated(() => {
    // 如果不是返回 并且 不是第一次初始化，那么就加载列表
    if (!route.meta.isBack && !isInit.value) {
        // 加载当前用户权限信息
        getUserPerm();
        // 加载市场活动列表信息
        getActivityList(1);
    }
    isInit.value = false;
    // 如果是返回 或者 是第一次初始化，那么不刷新
})
// 加载当前用户按钮信息
const getUserPerm = async () => {
    await doGetUserPerm().then((res) => {
        if (res.code === 200) {
            buttonList.value = new Set(res.data)
        }
    })
}
// 加载市场活动列表信息
const getActivityList = (num) => {
    // 处理表单数据(时间)，遍历对象
    // 活动日期范围
    for (let key in activitySearchData.value.activityTime) {
        // 获取最小活动时间
        if (key === '0') {
            activitySearchData.value.activityMinTime = activitySearchData.value.activityTime['0']
        }
        // 获取最大活动时间
        if (key === '1') {
            activitySearchData.value.activityMaxTime = activitySearchData.value.activityTime['1']
        }
    }
    activitySearchData.value.activityTime = null
    // 初始化，当前页与分页
    if (num > 0) {
        activitySearchData.value.pageNum = num;
    } else {
        activitySearchData.value.pageNum = currentPage.value;
    }
    activitySearchData.value.pageSize = pageSize.value;
    doSearch(activitySearchData.value).then((res) => {
        if (res.code === 200) {
            activityList.value = res.data.list;
            total.value = res.data.total;
        }
    })
    isInit.value = false;
}
// 表单搜索
// 表单数据
const activitySearchData = ref({});
// 搜索框开关
const searchDialog = ref(false);
// 搜索组件
const searchForm = ref({});
// 表单校验
const searchFormRules = {
    cost: {
        validator: (rule, value, callback) => {
            // 判断 value 和 当前 form 中收集的 password 是否一致
            if (activitySearchData.value.minCost
                && activitySearchData.value.maxCost
                && activitySearchData.value.maxCost < activitySearchData.value.minCost) {
                callback(new Error('最大预算必须大于等于最小预算'))
            } else {
                callback() // 校验成功
            }
        },
        trigger: 'blur'
    }
}

// 打开搜索表单
const openSearch = () => {
    searchDialog.value = true;
    // 加载负责人
    loadOwnenList();
}

const ownerList = ref([])
// 加载负责人
const loadOwnenList = async () => {
    await doGetAllOwner().then((res) => {
        if (res.code === 200) {
            ownerList.value = res.data;
        }
    })
}
// 搜索
const onSearch = () => {
    // 获取表单进行表单校验
    searchForm.value.validate((isValidate) => {
        if (isValidate) {
            getActivityList(1);
            currentPage.value = 1;
            searchDialog.value = false;
        }
    })
}
// 重置
const reset = () => {
    activitySearchData.value = {};
    currentPage.value = 1;
}


// 编辑 或 新增
// 弹窗开关
const editOrAddDialog = ref(false);
// 表单数据
const activityData = ref({})
// 表单组件
const editOrAddRef = ref(null)
// 当前是否是编辑
const isEdit = ref(false)
// 表单校验
const editOrAddRules = {
    ownerId: [
        { required: true, message: '请选择负责人', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入活动名称', trigger: 'blur' }
    ],
    cost: [
        { required: true, message: '请输入活动预算', trigger: 'blur' },
        { pattern: /^(0|([1-9][0-9]*))(\.[\d]{1,2})?$/, message: '活动预算不正确', trigger: 'blur' }
    ],
    activityTime: [
        { required: true, message: '请选择活动时间范围', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入活动信息', trigger: 'blur' }
    ]
}
// 打开编辑或新增弹窗
const openEditOrAdd = (id) => {
    // 显示弹窗
    editOrAddDialog.value = true;
    // 加载负责人列表
    loadOwnenList();
    // 如果是编辑，需要加载活动信息
    if (id) {
        // 加载活动信息
        loadActivity(id);
        isEdit.value = true;
    } else {
        isEdit.value = false;
    }
}

// 编辑时，加载活动信息
const loadActivity = (id) => {
    doLoadActivity(id).then((res) => {
        if (res.code === 200) {
            activityData.value = res.data;
            activityData.value.activityTime = [
                new Date(activityData.value.startTime),
                new Date(activityData.value.endTime)
            ];
        }
    })
}

// 提交表单
const editOrAddSubmit = async () => {
    // 校验数据
    await editOrAddRef.value.validate((isValidate) => {
        if (isValidate) {
            // 处理表单数据(时间)，遍历对象
            // 活动日期范围
            for (let key in activityData.value.activityTime) {
                // 获取活动开始时间
                if (key === '0') {
                    activityData.value.startTime = formatDateTime(activityData.value.activityTime['0'])
                }
                // 获取活动结束时间
                if (key === '1') {
                    activityData.value.endTime = formatDateTime(activityData.value.activityTime['1'])
                }
            }
            activityData.value.activityTime = null
            // 如果有id，那么就是编辑
            if (activityData.value.id) {
                doEditActivity(activityData.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        editOrAddDialog.value = false;
                        // 重新加载列表
                        getActivityList(currentPage.value);
                    }
                })
            } else {
                doAddActivity(activityData.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('录入成功', 'success')
                        editOrAddDialog.value = false;
                        // 重新加载列表
                        getActivityList(currentPage.value);
                    }
                })
            }
        }
    })
}
// 点击取消按钮
const cancle = () => {
    editOrAddDialog.value = false;
}

// 关闭编辑或新增弹窗
const closEeditOrAddDialog = () => {
    // 表单置空
    activityData.value = {};
    // 负责人置空
    ownerList.value = [];
    // 清空校验提示
    editOrAddRef.value.resetFields();
}



// 删除 与 批量删除
// 删除
const del = (id) => {
    messageBox("是否删除删除?").then(async () => {
        await doDelActivity(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                // 重新加载
                getActivityList();
            }
        })
    })
}

// 批量删除
const table = ref(null)
const batchDel = () => {
    // 获取组件，看看是否选择id
    var arr = table.value.getSelectionRows();
    if (arr.length > 0) {
        messageBox('您确定要删除吗?').then(async () => {
            const ids = [];
            arr.forEach(item => {
                ids.push(item.id)
            })
            await doDelBatchActivity(ids).then((res) => {
                if (res.code === 200) {
                    messageTip('删除成功', 'success')
                    // 重新加载
                    getActivityList();
                }
            })
        })
    } else {
        messageTip('未选择数据', 'warning')
    }
}

// 创建路由
const router = useRouter();
// 点击备注
const openView = (id) => {
    // 进行路由跳转 remark ，并传递参数
    router.push('/dashboard/activity/remark/' + `${id}`)
}
</script>

<style scoped>
.img {
    width: 500px;
}

.searchButton {
    float: right;
    margin-right: 15px;
}

.edit-add-button {
    margin-left: 360px;
    margin-top: 40px;
}

.editOrAddForm {
    margin-left: 40px;
}

.el-pagination {
    margin-top: 20px;
    float: right;
}
</style>
