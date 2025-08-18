<template>
  <div class="plan-container">
    <resizePanel ref="resizePanelRef" class="content-wrapper" :rightPanelOnly="rightPanelOnly">
      <template #left-content>
        <div class="chat-container-wrapper">
          <div ref="chatContainerRef" class="chart-container my-scroller">
            <div
              v-for="(chatItem, k) in chatHistoryList"
              :key="k"
              :class="`chat-${chatItem.role}-container`"
            >
              <div v-if="chatItem.role === 'user'" class="chat-user">
                <div class="flex justify-end items-center mb-1 text-xs">
                  <el-tag effect="dark" size="small" hit type="primary" class="mr-2">用户</el-tag>
                  <span>{{ chatItem.createTime }}</span>
                </div>
                <div>
                  {{ chatItem.content }}
                </div>
              </div>
              <div v-if="chatItem.role === 'assistant'" class="chat-assistant">
                <div class="flex justify-start items-center mb-1 text-xs">
                  <el-tag effect="dark" size="small" hit color="#3b82f6" class="mr-2">IECUBE 助手</el-tag>
                  <span>{{ chatItem.createTime }}</span>
                </div>
                <MdPreview :modelValue="chatItem.content" theme="dark"></MdPreview>
              </div>
            </div>
            <div v-if="thinking" class="chart-assistant-container">
              <div class="chat-assistant">
                <div class="flex justify-start items-center mb-1 text-xs">
                  <el-tag effect="dark" size="small" hit color="#3b82f6" class="mr-2">IECUBE 助手</el-tag>
                  <span class="mr-2">{{ thinkingCreateTime }}</span>
                  <span style="color:#3b82f6">● 正在输入...</span>
                </div>
                <MdPreview :modelValue="thinkingText" theme="dark"></MdPreview>
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
                  <el-icon size="14" class="inline-block cursor-pointer" @click="handleDelFocusEl">
                    <CircleClose />
                  </el-icon>
                </div>
              </div>
              <div class="w-full relative flex items-center justify-between">
                <el-input
                  type="textarea"
                  :rows="2"
                  class="ask-text-input"
                  v-model="askText"
                  placeholder="请先点击下方编辑按钮，在右侧页面点击选中需要修改的内容，之后在此处输入修改意见"
                  @keydown.ctrl.enter.prevent="handleAsk"
                />
              </div>
              <div class="flex items-center justify-between gap-2 px-4 pb-3">
                <div class="flex-1 flex items-center justify-start gap-1">
                  <div class="edit-btn" @click="startEdit" :class="{ isActive: isEdit }" title="点击下方编辑按钮后，请选中右侧页面中的元素">
                    <Icon size="20">
                      <CenterSquare />
                    </Icon>
                    <span>编辑</span>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2">
                  <div class="ask-btn" :class="{ 'btn-disable': askText == '' }" title="发送: ctrl + enter">
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
          <div class="h-full inline-flex items-center" v-show="!isFromCase">
            <el-select
              v-model="currentVersionId"
              style="width: 100px; margin-right: 8px;"
              size="small"
              @change="handleCurrentVersionChange"
            >
             <!--  <el-option
                :label="versionList[0].saved ?  `版本 V${versionList[0].version}` : `最新版本`"
                :value="versionList[0].id"
              ></el-option> -->
              <el-option v-if="versionList[0]" :label="versionList[0].saved ? `版本 V${versionList[0].userVersion}`: `最新版本` " :value="versionList[0].id"></el-option>
              <el-option
                 v-for="(versionItem, k) in versionOther"
                :key="k"
                :label="`历史 V${versionItem.userVersion}`"
                :value="versionItem.id"
              ></el-option>
            </el-select>
            <span class="hover:text-zeng">版本</span>
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
            <el-button
              v-show="isFromCase"
              title="根据案例创建教案"
              class="btn-icon"
              @click="handleCreateProject"
              link
            >
              <Icon :size="iconSize"><Add/></Icon>创建教案
            </el-button>
            <Icon 
              v-show="!isFromCase"
              title="编辑"
              :size="iconSize"
              class="btn-icon"
              @click="handleSliptePage(true)">
              <Edit />
            </Icon>
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
            
            <el-divider direction="vertical" />
            
            <el-button type="primary" icon="ArrowLeft" @click="goBack" link class="mr-4">返回</el-button>
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
            id="iframeRef"
            v-show="isPreview"
            class="wh-full absolute top-0 left-0 z-400"
            src="about:blank"
            loading="lazy"
            @load="stopLoading"
          ></iframe>
          <div ref="highlightTagRef" v-show="isPreview" class="hightlight-tag"></div>
          <div ref="highlightBoxRef" v-show="isPreview" class="highlight-box"></div>
          <div ref="editorRef" v-show="!isPreview" class="wh-full absolute top-0 left-0 z-900" ></div>
        </div>
      </template>
    </resizePanel>
  </div>
</template>

<script setup>
  import { Download, FolderAdd, Save, SendAltFilled, CenterSquare, Add, Edit, Screen } from '@vicons/carbon'
  import { Crosshairs, Eye} from '@vicons/fa'
  import { ClipboardCode20Filled } from '@vicons/fluent'
  import { Base64 } from 'js-base64'
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'
  import { throttle, debounce } from 'lodash'
  import router from '@/router'
  import resizePanel from './resizePanel.vue'
  import {
    editorProjectHtml,
    createProjectByCaseId,
    getProjectDetail,
    getFileResource
  } from '@/api/plan'
  import { getCaseDetail } from '@/api/caseApi'
  import ComponentsResolver from 'unplugin-icons/resolver'
  
  import moment from 'moment'
  
  const rightPanelOnly = ref(true)
  
  const handleSliptePage = (v) =>{
    rightPanelOnly.value = !v
    
    if(v){
      setTimeout(_=>{
        scrollRoll()
      }, 200)
    }
  }

  const iconSize = ref(20)
  const isPreview = ref(true)
  const resizePanelRef = ref(null)

  const loading = ref(true)
  const loadingText = ref('正在为您拼命加载页面中.....')
  
  const goBack = () =>{
    router.back()
  }

  // 加载 loading
  const startLoading = () => {
    loading.value = true
  }

  // 停止 loading
  const stopLoading = async () => {
    await nextTick()
    setTimeout(_ => {
      loading.value = false
    }, 800)
  }

  // 设置当前文件路径  (初始化项目、案例和切换版本时调用)
  // relativeFilePath.value = '/resource/' + fileName  废弃拼接 /resource/ 的方式获取文件路径
  const setCurrentFileName = fileName => {
    if (!fileName) {
      return
    }
    currentFileName.value = fileName
  }

  // 切换版本
  const handleCurrentVersionChange = async v => {
    startLoading()
    let versionItem = versionList.value.find(_ => _.id == v)
    try {
      setCurrentFileName(versionItem.resource.filename)
      await nextTick()
      initFetchHtml().then(htmlText => {
        updateEditValueAndView(htmlText)
      })
    } catch (e) {
      console.error(e)
    } finally {
      stopLoading()
    }
  }

  // 新建项目
  const handleCreateProject = () => {
    createProjectByCaseId(caseId.value).then(res => {
      if (res.state == 200) {
        let newId = res.data.project.id
        updateURL(newId)
        // init()
        let iframeDom = getIframeDom()
        let text = iframeDom.srcdoc || ''
        initMonacoEditor(text)
        initWebSocket()
        getProjectDetailById()
      }
    })
  }

  // 下载文件
  const handleDownload = () => {
    getFileResource(currentFileName.value).then(async res => {
      if(res.status == 200){
        let url = URL.createObjectURL(res.data)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName.value + '.html'
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    })
  }

  // 保存文件
  const handleSave = () => {
    const content = editorInstance.getValue()
    const base64Content = Base64.encode(content)
    editorProjectHtml({
      pChildId: currentVersionId.value,
      htmlBase64: base64Content
    }).then(res => {
      if (res.state == 200) {
        
        if(res.data == null){
          handleSliptePage(false)
          return
        }
        
        let list = res.data
        list = list.reverse()
        let n = list.length
        let latestVersion = list[0]
        
        currentVersionId.value = latestVersion.id
        setCurrentFileName(latestVersion.resource.filename)
        versionList.value = list
        
        handleSliptePage(false)
        
        ElMessage.success('保存成功')
      }
    })
  }

  // *********************************************************************************

  // 核心参数
  const route = useRoute()
  const currentFileName = ref('') // 获取当前文件
  const fileName = ref('') // 下载文件的文件名成
  const id = ref(route.query.id)
  const caseId = ref(route.query.caseId)

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
    if(isPreview.value){
      return 
    }
    let newHtml = editorInstance.getValue()
    setIframeHtml(newHtml)
  }, 800)

  //编辑相关代码
  const highlightBoxRef = ref(null)
  const highlightTagRef = ref(null)
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
    let iframeDom = getIframeDom()
    const iframeDoc = iframeDom.contentDocument
    iframeDoc.addEventListener('mousemove', throttledUpdate)
    iframeDoc.addEventListener('scroll', updateHighlight)
    iframeDoc.addEventListener('resize', updateHighlight)
    iframeDoc.addEventListener('click', stopEdit)
  }

  // 停止编辑
  function stopEdit() {
    isEdit.value = false
    hoveredElementClone.value = hoveredElement.value.cloneNode(true)
    let iframeDom = getIframeDom()
    const iframeDoc = iframeDom.contentDocument
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
      fileName: currentFileName.value
    }
    
    let msgObj = {
      type: 'message',
      message: msg
    }
    
    return msgObj
  }

  // 消息加入历史列表中
  const addMessage = (msgObj, isUser) => {
    let msg = msgObj.message
    let createTime = moment(msgObj.createTime).format('MM/DD HH:mm')
    if (isUser) {
      chatHistoryList.value.push({
        role: 'user',
        content: msg,
        createTime,
      })
    } else {
      if (msg) {
        chatHistoryList.value.push({
          role: 'assistant',
          content: msg,
          createTime
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
    ws.send(JSON.stringify(sendMsg))
    addMessage({
      message: askText.value,
      createTime: moment(new Date(),'MM/DD HH:mm')
    }, true)

    askText.value = ''
    hoveredElementClone.value = null

    await nextTick()
    scrollRoll()
    
    setTimeout( _=> {
      scrollRoll()
    }, 1000)
  }

  // 滚动
  const scrollRoll = async () => {
    await nextTick()
    if (chatContainerRef.value.scrollHeight > chatContainerRef.value.clientHeight) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  }

  // 初始化websocket
  let ws = null

  // ai 思考时展示的内容
  const thinking = ref(false)
  const thinkingCreateTime = ref('')
  const thinkingText = ref('')
  

  // 设置默认的思考状态
  const setDefaultThink = () => {
    thinking.value = false
    thinkingCreateTime.value = ''
    thinkingText.value = ''
  }

  // 定时器
  const intervalN = ref(null)

  // 初始化 websocket
  const initWebSocket = () => {
    if (isFromCase.value) return
    chatHistoryList.value = []
    ws = new WebSocket(`/ai/html/edit/${id.value}`)

    ws.onopen = event => {
      console.log('WebSocket is open now.')
      intervalN.value = setInterval(_ => {
        sendHeart()
      }, 20000)
    }
    
    ws.onclose = event => {
      console.log('WebSocket is closed now.')
      clearInterval(intervalN.value)
      // 异常关闭重连
      if(event.code != 1000 || event.code != 1001){
        initWebSocket()
      }
    }

    ws.onmessage = async event => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'current':
          initHistroyChatList(data.current)
          await nextTick()
          scrollRoll()
          break
        case 'stream_start':
          thinking.value = true
          thinkingCreateTime.value = moment(data.createTime).format('MM/DD HH:mm')
          break
        case 'stream':
          thinkingText.value += data.content
          await nextTick()
          scrollRoll()
          break
        case 'stream_end':
          thinking.value = false
          thinkingCreateTime.value = ''
          break
        case 'complete':
          thinkingText.value = ''
          addMessage({
            message: data.content,
            createTime: data.createTime
          })
          await nextTick()
          scrollRoll()
          break
        case 'ai':
          let contentObj = JSON.parse(Base64.decode(data.content))
          let fullCode = contentObj.fullCode || ''
          if(fullCode){
            let newHmtlText = Base64.decode(fullCode)
            updateEditValueAndView(newHmtlText)
            getProjectDetailById()
          } else {
            addMessage({
              message: contentObj.message,
              createTime: data.createTime
            })
            await nextTick()
            scrollRoll()
          }
          break
        case 'error':
          if(data.content == '余额不足'){
            ElMessage.error({
              message: '余额不足，请充值',
              customClass: 'el-message el-message--error is-closable myToast',
              duration: 3000
            })
          }
          break;  
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
        addMessage(contentObj, true)
      } else {
        addMessage(contentObj)
      }
    })
  }
  
  // 获取ifamre DOM
  const getIframeDom = () => {
    let iframeDom = document.getElementById('iframeRef')
    return iframeDom;
  }
  
  // 设置iframe 内容
  const setIframeHtml = htmlText => {
    let iframeDom = getIframeDom()
    iframeDom.srcdoc = htmlText
  }

  // 更新 iframe 和 monaco editor 内容
  const updateEditValueAndView = newHmtlText => {
    if(!newHmtlText) {
      return
    }
    
    if(!isFromCase.value){
      editorInstance.setValue(newHmtlText)
    }
    setIframeHtml(newHmtlText)
  }

  // 发送心跳
  const sendHeart = () => {
    if (!ws) {
      return
    }
    let heart = {
      type: 'ping'
    }
    if (ws.readyState == 1) {
      ws.send(JSON.stringify(heart))
    }
  }

  // 初始化
  const init = async () => {
    startLoading()
    initCoreParamByRoute()

    if (isFromCase.value) {
      await getCaseDetailById()
    } else {
      initMonacoEditor('')
      initWebSocket()
      await getProjectDetailById()
    }

    await nextTick()
    initFetchHtml().then(htmlText => {
      updateEditValueAndView(htmlText)
    })
  }

  // 根据路由初始化核心参数， 更新url 和 初始化时调用
  const initCoreParamByRoute = () => {
    id.value = route.query.id
    caseId.value = route.query.caseId
  }

  // 获取案例详情
  const getCaseDetailById = async () => {
    await getCaseDetail(caseId.value).then(res => {
      if (res.state == 200) {
        let caseItem = res.data
        fileName.value = caseItem.name
        setCurrentFileName(caseItem.file.filename)
      }
    })
  }

  // 获取项目详情
  const getProjectDetailById = async () => {
    await getProjectDetail(id.value).then(res => {
      if (res.state == 200) {
        let project = res.data.project
        fileName.value = project.name
        let childList = res.data.projectChildren
        childList = childList.reverse()
        if (childList.length > 0) {
          setCurrentFileName(childList[0].resource.filename)
          currentVersionId.value = childList[0].id
          versionList.value = childList
        }
      }
    })
  }

  // 获取讲义文件内容
  const initFetchHtml = async () => {
    return new Promise(resovle => {
      getFileResource(currentFileName.value).then(async res => {
        if(res.status == 200){
          const content = await blobToString(res.data)
          resovle(content)
        }
      })
    })
  }

  // 读取 Blob 内容
  async function blobToString(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsText(blob)
    })
  }

  // 初始化版本列表
  const currentVersionId = ref(0)
  const versionList = ref([])
  
  const versionOther = computed(()=>{
    let res = []
    if(versionList.value.length >= 2) {
      res  = versionList.value.slice(1).filter( item => {
        return item.saved
      })
    }
    
    return res;
  })

  // 更新 url， 参数改变修改核心参数
  const updateURL = id => {
    let replaceQuery = Object.assign(route.query, {
      id: id
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

  // 初始化
  onMounted(async () => {
    await nextTick()
    setTimeout(_ => {
      init()
    }, 200)
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

  // .ask-text-input {
  //   :deep(.el-input__wrapper) {
  //     @apply bg-transparent border-none rounded-none shadow-none;
  //   }
  //   :deep(.el-input__inner) {
  //     @apply w-full bg-transparent outline-none text-neutral-200 placeholder:text-neutral-500 p-4 !pt-2.5;
  //   }
  // }
  
  .ask-text-input{
    @apply bg-transparent border-none rounded-none shadow-none;
    
    :deep(.el-textarea__inner){
      resize: none;
      @extend .my-scroller;
      @apply border-none shadow-none w-full bg-transparent outline-none text-neutral-200 placeholder:text-neutral-500 p-4 !pt-2.5;
    }
  }

  .edit-btn {
    display: inline-block;
    font-size: 14px;
    @apply h24px px-2 gap-2 flex justify-center items-center rounded-full cursor-pointer bg-white text-gray-500;
  }

  .isActive {
    @apply text-white bg-blue-500;
  }

  .ask-btn {
    @apply h24px w24px bg-blue-500 flex justify-center items-center rounded-full cursor-pointer;
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
    color: #E9E9E9;
    background-color: #2E2E2E;
  }

  .chat-user {
    @extend .chat-bg;
    min-width: 0;
    max-width: 90%;
    border-right: 3px solid var(--zeng);
    border-left: none;
    @apply text-sm inline-block rounded-lg py-9px px-16px break-all;
  }

  .chat-assistant {
    @extend .my-scroller;
    @extend .chat-bg;
    min-width: 0;
    max-width: 90%;
    border-right: none;
    border-left: 3px solid #3b82f6;
    @apply text-sm inline-block rounded-lg px-16px pt-9px;
    overflow-x: auto;
  }
  
  
  
  .chat-container-wrapper {
    background-color: #191919;
    @apply wh-full relative flex flex-col;
    
    :deep(.md-editor-preview) {
      font-size: 14px;
    }
  }
  
  .md-editor-dark, .md-editor-modal-container[data-theme='dark'] {
    --md-color: #E9E9E9;
    --md-hover-color: #bbb;
    --md-bk-color: #2E2E2E;
    --md-bk-color-outstand: #333;
    --md-bk-hover-color: #1b1a1a;
    --md-border-color: #2d2d2d;
    --md-border-hover-color: #636262;
    --md-border-active-color: #777;
    --md-modal-mask: #00000073;
    --md-modal-shadow: 0px 6px 24px 2px #00000066;
    --md-scrollbar-bg-color: #0f0f0f;
    --md-scrollbar-thumb-color: #2d2d2d;
    --md-scrollbar-thumb-hover-color: #3a3a3a;
    --md-scrollbar-thumb-active-color: #3a3a3a;
  }

 
</style>
