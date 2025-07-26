<template>
  <el-dialog title="查看大纲" v-model.sync="visible" width="70%" top="50px" :before-close="handleClose" @close="handleClose">
    <div class="md-wrapper">
      <div v-show="canEidt" class="flex flex-row-reverse mb-2">
        <Icon :size="iconSize" class="ml-2" @click="handleSaveOutline">
          <Save/>
        </Icon>
        <Icon :size="iconSize" v-if="previewOnly" @click="handleTogglePreviewOnly(false)">
          <Edit/>
        </Icon>
        <Icon :size="iconSize" v-else @click="handleTogglePreviewOnly(true)">
          <View/>
        </Icon>
      </div>
      <MdEditor
        ref="mdEditorRef"
        id="md-editor"
        class="flex-1 overflow-y-auto"
        v-model="markdownContent"
        :toolbars="toolbars"
        :theme="settingsStore.theme"
        previewTheme="github"
      ></MdEditor>
    </div>
    <template #footer>
      <div class="flex flex-row-reverse">
        <el-button @click="handleClose" class="ml-2">取消</el-button>
        <el-button v-show="canEidt" type="primary" @click="handleGen">生成页面</el-button>
      </div>
    </template>
    
  </el-dialog>
</template>

<script setup>
  import {Edit, Save, View} from '@vicons/carbon'
  const iconSize = ref(20)
  
  import { useSettingsStore } from '@/store'
  const settingsStore = useSettingsStore()

  // const toolbars = ['=', 'previewOnly', 'save']
  const mdEditorRef = ref(null)
  const toolbars = []
  
  const previewOnly = ref(true)

  const visible = ref(false)
  const markdownContent = ref('')

  const open = async content => {
    markdownContent.value = content
    visible.value = true
    await nextTick()
    handleTogglePreviewOnly(true)
  }
  
  // 控制是否可以编辑
  const canEidt = ref(false)
  
  const setCanEdit = (b) =>{
    canEidt.value = b
  }
  
  const handleTogglePreviewOnly = val => {
    previewOnly.value = val
    mdEditorRef.value.togglePreviewOnly(previewOnly.value)
  }
  
  const handleClose = () => {
    visible.value = false
    canEidt.value = false
    emits('close')
  }
  
  const close = () => {
    visible.value = false
    canEidt.value = false
  }
  
  const handleGen = () => {
    emits('generate')
  }
  
  // 保存大纲
  const handleSaveOutline = () => {
    emits('save', markdownContent.value)
  }
  
  // 更新大纲内容
  const updateContent = (text) => {
    markdownContent.value = text
  }
  
  const emits = defineEmits(['close', 'save', 'generate'])

  // 暴露方法供外部使用
  defineExpose({
    open,
    close,
    setCanEdit,
    updateContent
  })
</script>

<style scoped>
  /* 添加一些样式以适应你的设计 */
  .md-wrapper {
    max-height: calc(100vh - 240px);
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
