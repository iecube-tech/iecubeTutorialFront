<template>
  <div class="plan-container">
    <div class="btn-tools">
      <div class="w-0 flex-1">
        <span v-show="showloading" class="loading-text">{{ loadingText }}</span>
      </div>

      <div class="h-full flex items-center gap-2">
        <el-icon
          size="20px"
          class="hovrer:cursor-pointer hover:text-blue-500"
          title="保存"
          v-show="editorVisible"
          @click="handleSave"
        >
          <FolderChecked />
        </el-icon>
        <el-icon
          size="20px"
          class="hovrer:cursor-pointer hover:text-blue-500"
          title="编辑模式"
          v-show="!editorVisible"
          @click="openEditor"
        >
          <Edit />
        </el-icon>
        <!-- <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="重新生成" @click="handleRefresh">
          <Refresh />
        </el-icon> -->
        <el-icon
          size="20px"
          class="hovrer:cursor-pointer hover:text-blue-500"
          title="下载页面"
          @click="handleDownload"
        >
          <Download />
        </el-icon>
        <!--  <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="分享" v-loading="shortLoading"
          @click="handleShare">
          <Share />
        </el-icon> -->
        <!-- <el-icon size="20px" class="hovrer:cursor-pointer hover:text-blue-500" title="分享">
          <Share />
        </el-icon> -->
      </div>
    </div>

    <resizePanel class="content-wrapper">
      <template #left-content>
        <div ref="editorRef" class="h-full"></div>
      </template>
      <template #right-content>
        <iframe
          ref="iframeRef"
          class="w-full select-none transition-all duration-200 bg-black h-full"
          :src="relativeFilePath + `?t=${t}`"
          loading="lazy"
          @load="closeLoadingText"
        ></iframe>
      </template>
    </resizePanel>

    <el-dialog v-model="shareVisible" title="分享" align-center>
      <div class="w-full h-full">
        <img :src="screenshotUrl" class="w-full h-full" />
        <img :src="huichuang" class="absolute top-[100px] right-0 w-[160px] h-[160px]" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
  import resizePanel from './resizePanel.vue'

  // import { EditorView, basicSetup } from 'codemirror'
  // import { EditorState } from '@codemirror/state'
  // import { oneDark } from '@codemirror/theme-one-dark';
  // import { css } from '@codemirror/lang-css';
  // import { html } from '@codemirror/lang-html';
  // import { javascript } from '@codemirror/lang-javascript'
  import { Base64 } from 'js-base64'
  import { updatePlan } from '@/api/plan'
  import html2canvas from 'html2canvas'
  import huichuang from './huichuang.jpg'

  import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'

  const iframeRef = ref(null)

  const screenshotUrl = ref('')
  const shortLoading = ref(false)

  const showloading = ref(true)
  const loadingText = ref('正在为您拼命加载页面中.....')
  const t = ref('')

  const updateTime = () => {
    t.value = new Date().getTime()
  }

  updateTime()

  const showLoadingText = () => {
    showloading.value = true
  }

  const closeLoadingText = async () => {
    // showloading.value = false
    // await nextTick()
    // setTimeout(async () => {
    //   await short()
    // }, 3000)
  }

  const route = useRoute()
  const relativeFilePath = ref('')
  const fileName = ref('')
  const id = ref(null)
  relativeFilePath.value = route.query.filePath
  fileName.value = route.query.fileName
  id.value = route.query.id

  const editorVisible = ref(true)
  const editorRef = ref(null)
  let editorInstance = null

  // let editorState = null
  // let editorView = null
  const textValue = ref('')

  /* const createEditor = (text) => {
  editorState = EditorState.create({
    doc: text,
    extensions: [
      basicSetup,
      css(),
      html(),
      javascript(),
      oneDark,
    ],
  });

  editorView = new EditorView({
    state: editorState,
    parent: editorRef.value
  })

} */

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
    closeEditor()

    const content = editorView.state.doc.toString()
    const base64Content = Base64.encode(content)
    updatePlan({
      id: id.value,
      htmlContentBase64: base64Content
    }).then(res => {
      ElMessage.success('保存成功')
      showLoadingText()
      updateTime()
    })
  }

  // 刷新页面
  const handleRefresh = () => {
    showLoadingText()
    updateTime()
  }

  // 分享功能
  const shareVisible = ref(false)
  const handleShare = async () => {
    shortLoading.value = true

    if (screenshotUrl.value === '') {
      console.log('截图失败>>>>>>>>>>>')
      await short()
    }
    shareVisible.value = true
    shortLoading.value = false
  }

  const short = async () => {
    console.log('截图开始>>>>>>>>>>>')
    let iframe = iframeRef.value
    const doc = iframe.contentDocument

    // 阶段1：等待基础DOM就绪
    await waitForDOMReady(iframe)

    // 阶段2：等待CSS/JS资源
    // await waitForAssets(iframe)

    // 阶段3：等待动态内容
    await waitForDynamicContent(iframe)
    // 强制展开滚动区域
    doc.body.style.overflow = 'visible'
    doc.body.style.height = 'auto'

    try {
      const canvas = await html2canvas(iframe.contentWindow.document.body, {
        useCORS: true,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        windowWidth: iframe.contentDocument.documentElement.scrollWidth,
        windowHeight: iframe.contentDocument.documentElement.scrollHeight
      })
      screenshotUrl.value = canvas.toDataURL('image/png')
    } catch (e) {
      console.log('截图失败>>>>>>>>>>>')
      screenshotUrl.value = ''
    }
  }

  // 等待DOM就绪
  const waitForDOMReady = iframe => {
    return new Promise(resolve => {
      if (iframe.contentDocument.readyState === 'complete') {
        resolve()
      } else {
        iframe.contentDocument.addEventListener('DOMContentLoaded', resolve)
      }
    })
  }

  // 等待CSS/JS资源
  const waitForAssets = async iframe => {
    const doc = iframe.contentDocument
    const scripts = Array.from(doc.querySelectorAll('script'))
    const links = Array.from(doc.querySelectorAll('link'))

    const scriptPromises = scripts.map(script => {
      return new Promise((resolve, reject) => {
        script.addEventListener('load', resolve)
        script.addEventListener('error', reject)
      })
    })

    const linkPromises = links.map(link => {
      return new Promise((resolve, reject) => {
        link.addEventListener('load', resolve)
        link.addEventListener('error', reject)
      })
    })

    await Promise.all(...scriptPromises, ...linkPromises)
  }

  // 等待动态内容
  const waitForDynamicContent = iframe => {
    return new Promise(resolve => {
      // const observer = new MutationObserver(() => {
      //   resolve()
      // })
      // observer.observe(iframe.contentDocument.body, {
      //   childList: true,
      //   subtree: true
      // })
      // 超时保险
      setTimeout(() => {
        resolve()
      }, 3000)
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

  const contentWrapperRef = ref(null)
  const resizeBtnRef = ref(null)

  // 存储初始位置和宽度
  let startX, startWidth

  // 拖拽功能
  const startDrag = e => {
    console.log(e)
    // 添加激活样式FF
    // resizeHandle.classList.add('active');

    // 记录初始位置和左侧面板宽度
    startX = e.clientX
    console.log(`startX: ${startX}`)

    startWidth = parseInt(document.defaultView.getComputedStyle(editorRef.value).width, 10)

    // 添加事件监听
    document.addEventListener('mousemove', doDrag)
    document.addEventListener('mouseup', stopDrag)

    // 防止文本选择
    e.preventDefault()
  }

  // 拖拽中
  function doDrag(e) {
    // 计算新的左侧面板宽度
    const newWidth = startWidth + (e.clientX - startX)
    const containerWidth = contentWrapperRef.value.clientWidth

    // 设置最小和最大宽度限制
    const minWidth = 200
    const maxWidth = containerWidth - 300

    if (newWidth > minWidth && newWidth < maxWidth) {
      editorRef.value.style.width = `${newWidth}px`
    }
  }

  // 停止拖拽
  function stopDrag() {
    // 移除激活样式
    // resizeHandle.classList.remove('active')

    // 移除事件监听
    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('mouseup', stopDrag)

    console.log('移出监听事件')
  }

  // 初始化
  const init = () => {
    showLoadingText()
    getHtmlFileContent()
  }

  init()
</script>

<style lang="scss" scoped>
  $btn-tool-height: 20px;

  .plan-container {
    height: 100%;
    width: 100%;
  }

  .btn-tools {
    height: $btn-tool-height;
    @apply flex justify-between;

    .loading-text {
      font-size: 16px;
      @apply whitespace-nowrap font-bold color-blue-500;
    }
  }

  .content-wrapper {
    height: calc(100% - $btn-tool-height);
  }
</style>
