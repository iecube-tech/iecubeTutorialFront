<!-- suffix-icon="Search"-->
<template>
  <div class="app-container">
    <div class="wh-full px-10px">
      <div class="tools-bar">
        <div></div>
        <div>
          <span class="el-form-item__label mr-1" style="font-size: 14px; color: var(--el-text-color-regular)">课程名称</span>
          <el-input
            v-model="SearchForm.title"
            class="w-200px mr-4"
            placeholder="请输入课程名称"
            clearable
          ></el-input>
          <span class="el-form-item__label mr-1" style="font-size: 14px; color: var(--el-text-color-regular)">知识要点</span>
          <el-input
            v-model="SearchForm.knowledgePoint"
            class="w-200px mr-2"
            placeholder="请输入知识要点"
            clearable
          ></el-input>
          <el-button type="primary" icon="Search" title="搜索" @click="searchCaseList">搜索</el-button>
          <el-button type="primary" title="重置" @click="reset">重置</el-button>
        </div>
      </div>
      <div class="case-grid">
        <div
          v-for="caseItem in caseList"
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
            </div>
          </div>
        </div>
      </div>
      <div v-if="caseList.length === 0" class="no-match">
        <span>暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getTagList, getCaseList, findCase } from '@/api/caseApi'
  import { getFileResource } from '@/api/plan'
  import router from '@/router'
  
  const SearchForm = ref({
    title: '',
    knowledgePoint: ''
  })
  
  const setDeafaultSearch = () =>{
    SearchForm.value.title = ''
    SearchForm.value.knowledgePoint = ''
  }
  
  const reset = () =>{
    setDeafaultSearch()
    searchCaseList()
  }
  
  const searchCaseList = () => {
    if(SearchForm.value.title == '' && SearchForm.value.knowledgePoint == ''){
      initCaseList()
    } else {
      findCase(SearchForm.value).then(res => {
      if(res.state == 200){
          let list = res.data
          caseList.value = list
          list.forEach(item =>{
            setUrlMapKey(item.cover.filename)
          })
          initCaseItemPngUrl()
        }
      })
    }
  }

  const caseList = ref([])

  const handleCaseClick = (id: number) => {
    router.push({
      path: '/showDigitalPlan',
      query: {
        id: '', // 项目id 从案例进入时 id 为空
        caseId: id // 案例id
      }
    })
  }
  
  let url = ref({
    map: {}
  })

  const initCaseList = () => {
    setDeafaultSearch()

    getCaseList().then(res => {
      if (res.state == 200) {
        let list = res.data
        caseList.value = list
        list.forEach(item =>{
          // url.value.map[item.cover.filename] = null
          setUrlMapKey(item.cover.filename)
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
  
  const setUrlMapKey = (key) => {
    if(!url.value.map[key]){
      url.value.map[key] = null
    }
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
