<template>
  <div class="app-container digitalPlanContainer">
    <el-tabs type="border-card">
      <el-tab-pane>
        <template #label>
          <svg-icon icon-class="client" class="mr-2" />
          动态讲义
        </template>
        <div class="flow-root mb-2">
          <span class="font-bold text-bold">基础信息</span>
        </div>
        <el-form
          :model="formData"
          :rules="rules"
          ref="genForm"
          inline
          label-width="90px"
          hide-required-asterisk
        >
          <div class="flex">
            <div class="w-1/2 pr16px">
              <el-row>
                <el-col :span="23">
                  <el-form-item label="文件名称:" prop="name" class="w-full">
                    <el-input
                      v-model="formData.name"
                      placeholder="请输入文件名称"
                      clearable
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <div class="w-1/2 pl16px">
              <el-row>
                <el-col :span="23">
                  <el-form-item label="课程名称:" prop="title" class="w-full">
                    <el-input
                      v-model="formData.title"
                      placeholder="请输入课程名称"
                      @input="debounceFindCaseList"
                      clearable
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
          <div class="flex">
            <div class="w-1/2 pr16px">
              <el-row v-for="(knowledgePoint, k) in formData.knowledgePoints" :key="k">
                <el-col :span="23">
                  <el-form-item
                    label-width="90px"
                    :label="k == 0 ? '知识要点' : ' '"
                    :prop="`knowledgePoints.${k}`"
                    class="w-full"
                    :rules="[
                      { required: true, message: '请输入知识要点', trigger: ['blur', 'change'] }
                    ]"
                  >
                    <el-input
                      v-model="formData.knowledgePoints[k]"
                      @input="debounceFindCaseList"
                      placeholder="请输入知识要点"
                      clearable
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <!-- <el-icon
                    v-if="k == 0"
                    @click="handleAddPoint"
                    class="h32px mb18px leading32px ml-1 cursor-pointer hover:text-zeng"
                  >
                    <Plus />
                  </el-icon>
                  <el-icon
                    v-else
                    class="h32px mb18px leading32px ml-1 cursor-pointer hover:text-zeng"
                    @click="handleReomvePoint(k)"
                  >
                    <Delete />
                  </el-icon> -->
                </el-col>
              </el-row>
            </div>
            <div class="w-1/2 pl16px">
              <!-- <el-upload
                ref="uploadRef"
                class="flex"
                :on-change="handleChange"
                :auto-upload="false"
                accept=".xlsx,.xls"
                :limit="1"
                :show-file-list="false"
              >
                <el-tooltip placement="top">
                  <template #content>
                    <span>1. 上传单个Excel文件</span>
                    <br />
                    <span>2.【不需要表头】知识点需要写在【第一列】</span>
                    <br />
                    <span>3. 最多上传 15 个知识点</span>
                  </template>
                  <el-button type="primary" plain>
                    <el-icon v-if="!loading" class="el-icon--upload">
                      <upload-filled />
                    </el-icon>
                    <el-icon v-else class="el-icon--upload is-loading">
                      <Loading />
                    </el-icon>
                    批量导入知识点
                  </el-button>
                </el-tooltip>
                <template #tip>
                  <div class="el-upload__tip ml-1 select-none">
                    （单个 .xlsx/.xls 文件，不超过 10MB）
                  </div>
                  <div v-show="fileName.length > 0" class="el-upload__tip ml-1">
                    <span class="select-none">{{ fileName }}</span>
                    <span class="ml-1 cursor-pointer hover:text-zeng">
                      <el-icon @click="clearFile">
                        <CloseBold />
                      </el-icon>
                    </span>
                  </div>
                </template>
              </el-upload> -->
            </div>
          </div>
        </el-form>
        <!-- <div class="mt-0 mb-2 font-bold" v-show="advanceSettingVisible">
          <el-button type="primary" link @click="toggleAdvanceSettingVisible">
            <span class="font-bold text-bold text-base hover:text-zeng">
              <el-icon>
                <ArrowUpBold />
              </el-icon>
              高级设置
            </span>
          </el-button>
          <el-button
            title="提示词切换"
            link
            type="primary"
            @click="togglePromptSettingVisible"
            v-if="userStore.isAdmin()"
          >
            <el-icon class="rotate-90 font-bold text-bold text-base text-zeng">
              <Sort />
            </el-icon>
          </el-button>
        </div>
        <el-form :model="formData" v-show="advanceSettingVisible">
          <el-form-item label-width="120px" v-show="!promptSettingVisible" label="生成方式:">
            <el-radio-group v-model="formData.type" prop="type">
              <el-radio value="1">
                <span class="w-[80px] inline-block">整页形式</span>
              </el-radio>
              <el-radio value="2">
                <span class="w-[80px] inline-block">分页形式</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label-width="120px" v-show="!promptSettingVisible" label="理论讲解:">
            <el-radio-group v-model="formData.planType" prop="planType">
              <el-radio value="1"><span class="w-[80px] inline-block">概述</span></el-radio>
              <el-radio value="2">
                <el-popover title="温馨提示：" content="针对简单知识点效果不明显" placement="right">
                  <template #reference>
                    <span class="inline-block">
                      精讲
                      <el-icon class="ml-1">
                        <InfoFilled />
                      </el-icon>
                    </span>
                  </template>
                </el-popover>
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label-width="120px" v-show="!promptSettingVisible" label="交互动画:">
            <el-radio-group v-model="formData.hasCode" prop="hasCode">
              <el-radio value="1"><span class="w-[80px] inline-block">有</span></el-radio>
              <el-radio value="2"><span class="w-[80px] inline-block">无</span></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label-width="120px" v-show="!promptSettingVisible" label="仿真代码:">
            <el-input
              v-model="formData.codeRequirement"
              placeholder="请输入仿真代码要求，如帮我生成QPSK算法的matlab仿真"
            ></el-input>
          </el-form-item>
          <el-form-item label-width="120px" v-show="!promptSettingVisible" label="学科垂域大模型:">
            <el-radio-group disabled>
              <el-radio value="1">通信垂域大模型</el-radio>
              <el-radio value="2">机电垂域大模型</el-radio>
              <el-radio value="3">集成电路垂域大模型</el-radio>
              <el-radio value="4">自建模型</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label-width="90px" v-show="promptSettingVisible" label="提示词:">
            <el-input
              type="textarea"
              :rows="5"
              v-model="formData.prompt"
              placeholder="请输入提示词"
            ></el-input>
          </el-form-item>
        </el-form> 
        <div>
          <el-button
            v-if="!advanceSettingVisible"
            type="primary"
            link
            @click="toggleAdvanceSettingVisible"
          >
            <span class="font-bold text-bold text-base hover:text-zeng">
              <el-icon>
                <ArrowDownBold />
              </el-icon>
              高级设置
            </span>
          </el-button>
          <el-button type="primary" class="w-[160px]" @click="handleSubmit">一键生成</el-button>
          <el-button type="primary" plain class="w-[160px]" @click="handleGenOutline">
            先看大纲
          </el-button>
        </div> -->
        
         <div>
          <el-button type="primary" class="w-[160px]" @click="handleSubmit">一键生成</el-button>
          <el-button type="primary" plain class="w-[160px]" @click="handleGenOutline">
            先看大纲
          </el-button>
        </div>
        <el-divider style="margin: 16px 0" />

        <div class="mb-2">
          <span class="font-bold text-bold">相关案例</span>
        </div>

        <el-row :gutter="10" class="mb-10px" v-if="filterCaseList.length > 0">
          <el-col :span="6" v-for="caseItem in filterCaseList.slice(0, 4)" :key="caseItem.id">
            <div class="case-card" @click="handleShowCase(caseItem)">
              <div class="case-image-wrapper">
                <img
                  :src="`/resource/${caseItem.cover.filename}`"
                  alt="案例图片"
                  class="case-img"
                />
              </div>
              <div class="case-content">
                <div class="w-full flex justify-between">
                  <div class="case-title">{{ caseItem.title }}</div>
                  <div v-show="caseItem.tags.length > 0">
                    <el-tag
                      v-for="(tag, k) in caseItem.tags.slice(0, 1)"
                      :key="k"
                      size="small"
                      class="mx-1"
                    >
                      {{ tag.name }}
                    </el-tag>
                  </div>
                </div>
                <div class="w-full flex justify-between">
                  <div class="case-description">{{ caseItem.knowledgePoint }}</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="mb-10px" v-if="filterCaseList.length > 4">
          <el-col :span="6" v-for="caseItem in filterCaseList.slice(4, 8)" :key="caseItem.id">
            <div class="case-card" @click="handleShowCase(caseItem)">
              <div class="case-image-wrapper">
                <img
                  :src="`/resource/${caseItem.cover.filename}`"
                  alt="案例图片"
                  class="case-img"
                />
              </div>
              <div class="case-content">
                <div class="w-full flex justify-between">
                  <div class="case-title">{{ caseItem.title }}</div>
                  <div v-show="caseItem.tags.length > 0">
                    <el-tag
                      v-for="(tag, k) in caseItem.tags.slice(0, 1)"
                      :key="k"
                      size="small"
                      class="mx-1"
                    >
                      {{ tag.name }}
                    </el-tag>
                  </div>
                </div>
                <div class="w-full flex justify-between">
                  <div class="case-description">{{ caseItem.knowledgePoint }}</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <div class="flex justify-center items-center" v-if="filterCaseList.length > 0">
          <span class="text-sm text-zeng cursor-pointer" @click="handleMoreCase">更多案例</span>
        </div>

        <div class="flex justify-center items-center" v-if="filterCaseList.length == 0">
          <span class="text-sm text-regular">
            暂无相关案例，可以到
            <span class="text-sm text-zeng cursor-pointer" @click="handleMoreCase">案例集</span>
            查看其他案例
          </span>
        </div>

        <el-divider style="margin: 16px 0" />

        <div class="mt-0 mb-4 font-bold text-bold">历史记录</div>
        <div class="px-4">
          <el-table :data="paginatedData" style="width: 100%" show-overflow-tooltip>
            <!-- <el-table-column prop="name" label="文件名称" /> -->
            <el-table-column prop="project.title" label="课程名称" />
            <el-table-column prop="project.knowledgePoint" label="知识点" />
            <el-table-column prop="project.createTime" label="生成时间">
              <template #default="{ row }">
                <span v-show="row.project.status == 'DONE'">
                  {{ moment(row.project.createTime).format('YYYY-MM-DD HH:mm:ss') }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="project.status" label="当前状态">
              <template #default="{ row }">
                <el-tag :type="getProjectStatusZn(row.project.status).type" class="w-[60px]">
                  {{ getProjectStatusZn(row.project.status).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作" width="240">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  :disabled="row.project.status != 'DONE'"
                  link
                  @click="handleShowOutline(row.project.row)"
                >
                  大纲
                </el-button>
                <el-button
                  type="primary"
                  :disabled="row.project.status != 'DONE'"
                  link
                  @click="handleShowPlan(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="primary"
                  :disabled="row.project.status != 'DONE'"
                  link
                  @click="handleDownload(row.project)"
                >
                  下载
                </el-button>
                <el-button type="primary" link @click="handleRemove(row.project)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.length"
            class="mt-2"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="习题生成" disabled>
        <template #label>
          <svg-icon icon-class="document" class="mr-2" />
          习题生成
        </template>
      </el-tab-pane>
      <el-tab-pane label="实验设计" disabled>
        <template #label>
          <svg-icon icon-class="system" class="mr-2" />
          实验设计
        </template>
      </el-tab-pane>
    </el-tabs>

    <markdownDialog
      ref="markdownDialogRef"
      @close="setDefaultOutlineParams"
      @save="handleUpdateOutline"
      @generate="handleGenPlanFromOutline"
    />
  </div>
</template>

<script setup lang="ts">
  import moment from 'moment'
  import router from '@/router'

  import { debounce } from 'lodash'
  import { Base64 } from 'js-base64'
  import { UploadFilled, Loading } from '@element-plus/icons-vue'
  import * as XLSX from 'xlsx'

  import { useUserStore } from '@/store'
  import { genPrompts, genOutlinePrompts } from './promptGen.js'
  import {
    getPlanList,
    generatePlan,
    removePlan,
    genOutlineWebsocketId,
    updateOutline,
    genPlanFromOutline
  } from '@/api/plan'

  import markdownDialog from './markdownDialog.vue'
  import { findCase } from '@/api/caseApi'

  import { getProjectStatusZn } from '@/utils/cnMap.js'

  const userStore = useUserStore()

  const genForm = ref(null)

  const formData = reactive({
    name: '',
    title: '',
    knowledgePoints: [''], // 知识要点支持多个
    type: '1',
    planType: '1',
    hasCode: '1',
    codeRequirement: '',

    prompt: ''
  })

  const rules = {
    name: [
      { required: true, message: '请输入文件名称', trigger: ['change', 'blur'] },
      {
        pattern: /^[^<>:"\/\\|?*]+$/,
        message: '文件名称不能包含特殊字符,如<>:"/\\|?*',
        trigger: ['change', 'blur']
      }
    ],
    title: [{ required: true, message: '请输入课程名称', trigger: ['change', 'blur'] }]
    // knowledgePoints: [
    //   { required: true, message: '请输入知识要点', trigger: ['change', 'blur'] },
    // ],
  }

  const advanceSettingVisible = ref(false)

  const toggleAdvanceSettingVisible = () => {
    advanceSettingVisible.value = !advanceSettingVisible.value
  }

  const promptSettingVisible = ref(false)
  const togglePromptSettingVisible = () => {
    promptSettingVisible.value = !promptSettingVisible.value
  }

  const tableData = ref([])

  // 分页参数
  const currentPage = ref(1)
  const pageSize = ref(10)

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    let res = tableData.value.slice(start, end)
    return res
  })

  const handleSizeChange = newSize => {
    currentPage.value = 1
    pageSize.value = newSize
  }

  const handleCurrentChange = newPage => {
    currentPage.value = newPage
  }

  const getList = () => {
    getPlanList()
      .then(res => {
        if (res.state == 200) {
          tableData.value = res.data
        }
      })
      .catch(err => {
        clearInterval(intervalTime.value)
      })
  }

  const intervalTime = ref(null)

  onMounted(() => {
    getList()
    intervalTime.value = setInterval(() => {
      getList()
    }, 20 * 1000)
  })

  onBeforeUnmount(() => {
    clearInterval(intervalTime.value)
    setDefaultOutlineParams()
  })

  // 生成大纲时核心参数
  const ws = ref(null)
  const tmpText = ref('')
  const tmpReqObj = ref(null)

  // (关闭弹框时调用方法) 生成大纲核心参数 
  const setDefaultOutlineParams = () => {
    if (ws.value) {
      ws.value.close()
    }
    ws.value = null
    tmpText.value = ''
    tmpReqObj.value = null
    markdownDialogRef.value.updateContent('')
  }

  // TODO 先看大纲 (生成大纲)
  const handleGenerateOutline = () => {
    genForm.value.validate(valid => {
      if (valid) {
        
        setDefaultOutlineParams()

        let promptText = ''
        if (!promptSettingVisible.value) {
          promptText = genPrompts(
            formData.type,
            formData.planType,
            formData.hasCode,
            formData.codeRequirement
          )
        } else {
          promptText = formData.prompt
        }

        promptText = Base64.encode(promptText)

        let req = {
          name: formData.name,
          title: formData.title,
          instruction: promptText,
          knowledgePoints: formData.knowledgePoints[0]
        }
        genOutlineWebsocketId(req).then(res => {
          if (res.state == 200) {
            tmpReqObj.value = res.data
            markdownDialogRef.value.open()
            initWebsocket(tmpReqObj.value.id)
          }
        })
      }
    })
  }

  const handleGenOutline = debounce(handleGenerateOutline, 800)

  // TODO: 查看大纲
  const markdownDialogRef = ref(null)
  const handleShowOutline = async row => {
    markdownDialogRef.value.open()
    markdownDialogRef.value.updateContent('aaaa')
  }

  // TODO 初始化 ws 跟新大纲内容
  const initWebsocket = moutlineId => {
    if (ws.value) {
      ws.value.close()
    }

    ws.value = new WebSocket(`/ai/outline/receive/${moutlineId}`)

    ws.value.onopen = () => {
      console.log('WebSocket连接已打开')
    }

    ws.value.onmessage = event => {
      let data = JSON.parse(event.data)
      if (data.type == 'stream') {
        tmpText.value += data.message
        markdownDialogRef.value.updateContent(tmpText.value)
      } else if (data.type == 'message') {
        tmpText.value = data.message
        markdownDialogRef.value.updateContent(tmpText.value)
        markdownDialogRef.value.setCanEdit(true)
      }
    }
  }

  const handleUpdateOutline = outline => {
    tmpReqObj.value.outline = outline
    updateOutline(tmpReqObj.value).then(res => {
      if (res.state == 200) {
        ElMessage.success('更新成功')
      }
    })
  }

  const handleGenPlanFromOutline = () => {
    if(tmpReqObj.value.id != '') {
      genPlanFromOutline(tmpReqObj.value.id).then(res=>{
        if(res.state == 200){
          ElMessage.success('提交成功')
          setDefaultOutlineParams()
          markdownDialogRef.value.close()
          getList()
        }
      })
    }
  }

  // 查看案例
  const handleShowCase = caseItem => {
    let openPath = router.resolve({
      path: '/showDigitalPlan',
      query: {
        id: '', // 项目id 从案例进入时 id 为空
        caseId: caseItem.id // 案例id
      }
    })
    window.open(openPath.href, '_blank')
  }

  // 查看项目 最新版本 讲义
  const handleShowPlan = row => {
    let openPath = router.resolve({
      path: '/showDigitalPlan',
      query: {
        id: row.project.id,
        caseId: ''
      }
    })
    window.open(openPath.href, '_blank')
  }

  // 下载讲义
  const handleDownload = row => {
    let filePath = `/resource/${row.resource.filename}`
    const link = document.createElement('a')
    link.href = filePath
    link.download = row.name
    link.click()
  }

  // 删除讲义
  const handleRemove = row => {
    ElMessageBox.confirm(`确定要删除该讲义 ${row.name} 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      removePlan(row.id)
        .then(res => {
          ElMessage.success({
            message: '删除成功',
            customClass: 'el-message el-message--success is-closable myToast'
          })
          getList()
        })
        .catch(err => {
          ElMessage.error('删除失败')
        })
    })
  }

  // 一键生成讲义
  const handleGenerate = () => {
    genForm.value.validate(valid => {
      if (valid) {
        let promptText = ''
        if (!promptSettingVisible.value) {
          promptText = genPrompts(
            formData.type,
            formData.planType,
            formData.hasCode,
            formData.codeRequirement
          )
        } else {
          promptText = formData.prompt
        }

        promptText = Base64.encode(promptText)

        let promises = []
        formData.knowledgePoints.forEach(knowledgePoints => {
          let req = {
            name: formData.name,
            title: formData.title,
            knowledgePoints: knowledgePoints,
            instruction: promptText
          }
          promises.push(doCreatePlan(req))
        })
        Promise.all(promises)
          .then(res => {
            tipMessage('发送成功！请耐心等待讲义生成完成!')
          })
          .catch(err => {
            getList()
          })
      }
    })
  }

  const handleSubmit = debounce(handleGenerate, 800)

  const tipMessage = msg => {
    ElMessage.success({
      message: msg, //,
      duration: 10 * 1000,
      showClose: true,
      customClass: 'el-message el-message--success is-closable myToast',
      type: 'success'
    })
    setTimeout(() => {
      getList()
    }, 1000)
  }

  const doCreatePlan = (request: any) => {
    return new Promise((resolve, reject) => {
      generatePlan(request).then(res => {
        resolve(true)
      })
    })
  }

  // 批量上传

  let loading = ref(false)
  const fileName = ref('')
  const uploadRef = ref(null)

  // 文件变化时的处理
  const handleChange = (file, fileList) => {
    if (loading.value) {
      return
    }

    if (!validateFile(file.raw)) {
      const index = fileList.findIndex(item => item.uid === file.uid)
      if (index > -1) {
        fileList.splice(index, 1)
      }
      return
    }

    if (file.raw) {
      fileName.value = file.raw.name
      parseExcel(file.raw)
    }
  }

  // 文件校验函数
  const validateFile = file => {
    const fileName = file.name.toLowerCase()
    const isExcel =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    if (!isExcel) {
      ElMessage.error('只能上传 Excel 文件(.xlsx 或 .xls)!')
      return false
    }

    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      ElMessage.error('文件大小不能超过 10MB!')
      return false
    }

    return true
  }

  // 解析 Excel 文件（保持不变）
  const parseExcel = file => {
    loading.value = true

    const reader = new FileReader()

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length === 0) {
          ElMessage.warning('Excel 文件为空!')
          loading.value = false
          return
        } else {
          if (jsonData.length > maxPointLength.value) {
            // ElMessage.warning(`最多只能添加${maxPointLength.value}个知识点`)
            jsonData = jsonData.slice(0, maxPointLength.value)
          }
        }

        const firstColumnData = []
        jsonData.forEach(row => {
          if (row[0] !== undefined && row[0] !== null && row[0] !== '') {
            firstColumnData.push(row[0])
          }
        })

        ElMessage.success(`成功解析 ${firstColumnData.length} 行数据!`)
        formData.knowledgePoints = firstColumnData
      } catch (error) {
        ElMessage.error('文件解析失败，请检查文件格式!')
      } finally {
        loading.value = false
      }
    }

    reader.onerror = () => {
      ElMessage.error('文件读取失败!')
      loading.value = false
    }

    reader.readAsArrayBuffer(file)
  }

  // 清除文件列表
  const clearFile = () => {
    fileName.value = ''
    uploadRef.value.clearFiles()
  }

  const handleReomvePoint = index => {
    formData.knowledgePoints.splice(index, 1)
  }

  const maxPointLength = ref(15) // 限制最多添加15个知识点

  const handleAddPoint = () => {
    if (formData.knowledgePoints.length < maxPointLength.value) {
      formData.knowledgePoints.push('')
    } else {
      ElMessage.warning(`最多只能添加${maxPointLength.value}个知识点`)
    }
  }

  // 相关案例
  const handleMoreCase = () => {
    router.push('/caseMarket')
  }

  const caseList = ref([])
  const filterCaseList = ref([])

  const findCaseList = () => {
    let req = {
      title: formData.title,
      knowledgePoints: formData.knowledgePoints[0]
    }
    findCase(req).then(res => {
      filterCaseList.value = res.data
    })
  }

  findCaseList()

  const debounceFindCaseList = debounce(findCaseList, 800)
</script>

<style lang="scss" scoped>
  .digitalPlanContainer {
    :deep(.el-tabs__content) {
      height: calc(100vh - 120px);
      overflow-y: auto;
    }
  }

  $card-height: 160px;

  .case-card {
    height: $card-height;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--border-color);
    background-color: var(--my-card-bg);
    padding: 10px;
    @apply group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden;

    &:hover {
      @apply transform -translate-y-1;
    }
  }

  .case-image-wrapper {
    @apply relative overflow-hidden rounded-xl;
  }

  .case-img {
    height: 0;
    flex: 1;
    @apply w-full h-full object-cover transition-transform duration-300;
  }

  .case-content {
    @apply mt-2 h-60px flex flex-col justify-between items-start;
  }

  .case-title {
    color: var(--el-text-color-regular);
    @apply w-0 flex-1  text-sm overflow-hidden text-ellipsis font-bold whitespace-nowrap line-clamp-1;
  }

  .case-description {
    color: var(--el-text-color-secondary);
    @apply inline-block w-0 flex-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap line-clamp-2 leading-relaxed;
  }

  .text-regular {
    color: var(--el-text-color-regular);
  }
</style>
