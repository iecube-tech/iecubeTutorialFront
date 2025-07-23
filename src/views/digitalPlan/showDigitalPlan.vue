<template>
  <div class="plan-container">
    <resizePanel ref="resizePanelRef" class="content-wrapper">
      <template #left-content>
        <div class="wh-full relative flex flex-col bg-neutral-800">
          <div ref="chatContainerRef" class="chart-container my-scroller">
            <div
              v-for="(chatItem, k) in chatHistoryList"
              :key="k"
              :class="`chat-${chatItem.role}-container`"
            >
              <div v-if="chatItem.role === 'user'" class="chat-user">
                {{ chatItem.content }}
              </div>
              <div v-if="chatItem.role === 'assistant'" class="chat-assistant">
                {{ chatItem.content }}
                <MdPreview :modelValue="chatItem.content"></MdPreview>
              </div>
            </div>
            <div v-if="thinking" class="chart-assistant-container">
              <div class="chat-assistant">
                <MdPreview :modelValue="thinkingText"></MdPreview>
              </div>
            </div>
          </div>
          <div class="px-3 my-2">
            <div
              class="relative bg-neutral-800 border border-neutral-700 rounded-2xl ring-[4px] focus-within:ring-neutral-500/30 focus-within:border-neutral-600 ring-transparent z-10 w-full group"
            >
              <div class="px-4 pt-3 mb-2">
                <div
                  v-show="isShowFocusElement"
                  class="h-24px w-fit bg-blue-500 text-white text-sm rounded-md px-2 pt-2px"
                >
                  <div class="h-full inline-flex max-w-120px">
                    <div class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span>{{ showTagElText }}</span>
                    </div>
                  </div>
                  <el-icon size="14" class="inline-block cursor-pointer" @click="handleDelFocusEl"><CircleClose /></el-icon>
                </div>
              </div>
              <div class="w-full relative flex items-center justify-between">
                <el-input
                  type="text"
                  class="ask-text-input"
                  v-model="askText"
                  placeholder="请输入你的需求"
                  @keydown.enter="handleAsk"
                />
              </div>
              <div class="flex items-center justify-between gap-2 px-4 pb-3">
                <div class="flex-1 flex items-center justify-start gap-2">
                  <div class="edit-btn" :class="{ isActive: isEdit }" title="选择右侧页面中的元素">
                    <Icon @click="startEdit">
                      <Crosshairs />
                    </Icon>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2">
                  <div class="ask-btn" :class="{ 'btn-disable': askText == '' }">
                    <Icon
                      class="ask-icon"
                      :class="{ 'icon-disable': askText == '' }"
                      @click="handleAsk"
                    >
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
            <el-select
              v-show="!isFromCase"
              v-model="currentVersion"
              class="!w-100px mr-2"
              size="small"
              @change="handleCurrentVersionChange"
            >
              <el-option
                v-for="(versionItem, k) in versionList"
                :key="k"
                :label="k == 0 ? `最新 V${versionItem.version}` : `历史 V${versionItem.version}`"
                :value="versionItem.version"
              ></el-option>
            </el-select>
            <span v-show="!isFromCase" class="hover:text-zeng">版本</span>

            <Icon
              v-show="isFromCase"
              title="根据案例创建教案"
              :size="iconSize"
              class="btn-icon"
              style="color: var(--zeng)"
              @click="handleCreateProject"
            >
              <CreateNewFolderSharp />
            </Icon>
          </div>

          <div class="h-full flex items-center">
            <el-radio-group v-show="!isFromCase" v-model="isPreview" class="h-full" size="small">
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
            <Icon
              v-show="!isFromCase"
              title="保存"
              :size="iconSize"
              class="btn-icon"
              @click="handleSave"
            >
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
            class="wh-full absolute top-0 left-0 z-400"
            src="about:blank"
            :srcdoc="htmlText"
            loading="lazy"
            @load="stopLoading"
          ></iframe>
          <div ref="highlightTagRef" v-show="isPreview" class="hightlight-tag"></div>
          <div ref="highlightBoxRef" v-show="isPreview" class="highlight-box"></div>
          <div
            ref="editorRef"
            v-show="!isPreview"
            class="wh-full absolute top-0 left-0 z-900"
          ></div>
        </div>
      </template>
    </resizePanel>
  </div>
</template>

<script setup>
  import { Download, Json, Save, SendAltFilled, Version } from '@vicons/carbon'
  import { Crosshairs, Eye } from '@vicons/fa'
  import { ClipboardCode20Filled } from '@vicons/fluent'
  import { CreateNewFolderSharp } from '@vicons/material'
  import { Base64 } from 'js-base64'
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'
  import { throttle, debounce } from 'lodash'
  import router from '@/router'
  import resizePanel from './resizePanel.vue'
  import { updatePlan, createProjectByCaseId, getProjectDetail } from '@/api/plan'

  const iconSize = ref(20)
  const isPreview = ref(true)
  const resizePanelRef = ref(null)

  const loading = ref(true)
  const loadingText = ref('正在为您拼命加载页面中.....')

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = async () => {
    // console.log('stop  loading ....')
    await nextTick()
    setTimeout(_ => {
      loading.value = false
    }, 800)
  }

  // TODO: 切换版本
  const handleCurrentVersionChange = v => {
    startLoading()
    let versionItem = versionList.value.find(_ => _.version == v)
    let newFileName = `/resource/${versionItem.resource.filename}`
    updateURL(id.value, newFileName)
    initFetchHtml()
  }

  // 新建项目
  const handleCreateProject = () => {
    createProjectByCaseId(caseId.value).then(res => {
      if (res.state == 200) {
        let data = res.data
        let newId = data.project.id
        let newFileName = data.projectChildren[0].resource.filename || ''
        updateURL(newId, newFileName)
        initWebSocket()
        updateLayout()
        initVersionList()
      }
    })
  }

  // 下载文件
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = relativeFilePath.value
    link.download = fileName.value
    link.click()
  }

  // TODO: 保存文件
  const handleSave = () => {
    const content = editorInstance.getValue()
    const base64Content = Base64.encode(content)
    updatePlan({
      id: id.value,
      htmlContentBase64: base64Content
    }).then(res => {
      ElMessage.success('保存成功')
    })
  }

  // *********************************************************************************

  // 核心参数
  const route = useRoute()
  const relativeFilePath = ref('')
  const htmlText = ref('')
  const fileName = ref('')
  const id = ref('')
  const caseId = ref('')

  // 是否从案例跳转过来
  const isFromCase = computed(() => {
    return id.value == ''
  })

  // 初始化编辑器
  const editorRef = ref(null)
  let editorInstance = null
  const initMonacoEditor = text => {
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

    editorInstance.onDidChangeModelContent(debounceUpdateHtmlText)
  }

  const debounceUpdateHtmlText = debounce(event => {
    console.log('代码改变 >>>>>>>>>>>>>>>>>>>')
    // startLoading()
    htmlText.value = editorInstance.getValue()
  }, 800)

  //编辑相关代码

  const highlightBoxRef = ref(null)
  const highlightTagRef = ref(null)
  const iframeRef = ref(null)
  const hoveredElement = ref(null)
  const hoveredElementClone = ref(null)
  const isEdit = ref(false)
  const askText = ref('')

  const showTagElText = ref('')
  const tagElouterHTML = ref('')

  const isShowFocusElement = computed(() => {
    let focusEl = hoveredElementClone.value
    if (!focusEl) {
      showTagElText.value = ''
      tagElouterHTML.value = ''
      return false
    } else {
      let tagElName = focusEl.tagName.toLowerCase()
      let tagElInnerText = focusEl.innerText
      let showTagText = tagElName
      if (tagElInnerText) {
        showTagText += '.' + tagElInnerText
      }
      showTagElText.value = showTagText
      tagElouterHTML.value = focusEl.outerHTML
      return true
    }
  })
  
  
  const handleDelFocusEl = () => {
    hoveredElement.value = null
    hoveredElementClone.value = null
  }

  // 鼠标移入元素时，高亮显示元素
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

  // 左侧 AI 对话框 功能
  const chatContainerRef = ref(null)

  // 历史会话列表
  let chatHistoryList = ref([])

  // 组合用户提问的请求体
  const consistSendMsg = () => {
    let list = []
    if (tagElouterHTML.value) {
      list = [
        {
          html: Base64.encode(tagElouterHTML.value)
        }
      ]
    }
    let msg = {
      type: 'user',
      projectId: id.value,
      message: askText.value,
      selectedElements: list,
      fullCode: Base64.encode(editorInstance.getValue()),
      fileName: fileName.value
    }
    return msg
  }

  // 消息加入历史列表中
  const addMessage = (msg, isUser) => {
    if (isUser) {
      chatHistoryList.value.push({
        role: 'user',
        content: msg
      })
    } else {
      if (msg) {
        chatHistoryList.value.push({
          role: 'assistant',
          content: msg
        })
      }
    }
  }

  // 用户提问
  const handleAsk = async () => {
    if (!askText.value) {
      return
    }

    setDefaultThink()

    if (!ws) {
      return
    }
    
    let sendMsg = consistSendMsg()
    ws.value.send(JSON.stringify(sendMsg))
    addMessage(askText.value, true)

    askText.value = ''
    hoveredElementClone.value = null

    await nextTick()
    scrollRoll()
  }

  // 滚动
  const scrollRoll = async () => {
    await nextTick()
    if (chatContainerRef.value.scrollHeight > chatContainerRef.value.clientHeight) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  }

  // 初始化websocket
  const ws = ref(null)

  // ai 思考时展示的内容
  const thinking = ref(false)
  const thinkingText = ref('')

  // 设置默认的思考状态
  const setDefaultThink = () => {
    thinking.value = false
    thinkingText.value = ''
  }

  // 定时器
  const intervalN = ref(null)

  // 初始化 websocket
  const initWebSocket = () => {
    if (isFromCase.value) return

    ws.value = new WebSocket(`/ai/html/edit/${id.value}`)

    ws.value.onopen = event => {
      // intervalN.value = setInterval(_ => {
      //   sendHeart()
      // }, 30000)
    }

    ws.value.onmessage = async event => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'current':
          initHistroyChatList(data.current)
          await nextTick()
          scrollRoll()
          break
        case 'stream_start':
          thinking.value = true
          break
        case 'stream':
          thinkingText.value += data.content
          await nextTick()
          scrollRoll()
          break
        case 'stream_end':
          thinking.value = false
          break
        case 'complete':
          thinkingText.value = ''
          addMessage(data.content)
          await nextTick()
          scrollRoll()
          break
        case 'ai':
          let contentObj = JSON.parse(Base64.decode(data.content))
          let newHmtlText = Base64.decode(contentObj.fullCode)
          updateEditValueAndView(newHmtlText)
          initVersionList()
          break
        default:
          break
      }
    }
  }

  // 初始化历史对话列表
  const initHistroyChatList = list => {
    list.forEach(chatItem => {
      let contentObj = JSON.parse(Base64.decode(chatItem.content))
      if (contentObj.type === 'user') {
        addMessage(contentObj.message, true)
      } else {
        addMessage(contentObj.message)
      }
    })
  }

  // 更新 iframe 和 monaco editor 内容
  const updateEditValueAndView = newHmtlText => {
    htmlText.value = newHmtlText
    editorInstance.setValue(newHmtlText)
  }

  const sendHeart = () => {
    if (!ws.value) {
      return
    }
    let heart = {
      type: 'ping'
    }
    if (ws.value.readyState == 1) {
      ws.value.send(JSON.stringify(heart))
    }
  }

  // 初始化
  const init = async () => {
    startLoading()
    initCoreParamByRoute()
    updateLayout()
    initVersionList()
    initWebSocket()
    await nextTick()
    setTimeout(_ => {
      initFetchHtml(true)
    }, 500)
  }

  // 获取讲义文件内容 true: 初始化edit  , 默认false: 更新editor内容
  const initFetchHtml = async (isCreateEdit = false) => {
    const response = await fetch(relativeFilePath.value)
    htmlText.value = await response.text()
    if (isCreateEdit) {
      initMonacoEditor(htmlText.value)
    } else {
      editorInstance.setValue(htmlText.value)
      setTimeout(_ => {
        stopLoading()
      }, 1000)
    }
  }

  // 初始化版本列表
  const currentVersion = ref(1)
  const versionList = ref([])

  const initVersionList = () => {
    if (!id.value) {
      return
    }
    getProjectDetail(id.value).then(res => {
      if (res.state == 200) {
        let list = res.data.projectChildren || []
        versionList.value = list.reverse()
        if (list.length > 0) {
          currentVersion.value = list[0].version
        }
      }
    })
  }

  // 更新 url， 参数改变修改核心参数
  const updateURL = (id, fileName) => {
    let replaceQuery = Object.assign(route.query, {
      id: id,
      fileName: fileName
    })
    router.replace({
      path: route.path,
      query: replaceQuery
    })

    const newUrl = router.resolve({
      path: route.path,
      query: replaceQuery
    }).href

    window.history.replaceState({}, '', newUrl)
    initCoreParamByRoute()
  }

  // 跟新布局 是否显示 ai 对话框, 初始化和创新项目时调用
  const updateLayout = () => {
    resizePanelRef.value.setRightPanelOnly(isFromCase.value)
  }

  // 根据路由初始化核心参数， 更新url 和 初始化时调用
  const initCoreParamByRoute = () => {
    relativeFilePath.value = route.query.filePath
    fileName.value = route.query.fileName
    id.value = route.query.id
    caseId.value = route.query.caseId
  }

  // 在组件挂载时调用init函数
  onMounted(() => {
    init()
  })
</script>

<style lang="scss" scoped>
  .my-scroller {
    scroll-behavior: smooth;
  }

  .my-scroller::-webkit-scrollbar {
    width: 6px; /* 滚动条宽度 */
    height: 6px;
  }

  .my-scroller::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.2); /* 轨道背景 */
  }

  .my-scroller::-webkit-scrollbar-thumb {
    background-color: #8b8b8b; /* 滑块颜色 */
    border-radius: 4px; /* 滑块圆角 */
  }

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

  .ask-text-input {
    :deep(.el-input__wrapper) {
      @apply bg-transparent border-none rounded-none shadow-none;
    }
    :deep(.el-input__inner) {
      @apply w-full bg-transparent outline-none text-neutral-200 placeholder:text-neutral-500 p-4 !pt-2.5;
    }
  }

  .edit-btn {
    @apply h24px w24px flex justify-center items-center rounded-full cursor-pointer bg-white text-gray-500;
  }

  .isActive {
    background-color: var(--zeng);
    @apply text-white;
  }

  .ask-btn {
    background-color: var(--zeng);
    @apply h24px w24px flex justify-center items-center rounded-full cursor-pointer;
  }

  .btn-disable {
    @apply bg-gray-200 cursor-not-allowed;
  }

  .ask-icon {
    @apply text-white;
  }

  .icon-disable {
    @apply pointer-events-none text-gray-400 opacity-50;
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

  // 左侧对话框样式
  .chart-container {
    @apply h-0 flex-1 overflow-y-auto overflow-x-hidden p-1 mr-1;
  }

  .chat-user-container {
    @apply flex justify-end mb-4;
  }

  .chat-assistant-container {
    @apply flex justify-start mb-4;
  }

  .chat-bg {
    color: #3f4a54;
    background-color: #ffffff;
  }

  .chat-user {
    @extend .chat-bg;
    min-width: 0;
    max-width: 90%;
    @apply text-sm inline-block rounded-lg py-9px px-16px break-all;
  }

  .chat-assistant {
    @extend .my-scroller;
    @extend .chat-bg;
    min-width: 0;
    max-width: 90%;
    @apply text-sm inline-block rounded-lg px-16px pt-9px;
    overflow-x: auto;
  }
</style>
