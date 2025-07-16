<template>
  <div class="app-container">
    <div class="wh-full px-10px">
      <div class="tools-bar">
        <div>
          
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
            <img :src="`/resource/${caseItem.cover.filename}`" alt="案例图片" class="case-img" />
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
      <div v-if="filterCaseList.length === 0" class="no-match">
        <span>暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getTagList, getCaseList } from '@/api/caseApi'

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

  /* const tagList = ref([])

  const initTagList = () => {
    getTagList().then(res => {
      if (res.state == 200) {
        tagList.value = res.data
      }
    })
  }

  initTagList() */

  const initCaseList = () => {
    filterText.value = ''

    getCaseList().then(res => {
      if (res.state == 200) {
        caseList.value = res.data
      }
    })
  }

  initCaseList()
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
