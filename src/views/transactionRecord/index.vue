<template>
  <div class="transcation-record-container select-none">
    <!-- 标题 -->
    <div class="mb-4">
      <span class="text-bold font-bold text-2xl">消费明细</span>
    </div>

    <!-- 余额提醒 -->
    <div class="flex justify-between items-center mb-8">
      <div class="w-3/4">
        <el-alert type="error" :closable="false" show-icon>
          <template #title>
            <span>账号余额不足，请&nbsp;</span>
            <contact-us placement="top">
              <template #default>
                <span class="text-blue-500 cursor-pointer">联系我们</span>
              </template>
            </contact-us>
            <span>&nbsp;充值！</span>
          </template>
        </el-alert>
      </div>
      <contact-us placement="left">
        <template #default>
          <el-button type="primary">立即充值</el-button>
        </template>
      </contact-us>
    </div>

    <!-- 统计卡片 -->
    <div class="mb-8">
      <div class="grid grid-cols-4 gap-4">
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

        <div class="stat-card expiring">
          <div class="stat-icon-expiring">
            <Icon :size="cardIconSize">
              <Time />
            </Icon>
          </div>
          <div class="ml-4">
            <countTo class="stat-number" :endVal="stats.expiring" :duration="1500"></countTo>
            <div class="stat-label">即将过期积分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月度消费列表 -->
    <div class="monthly-consumption">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-lg font-semibold">月度消费记录</span>
            <el-button type="primary" size="small" @click="refreshData">
              <Icon class="mr-1">
                <Renew />
              </Icon>
              刷新
            </el-button>
          </div>
        </template>

        <el-table :data="monthlyData" v-loading="loading" @expand-change="handleExpandChange">
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="px-8 py-4">
                <h4 class="text-base font-semibold mb-3 text-gray-700">{{ row.month }} 消费明细</h4>
                <el-table :data="row.details" size="small">
                  <el-table-column prop="date" label="日期" width="120" />
                  <el-table-column prop="description" label="项目" />
                  <el-table-column prop="points" label="积分" width="120" align="right">
                    <template #default="{ row: detail }">
                      <span class="text-red-500 font-medium">-{{ detail.points }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="month" label="月份" />
          <el-table-column prop="consumed" label="月消耗积分" width="200" align="right">
            <template #default="{ row }">
              <span class="text-red-500 font-medium">{{ row.consumed.toLocaleString() }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { User, Wallet, Purchase, Time, Renew } from '@vicons/carbon'
  import { Icon } from '@vicons/utils'
  import { CountTo } from 'vue3-count-to'
  import { duration } from 'moment'

  const cardIconSize = ref(28)

  // 统计数据
  const stats = ref({
    currentUsers: 156,
    balance: 28500,
    consumed: 15200,
    expiring: 3200
  })

  // 加载状态
  const loading = ref(false)

  // 月度数据
  const monthlyData = ref([
    {
      month: '2024-12',
      quota: 10000,
      consumed: 3200,
      expiring: 800,
      remaining: 6800,
      details: [
        { date: '12-01', description: '生成教学计划', points: 50, type: '教案生成' },
        { date: '12-02', description: '课件制作', points: 30, type: '课件制作' },
        { date: '12-03', description: '题库生成', points: 40, type: '题库生成' },
        { date: '12-05', description: '教案优化', points: 25, type: '教案生成' }
      ]
    },
    {
      month: '2024-11',
      quota: 10000,
      consumed: 4800,
      expiring: 1200,
      remaining: 5200,
      details: [
        { date: '11-03', description: '批量生成课件', points: 120, type: '课件制作' },
        { date: '11-08', description: '教案个性化定制', points: 80, type: '教案生成' },
        { date: '11-15', description: '试题库扩充', points: 60, type: '题库生成' },
        { date: '11-22', description: '教学资源整理', points: 45, type: '资源管理' }
      ]
    },
    {
      month: '2024-10',
      quota: 10000,
      consumed: 7200,
      expiring: 1200,
      remaining: 2800,
      details: [
        { date: '10-05', description: '大批量教案生成', points: 200, type: '教案生成' },
        { date: '10-12', description: '多媒体课件制作', points: 150, type: '课件制作' },
        { date: '10-18', description: '考试题库建设', points: 100, type: '题库生成' },
        { date: '10-25', description: '教学评估报告', points: 80, type: '报告生成' }
      ]
    }
  ])

  // 处理展开变化
  const handleExpandChange = (row: any, expanded: boolean) => {
    if (expanded) {
      console.log(`展开 ${row.month} 的详细数据`)
    }
  }

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      教案生成: 'primary',
      课件制作: 'success',
      题库生成: 'warning',
      资源管理: 'info',
      报告生成: 'danger'
    }
    return colorMap[type] || 'info'
  }

  // 刷新数据
  const refreshData = () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      ElMessage.success('数据已刷新')
    }, 1000)
  }
</script>

<style lang="scss" scoped>
  .transcation-record-container {
    height: calc(100vh - 50px);
    overflow-y: auto;
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
