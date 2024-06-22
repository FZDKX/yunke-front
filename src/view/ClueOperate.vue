<template>
    <el-button type="primary" class="goBackButton" @click="goBack(null)">返回</el-button>
    <el-button type="success" class="submitButton" @click="submit">提交</el-button>
    <br><br><br>
    <el-form :model="clueData" label-width="80px" ref="editOrAddRef" :rules="editOrAddRules">

        <!-- 活动信息 -->
        <el-card class="elCard">
            <template #header>
                <span>活动信息</span>
            </template>
            <el-form-item label="负责人" prop="ownerId">
                <el-select v-model="clueData.ownerId" placeholder="选择负责人" style="width: 200px;">
                    <el-option v-for="owner in dic.ownerList" :key="owner.id" :label="owner.name" :value="owner.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="活动名称" prop="activityId">
                <el-select v-model="clueData.activityId" placeholder="选择活动" style="width: 200px;">
                    <el-option v-for="activity in dic.activityList" :key="activity.id" :label="activity.name"
                        :value="activity.id" />
                </el-select>
            </el-form-item>
        </el-card>

        <!-- 客户信息 -->
        <el-card class="elCard">
            <template #header>
                <span>客户信息</span>
            </template>
            <el-form-item label="姓名" prop="fullName">
                <el-input v-model="clueData.fullName" />
            </el-form-item>
            <el-form-item label="称呼" prop="appellation">
                <el-select v-model="clueData.appellation" placeholder="选择称呼">
                    <el-option v-for="item in dic.appellationList" :key="item.id" :label="item.typeValue"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="年龄" prop="age">
                <el-input v-model="clueData.age" />
            </el-form-item>
            <el-form-item label="职业" prop="job">
                <el-input v-model="clueData.job" />
            </el-form-item>
            <el-form-item label="年收入" prop="yearIncome">
                <el-input v-model="clueData.yearIncome" />
            </el-form-item>
            <el-form-item label="地址" prop="address">
                <el-input v-model="clueData.address" />
            </el-form-item>
        </el-card>

        <!-- 联系方式 -->
        <el-card class="elCard">
            <template #header>
                <span>联系方式</span>
            </template>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="clueData.phone" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="微信号" prop="weixin">
                <el-input v-model="clueData.weixin" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="QQ" prop="qq">
                <el-input v-model="clueData.qq" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="email" prop="email">
                <el-input v-model="clueData.email" style="width: 200px;" />
            </el-form-item>
        </el-card>

        <!-- 线索信息 -->
        <el-card class="elCard">
            <template #header>
                <span>线索信息</span>
            </template>
            <el-form-item label="是否贷款" prop="needLoan">
                <el-select v-model="clueData.needLoan" placeholder="请选择是否贷款">
                    <el-option v-for="item in dic.needLoanList" :key="item.id" :label="item.typeValue"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="意向状态" prop="intentionState">
                <el-select v-model="clueData.intentionState" placeholder="选择意向状态">
                    <el-option v-for="item in dic.intentionStateList" :key="item.id" :label="item.typeValue"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="意向产品" prop="intentionProduct">
                <el-select v-model="clueData.intentionProduct" placeholder="选择意向产品">
                    <el-option v-for="item in dic.intentionProductList" :key="item.id" :label="item.name"
                        :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="线索状态" prop="state">
                <el-select v-model="clueData.state" placeholder="选择线索状态">
                    <el-option v-for="item in dic.stateList" :key="item.id" :label="item.typeValue" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="线索来源" prop="source">
                <el-select v-model="clueData.source" placeholder="选择线索来源">
                    <el-option v-for="item in dic.sourceList" :key="item.id" :label="item.typeValue" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="下次联系" prop="nextContactTime">
                <el-date-picker v-model="clueData.nextContactTime" type="date" placeholder="下次联系时间" />
            </el-form-item>
            <el-form-item label="线索描述" prop="description">
                <el-input v-model="clueData.description" style="width: 280px" :rows="5" type="textarea"
                placeholder="请输入线索描述 " maxlength="300" show-word-limit="true" />
            </el-form-item>
        </el-card>
    </el-form>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doAddClue, doEditClue, doLoadClue } from '../api/clue';
import { doLoadClueDic } from '../api/dic';
import { messageTip } from '../utils/elementUtils';
import { formatDateTime } from '../utils/date';

const route = useRoute();
onMounted(() => {
    // 不为 null ，那么就是编辑，需要加载数据
    if (route.params.id !== 'null') {
        // 加载线索数据 与 字典数据
        loadClue(route.params.id)
    } else {
        // 加载字典数据
        loadDic();
    }
})

// 定义变量
// 表单数据
const clueData = ref({})
// 字典数据
const dic = ref([])
// 表单组件
const editOrAddRef = ref(null)
// 校验规则
const editOrAddRules = {
    ownerId: { required: true, message: '请选择负责人', trigger: 'blur' },
    activityId: { required: true, message: '请选择市场活动', trigger: 'blur' },
    fullName: { required: true, message: '请输入客户姓名', trigger: 'blur' },
    appellation: { required: true, message: '请选择称呼', trigger: 'blur' },
    fullName: { required: true, message: '请输入手机号', trigger: 'blur' },
    intentionState: { required: true, message: '请选择意向状态', trigger: 'blur' },
    intentionProduct: { required: true, message: '请选择意向产品', trigger: 'blur' },
    state: { required: true, message: '请选择线索状态', trigger: 'blur' },
    source: { required: true, message: '请选择线索来源', trigger: 'blur' },
    description: { required: true, message: '请输入线索描述', trigger: 'blur' }
}
// 当前是否是编辑
const isEdit = ref(false)


// 如果是编辑，加载线索信息
const loadClue = async (id) => {
    await doLoadClue(id).then((res) => {
        if (res.code === 200) {
            clueData.value = res.data.tclue;
            dic.value = res.data.dicVO;
        }
    })
}


const loadDic = async () => {
    await doLoadClueDic().then((res) => {
        if (res.code === 200) {
            dic.value = res.data;
        }
    })
}

// 提交表单
const submit = async () => {
    // 校验数据
    await editOrAddRef.value.validate((isValidate) => {
        if (isValidate) {
            // 处理时间
            clueData.value.nextContactTime = formatDateTime(clueData.value.nextContactTime)
            // 如果有id，那么就是编辑
            if (clueData.value.id) {
                doEditClue(clueData.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('编辑成功', 'success')
                        goBack()
                    }
                })
            } else {
                doAddClue(clueData.value).then((res) => {
                    if (res.code === 200) {
                        messageTip('录入成功', 'success')
                        goBack()
                    }
                })
            }
        }
    })
}

const router = useRouter();
// 返回
const goBack = () => {
    router.back();
}
</script>

<style scoped>
.elCard {
    margin-left: 35px;
    float: left;
    width: 280px;
}

.goBackButton {
    margin-left: 38px;
}

.submitButton {
    float: right;
    margin-right: 40px;
}
</style>