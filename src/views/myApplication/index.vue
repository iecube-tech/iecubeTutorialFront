<template>
  <div class="app-container">
    <div class="mb-4">
      <div class="flex justify-between items-start gap-4">
        <el-button type="primary" icon="Plus" @click="openRechargeDialog">申请积分充值</el-button>
        <div class="flex flex-row gap-4 w-[220px]">
          <el-select v-model="filterForm.status" placeholder="状态筛选" clearable>
            <el-option
              v-for="status in applyStatus"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
         <!--  <el-input
            v-model="filterForm.text"
            placeholder="搜索内容"
            clearable
            suffix-icon="Search"
          /> -->
        </div>
      </div>
    </div>

    <div>
      <el-table :data="filteredTableData" align="center">
        <el-table-column prop="id" label="申请编号" width="100" />
        <el-table-column prop="approvalType" label="审批类型" align="center">
          <template #default="{ row }">
            <el-tag :type="getApplyTypeZn(row.approvalType).type">
              {{ getApplyTypeZn(row.approvalType).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ moment(row.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="getApplyStatusZn(row.status).type">
              {{ getApplyStatusZn(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approverPhone" label="审批人">
          <template #default="{ row }">
            {{ approverName(row.approverPhone) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="审批意见">
          <template #default="{ row }">
            {{getRemark(row)}}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link icon="View" @click="handleShowDetail(row)">
              查看
            </el-button>
            <!-- <el-button type="primary" link icon="Delete" @click="handleDelete(row)">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>

    <applyDetailDialog ref="applyDetailDialogRef" :appoverList="appoverList"/>
    <rechangeDialog ref="rechangeDialogRef" @refresh="initTableData" />
  </div>
</template>

<script setup lang="ts">
  import moment from 'moment'
  import { getMyApplies } from '@/api/apply'
  import { applyStatus, getApplyTypeZn, getApplyStatusZn } from '@/utils/cnMap'
  import { getRemark } from '@/utils/applyFuns'

  import rechangeDialog from './rechangeDialog.vue'
  import applyDetailDialog from './applyDetailDialog.vue'
  
  import { getApproverList } from '@/api/dept'
  const filterForm = ref({
    status: '',
    text: ''
  })

  // 审批人列表
  const appoverList = ref([])
  function initAppoverList() {
    getApproverList().then(res => {
      if (res.state == 200) {
        appoverList.value = res.data || []
      }
    })
  }

  initAppoverList()

  const approverName = phone => {
    let name = appoverList.value.find(item => item.phone == phone)
    return name ? name.name : phone
  }
  
  const tableData = ref([])

  const initTableData = () => {
    getMyApplies().then(res => {
      if (res.state == 200) {
        let tmp = res.data || []
        tmp.forEach(item => {
          let contentJson = JSON.parse(item.content)
          item = Object.assign(item, contentJson)
        })
        tableData.value = tmp
        // console.log(tmp)
      }
    })
  }

  initTableData()
  
    // 计算属性
  const filteredTableData = computed(() => {
    let data = tableData.value
    
    if (filterForm.value.status) {
      data = data.filter(item => item.status === filterForm.value.status)
    }

    return data
  })
  
  const applyDetailDialogRef = ref(null)
  function handleShowDetail(row) {
    applyDetailDialogRef.value.open(row)
  }

  function handleDelete(row) {
    console.log('删除', row)
  }

  const rechangeDialogRef = ref(null)

  const openRechargeDialog = () => {
    rechangeDialogRef.value.open()
  }
</script>

<style lang="scss" scoped>
  :deep(.el-tag){
    width: 80px
  }
</style>
