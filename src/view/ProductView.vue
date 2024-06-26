<template>
    <!-- 新增用户 -->
    <el-button type="primary" @click="addOrEditProduct(null)" v-if="buttonList.has('product:add')">新增产品</el-button>

    <br><br>
    <!-- 表格 -->
    <el-table :data="productList" style="width: 100%" :stripe="true" ref="table" v-if="buttonList.has('product:list')">
        <!-- 序号，type = index , 自动递增 -->
        <el-table-column type="index" label="序号" align="center" width="100" />
        <!-- 其他数据 -->
        <el-table-column property="name" label="产品名称" align="center" />
        <el-table-column property="guidePriceS" label="起始价" align="center" />
        <el-table-column property="guidePriceE" label="最高价" align="center" />
        <el-table-column property="quotation" label="经销商报价" align="center" />
        <!-- 状态 -->
        <el-table-column label="状态" align="center">
            <template #default="scope">
                <el-button type="primary" plain v-if="scope.row.state === 0" size="small" disabled>在售</el-button>
                <el-button type="danger" plain v-else size="small" disabled> 下架 </el-button>
            </template>
        </el-table-column>


        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="success" @click="addOrEditProduct(scope.row.id)" size="small"
                    v-if="buttonList.has('product:edit')">编辑</el-button>
                <el-button type="danger" @click="down(scope.row.id)" size="small"
                    v-if="buttonList.has('product:delete') && scope.row.state === 0">下架</el-button>
                <el-button type="danger" plain size="small" disabled v-else>下架</el-button>
                <el-button type="danger" @click="up(scope.row.id)" size="small"
                    v-if="buttonList.has('product:delete') && scope.row.state === 1">上架</el-button>
                <el-button type="danger" plain size="small" disabled v-else>上架</el-button>
            </template>
        </el-table-column>

        <!-- 使用插槽，当表格没有数据时显示 -->
        <template #empty>
            <img src="../assets/empty.png" class="img" />
        </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getProductList" />

    <!-- 编辑 或 新增 产品 -->
    <el-dialog v-model="editOrAdd" :title="isEdit ? '编辑产品' : '新增产品'" width="550" @closed="closeDialog">
        <el-form :model="productInfo" label-width="100px" ref="editOrAddRef" :rules="editOrAddRules">
            <el-form-item label="名称" prop="name">
                <el-input v-model.trim="productInfo.name" />
            </el-form-item>
            <el-form-item label="起始价" prop="guidePriceS">
                <el-input v-model.trim="productInfo.guidePriceS" />
            </el-form-item>
            <el-form-item label="最高价" prop="guidePriceE">
                <el-input v-model.trim="productInfo.guidePriceE" />
            </el-form-item>
            <el-form-item label="经销商报价" prop="quotation">
                <el-input v-model.trim="productInfo.quotation" />
            </el-form-item>
        </el-form>
        <div class="edit-add-button">
            <el-button type="info" @click="cancle">取消</el-button>
            <el-button type="primary" @click="productSubmit">提交</el-button>
        </div>
    </el-dialog>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { messageBox, messageTip } from '../utils/elementUtils';
import { doGetUserPerm } from '../api/user';
import { doAddProduct, doDownProduct, doEditProduct, doGetProduct, doGetProductList, doUpProduct } from '../api/product'
// 用户分页列表信息
const productList = ref([])
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
    getProductList();
})

const getUserPerm = async () => {
    await doGetUserPerm().then((res) => {
        if (res.code === 200) {
            buttonList.value = new Set(res.data)
        }
    })
}

// 加载列表信息
const getProductList = async () => {
    await doGetProductList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            productList.value = res.data.list
            total.value = res.data.total
        }
    })
}



// 编辑或新增用户 数据
const productInfo = ref({});
// 是否打开弹窗
const editOrAdd = ref(false);
// 是否是编辑
const isEdit = ref(true);
// 表单ref
const editOrAddRef = ref(null)
// 验证规则
const editOrAddRules = {
    guidePriceS: [
        { required: true, message: '请输入起始价', trigger: 'blur' },
        { pattern: /^(0|([1-9][0-9]*))(\.[\d]{1,2})?$/, message: '价格不正确', trigger: 'blur' }
    ],
    guidePriceE: [
        { required: true, message: '请输入最高价', trigger: 'blur' },
        { pattern: /^(0|([1-9][0-9]*))(\.[\d]{1,2})?$/, message: '价格不正确', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入产品名称', trigger: 'blur' }
    ],
    quotation: [
        { required: true, message: '请输入经销商报价', trigger: 'blur' },
        { pattern: /^(0|([1-9][0-9]*))(\.[\d]{1,2})?$/, message: '价格不正确', trigger: 'blur' }
    ],
    state: [
        { required: true, message: '请选择商品状态', trigger: 'blur' }
    ]
}

// 点击新增 或 编辑产品
const addOrEditProduct = (id) => {
    if (id) {
        isEdit.value = true;
        // 加载产品信息
        getProduct(id);
    } else {
        isEdit.value = false;
    }
    // 打开弹窗
    editOrAdd.value = true;
}

// 加载单个产品信息
const getProduct = async (id) => {
    await doGetProduct(id).then((res) => {
        if (res.code === 200) {
            productInfo.value = res.data;
        }
    })
}

// 关闭弹窗事件
const closeDialog = () => {
    productInfo.value = {}
}

// 取消
const cancle = () => {
    editOrAdd.value = false;
}

// 点击提交表单
const productSubmit = async () => {
    // 校验数据
    await editOrAddRef.value.validate((isValidate) => {
        if (isValidate) {
            // 如果有id，那么就是编辑
            if (productInfo.value.id) {
                doEditProduct(productInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载列表
                        getProductList(currentPage.value);
                    }
                })
            } else {
                doAddProduct(productInfo.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('录入成功', 'success')
                        editOrAdd.value = false;
                        // 重新加载列表
                        getProductList(currentPage.value);
                    }
                })
            }
        }
    })
}

// 点击下架按钮
const down = (id) => {
    messageBox('您确定要下架该商品吗?').then(async () => {
        await doDownProduct(id).then((res) => {
            if (res.code === 200) {
                messageTip('下架成功', 'success')
                // 重新加载当前页
                getProductList();
            }
        })
    })
}

// 点击上架
const up = (id) => {
    messageBox('您确定要上架该商品吗?').then(async () => {
        await doUpProduct(id).then((res) => {
            if (res.code === 200) {
                messageTip('上架成功', 'success')
                // 重新加载当前页
                getProductList();
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