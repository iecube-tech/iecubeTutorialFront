<template>
  <div class="app-container digitalPlanContainer">
    <el-tabs type="border-card">
      <el-tab-pane>
        <template #label>
          <svg-icon icon-class="client" class="mr-2" />
          动态讲义
        </template>
        <p class="mt-0 mb-2" style="display: flow-root;">
          <span class="font-bold text-bold">基础信息</span>
        </p>
        <el-form :model="formData" :rules="rules" ref="genForm" inline label-width="90px" hide-required-asterisk>
          <div class="flex">
            <div class="w-1/2 pr16px">
              <el-row>
                <el-col :span="23">
                  <el-form-item label="文件名称:" prop="name" class="w-full">
                    <el-input v-model="formData.name" placeholder="请输入文件名称" clearable></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <div class="w-1/2 pl16px">
              <el-row>
                <el-col :span="23">
                  <el-form-item label="课程名称:" prop="title" class="w-full">
                    <el-input v-model="formData.title" placeholder="请输入课程名称" clearable></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
          <div class="flex">
            <div class="w-1/2 pr16px">
              <el-row v-for="(knowledgePoint, k) in formData.knowledgePoints" :key="k">
                <el-col :span="23">
                  <el-form-item label-width="90px" :label="k == 0 ? '知识要点' : ' '" :prop="`knowledgePoints.${k}`"
                    class="w-full" :rules="[{ required: true, message: '请输入知识要点', trigger: ['blur', 'change'] }]">
                    <el-input v-model="formData.knowledgePoints[k]" placeholder="请输入知识要点" clearable></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <el-icon v-if="k == 0" @click="handleAddPoint"
                    class="h32px mb18px leading32px ml-1 cursor-pointer hover:text-zeng">
                    <Plus />
                  </el-icon>
                  <el-icon v-else class="h32px mb18px leading32px ml-1 cursor-pointer hover:text-zeng"
                    @click="handleReomvePoint(k)">
                    <Delete />
                  </el-icon>
                </el-col>
              </el-row>
            </div>
            <div class="w-1/2 pl16px">
              <el-upload ref="uploadRef" class="flex" :on-change="handleChange" :auto-upload="false" accept=".xlsx,.xls"
                :limit="1" :show-file-list="false">
                <el-tooltip content="上传单个Excel文件，【不需要表头】知识点需要写在【第一列】" placement="top">
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
              </el-upload>
            </div>
          </div>
        </el-form>
        <p class="mt-0 mb-2 font-bold" v-show="advanceSettingVisible">
          <el-button type="primary" link @click="toggleAdvanceSettingVisible">
            <span class="font-bold text-bold text-base hover:text-zeng">
              <el-icon>
                <ArrowUpBold />
              </el-icon>
              高级设置
            </span>
          </el-button>
          <el-button title="提示词切换" link type="primary" @click="togglePromptSettingVisible" v-if="userStore.isAdmin()">
            <el-icon class="rotate-90 font-bold text-bold text-base text-zeng">
              <Sort />
            </el-icon>
          </el-button>
        </p>
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
                      精讲<el-icon class="ml-1">
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
            <el-input v-model="formData.codeRequirement" placeholder="请输入仿真代码要求，如帮我生成QPSK算法的matlab仿真"></el-input>
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
            <el-input type="textarea" :rows="5" v-model="formData.prompt" placeholder="请输入提示词"></el-input>
          </el-form-item>
        </el-form>
        <div>
          <el-button v-if="!advanceSettingVisible" type="primary" link @click="toggleAdvanceSettingVisible">
            <span class="font-bold text-bold text-base hover:text-zeng">
              <el-icon>
                <ArrowDownBold />
              </el-icon>
              高级设置
            </span>
          </el-button>
          <el-button type="primary" class="w-[200px]" @click="handleSubmit">一键生成</el-button>
        </div>

        <el-divider class="my-4" />

        <p class="mt-0 mb-4 font-bold text-bold">历史记录</p>
        <div class="p-4">
          <el-table :data="tableData" style="width: 100%" show-overflow-tooltip>
            <!-- <el-table-column prop="name" label="文件名称" /> -->
            <el-table-column prop="title" label="课程名称" />
            <el-table-column prop="knowledgePoint" label="知识点" />
            <el-table-column prop="createTime" label="生成时间" >
              <template #default="scope">
                <span v-show="scope.row.status == 'DONE'">{{
                  moment(scope.row.resource.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="当前状态">
              <template #default="scope">
                <el-tag :type="scope.row.status == 'NOTReady' ? 'info' :
                  scope.row.status == 'GENERATING' ? 'warning' :
                    scope.row.status == 'DONE' ? 'success' : 'danger'" class="w-[60px]">{{ scope.row.statusZn
                    }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operation" label="操作" width="180">
              <template #default="scope">
                <el-button type="primary" :disabled="scope.row.status != 'DONE'" link
                  @click="handleShowPlan(scope.row)">查看</el-button>
                <el-button type="primary" :disabled="scope.row.status != 'DONE'" link
                  @click="handleDownload(scope.row)">下载</el-button>
                <el-button type="primary" link @click="handleRemove(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
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
  </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import router from '@/router'
import { getPlanList, generatePlan, removePlan } from '@/api/plan'

import { useUserStore } from "@/store"

const userStore = useUserStore();

const genForm = ref(null)

const formData = reactive({
  name: '',
  title: '',
  knowledgePoints: [''], // 知识要点支持多个
  type: '1',
  planType: '1',
  hasCode: '1',
  codeRequirement: '',

  prompt: '',
})

const rules = {
  name: [
    { required: true, message: '请输入文件名称', trigger: ['change', 'blur'] },
    { pattern: /^[^<>:"\/\\|?*]+$/, message: '文件名称不能包含特殊字符,如<>:"/\\|?*', trigger: ['change', 'blur'] }
  ],
  title: [
    { required: true, message: '请输入课程名称', trigger: ['change', 'blur'] },
  ],
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

const getStateCn = (state) => {
  let statusZn = ''
  switch (state) {
    case 'NOTReady':
      statusZn = '准备中'
      break;
    case 'GENERATING':
      statusZn = '生成中'
      break;
    case 'DONE':
      statusZn = '完成'
      break;
    case 'FAILED':
      statusZn = '失败'
      break;
    default:
      statusZn = '-'
      break;
  }
  return statusZn

}

const getList = () => {
  getPlanList().then(res => {
    tableData.value = res.data

    for (let i = 0; i < tableData.value.length; i++) {
      // tableData.value[i].createTime = moment(tableData.value[i].createTime).utc().format('YYYY-MM-DD HH:mm:ss')
      // tableData.value[i].createTime = moment(tableData.value[i].createTime).utc().format('YYYY-MM-DD HH:mm:ss')
      tableData.value[i].statusZn = getStateCn(tableData.value[i].status)
    }

  }).catch(err => {
    clearInterval(intervalTime.value)
    console.log(err)
  })
}


const intervalTime = ref(null)

onMounted(() => {
  getList();
  intervalTime.value = setInterval(() => {
    getList()
  }, 20 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(intervalTime.value)
})

// 查看讲义
const handleShowPlan = (row) => {
  let filePath = `/resource/${row.resource.filename}`
  let openPath = router.resolve({
    path: '/showDigitalPlan',
    query: {
      filePath: filePath,
      fileName: row.name,
      id: row.id
    }
  })
  window.open(openPath.href, '_blank')
}

// 下载讲义
const handleDownload = (row) => {
  let filePath = `/resource/${row.resource.filename}`
  const link = document.createElement('a');
  link.href = filePath;
  link.download = row.name;
  link.click();
}

// 删除讲义
const handleRemove = (row) => {
  ElMessageBox.confirm(`确定要删除该讲义 ${row.name} 吗?`, "提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    removePlan(row.id).then(res => {
      ElMessage.success({
        message: '删除成功',
        customClass: 'el-message el-message--success is-closable myToast',
      })
      getList()
    }).catch(err => {
      console.log(err)
      ElMessage.error('删除失败')
    })
  })
}

import genPrompts from './promptGen.js'

import { Base64 } from 'js-base64'


// 一键生成讲义
const handleSubmit = () => {
  genForm.value.validate((valid) => {
    if (valid) {
      let promptText = '';
      if (!promptSettingVisible.value) {
        promptText = genPrompts(formData.type, formData.planType, formData.hasCode, formData.codeRequirement)
      } else {
        promptText = formData.prompt
      }

      promptText = Base64.encode(promptText)

      let promises = [];
      formData.knowledgePoints.forEach((knowledgePoints) => {
        let req = {
          name: formData.name,
          title: formData.title,
          knowledgePoints: knowledgePoints,
          instruction: promptText,
        }
        promises.push(doCreatePlan(req));
      })
      Promise.all(promises).then(res => {
        tipMessage();
      }).catch(err => {
        getList()
      })
    }
  })
}

const tipMessage = () => {
  ElMessage.success({
    message: '发送成功！请耐心等待讲义生成完成!',
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
import { UploadFilled, Loading } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

let loading = ref(false)
const fileName = ref("")
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
const validateFile = (file) => {
  const fileName = file.name.toLowerCase()
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ||
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
const parseExcel = (file) => {
  loading.value = true

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length === 0) {
        ElMessage.warning('Excel 文件为空!')
        loading.value = false
        return
      }

      const firstColumnData = []
      jsonData.forEach(row => {
        if (row[0] !== undefined && row[0] !== null && row[0] !== '') {
          firstColumnData.push(row[0])
        }
      })

      ElMessage.success(`成功解析 ${firstColumnData.length} 行数据!`)
      formData.knowledgePoints = firstColumnData;

    } catch (error) {
      console.error('解析失败:', error)
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
  fileName.value = ""
  uploadRef.value.clearFiles()
}

const handleReomvePoint = (index) => {
  formData.knowledgePoints.splice(index, 1)
}

const handleAddPoint = () => {
  formData.knowledgePoints.push('')
}

</script>

<style lang="scss" scoped>
.digitalPlanContainer {
  :deep(.el-tabs__content) {
    height: calc(100vh - 130px);
    overflow-y: auto;
  }
}
</style>