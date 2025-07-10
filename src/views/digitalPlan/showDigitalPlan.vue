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
              <div class="px-4 pt-3 mb-2">
                <span class="tag inline-block max-w-150px overflow-hidden text-ellipsis whitespace-nowrap" v-show="hoveredElementTagName !== ''">
                  {{ hoveredElementTagName }} . {{ hoveredElementText }}
                </span>
              </div>
              <div class="w-full relative flex items-center justify-between">
                <el-input
                  type="text"
                  class="ask-text-input"
                  v-model="askText"
                  placeholder="请输入你的需求"
                />
              </div>
              <div class="flex items-center justify-between gap-2 px-4 pb-3">
                <div class="flex-1 flex items-center justify-start gap-2">
                  <div class="ask-btn" @click="startEdit">
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
          <div ref="highlightTagRef" class="hightlight-tag"></div>
          <div ref="highlightBoxRef" class="highlight-box"></div>
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
  const htmlText = ref('')
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
    const response = await fetch(relativeFilePath.value)
    htmlText.value = await response.text()
    createEditor(htmlText.value)
  }

  // 初始化
  const init = () => {
    startLoading()
    getHtmlFileContent()
  }

  init()

  //编辑相关
  import { throttle } from 'lodash'

  const highlightBoxRef = ref(null)
  const highlightTagRef = ref(null)
  const iframeRef = ref(null)
  const hoveredElement = ref(null)

  const hoveredElementTagName = computed(() => {
    return hoveredElement.value ? hoveredElement.value.tagName.toLowerCase() : ''
  })

  const hoveredElementStr = computed(() => {
    return hoveredElement.value ? hoveredElement.value.outerHTML : ''
  })
  
  const hoveredElementText = computed(() => {
    return hoveredElement.value ? hoveredElement.value.innerText : ''
  })



  function updateHighlight() {
    if (!hoveredElement.value) return
    let highlightBox = highlightBoxRef.value

    const rect = hoveredElement.value.getBoundingClientRect()

    // 更新高亮框
    let left = rect.left - 2
    let top = rect.top - 2
    highlightBox.style.display = 'block'
    highlightBox.style.left = left + 'px'
    highlightBox.style.top = top + 'px'
    highlightBox.style.width = rect.width + 4 + 'px'
    highlightBox.style.height = rect.height + 4 + 'px'
    let height = rect.height + 4

    // 更新标签
    updateElementTag(hoveredElement.value, left, top, height)
  }

  function updateElementTag(element, left, top, height) {
    let tag = highlightTagRef.value

    let name = `${element.tagName.toLowerCase()}`
    // 设置标签内容
    tag.textContent = name

    // 设置标签位置
    let newTop = 0
    if (top - 20 <= 0) {
      newTop = top + height
    } else {
      newTop = top - 20
    }

    tag.style.display = 'block'
    tag.style.top = newTop + 'px'
    tag.style.left = left + 'px'
  }

  // 节流处理鼠标移动
  const updateHoverElement = e => {
    hoveredElement.value = e.target
    updateHighlight()
  }

  const throttledUpdate = throttle(updateHoverElement, 50)

  function startEdit() {
    hoveredElement.value = null
    const iframeDoc = iframeRef.value.contentDocument
    iframeDoc.addEventListener('mousemove', throttledUpdate)
    iframeDoc.addEventListener('scroll', updateHighlight)
    iframeDoc.addEventListener('resize', updateHighlight)
    iframeDoc.addEventListener('click', stopEdit)
  }

  function stopEdit() {
    // console.log(hoveredElement.value)
    const iframeDoc = iframeRef.value.contentDocument
    let tag = highlightTagRef.value
    let highlightBox = highlightBoxRef.value
    tag.style.display = 'none'
    highlightBox.style.display = 'none'
    // 移除事件监听器
    iframeDoc.removeEventListener('mousemove', throttledUpdate)
    iframeDoc.removeEventListener('scroll', updateHighlight)
    iframeDoc.removeEventListener('resize', updateHighlight)
    iframeDoc.addEventListener('click', stopEdit)
  }

  document.addEventListener('mousemove', e => {
    if (!hoveredElement.value) {
      const iframeDoc = iframeRef.value.contentDocument
      let tag = highlightTagRef.value
      let highlightBox = highlightBoxRef.value
      tag.style.display = 'none'
      highlightBox.style.display = 'none'
    }
  })
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

  .highlight-box {
    display: none;
    position: absolute;
    height: 20px;
    width: 20px;
    z-index: 9999;
    pointer-events: none;
    // background-color: rgba(0, 0, 0, 0.1);
    @apply border-2 border-blue-500 border-dashed;
  }
  
  .tag {
    @apply bg-blue-500 text-white text-sm px-2 py0.5px rounded-md;
  }

  .hightlight-tag {
    display: none;
    position: absolute;
    z-index: 9999;
    pointer-events: none;
    @extend .tag;
  }
</style>
