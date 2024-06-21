<template>
    <!-- 录入市场活动 -->
    <el-button type="primary" @click="openEditOrAdd(null)" v-if="buttonList.has('clue:add')">录入</el-button>
    <el-button type="success" @click="openUpload" v-if="buttonList.has('clue:add')">Excel导入</el-button>
    <br><br>

    <!-- 表格 -->
    <el-table :data="clueList" style="width: 100%" ref="table" border v-if="buttonList.has('clue:list')">
        <!-- 其他信息 -->
        <el-table-column type="expand">
            <template #default="props">

                <el-card class="elCard">
                    <template #header>
                        <span>其他联系方式</span>
                    </template>
                    <li v-if="props.row.weixin" class="li">
                        微信 : {{ props.row.weixin }}
                    </li>
                    <li v-if="props.row.qq" class="li">
                        QQ : {{ props.row.qq }}
                    </li>
                    <li v-if="props.row.email" class="li">
                        邮箱 : {{ props.row.email }}
                    </li>
                </el-card>

                <el-card class="elCard">
                    <template #header>
                        <span>客户信息</span>
                    </template>
                    <li v-if="props.row.age" class="li">
                        年龄 : {{ props.row.age }}
                    </li>
                    <li v-if="props.row.job" class="li">
                        工作 : {{ props.row.job }}
                    </li>
                    <li v-if="props.row.yearIncome" class="li">
                        年收入 : {{ props.row.yearIncome }}
                    </li>
                    <li v-if="props.row.address" class="li">
                        地址 : {{ props.row.address }}
                    </li>
                </el-card>

                <el-card class="elCard">
                    <template #header>
                        <span>线索信息</span>
                    </template>
                    <li v-if="props.row.stateStr" class="li">
                        线索状态 : {{ props.row.stateStr }}
                    </li>
                    <li v-if="props.row.sourceStr" class="li">
                        线索来源 : {{ props.row.sourceStr }}
                    </li>
                    <li v-if="props.row.description" class="li">
                        线索描述 : {{ props.row.description }}
                    </li>
                    <li v-if="props.row.nextContactTime" class="li">
                        下次联系时间 : {{ props.row.nextContactTime }}
                    </li>
                </el-card>
            </template>
        </el-table-column>
        <!-- 数据 -->
        <el-table-column property="ownerName" label="负责人" align="center" width="100" />
        <el-table-column property="activityName" label="活动名称" align="center" show-overflow-tooltip />
        <el-table-column property="fullName" label="姓名" align="center" show-overflow-tooltip width="100" />
        <el-table-column property="appellationStr" label="称呼" align="center" show-overflow-tooltip />
        <el-table-column property="phone" label="手机号" align="center" show-overflow-tooltip />
        <el-table-column property="intentionProductStr" label="意向产品" align="center" show-overflow-tooltip />
        <el-table-column property="intentionStateStr" label="意向状态" align="center" show-overflow-tooltip />
        <el-table-column property="needLoanStr" label="是否需要贷款" align="center" show-overflow-tooltip />

        <!-- 操作使用插槽 -->
        <el-table-column label="操作" align="center">
            <template #default="scope">
                <el-button type="success" @click="openEditOrAdd(scope.row.id)" size="small"
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
        :hide-on-single-page="true" v-model:current-page="currentPage" @change="getClueList" />

    <!-- 文件上传弹窗 -->
    <el-dialog v-model="uploadDialog" title="导入Excel" width="500">
        <el-upload :file-list="fileList" action="url" :http-request="uploadFile" ref="upload" :limit="fileLimit"
            multiple :on-exceed="handleExceed" :before-upload="beforeUpload" :auto-upload="false">
            <el-button type="success" style="margin-top: 20px;">选择文件</el-button>


            <template #tip>
                <div class="el-upload__tip">
                    文件类型只能为 xls 或 xlsx
                </div>
            </template>
        </el-upload>
        <el-button type="primary" @click="uploadSubmit" class="uploadButton">上传</el-button>
    </el-dialog>

    <!-- 新增或编辑 -->
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { doGetUserPerm } from '../api/user';
import { doLoadCuleList, doUploadExcel } from '../api/clue';
import { messageTip } from '../utils/elementUtils';

// 加载活动列表
// 列表数据
const clueList = ref([])
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
    getClueList();
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
const getClueList = async () => {
    await doLoadCuleList(currentPage.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            clueList.value = res.data.list;
            total.value = res.data.total;
        }
    })
}

// 点击Excel导入
const uploadDialog = ref(false)
const openUpload = () => {
    uploadDialog.value = true;
}

// 文件上传
// 上传组件
const upload = ref(null)
// 上传的文件列表
const fileList = ref([])
// 运行上传的文件类型，只能是 excle表格
const fileType = ['xls', 'xlsx']
// 单个文件的最大大小 单位M
const fileSize = 500
// 最大上传文件个数
const fileLimit = 3
// 上传文件的方法，每个文件，都会单独的调用这个方法，进行上传，如果有10个文件，那么这个方法就会被调10次
const uploadFile = async (param) => {
    console.log('文件上传', param)
    // 文件上传需要使用 formData 进行文件保存
    var formData = new FormData();
    // 获取文件
    var file = param.file;
    // 文件存入formData，设置key，后端需要根据这个key取
    formData.append('file', file)
    // 发送请求，上传文件
    await doUploadExcel(formData).then((res) => {
        if (res.code === 200) {
            messageTip('导入成功','success')
            getClueList();
            uploadDialog.value = false;
            fileList.value = [];
        }
    })

}

// 超出文件上传个数时的回调
const handleExceed = () => {
    messageTip('最多只能同时上传' + fileLimit + '个文件', 'warning')
}
// 上传文件时，对文件进行判断，如判断文件类型，文件大小，如果有10个文件，那么这个方法就会被调10次
const beforeUpload = (file) => {
    // 获取文件类型
    if (file.type && file.type != "") {
        // 获取文件后缀
        var suffix = file.name.substring(file.name.lastIndexOf(".") + 1);
        // 获取文件大小
        var dataSize = file.size / 1024 / 1024;
        // 如果大小大于最大大小
        if (dataSize > fileSize) {
            messageTip('文件大小不能超过' + fileSize + 'M', 'warning')
            return false;
        }
        // 如果该文件类型可以上传，那么返回true
        if (fileType.includes(suffix)) {
            return true;
        } else {
            messageTip('文件类型不正确', 'warning')
            return false;
        }
    }
}
// 点击上传按钮，进行手动上传
const uploadSubmit = () => {
    upload.value.submit();
    // 会自动调用 :http-request="" 绑定的方法
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

.uploadButton {
    margin-left: 400px;
    margin-top: 50px;

}
</style>