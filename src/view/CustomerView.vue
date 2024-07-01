<template>
    <el-button type="primary" @click="exportAll">全部导出</el-button>
    <el-button type="success" @click="exportSelect">选择导出</el-button>
    <br><br>
    <!-- 表格 -->
    <el-table :data="customerList" style="width: 100%" ref="table" border v-if="buttonList.has('customer:list')">
        <!-- 复选框 type = selection-->
        <el-table-column type="selection" />
        <!-- 其他信息 -->
        <el-table-column type="expand">
            <template #default="props">
                <el-card class="elCard">
                    <template #header>
                        <span>其他联系方式</span>
                    </template>
                    <li v-if="props.row.clueVO.weixin" class="li">
                        微信 : {{ props.row.clueVO.weixin }}
                    </li>
                    <li v-if="props.row.clueVO.qq" class="li">
                        QQ : {{ props.row.clueVO.qq }}
                    </li>
                    <li v-if="props.row.clueVO.email" class="li">
                        邮箱 : {{ props.row.clueVO.email }}
                    </li>
                </el-card>

                <el-card class="elCard">
                    <template #header>
                        <span>客户信息</span>
                    </template>
                    <li v-if="props.row.clueVO.age" class="li">
                        年龄 : {{ props.row.clueVO.age }}
                    </li>
                    <li v-if="props.row.clueVO.job" class="li">
                        工作 : {{ props.row.clueVO.job }}
                    </li>
                    <li v-if="props.row.clueVO.yearIncome" class="li">
                        年收入 : {{ props.row.clueVO.yearIncome }}
                    </li>
                    <li v-if="props.row.clueVO.address" class="li">
                        地址 : {{ props.row.clueVO.address }}
                    </li>
                </el-card>

                <el-card class="elCard">
                    <template #header>
                        <span>客户意向</span>
                    </template>
                    <li v-if="props.row.clueVO.needLoanStr" class="li">
                        是否贷款 : {{ props.row.clueVO.needLoanStr }}
                    </li>
                    <li v-if="props.row.description" class="li">
                        信息 : {{ props.row.description }}
                    </li>
                </el-card>
            </template>
        </el-table-column>
        <!-- 数据 -->
        <el-table-column property="clueVO.ownerName" label="负责人" align="center" width="100" />
        <el-table-column property="clueVO.fullName" label="姓名" align="center" show-overflow-tooltip width="100" />
        <el-table-column property="clueVO.appellationStr" label="称呼" align="center" show-overflow-tooltip width="80" />
        <el-table-column property="clueVO.phone" label="手机号" align="center" show-overflow-tooltip width="130" />
        <el-table-column property="productName" label="意向产品" align="center" show-overflow-tooltip />
        <el-table-column property="intentionStateName" label="意向状态" align="center" show-overflow-tooltip />
        <el-table-column property="nextContactTime" label="下次联系" align="center" show-overflow-tooltip />

        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center" width="300">
            <template #default="scope">
                <el-button type="primary" plain @click="convert(scope.row.id)" size="small"
                    v-if="scope.row.state == 0">转为交易</el-button>
                <el-button type="danger" plain size="small" v-else disabled>已转交易</el-button>
                <el-button type="primary" @click="openRemark(scope.row.id)" size="small"
                    v-if="buttonList.has('clue:edit')">备注</el-button>
                <el-button type="success" @click="openEdit(scope.row.id)" size="small"
                    v-if="buttonList.has('clue:edit')">编辑</el-button>
                <el-button type="danger" @click="del(scope.row.id)" size="small"
                    v-if="buttonList.has('clue:delete')">删除</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getCustomerList" />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialog" title="编辑客户意向" width="550" @closed="closeEditDialog">
        <!-- 表单 -->
        <el-form class="editForm" :model="customer" label-width="80px" ref="customerRef" :rules="customerRules">
            <el-form-item label="意向产品" prop="product">
                <el-select v-model="customer.product" placeholder="选择意向产品" style="width: 230px;">
                    <el-option v-for="product in dic.intentionProductList" :key="product.id" :label="product.name"
                        :value="product.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="意向状态" prop="intentionState">
                <el-select v-model="customer.intentionState" placeholder="选择意向状态" style="width: 230px;">
                    <el-option v-for="item in dic.intentionStateList" :key="item.id" :label="item.typeValue"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="下次联系" prop="nextContactTime">
                <el-date-picker v-model="customer.nextContactTime" type="date" placeholder="下次联系时间"
                    style="width: 230px;" />
            </el-form-item>
            <el-form-item label="客户描述" prop="description">
                <el-input v-model="customer.description" style="width: 300px" :rows="5" type="textarea"
                    placeholder="请输入客户描述" />
            </el-form-item>
        </el-form>
        <div class="editButton">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="editSubmit">转换</el-button>
        </div>
    </el-dialog>

     <!-- 转换交易弹窗 -->
     <el-dialog v-model="convertDialog" title="转为交易" width="550" @closed="closConvertDialog">
        <!-- 表单 -->
        <el-form class="convertForm" :model="tran" label-width="120px" ref="convertRef" :rules="tranRules">
            <el-form-item label="预计成交日期" prop="expectedDate">
                <el-date-picker v-model="tran.expectedDate" type="date" placeholder="预计成交日期"
                    style="width: 300px;" />
            </el-form-item>
            <el-form-item label="下次联系时间" prop="nextContactTime">
                <el-date-picker v-model="tran.nextContactTime" type="date" placeholder="下次联系时间"
                    style="width: 300px;" />
            </el-form-item>
            <el-form-item label="客户描述" prop="description">
                <el-input v-model="tran.description" style="width: 300px" :rows="5" type="textarea"
                    placeholder="请输入交易描述" />
            </el-form-item>
        </el-form>
        <div class="convertButton">
            <el-button type="info" @click="cancleTran">取消</el-button>
            <el-button type="primary" @click="convertSubmit">转换</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import { doGetUserPerm } from '../api/user';
import { doDelCustomer, doEditCustomer, doExportExcel, doGetCustomer, doLoadCustomerList } from '../api/customer';
import { doLoadCustomerDic } from '../api/dic';
import { formatDateTime } from '../utils/date';
import { messageBox, messageTip } from '../utils/elementUtils';
import { useRouter, useRoute } from 'vue-router'
import { downLoadFile } from '../utils/downLoad';
import { doAddTran } from '../api/tran';
// 加载客户列表
// 列表数据
const customerList = ref([])
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
    getCustomerList();
})
// 当组件被激活时触发
// 当前页面是否是第一次加载
const isInit = ref(true)
const route = useRoute();
onActivated(() => {
    // 如果不是返回 并且 不是第一次初始化，那么就加载列表
    if (!route.meta.isBack && !isInit.value) {
        // 加载当前用户权限信息
        getUserPerm();
        // 加载市场活动列表信息
        getCustomerList()
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
// 加载列表信息
const getCustomerList = async () => {
    await doLoadCustomerList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            customerList.value = res.data.list;
            total.value = res.data.total;
        }
    })
}

// 编辑客户信息
// 弹窗开关
const editDialog = ref(false);
// 表单数据
const customer = ref({});
// 组件
const customerRef = ref(null);
// 产品列表
const dic = ref({})
// 验证规则
const customerRules = {
    product: [
        { required: true, message: '请选择意向产品', trigger: 'blur' }
    ],
    nextContactTime: [
        { required: true, message: '请选择下次联系时间', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入客户描述', trigger: 'blur' }
    ],
    intentionState: [
        { required: true, message: '请选择意向状态', trigger: 'blur' }
    ]
};

// 点击编辑客户
const openEdit = (id) => {
    // 加载产品信息
    loadCustomerDic();
    // 加载客户信息
    getCustomer(id);
    // 打开弹窗
    editDialog.value = true;
}
// 加载客户信息
const getCustomer = async (id) => {
    await doGetCustomer(id).then((res) => {
        if (res.code === 200) {
            customer.value = res.data;
            // 客户信息转换
            customer.value.nextContactTime = new Date(customer.value.nextContactTime);
        }
    })
}
// 获取字典列表
const loadCustomerDic = async () => {
    await doLoadCustomerDic().then((res) => {
        if (res.code === 200) {
            dic.value = res.data;
        }
    })
}
// 取消编辑
const cancle = () => {
    editDialog.value = false;
}
// 关闭弹窗之后
const closeEditDialog = () => {
    customer.value = {}
    dic.value = {}
    // 清空校验提示
    customerRef.value.resetFields();
}
// 提交编辑
const editSubmit = async () => {
    // 校验数据
    await customerRef.value.validate((isValidate) => {
        if (isValidate) {
            customer.value.nextContactTime = formatDateTime(customer.value.nextContactTime)
            doEditCustomer(customer.value).then((res) => {
                if (res.code === 200) {
                    messageTip('编辑成功', 'success')
                    // 关闭弹窗
                    editDialog.value = false;
                    // 刷新页面
                    getCustomerList();
                }
            })
        }
    })
}


// 删除客户
const del = (id) => {
    messageBox("是否删除删除?").then(async () => {
        await doDelCustomer(id).then((res) => {
            if (res.code === 200) {
                messageTip('删除成功', 'success')
                // 重新加载
                getCustomerList();
            }
        })
    })
}
const router = useRouter();
// 点击备注
const openRemark = (id) => {
    // 进行路由跳转 remark ，并传递参数
    router.push('/dashboard/customer/remark/' + `${id}`)
}

// 导出excel
const table = ref(null);
// 全部导出
const exportAll = async () => {
    await doExportExcel([]).then((res) => {
        downLoadFile(res)
    })
}
// 选择导出
const exportSelect = async () => {
    // 获取组件，看看是否选择id
    var arr = table.value.getSelectionRows();
    if (arr.length > 0) {
        const ids = [];
        arr.forEach(item => {
            ids.push(item.id)
        })
        await doExportExcel(ids).then((res) => {
            downLoadFile(res)
        })
    } else {
        messageTip('未选择导出客户', 'warning')
    }
}


// 点击转为交易
// 弹窗开关
const convertDialog = ref(false);
// 表单数据
const tran = ref({});
// 组件
const convertRef = ref(null);
// 验证规则
const tranRules = {
    expectedDate: [
        { required: true, message: '请选择预计成交时间', trigger: 'blur' }
    ],
    nextContactTime: [
        { required: true, message: '请选择下次联系时间', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入交易描述', trigger: 'blur' }
    ]
};

// 点击转为交易按钮
const convert = (id) => {
    // 保存客户id
    tran.value.customerId = id;
    // 打开弹窗
    convertDialog.value = true;
}

// 取消转换客户
const cancleTran = () => {
    convertDialog.value = false;
}

// 关闭弹窗之后
const closConvertDialog = () => {
    tran.value = {}
    // 清空校验提示
    convertRef.value.resetFields();
}

// 提交转为交易
const convertSubmit = async () => {
    // 校验数据
    await convertRef.value.validate((isValidate) => {
        if (isValidate) {
            tran.value.nextContactTime = formatDateTime(tran.value.nextContactTime)
            tran.value.expectedDate = formatDateTime(tran.value.expectedDate)
            doAddTran(tran.value).then((res) => {
                if (res.code === 200) {
                    messageTip('转换成功', 'success')
                    // 关闭弹窗
                    convertDialog.value = false;
                    // 刷新页面
                    getCustomerList();
                }
            })
        }
    })
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

.elCard {
    margin-left: 70px;
    float: left;
    width: 300px;
}

.li {
    margin-top: 5px;
    size: 20px;
}

.editForm {
    margin-left: 60px;
}

.editButton {
    margin-left: 360px;
    margin-top: 30px;
}

.convertForm {
    margin-left: 35px;
}

.convertButton {
    margin-left: 360px;
    margin-top: 30px;
}
</style>