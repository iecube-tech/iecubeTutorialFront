<template>
  <div class="plan-container">
    <resizePanel ref="resizePanelRef" class="content-wrapper">
      <template #left-content>
        <div class="wh-full relative flex flex-col bg-neutral-800">
          <div class="h-0 flex-1 overflow-y-auto">
            
          </div>
          <div class="px-3 my-2">
            <div
              class="relative bg-neutral-800 border border-neutral-700 rounded-2xl ring-[4px] focus-within:ring-neutral-500/30 focus-within:border-neutral-600 ring-transparent z-10 w-full group"
            >
              <div class="px-4 pt-3 mb-2">
                <span
                  class="tag inline-block max-w-150px overflow-hidden text-ellipsis whitespace-nowrap"
                  v-show="hoveredElementTagName !== ''"
                >
                  <span>{{ hoveredElementTagName }}</span>
                  <span v-show="hoveredElementText !== ''">.{{ hoveredElementText }}</span>
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
                  <div class="ask-btn">
                    <Icon :class="{ isActive: isEdit }" @click="startEdit">
                      <Crosshairs />
                    </Icon>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2">
                  <div class="ask-btn">
                    <Icon :class="{ 'icon-disable': askText == '' }" @click="handAsk">
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
        <div class="btn-tools h-24px flex justify-between items-center">
          <div class="h-full flex items-center">
            <el-select v-model="currentVersion" class="!w-100px mr-2" size="small">
              <el-option label="最新 V3" value="3"></el-option>
              <el-option label="历史 V2" value="2"></el-option>
              <el-option label="历史 V1" value="1"></el-option>
            </el-select>
            <span class="hover:text-zeng">版本</span>
          </div>

          <div class="h-full flex items-center">
            <el-radio-group v-model="isPreview" class="h-full" size="small">
              <el-radio-button title="代码" :value="false" class="h-full py-0">
                <Icon :size="iconSize">
                  <ClipboardCode20Filled />
                </Icon>
              </el-radio-button>
              <el-radio-button title="预览" :value="true" class="h-full py-0">
                <Icon :size="iconSize">
                  <Eye />
                </Icon>
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="h-full flex items-center gap-4">
            <Icon title="保存" :size="iconSize" class="btn-icon" @click="handleSave">
              <Save />
            </Icon>
            <Icon title="下载" :size="iconSize" class="btn-icon" @click="handleDownload">
              <Download />
            </Icon>
          </div>
        </div>
        <div class="w-full relative h-[calc(100%-28px)] mt-4px">
          <el-skeleton
            v-if="loading"
            class="wh-full absolute top-0 left-0 z-500"
            style="background-color: var(--bg-color)"
            :loading="loading"
            animated
            :throttle="{ leading: 500, initVal: true }"
          >
            <template #template>
              <div class="loading-text">{{ loadingText }}</div>
              <el-skeleton-item variant="h1" style="width: 100%" class="mt-4 mb-4" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </template>
          </el-skeleton>
          <iframe
            v-show="isPreview"
            ref="iframeRef"
            class="wh-full absolute top-0 left-0"
            :src="relativeFilePath + `?t=${t}`"
            loading="lazy"
            @load="stopLoading"
          ></iframe>
          <div ref="highlightTagRef" v-show="isPreview" class="hightlight-tag"></div>
          <div ref="highlightBoxRef" v-show="isPreview" class="highlight-box"></div>
          <div ref="editorRef" v-show="!isPreview" class="wh-full absolute top-0 left-0"></div>
        </div>
      </template>
    </resizePanel>
  </div>
</template>

<script setup>
  import { Download, Save, SendAltFilled, Version } from '@vicons/carbon'
  import { Crosshairs, Eye } from '@vicons/fa'
  import { ClipboardCode20Filled } from '@vicons/fluent'
  import resizePanel from './resizePanel.vue'

  import { Base64 } from 'js-base64'
  import { updatePlan } from '@/api/plan'

  import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'

  const iconSize = ref(20)
  const isPreview = ref(true)
  const resizePanelRef = ref(null)

  const currentVersion = ref(1)

  // const handlePreview = v => {
  //   isPreview.value = v
  //   // resizePanelRef.value.setRightPanelOnly(v)
  // }

  const loading = ref(true)
  const loadingText = ref('正在为您拼命加载页面中.....')
  const t = ref('')

  const updateTime = () => {
    t.value = new Date().getTime()
  }

  updateTime()

  const route = useRoute()
  const relativeFilePath = ref('')
  const htmlText = ref('')
  const fileName = ref('')
  const id = ref(null)
  relativeFilePath.value = route.query.filePath
  fileName.value = route.query.fileName
  id.value = route.query.id

  // 刷新页面
  const handleRefresh = () => {
    startLoading()
    updateTime()
  }

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

  // 初始化编辑器
  const editorRef = ref(null)
  let editorInstance = null
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

  onMounted(() => {
     init()
  })

  //编辑相关代码
  import { throttle } from 'lodash'

  const highlightBoxRef = ref(null)
  const highlightTagRef = ref(null)
  const iframeRef = ref(null)
  const hoveredElement = ref(null)
  const hoveredElementClone = ref(null)
  const isEdit = ref(false)
  const askText = ref('')

  const hoveredElementTagName = computed(() => {
    return hoveredElementClone.value ? hoveredElementClone.value.tagName.toLowerCase() : ''
  })

  const hoveredElementStr = computed(() => {
    return hoveredElementClone.value ? hoveredElementClone.value.outerHTML : ''
  })

  const hoveredElementText = computed(() => {
    return hoveredElementClone.value ? hoveredElementClone.value.innerText : ''
  })

  //  鼠标移入元素时，高亮显示元素
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

  // 鼠标移入元素时，高亮显示元素
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

  // 鼠标移入元素时，高亮显示元素
  const updateHoverElement = e => {
    hoveredElement.value = e.target
    updateHighlight()
  }

  // 节流函数处理鼠标移动
  const throttledUpdate = throttle(updateHoverElement, 50)

  // 开始编辑
  function startEdit() {
    if (isEdit.value) {
      return
    }
    isEdit.value = true
    hoveredElement.value = null
    const iframeDoc = iframeRef.value.contentDocument
    iframeDoc.addEventListener('mousemove', throttledUpdate)
    iframeDoc.addEventListener('scroll', updateHighlight)
    iframeDoc.addEventListener('resize', updateHighlight)
    iframeDoc.addEventListener('click', stopEdit)
  }

  // 停止编辑
  function stopEdit() {
    isEdit.value = false
    hoveredElementClone.value = hoveredElement.value.cloneNode(true)
    const iframeDoc = iframeRef.value.contentDocument
    let tag = highlightTagRef.value
    let highlightBox = highlightBoxRef.value
    tag.style.display = 'none'
    highlightBox.style.display = 'none'
    iframeDoc.removeEventListener('mousemove', throttledUpdate)
    iframeDoc.removeEventListener('scroll', updateHighlight)
    iframeDoc.removeEventListener('resize', updateHighlight)
    iframeDoc.addEventListener('click', stopEdit)
  }

  const handAsk = () => {
    console.log('send message success: ', askText.value)
  }
  
  
  
  
</script>

<style lang="scss" scoped>
  .plan-container {
    @apply h-full w-full;
  }

  .loading-text {
    font-size: 16px;
    @apply whitespace-nowrap font-bold color-blue-500;
  }

  .content-wrapper {
    @apply h-full;
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
    @apply h24px w24px text-gray-800 flex justify-center items-center bg-buttonface  rounded-full cursor-pointer hover:text-zeng;
  }

  .icon-disable {
    @apply text-gray-400 cursor-not-allowed opacity-50 pointer-events-none;
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

  .btn-tools {
    :deep(.el-radio-button__inner) {
      @apply py-0 px-6;
    }
  }
</style>
