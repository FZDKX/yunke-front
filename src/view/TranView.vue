<template>
    <!-- 表格 -->
    <el-table :data="tranList" style="width: 100%" :stripe="true" ref="table" v-if="buttonList.has('tran:list')">
        <!-- 其他信息 -->
        <el-table-column type="expand">
            <template #default="props">
                <div class="info">
                    <p>交易流水号 : {{ props.row.tranNo }}</p>
                    <p>称呼 : {{ props.row.tranCustomerVO.appellationName }}</p>
                    <p>手机号 : {{ props.row.tranCustomerVO.phone }}</p>
                    <p>地址 : {{ props.row.tranCustomerVO.address }}</p>
                    <p>交易描述 : {{ props.row.description }}</p>
                </div>
            </template>
        </el-table-column>
        <!-- 序号，type = index , 自动递增 -->
        <el-table-column type="index" label="序号" align="center" width="65" />

        <!-- 其他数据 -->
        <el-table-column property="ownerName" label="负责人" align="center" width="80" />
        <el-table-column property="tranCustomerVO.fullName" label="客户姓名" align="center" width="100" />
        <el-table-column property="tranCustomerVO.productName" label="购买产品" width="120" align="center"
            show-overflow-tooltip />
        <el-table-column property="money" label="金额(万)" align="center" width="80" show-overflow-tooltip />
        <el-table-column property="expectedDate" label="预计成交日期" align="center" show-overflow-tooltip />
        <el-table-column property="stageName" label="交易阶段" width="90" align="center" show-overflow-tooltip />
        <el-table-column property="nextContactTime" label="下次联系" align="center" show-overflow-tooltip />


        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center" width="400">
            <template #default="scope">
                <el-button type="primary" plain @click="tranHistory(scope.row.id)" size="small"
                    v-if="buttonList.has('tran:view')">交易历史</el-button>
                <el-button type="primary" @click="next(scope.row.id)" size="small"
                    v-if="buttonList.has('tran:delete')">下一阶段</el-button>
                <el-button type="success" @click="edit(scope.row.id)" size="small"
                    v-if="buttonList.has('tran:edit')">编辑</el-button>
                <el-button type="success" @click="openRemark(scope.row.id)" size="small"
                    v-if="buttonList.has('tran:edit')">备注</el-button>
                <el-button type="danger" @click="del(scope.row.id)" size="small"
                    v-if="buttonList.has('tran:delete')">删除</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getTranList" />

    <!-- 交易历史弹窗 -->
    <el-dialog v-model="historyDialog" title="交易历史" width="800" @closed="closHistoryDialog">
        <el-table :data="historyList" :stripe="true">
            <!-- 序号，type = index , 自动递增 -->
            <el-table-column type="index" label="序号" align="center" width="65" />

            <!-- 其他数据 -->
            <el-table-column property="stageName" label="交易阶段" align="center" width="90" />
            <el-table-column property="money" label="金额(万)" align="center" width="120" />
            <el-table-column property="expectedDate" label="预计成交日期" align="center" />
            <el-table-column property="createName" label="创建人" align="center" />
            <el-table-column property="createTime" label="创建时间" align="center" />
        </el-table>
    </el-dialog>

    <!-- 下一阶段弹窗 -->
    <el-dialog v-model="nextDialog" title="下一阶段" width="550" @closed="closeNextDialog">
        <!-- 表单 -->
        <el-form class="nextTranForm" :model="nextTran" label-width="120px" ref="nextTranRef" :rules="nextTranRules">
            <el-form-item label="下一阶段" v-if="!isEdit" prop="stage">
                <el-select v-model="nextTran.stage" placeholder="选择下一交易阶段" style="width: 200px;">
                    <el-option v-for="item in stageList" :key="item.id" :label="item.typeValue" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="预计成交日期" prop="expectedDate">
                <el-date-picker v-model="nextTran.expectedDate" type="date" placeholder="预计成交日期"
                    style="width: 300px;" />
            </el-form-item>
            <el-form-item label="下次联系时间" prop="nextContactTime">
                <el-date-picker v-model="nextTran.nextContactTime" type="date" placeholder="下次联系时间"
                    style="width: 300px;" />
            </el-form-item>
            <el-form-item label="客户描述" prop="description">
                <el-input v-model="nextTran.description" style="width: 300px" :rows="5" type="textarea"
                    placeholder="请输入交易描述" />
            </el-form-item>
        </el-form>
        <div class="nextTranButton">
            <el-button type="info" @click="updateCancle">取消</el-button>
            <el-button type="primary" @click="updateCancleSubmit">转换</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import { doGetUserPerm } from '../api/user';
import { messageBox, messageTip } from '../utils/elementUtils';
import { formatDateTime } from '../utils/date';
import { useRouter, useRoute } from 'vue-router';
import { doDelTran, doEditTran, doGetTran, doGetTranHistory, doGetTranList, doUpdateTran } from '../api/tran';
import { doGetTranStageList } from '../api/dic';

// 加载活动列表
// 列表数据
const tranList = ref([])
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
    // 加载交易列表信息
    getTranList();
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
        // 设置当前页
        currentPage.value = 1;
        // 加载交易列表信息
        getTranList();
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
// 加载交易列表信息
const getTranList = async () => {
    await doGetTranList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            tranList.value = res.data.list;
            total.value = res.data.total;
        }
    })
}

// 打开交易历史
// 弹窗开关
const historyDialog = ref(false);
// 交易隶属数据列表
const historyList = ref([])
// 点击交易历史
const tranHistory = (id) => {
    // 加载交易历史数据
    getTranHistoryList(id);
    // 打开弹窗
    historyDialog.value = true;
}
// 加载交易历史数据
const getTranHistoryList = async (id) => {
    await doGetTranHistory(id).then((res) => {
        if (res.code === 200) {
            historyList.value = res.data;
        }
    })
}
// 关闭弹窗事件
const closHistoryDialog = () => {
    historyList.value = [];
}

// 下一阶段
// 弹窗开关
const nextDialog = ref(false);
// 表单数据
const nextTran = ref({});
// 表单组件
const nextTranRef = ref(null);
// 交易阶段列表
const stageList = ref([]);
// 验证规则
const nextTranRules = {
    stage: [
        { required: true, message: '请选择下一阶段', trigger: 'blur' }
    ],
    expectedDate: [
        { required: true, message: '请选择预计成交时间', trigger: 'blur' }
    ],
    nextContactTime: [
        { required: true, message: '请选择下次联系时间', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入交易描述', trigger: 'blur' }
    ]
}
// 当前是编辑 还是 下一阶段
const isEdit = ref(false);
// 点击下一阶段
const next = (id) => {
    // 当前是下一阶段
    isEdit.value = false;
    // 查询交易数据
    getTran(id);
    // 查询交易阶段列表
    getTranStageList();
    nextDialog.value = true;

}
// 查询交易具体信息
const getTran = async (id) => {
    await doGetTran(id).then((res) => {
        if (res.code === 200) {
            nextTran.value = res.data;
            // 数据转换
            nextTran.value.nextContactTime = new Date(nextTran.value.nextContactTime);
            nextTran.value.expectedDate = new Date(nextTran.value.expectedDate);
        }
    })
}
// 查询交易阶段列表
const getTranStageList = async () => {
    await doGetTranStageList().then((res) => {
        if (res.code === 200) {
            stageList.value = res.data.stageList;
        }
    })
}
// 提交下一阶段
const updateCancleSubmit = async () => {
    // 校验数据
    await nextTranRef.value.validate((isValidate) => {
        if (isValidate) {
            nextTran.value.nextContactTime = formatDateTime(nextTran.value.nextContactTime)
            nextTran.value.expectedDate = formatDateTime(nextTran.value.expectedDate)
            if (isEdit.value) {
                doEditTran(nextTran.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('修改成功', 'success')
                        // 关闭弹窗
                        nextDialog.value = false;
                        // 刷新页面
                        getTranList();
                    }
                })
            } else {
                messageBox("是否确认进入下一阶段?").then(async () => {
                    doUpdateTran(nextTran.value).then((res) => {
                        if (res.code === 200) {
                            messageTip('已进入下一阶段', 'success')
                            // 关闭弹窗
                            nextDialog.value = false;
                            // 刷新页面
                            getTranList();
                        }
                    })
                })
            }
        }
    })
}
// 关闭弹窗事件
const closeNextDialog = () => {
    nextTran.value = {};
    stageList.value = {};
     // 清空校验提示
     nextTranRef.value.resetFields();
}
// 点击取消按钮
const updateCancle = () => {
    nextDialog.value = false;
}

// 点击编辑
const edit = (id) => {
    // 当前是编辑
    isEdit.value = true;
    // 查询交易数据
    getTran(id);
    nextDialog.value = true;
}

// 删除交易
const del = async (id) => {
    messageBox("是否确认删除当前交易记录?").then(async () => {
        await doDelTran(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                // 刷新页面
                getTranList();
            }
        })
    })
}

// 点击备注按钮
const router = useRouter();
const openRemark = (id) => {
    router.push('/dashboard/tran/remark/' + `${id}`)
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

.info {
    margin-left: 65px;
}

.nextTranButton {
    margin-left: 360px;
    margin-top: 40px;
}

.nextTranForm {
    margin-left: 30px;
}
</style>