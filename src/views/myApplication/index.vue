<template>
  <div class="app-container">
    <div class="mb-4">
      <div class="flex justify-between items-start gap-4">
        <el-button type="primary" icon="Plus" @click="openRechargeDialog">申请积分充值</el-button>
        <div class="flex flex-row gap-4 w-[400px]">
          <el-select v-model="searchForm.statsus" placeholder="状态筛选" clearable>
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
          <el-input
            v-model="searchForm.text"
            placeholder="搜索内容"
            clearable
            suffix-icon="Search"
          />
        </div>
      </div>
    </div>

    <div>
      <el-table :data="tableData">
        <el-table-column prop="id" label="申请编号" />
        <el-table-column prop="approvalType" label="审批类型" >
          <template #default={row}>
            <el-tag :type="getApplyTypeZn(row.approvalType).type">{{getApplyTypeZn(row.approvalType).label}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parentGroup" label="父组织" />
        <el-table-column prop="subGroup" label="子组织" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <!-- <span class="text-red-400 font-bold">{{ row.amount.toLocaleString() }} RMB</span> -->
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="approver" label="审批人" />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailDialogVisible" title="审批详情" width="60%" destroy-on-close>
      <div class="detail-content" v-if="currentRow">
        <el-descriptions :column="2" border label-width="120px">
          <el-descriptions-item label="申请编号">
            {{ currentRow.applicationNo }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ currentRow.submitTime }}
          </el-descriptions-item>
          <el-descriptions-item label="申请金额">
            <!-- <span class="text-red-400 font-bold">{{ currentRow.amount.toLocaleString() }}RMB</span> -->
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ currentRow.applicant || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="父组织">
            {{ currentRow.parentOrg }}
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(currentRow.status)">
              {{ getStatusLabel(currentRow.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="子组织">
            {{ currentRow.childOrg }}
          </el-descriptions-item>

          <el-descriptions-item label="申请理由">
            {{ currentRow.reason || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <rechangeDialog ref="rechangeDialogRef" />
  </div>
</template>

<script setup lang="ts">
  import { getMyApplies } from '@/api/apply'
  import {getApplyTypeZn} from '@/utils/cnMap'

  import rechangeDialog from './rechangeDialog.vue'
  const searchForm = reactive({
    statsus: '',
    text: ''
  })

  const statusOptions = ref([
    { label: '已批准', value: 'approved', type: 'success' },
    { label: '待批准', value: 'pending', type: 'info' },
    { label: '已拒绝', value: 'rejected', type: 'danger' }
  ])

  const getStatusLabel = status => {
    const item = statusOptions.value.find(item => item.value === status)
    return item ? item.label : status
  }

  const getStatusType = status => {
    const item = statusOptions.value.find(item => item.value === status)
    return item ? item.type : status
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
      }
    })
  }

  initTableData()

  const detailDialogVisible = ref(false)
  const currentRow = ref(null)

  function handleView(row) {
    currentRow.value = row
    detailDialogVisible.value = true
  }

  function handleDelete(row) {
    console.log('删除', row)
  }

  const rechangeDialogRef = ref(null)

  const openRechargeDialog = () => {
    rechangeDialogRef.value.open()
  }
</script>

<style lang="scss" scoped></style>
