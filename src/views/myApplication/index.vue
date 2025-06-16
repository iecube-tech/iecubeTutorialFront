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
        <el-table-column prop="parentGroup" label="父组织" />
        <el-table-column prop="subGroup" label="子组织" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="text-red-400 font-bold">{{ row.amount.toLocaleString() }} RMB</span>
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
            <span class="text-red-400 font-bold">{{ currentRow.amount.toLocaleString() }}RMB</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ currentRow.applicant || '无'}}
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

  const tableData = ref([
    {
      id: 1,
      applicationNo: 'APP202401001',
      parentGroup: '总公司',
      subGroup: '华北分公司',
      amount: 150000,
      status: 'approved',
      submitTime: '2024-01-15 14:30:25',
      approver: '张经理'
    },
    {
      id: 2,
      applicationNo: 'APP202401002',
      parentGroup: '总公司',
      subGroup: '华南分公司',
      amount: 280000,
      status: 'pending',
      submitTime: '2024-01-16 09:15:42',
      approver: '李总监'
    },
    {
      id: 3,
      applicationNo: 'APP202401003',
      parentGroup: '华北分公司',
      subGroup: '北京办事处',
      amount: 95000,
      status: 'rejected',
      submitTime: '2024-01-17 16:22:18',
      approver: '王主管'
    },
    {
      id: 4,
      applicationNo: 'APP202401004',
      parentGroup: '华南分公司',
      subGroup: '广州办事处',
      amount: 320000,
      status: 'approved',
      submitTime: '2024-01-18 11:45:33',
      approver: '陈总'
    },
    {
      id: 5,
      applicationNo: 'APP202401005',
      parentGroup: '总公司',
      subGroup: '华东分公司',
      amount: 180000,
      status: 'pending',
      submitTime: '2024-01-19 13:20:07',
      approver: '刘经理'
    },
    {
      id: 6,
      applicationNo: 'APP202401006',
      parentGroup: '华东分公司',
      subGroup: '上海办事处',
      amount: 210000,
      status: 'approved',
      submitTime: '2024-01-20 10:35:51',
      approver: '赵主任'
    }
  ])
  
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
