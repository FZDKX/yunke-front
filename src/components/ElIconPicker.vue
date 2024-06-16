<script setup>
import { defineEmits, defineProps, getCurrentInstance } from 'vue';

// 获取当前组件实例，并从中解构出全局属性 globalProperties
const { appContext: { app: { config: { globalProperties } } } } = getCurrentInstance();

// 定义 Props 接口
const props = defineProps({
    modelValue: String // 声明 modelValue 属性类型为字符串
});

// 定义 emits 方法，声明组件可以发出的事件
const emits = defineEmits(['update:modelValue']);
</script>

<template>
    <el-popover trigger="focus" :width="256" :title="请选择图标" :hide-after="0">
        <template #reference>
            <el-button :icon="modelValue" v-if="modelValue">{{ modelValue }}</el-button>
            <el-button v-else type="primary"> 点我选择图标 </el-button>
        </template>
        <div class="el-icon-picker">
            <component v-for="icon in globalProperties.$icons" :key="icon"
                :class="[icon, 'icon', { 'icon-active': icon == modelValue }]" :is="icon"
                @click="emits('update:modelValue', icon)">
            </component>
        </div>
    </el-popover>
</template>

<style scoped>
.el-icon-picker {
    height: 256px;
    overflow-y: scroll;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    color: var(--el-text-color-regular);
    font-size: 20px;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    line-height: 45px;
    margin: 5px;
}

.icon:hover {
    color: var(--el-color-primary);
}

.icon-active {
    color: var(--el-color-primary);
}
</style>
