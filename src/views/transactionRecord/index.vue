<template>
  <div class="transcation-record-container select-none">
    <div class="flex justify-between align-center mb-8">
      <span class="text-bold font-bold text-2xl">消费明细</span>
    </div>

    <el-row :gutter="20" class="mb-8">
      <el-col :span="6">
        <div class="stat-card currentUsers">
          <div class="">
            <Icon :size="cardIconSize">
              <User />
            </Icon>
          </div>
          <div class="ml-4">
            <countTo class="stat-number" :endVal="stats.currentUsers" :duration="1500"></countTo>
            <div class="stat-label">当前使用人数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card balance">
          <div class="">
            <Icon :size="cardIconSize">
              <Wallet />
            </Icon>
          </div>
          <div class="ml-4">
            <countTo class="stat-number" :endVal="stats.balance" :duration="1500"></countTo>
            <div class="stat-label">账户余额</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card consumed">
          <div class="">
            <Icon :size="cardIconSize">
              <Purchase />
            </Icon>
          </div>
          <div class="ml-4">
            <countTo class="stat-number" :endVal="stats.consumed" :duration="1500"></countTo>
            <div class="stat-label">消耗额度</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card expiring">
          <div class="">
            <Icon :size="cardIconSize">
              <Time />
            </Icon>
          </div>
          <div class="ml-4">
            <span class="stat-number">{{ moment(stats.expiring).format('YYYY-MM-DD') }}</span>
            <div class="stat-label">积分过期时间</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="monthly-consumption">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">月度消费记录</span>
          </div>
        </template>

        <el-table :data="monthlyData">
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="px-8 py-4">
                <el-table :data="row.details" size="small">
                  <el-table-column prop="createTime" label="日期" width="180">
                    <template #default="{ row: detail }">
                      <span>{{ moment(detail.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="项目">
                    <template #default="{ row: detail }">
                      <span v-if="isComsumeType(detail.type)">
                        {{ `${detail.projectTitle} - ${detail.projectKnowledgePoint}` }} 
                        <span>({{ cnType(detail.type) }})</span>
                      </span>
                      <span v-else-if="detail.type == 'RECHARGE'">充值</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="points" label="积分" width="180" align="right">
                     <template #default="{ row: detail }">
                      <span v-if="isComsumeType(detail.type)">
                        <span class="text-red-500 font-medium">-{{ detail.points }}</span>
                      </span>
                      <span
                        v-else-if="detail.type == 'RECHARGE'"
                        class="text-green-500 font-medium"
                      >
                        +{{ detail.points }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="month" label="月份" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { User, Wallet, Purchase, Time, Renew } from '@vicons/carbon'
  import { Icon } from '@vicons/utils'
  import { CountTo } from 'vue3-count-to'
  import moment from 'moment'

  import { getAmountDetail, getConsumedDetail, getSecondGroupBill } from '@/api/dept'
  import { getSecondUser } from '@/api/user'

  const router = useRouter()
  const route = useRoute()

  const oSecId = route.params.id

  // 统计数据
  const stats = ref({
    currentUsers: 0,
    balance: 0,
    consumed: 0,
    expiring: 0
  })

  const cardIconSize = ref(28)
  // 月度数据
  const monthlyData = ref([])

  const initUserColleague = async () => {
    getSecondUser(oSecId).then(res => {
      if (res.state === 200) {
        let users = res.data || []
        stats.value.currentUsers = users.length
      }
    })
  }

  const initAmount = async () => {
    getAmountDetail(oSecId).then(res => {
      if (res.state == 200) {
        stats.value.balance = res.data.amount
        stats.value.expiring = res.data.expireDate
      }
    })
  }

  const initConsumed = async () => {
    getConsumedDetail(oSecId).then(res => {
      if (res.state == 200) {
        stats.value.consumed = res.data.consumeTotal
      }
    })
  }

  const initGroupBill = async () => {
    getSecondGroupBill(oSecId).then(res => {
      if (res.state == 200) {
        let records = res.data || []
        initMonthlyData(records)
      }
    })
  }

  const initMonthlyData = obj => {
    let yearData = obj.yearlyData
    let year_keys = Object.keys(yearData)
    year_keys.sort((a, b) => b - a)
    let res = []
    year_keys.forEach(year => {
      let yearItem = yearData[year]
      let month_keys = Object.keys(yearItem)
      month_keys.sort((a, b) => b - a)
      month_keys.forEach(month => {
        res.push({
          month: `${year}-${month}`,
          details: yearItem[month]
        })
      })
    })

    monthlyData.value = res
  }
  
  const isComsumeType = type => {
    return ['CONSUME', 'CONSUME_OUTLINE', 'CONSUME_GEN', 'CONSUME_EDIT'].includes(type)
  }
  
  const cnType = type => {
    switch (type) {
      case 'CONSUME':
        return '消费'
      case 'CONSUME_OUTLINE':
        return '大纲消费'
      case 'CONSUME_GEN':
        return '生成消费'
      case 'CONSUME_EDIT':
        return '编辑消费'
      default:
        return ''
    }
  }

  onMounted(() => {
    initUserColleague()
    initAmount()
    initConsumed()
    initGroupBill()
  })
</script>

<style lang="scss" scoped>
  .transcation-record-container {
    // height: calc(100vh - 50px);
    // overflow-y: auto;
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

  .stat-card.currentUsers {
    background-color: #ecf5ff;
    border: 0.5px solid #409eff;
    color: #409eff;
  }

  .stat-card.balance {
    background-color: #f0f9eb;
    border: 0.5px solid #67c23a;
    color: #67c23a;
  }

  .stat-card.consumed {
    background-color: #d3d5f5;
    border: 0.5px solid #3f48cc;
    color: #3f48cc;
  }

  .stat-card.expiring {
    background-color: #fdf6ec;
    border: 0.5px solid #e6a23c;
    color: #e6a23c;
  }

  /* 深色模式透明渐变 */
  @media (prefers-color-scheme: dark) {
    .stat-card.currentUsers {
      background-color: #409eff50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.balance {
      background-color: #67c23a50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.consumed {
      background-color: #3f48cc50;
      color: rgb(255, 255, 255, 0.9);
    }

    .stat-card.expiring {
      background-color: #e6a23c50;
      color: rgb(255, 255, 255, 0.9);
    }
  }
</style>
