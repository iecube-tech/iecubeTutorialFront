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

    <div class="flex justify-between items-center mb-4">
      <div></div>
      <div  class="w220px">
        <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="item in applyStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <div>
      <el-table :data="filteredTableData" class="mb-8">
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
        <el-table-column prop="creator" label="申请人">
          <template #default="{ row }">
            {{ row.creator.name }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="审批意见">
          <template #default="{ row }">
            {{ getRemark(row) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="success"
              link
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
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

    <approveDialog ref="approveDialogRef" @refresh="initTableData" />
  </div>
</template>

<script setup>
  import moment from 'moment'
  import { Time, Checkmark, WarningAlt } from '@vicons/carbon'
  import { CountTo } from 'vue3-count-to'

  import { applyStatus, getApplyTypeZn, getApplyStatusZn } from '@/utils/cnMap'
  import { getRemark } from '@/utils/applyFuns'

  import { getMyApproves, pass, reject } from '@/api/apply'
  import approveDialog from './approveDialog.vue'
  const approveDialogRef = ref(null)

  const cardIconSize = ref(24)

  // 响应式数据
  const loading = ref(false)

  const tableData = ref([])
  const initTableData = () => {
    getMyApproves().then(res => {
      if (res.state == 200) {
        let tmp = res.data || []
        tmp.forEach(item => {
          let contentJson = JSON.parse(item.content)
          item = Object.assign(item, contentJson)
          
          if(item.status == 'PENDING'){
            statistics.value.pending++
          }else if(item.status == 'APPROVED'){
            statistics.value.approved++
          }else if(item.status == 'REJECTED'){
            statistics.value.rejected++
          }
          
        })
        tableData.value = tmp
        
        
        // console.log(tmp)
      }
    })
  }

  initTableData()

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

  // 计算属性
  const filteredTableData = computed(() => {
    let data = tableData.value

    // 根据筛选条件过滤数据
    // if (filterForm.value.applicationNo) {
    //   data = data.filter(item =>
    //     item.applicationNo.toLowerCase().includes(filterForm.value.applicationNo.toLowerCase())
    //   )
    // }

    if (filterForm.value.status) {
      data = data.filter(item => item.status === filterForm.value.status)
    }

    // if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
    //   const [startDate, endDate] = filterForm.value.dateRange
    //   data = data.filter(item => {
    //     const submitDate = item.submitTime.split(' ')[0]
    //     return submitDate >= startDate && submitDate <= endDate
    //   })
    // }

    return data
  })

  const handleSearch = () => {
    // currentPage.value = 1
    ElMessage.success('查询完成')
  }

  const handleReset = () => {
    filterForm.value = {
      applicationNo: '',
      status: '',
      dateRange: []
    }
    // currentPage.value = 1
    ElMessage.info('筛选条件已重置')
  }

  const handleView = row => {
    approveDialogRef.value.open(row)
  }

  const handleApprove = async row => {
    ElMessageBox.confirm('确定要通过这个申请吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      let req = {
        id: row.id,
        remark: '同意'
      }
      pass(req).then(res => {
        if (res.state == 200) {
          initTableData()
          ElMessage.success('审批通过')
        }
      })
    })
  }

  const handleReject = async row => {
    await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝理由'
    }).then(({ value }) => {
      let req = {
        id: row.id,
        remark: value
      }
      reject(req).then(res => {
        if (res.state == 200) {
          initTableData()
          ElMessage.success('审批拒绝')
        }
      })
    })
  }
</script>

<style scoped lang="scss">
  :deep(.el-tag) {
    width: 80px;
  }

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
    background-color: #fef0f0;
    border: 0.5px solid #f56c6c;
    color: #f56c6c;
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
      background-color: #f56c6c50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.expiring {
      background-color: #e6a23c50;
      color: rgb(255, 255, 255, 0.9);
    }
  }
</style>
