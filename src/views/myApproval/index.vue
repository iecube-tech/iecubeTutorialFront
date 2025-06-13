<template>
  <div class="app-container approval-container">
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="stat-card pending">
        <div class="">
          <Icon :size="cardIconSize">
            <Time />
          </Icon>
        </div>
        <div class="ml-4">
          <countTo class="stat-number" :endVal="statistics.pending" :duration="1000"></countTo>
          <div class="stat-label">待审批</div>
        </div>
      </div>

      <div class="stat-card approved">
        <div class="">
          <Icon :size="cardIconSize">
            <Checkmark />
          </Icon>
        </div>
        <div class="ml-4">
          <countTo class="stat-number" :endVal="statistics.approved" :duration="1000"></countTo>
          <div class="stat-label">已通过</div>
        </div>
      </div>

      <div class="stat-card rejected">
        <div class="">
          <Icon :size="cardIconSize">
            <WarningAlt />
          </Icon>
        </div>
        <div class="ml-4">
          <countTo class="stat-number" :endVal="statistics.rejected" :duration="1000"></countTo>
          <div class="stat-label">已拒绝</div>
        </div>
      </div>
    </div>

    <el-form :model="filterForm" inline>
      <el-form-item label="申请编号" class="w-220px">
        <el-input v-model="filterForm.applicationNo" placeholder="请输入申请编号" clearable />
      </el-form-item>
      <el-form-item label="状态" class="w-220px">
        <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon>
            <Search />
          </el-icon>
          查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon>
            <Refresh />
          </el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div>
      <el-table :data="filteredTableData" class="mb-8" @selection-change="handleSelectionChange">
        <el-table-column prop="applicationNo" label="申请编号" width="180" />
        <el-table-column prop="parentOrg" label="父组织" width="150" />
        <el-table-column prop="childOrg" label="子组织" width="150" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="text-red-400 font-bold">{{ row.amount.toLocaleString() }} RMB</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusConfig(row.status).type" size="small">
              {{ getStatusConfig(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="applicant" label="申请人" width="120" />
        <el-table-column prop="remarks" label="备注" />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              link
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="danger"
              link
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 审批详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="审批详情" width="60%" destroy-on-close>
      <div class="detail-content" v-if="currentRow">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请编号">
            {{ currentRow.applicationNo }}
          </el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ currentRow.applicant }}
          </el-descriptions-item>
          <el-descriptions-item label="父组织">
            {{ currentRow.parentOrg }}
          </el-descriptions-item>
          <el-descriptions-item label="子组织">
            {{ currentRow.childOrg }}
          </el-descriptions-item>
          <el-descriptions-item label="申请金额">
            {{ currentRow.amount.toLocaleString() }}RMB
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusConfig(currentRow.status).type">
              {{ getStatusConfig(currentRow.status).label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ currentRow.submitTime }}
          </el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">
            {{ currentRow.reason || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 审批操作区域 -->
        <div class="approval-actions" v-if="currentRow.status === 'pending'">
          <el-divider content-position="left">审批操作</el-divider>
          <el-form :model="approvalForm" label-width="80px">
            <el-form-item label="审批意见">
              <el-input
                v-model="approvalForm.comment"
                type="textarea"
                :rows="4"
                placeholder="请输入审批意见"
              />
            </el-form-item>
          </el-form>
          <div class="action-buttons">
            <el-button type="success" @click="handleConfirmApproval('approved')">
              通过申请
            </el-button>
            <el-button type="danger" @click="handleConfirmApproval('rejected')">拒绝申请</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量审批确认弹窗 -->
    <el-dialog
      v-model="batchDialogVisible"
      :title="batchAction === 'approve' ? '批量通过' : '批量拒绝'"
      width="40%"
    >
      <div class="batch-confirm">
        <p>
          确定要{{ batchAction === 'approve' ? '通过' : '拒绝' }}以下
          {{ selectedRows.length }} 个申请吗？
        </p>
        <ul class="selected-list">
          <li v-for="row in selectedRows" :key="row.id">
            {{ row.applicationNo }} - {{ row.applicant }}
          </li>
        </ul>
        <el-form :model="batchApprovalForm" label-width="80px">
          <el-form-item label="批量意见">
            <el-input
              v-model="batchApprovalForm.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入批量审批意见"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button
          :type="batchAction === 'approve' ? 'success' : 'danger'"
          @click="handleConfirmBatchApproval"
        >
          确定{{ batchAction === 'approve' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { Time , Checkmark, WarningAlt} from '@vicons/carbon'
  import { CountTo } from 'vue3-count-to'
  const cardIconSize = ref(24);

  // 状态配置
  const statusOptions = [
    { label: '已批准', value: 'approved', type: 'success' },
    { label: '待批准', value: 'pending', type: 'warning' },
    { label: '已拒绝', value: 'rejected', type: 'danger' }
  ]

  // 响应式数据
  const loading = ref(false)
  const tableData = ref([])
  const selectedRows = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  // 筛选表单
  const filterForm = ref({
    applicationNo: '',
    status: '',
    dateRange: []
  })

  // 统计数据
  const statistics = ref({
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // 弹窗相关
  const detailDialogVisible = ref(false)
  const batchDialogVisible = ref(false)
  const currentRow = ref(null)
  const batchAction = ref('')

  // 审批表单
  const approvalForm = ref({
    comment: ''
  })

  const batchApprovalForm = ref({
    comment: ''
  })

  // 计算属性
  const filteredTableData = computed(() => {
    let data = tableData.value

    // 根据筛选条件过滤数据
    if (filterForm.value.applicationNo) {
      data = data.filter(item =>
        item.applicationNo.toLowerCase().includes(filterForm.value.applicationNo.toLowerCase())
      )
    }

    if (filterForm.value.status) {
      data = data.filter(item => item.status === filterForm.value.status)
    }

    if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
      const [startDate, endDate] = filterForm.value.dateRange
      data = data.filter(item => {
        const submitDate = item.submitTime.split(' ')[0]
        return submitDate >= startDate && submitDate <= endDate
      })
    }

    return data
  })

  const canBatchApprove = computed(() => {
    return selectedRows.value.every(row => row.status === 'pending')
  })

  const canBatchReject = computed(() => {
    return selectedRows.value.every(row => row.status === 'pending')
  })

  // 方法
  const getStatusConfig = statusValue => {
    return (
      statusOptions.find(option => option.value === statusValue) || { label: '未知', type: 'info' }
    )
  }

  const loadData = async () => {
    loading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      tableData.value = [
        {
          id: 1,
          applicationNo: 'APP202401001',
          parentOrg: '总公司',
          childOrg: '华北分公司',
          amount: 150000,
          status: 'approved',
          submitTime: '2024-01-15 14:30:25',
          applicant: '李小明',
          reason: '需要资金支持华北分公司的市场扩张计划'
        },
        {
          id: 2,
          applicationNo: 'APP202401002',
          parentOrg: '总公司',
          childOrg: '华南分公司',
          amount: 280000,
          status: 'pending',
          submitTime: '2024-01-16 09:15:42',
          applicant: '王小红',
          reason: '华南分公司设备升级改造项目资金申请'
        },
        {
          id: 3,
          applicationNo: 'APP202401003',
          parentOrg: '华北分公司',
          childOrg: '北京办事处',
          amount: 95000,
          status: 'rejected',
          submitTime: '2024-01-17 16:22:18',
          applicant: '张三',
          reason: '办公室装修费用申请'
        },
        {
          id: 4,
          applicationNo: 'APP202401004',
          parentOrg: '华南分公司',
          childOrg: '广州办事处',
          amount: 320000,
          status: 'pending',
          submitTime: '2024-01-18 11:45:33',
          applicant: '李四',
          reason: '广州办事处新业务拓展资金需求'
        },
        {
          id: 5,
          applicationNo: 'APP202401005',
          parentOrg: '总公司',
          childOrg: '华东分公司',
          amount: 180000,
          status: 'pending',
          submitTime: '2024-01-19 13:20:07',
          applicant: '刘经理',
          reason: '华东分公司人员培训和技术升级费用'
        },
        {
          id: 6,
          applicationNo: 'APP202401006',
          parentOrg: '华东分公司',
          childOrg: '上海办事处',
          amount: 210000,
          status: 'approved',
          submitTime: '2024-01-20 10:35:51',
          applicant: '赵主任',
          reason: '上海办事处市场推广活动经费'
        },
        {
          id: 7,
          applicationNo: 'APP202401007',
          parentOrg: '总公司',
          childOrg: '西南分公司',
          amount: 160000,
          status: 'pending',
          submitTime: '2024-01-21 15:22:33',
          applicant: '陈总监',
          reason: '西南分公司办公设备采购申请'
        },
        {
          id: 8,
          applicationNo: 'APP202401008',
          parentOrg: '华北分公司',
          childOrg: '天津办事处',
          amount: 85000,
          status: 'pending',
          submitTime: '2024-01-22 09:45:12',
          applicant: '孙经理',
          reason: '天津办事处客户接待和商务活动费用'
        },
        {
          id: 7,
          applicationNo: 'APP202401007',
          parentOrg: '总公司',
          childOrg: '西南分公司',
          amount: 160000,
          status: 'pending',
          submitTime: '2024-01-21 15:22:33',
          applicant: '陈总监',
          reason: '西南分公司办公设备采购申请'
        },
        {
          id: 8,
          applicationNo: 'APP202401008',
          parentOrg: '华北分公司',
          childOrg: '天津办事处',
          amount: 85000,
          status: 'pending',
          submitTime: '2024-01-22 09:45:12',
          applicant: '孙经理',
          reason: '天津办事处客户接待和商务活动费用'
        }
      ]

      total.value = tableData.value.length
      calculateStatistics()
    } catch (error) {
      ElMessage.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }

  const calculateStatistics = () => {
    statistics.value = {
      pending: tableData.value.filter(item => item.status === 'pending').length,
      approved: tableData.value.filter(item => item.status === 'approved').length,
      rejected: tableData.value.filter(item => item.status === 'rejected').length
    }
  }

  const handleSearch = () => {
    currentPage.value = 1
    // 这里可以添加服务器端搜索逻辑
    ElMessage.success('查询完成')
  }

  const handleReset = () => {
    filterForm.value = {
      applicationNo: '',
      status: '',
      dateRange: []
    }
    currentPage.value = 1
    ElMessage.info('筛选条件已重置')
  }

  const handleSelectionChange = selection => {
    selectedRows.value = selection
  }

  const handleView = row => {
    currentRow.value = row
    approvalForm.value.comment = ''
    detailDialogVisible.value = true
  }

  const handleApprove = async row => {
    try {
      await ElMessageBox.confirm('确定要通过这个申请吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 模拟API调用
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 500))

      // 更新状态
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = 'approved'
        calculateStatistics()
      }

      ElMessage.success('审批通过')
    } catch {
      // 用户取消操作
    } finally {
      loading.value = false
    }
  }

  const handleReject = async row => {
    try {
      await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入拒绝理由'
      })

      // 模拟API调用
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 500))

      // 更新状态
      const index = tableData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        tableData.value[index].status = 'rejected'
        calculateStatistics()
      }

      ElMessage.success('已拒绝申请')
    } catch {
      // 用户取消操作或输入验证失败
    } finally {
      loading.value = false
    }
  }

  const handleConfirmApproval = async action => {
    if (!approvalForm.value.comment.trim()) {
      ElMessage.warning('请输入审批意见')
      return
    }

    try {
      loading.value = true
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))

      // 更新状态
      const index = tableData.value.findIndex(item => item.id === currentRow.value.id)
      if (index !== -1) {
        tableData.value[index].status = action
        calculateStatistics()
      }

      detailDialogVisible.value = false
      ElMessage.success(action === 'approved' ? '审批通过' : '已拒绝申请')
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  }

  const handleBatchApprove = () => {
    batchAction.value = 'approve'
    batchApprovalForm.value.comment = ''
    batchDialogVisible.value = true
  }

  const handleBatchReject = () => {
    batchAction.value = 'reject'
    batchApprovalForm.value.comment = ''
    batchDialogVisible.value = true
  }

  const handleConfirmBatchApproval = async () => {
    if (!batchApprovalForm.value.comment.trim()) {
      ElMessage.warning('请输入批量审批意见')
      return
    }

    try {
      loading.value = true
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newStatus = batchAction.value === 'approve' ? 'approved' : 'rejected'

      // 批量更新状态
      selectedRows.value.forEach(row => {
        const index = tableData.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          tableData.value[index].status = newStatus
        }
      })

      calculateStatistics()
      selectedRows.value = []
      batchDialogVisible.value = false

      ElMessage.success(`批量${batchAction.value === 'approve' ? '通过' : '拒绝'}成功`)
    } catch (error) {
      ElMessage.error('批量操作失败')
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = size => {
    pageSize.value = size
    currentPage.value = 1
  }

  const handleCurrentChange = page => {
    currentPage.value = page
  }

  // 生命周期
  onMounted(() => {
    loadData()
  })
</script>

<style scoped lang="scss">
  .approval-container {
    @apply flex flex-col h-full;
  }

  .stat-card {
    @apply flex items-center rounded-lg p-4 shadow-md h-[100px];

    &:hover {
      .stat-number {
        @apply text-3xl;
      }
    }
  }

  .stat-label {
    @apply text-sm font-medium;
  }

  .stat-number {
    @apply text-2xl font-semibold h-[40px] block;
  }

  .stat-card.pending {
    background-color: #ecf5ff;
    border: 0.5px solid #409eff;
    color: #409eff;
  }

  .stat-card.approved {
    background-color: #f0f9eb;
    border: 0.5px solid #67c23a;
    color: #67c23a;
  }

  .stat-card.rejected {
    background-color: #FEF0F0;
    border: 0.5px solid #F56C6C;
    color: #F56C6C;
  }

  .stat-card.expiring {
    background-color: #fdf6ec;
    border: 0.5px solid #e6a23c;
    color: #e6a23c;
  }

  /* 深色模式透明渐变 */
  @media (prefers-color-scheme: dark) {
    .stat-card.pending {
      background-color: #409eff50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.approved {
      background-color: #67c23a50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.rejected {
      background-color: #F56C6C50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.expiring {
      background-color: #e6a23c50;
      color: rgb(255, 255, 255, 0.9);
    }
  }
</style>
