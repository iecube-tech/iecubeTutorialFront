<template>
  <div class="app-container">
    <div class="wh-full px-10px">
      <div class="tools-bar">
        <div>
          <el-button type="primary" @click="handleAdd">
            <Icon size="20">
              <Add />
            </Icon>
            新建
          </el-button>
        </div>
        <div>
          <el-input
            v-model="filterText"
            class="w-200px"
            suffix-icon="Search"
            placeholder="请输入搜索内容"
          ></el-input>
        </div>
      </div>
      <div class="case-grid">
        <div
          v-for="caseItem in filterCaseList"
          :key="caseItem.id"
          class="case-card group"
          @click="handleCaseClick(caseItem.id)"
        >
          <div class="case-image-wrapper">
            <img :src="url.map[caseItem.cover.filename]" alt="案例图片" class="case-img" />
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
              <Icon
                class="invisible group-hover:visible"
                style="color: #f76560"
                @click.stop="handleDelete(caseItem)"
              >
                <Delete />
              </Icon>
            </div>
          </div>
        </div>
      </div>
      <div v-if="filterCaseList.length === 0" class="no-match">
        <span>暂无数据</span>
      </div>
    </div>

    <el-dialog v-model="addCaseDialog.visible" title="新建案例" width="50%">
      <el-form
        ref="addCaseFormRef"
        :model="addCaseDialog.formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="文件" prop="file">
          <el-upload
            ref="htmlUploadRef"
            :auto-upload="false"
            :before-upload="beforeHtmlUpload"
            :on-change="handleHtmlFileChange"
            :on-remove="handleHtmlFileRemove"
            :limit="1"
            :on-exceed="handleHtmlExceed"
            accept=".html,.htm"
          >
            <el-button type="primary" plain class="mr-4">
              <Icon>
                <CloudUpload />
              </Icon>
              上传文件
            </el-button>
            <div class="el-upload__tip">只能上传HTML文件，且不超过5MB</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :on-change="handlePictureChange"
            :on-preview="handleImagePreview"
            :on-remove="handlePictureRemove"
            list-type="picture-card"
            :limit="1"
            :on-exceed="handleExceed"
            accept="image/*"
          >
            <Icon size="30"><Add /></Icon>
            <template #tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件名称" prop="name">
          <el-input v-model="addCaseDialog.formData.name" />
        </el-form-item>
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="addCaseDialog.formData.title" />
        </el-form-item>
        <el-form-item label="知识要点" prop="knowledgePoint">
          <el-input v-model="addCaseDialog.formData.knowledgePoint" />
        </el-form-item>
        <el-form-item label="课程大纲" prop="outline">
          <el-input v-model="addCaseDialog.formData.outline" />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="addCaseDialog.formData.tags"
            placeholder="请选择标签"
            value-key="id"
            clearable
          
          >
            <el-option v-for="(item, k) in tagList" :key="k" :label="item.name" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div>
          <el-button type="primary" @click="handleSumbitCase">确定</el-button>
          <el-button @click="close">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" :before-close="dialogVisible = false">
      <img class="w-full" :src="dialogImageUrl" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { uploadFile, getTagList, uploadCase, getCaseList, deleteCase } from '@/api/caseApi'
  import { getFileResource } from '@/api/plan'

  import { Add, Delete, CloudUpload } from '@vicons/carbon'
  import {cloneDeep} from 'lodash'

  const filterText = ref('')

  const filterCaseList = computed(() => {
    return caseList.value.filter(item => {
      let f =
        item.title.includes(filterText.value) || item.knowledgePoint.includes(filterText.value)
      return f
    })
  })

  const caseList = ref([])

  const handleCaseClick = (id: number) => {
    // 处理案例点击事件，跳转到详情页
    console.log('点击案例:', id)
  }

  const handleDelete = (caseItem: any) => {
    ElMessageBox.confirm(`确定要删除该案例 [ ${caseItem.title} ] 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // 从案例列表中删除该案例
        deleteCase(caseItem.id).then(res => {
          if (res.state == 200) {
            initCaseList()
          }
        })
      })
      .catch(() => {})
  }

  const addCaseFormRef = ref(null)
  const htmlUploadRef = ref(null)
  const uploadRef = ref(null)

  const handleSumbitCase = () => {
    addCaseFormRef.value.validate(valid => {
      if (valid) {
        let req = cloneDeep(addCaseDialog.value.formData)
        req.tags = [ req.tags ]
        uploadCase(req).then(res => {
          if (res.state == 200) {
            close()
            ElMessage.success('上传成功')
            initCaseList()
          }
        })
      }
    })
  }

  const handleAdd = () => {
    addCaseDialog.value.visible = true
    addCaseFormRef.value.clearValidate()
  }

  const close = () => {
    addCaseFormRef.value.clearValidate()
    setDeafaultFormData()
    addCaseDialog.value.visible = false
  }

  const addCaseDialog = ref({
    visible: false,
    formData: {
      file: null,
      cover: null,
      title: '',
      name: '',
      knowledgePoint: '',
      outline: '',
      instruction: '',
      html: '',
      tags: []
    }
  })

  const setDeafaultFormData = () => {
    htmlUploadRef.value.clearFiles()
    uploadRef.value.clearFiles()
    addCaseDialog.value.formData = {
      file: null,
      cover: null,
      title: '',
      name: '',
      knowledgePoint: '',
      outline: '',
      instruction: '',
      html: '',
      tags: []
    }
  }

  const rules = ref({
    file: [{ required: true, message: '请上传文件', trigger: 'change' }],
    cover: [{ required: true, message: '请上传封面', trigger: 'change' }],
    title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
    name: [{ required: true, message: '请输入文件名称', trigger: 'blur' }],
    knowledgePoint: [{ required: true, message: '请输入知识要点', trigger: 'blur' }],
    tags: [{ required: true, message: '请选择标签', trigger: 'change' }]
  })

  // HTML文件上传前验证
  const beforeHtmlUpload = file => {
    const isHtml =
      file.type === 'text/html' ||
      file.name.toLowerCase().endsWith('.html') ||
      file.name.toLowerCase().endsWith('.htm')
    const isLt5M = file.size / 1024 / 1024 < 5

    if (!isHtml) {
      ElMessage.error('只能上传HTML文件!')
      return false
    }
    if (!isLt5M) {
      ElMessage.error('上传HTML文件大小不能超过 5MB!')
      return false
    }
    return false // 阻止自动上传，手动处理
  }

  // HTML文件变化处理
  const handleHtmlFileChange = async (file, fileList) => {
    if (file.status === 'ready') {
      uploadFileToServer(file)
    }
  }

  const readText = file => {
    const reader = new FileReader()
    reader.onload = e => {
      const htmlContent = e.target.result
      addCaseDialog.value.formData.html = htmlContent
      addCaseDialog.value.formData.name = file.name.split('.')[0]
    }

    reader.onerror = () => {
      console.error('HTML文件读取失败!')
    }

    reader.readAsText(file.raw, 'UTF-8')
  }

  const uploadFileToServer = async file => {
    const formData = new FormData()
    formData.append('file', file.raw)

    try {
      const res = await uploadFile(formData)
      if (res.state === 200) {
        addCaseDialog.value.formData.file = res.data.id
        readText(file)
      } else {
        ElMessage.error('文件上传失败')
      }
    } catch (error) {}
  }

  // HTML文件移除处理
  const handleHtmlFileRemove = (file, fileList) => {
    addCaseDialog.value.formData.file = null
    addCaseDialog.value.formData.html = ''
  }

  // HTML文件数量超限处理
  const handleHtmlExceed = (files, fileList) => {
    ElMessage.warning('最多只能上传1个HTML文件!')
  }

  // 上传图片
  const beforeUpload = file => {
    console.log(file)
    const isImage = file.type.startsWith('image/')
    const limitNum = 2
    const isLimit = file.size / 1024 / 1024 < limitNum

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLimit) {
      ElMessage.error(`上传图片大小不能超过 ${limitNum}MB!`)
      return false
    }
    return false
  }

  // 上传成功回调
  const handlePictureChange = (file, fileList) => {
    if (file.status === 'ready') {
      let formData = new FormData()
      formData.append('file', file.raw)

      dialogImageUrl.value = URL.createObjectURL(file.raw)

      uploadFile(formData).then(res => {
        if (res.state === 200) {
          addCaseDialog.value.formData.cover = res.data.id
        }
      })
    }
  }

  const handlePictureRemove = (file, fileList) => {
    addCaseDialog.value.formData.cover = null
    dialogImageUrl.value = null
  }

  // 超出文件数量限制
  const handleExceed = (files, fileList) => {
    ElMessage.warning('最多只能上传1张图片!')
  }

  const dialogVisible = ref(false)
  const dialogImageUrl = ref(null)

  // 图片预览处理
  const handleImagePreview = file => {
    console.log(file)
    dialogVisible.value = true
  }

  const tagList = ref([])

  const initTagList = () => {
    getTagList().then(res => {
      if (res.state == 200) {
        tagList.value = res.data
      }
    })
  }

  initTagList()
  
  let url = ref({
    map: {}
  })

  const initCaseList = () => {
    filterText.value = ''

    getCaseList().then(res => {
      if (res.state == 200) {
        let list = res.data
        caseList.value = list
        list.forEach(item =>{
          url.value.map[item.cover.filename] = null
        })
        initCaseItemPngUrl()
      }
    })
  }
  
  initCaseList()
  
  const initCaseItemPngUrl = async ()=>{
    for(let key in url.value.map){
      if(url.value.map[key] == null){
        url.value.map[key] = await getFile(key)
      }
    }
  }
  
  // 获取文件Blob
  const getFile = async fileName => {
    let res = await getFileResource(fileName)
    let blob = new Blob([res.data], { type: 'image/png' })
    return URL.createObjectURL(blob)
  }
  
  onBeforeUnmount(() => {
  // 释放所有创建的 URL 对象
    for(let key in url.value.map){
      if (url.value.map[key]) {
        URL.revokeObjectURL(url.value.map[key])
      }
    }
  })
</script>

<style lang="scss" scoped>
  $height: calc(100% - 48px);

  .tools-bar {
    border-bottom: 1px solid var(--border-color);
    @apply h-40px mb-8px pb-8px flex justify-between items-center;
  }

  .no-match {
    height: $height;
    color: var(--el-text-color-regular);
    @apply flex justify-center items-center;
  }

  .case-grid {
    max-height: $height;
    @apply overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
  }

  .case-card {
    height: 200px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--border-color);
    background-color: var(--my-card-bg);
    padding: 10px;
    @apply rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden;

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

    // .case-card:hover & {
    //   @apply scale-110;
    // }
  }

  .case-content {
    @apply mt-2 h-60px flex flex-col justify-between items-start;
  }

  .case-title {
    color: var(--el-text-color-regular);
    @apply w-0 flex-1 text-sm font-bold overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1;
  }

  .case-description {
    color: var(--el-text-color-secondary);
    @apply inline-block w-0 flex-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1 leading-relaxed;
  }
</style>
