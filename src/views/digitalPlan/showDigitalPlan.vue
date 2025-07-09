<template>
  <div class="plan-container">
    <div class="btn-tools">
      <div></div>

      <div class="h-full flex items-center gap-2">
        <Icon
          title="代码"
          :size="iconSize"
          class="btn-icon"
          :class="{ isActive: !isPreview }"
          @click="handlePreview(false)"
        >
          <ClipboardCode20Filled />
        </Icon>
        <Icon
          title="预览"
          :size="iconSize"
          class="btn-icon"
          :class="{ isActive: isPreview }"
          @click="handlePreview(true)"
        >
          <Eye />
        </Icon>
        <Icon title="保存" :size="iconSize" class="btn-icon" @click="handleSave">
          <Save />
        </Icon>
        <Icon title="下载" :size="iconSize" class="btn-icon" @click="handleDownload">
          <Download />
        </Icon>
      </div>
    </div>

    <resizePanel ref="resizePanelRef" class="content-wrapper">
      <template #left-content>
        <div class="wh-full relative flex flex-col bg-neutral-800">
          <div ref="editorRef" class="h-0 flex-1"></div>
          <div class="px-3 my-2">
            <div
              class="relative bg-neutral-800 border border-neutral-700 rounded-2xl ring-[4px] focus-within:ring-neutral-500/30 focus-within:border-neutral-600 ring-transparent z-10 w-full group"
            >
              <div class="px-4 pt-3">
                <div
                  class="border border-neutral-700 rounded-xl p-1.5 pr-3 max-w-max hover:brightness-110 transition-all duration-200 ease-in-out !cursor-pointer !cursor-pointer"
                ></div>
              </div>
              <div class="w-full relative flex items-center justify-between">
                <el-input
                  type="text"
                  class="ask-text-input"
                  v-model="askText"
                  placeholder="请输入要替换的内容"
                />
              </div>
              <div class="flex items-center justify-between gap-2 px-4 pb-3">
                <div class="flex-1 flex items-center justify-start gap-2">
                  <div class="ask-btn">
                    <Icon>
                      <Crosshairs />
                    </Icon>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2">
                  <div class="ask-btn">
                    <Icon>
                      <SendAltFilled />
                    </Icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #right-content>
        <div class="wh-full relative">
          <el-skeleton
            v-if="loading"
            class="wh-full absolute top-0 left-0 z-500"
            style="background-color: var(--bg-color)"
            :loading="loading"
            animated
            :throttle="{ leading: 500, initVal: true }"
          >
            <template #template>
              {{ loading }}
              <div class="loading-text">{{ loadingText }}</div>
              <el-skeleton-item variant="h1" style="width: 100%" class="mt-4 mb-4" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </template>
          </el-skeleton>
          <iframe
            ref="iframeRef"
            class="wh-full absolute top-0 left-0"
            :src="relativeFilePath + `?t=${t}`"
            loading="lazy"
            @load="stopLoading"
          ></iframe>
        </div>
      </template>
    </resizePanel>
  </div>
</template>

<script setup>
  import { Download, Save, SendAltFilled } from '@vicons/carbon'
  import { Crosshairs, Eye } from '@vicons/fa'
  import { ClipboardCode20Filled } from '@vicons/fluent'
  import resizePanel from './resizePanel.vue'

  import { Base64 } from 'js-base64'
  import { updatePlan } from '@/api/plan'

  import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'

  // 左侧编辑器
  const askText = ref('')

  const iconSize = ref(20)
  const isPreview = ref(false)
  const resizePanelRef = ref(null)

  const handlePreview = v => {
    isPreview.value = v
    resizePanelRef.value.setRightPanelOnly(v)
  }

  const iframeRef = ref(null)

  const loading = ref(true)
  const loadingText = ref('正在为您拼命加载页面中.....')
  const t = ref('')

  const updateTime = () => {
    t.value = new Date().getTime()
  }

  updateTime()

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = async () => {
    loading.value = false
    // await nextTick()
    // setTimeout(async () => {
    //   await short()
    // }, 3000)
  }

  const route = useRoute()
  const relativeFilePath = ref('')
  const textValue = ref('')
  const fileName = ref('')
  const id = ref(null)
  relativeFilePath.value = route.query.filePath
  fileName.value = route.query.fileName
  id.value = route.query.id

  const editorVisible = ref(true)
  const editorRef = ref(null)
  let editorInstance = null

  // 打开关闭编辑器
  const openEditor = () => {
    editorVisible.value = true
  }

  const closeEditor = () => {
    editorVisible.value = false
  }

  // 下载文件
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = relativeFilePath.value
    link.download = fileName.value
    link.click()
  }

  // 保存文件
  const handleSave = () => {
    /*  
   closeEditor()

    const content = editorView.state.doc.toString()
    const base64Content = Base64.encode(content)
    updatePlan({
      id: id.value,
      htmlContentBase64: base64Content
    }).then(res => {
      ElMessage.success('保存成功')
      handleRefresh()
    }) 
      */
  }

  // 刷新页面
  const handleRefresh = () => {
    startLoading()
    updateTime()
  }

  // 初始化编辑器
  const createEditor = text => {
    editorInstance = monaco.editor.create(editorRef.value, {
      value: text,
      language: 'html',
      theme: 'vs-dark',
      wordWrap: 'on',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 12,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false
    })
  }

  // 获取讲义文件内容
  const getHtmlFileContent = async () => {
    console.log(relativeFilePath.value)
    const response = await fetch(relativeFilePath.value)
    const htmlContent = await response.text()
    textValue.value = htmlContent
    createEditor(htmlContent)
  }

  // 初始化
  const init = () => {
    startLoading()
    getHtmlFileContent()
  }

  init()
</script>

<style lang="scss" scoped>
  $btn-tool-height: 24px;

  .plan-container {
    height: 100%;
    width: 100%;
  }

  .btn-tools {
    height: $btn-tool-height;
    @apply flex justify-between;
    padding-right: 8px;
  }

  .loading-text {
    font-size: 16px;
    @apply whitespace-nowrap font-bold color-blue-500;
  }

  .content-wrapper {
    height: calc(100% - $btn-tool-height);
  }

  .btn-icon:hover {
    cursor: pointer;
    color: var(--zeng);
  }

  .isActive {
    color: var(--zeng);
  }

  .ask-text-input {
    :deep(.el-input__wrapper) {
      @apply bg-transparent border-none rounded-none shadow-none;
    }
    :deep(.el-input__inner) {
      @apply w-full bg-transparent outline-none text-neutral-200 placeholder:text-neutral-500 p-4 !pt-2.5;
    }
  }

  .ask-btn {
    background-color: rgb(240, 240, 240);
    @apply h24px w24px flex justify-center items-center bg-buttonface  rounded-full cursor-pointer hover:text-zeng;
  }
</style>
