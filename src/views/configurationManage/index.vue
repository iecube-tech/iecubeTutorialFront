<template>
  <div class="app-container configurationContainer">
    <div class="subject-title text-bold">
      <Icon>
        <ArrowsHorizontal />
      </Icon>
      1 元 = X 积分
    </div>
    <el-input-number v-model="oneRmb2Points" class="config-item" :min="0.01"></el-input-number>
    <span>&nbsp;&nbsp;积分</span>

    <div class="subject-title text-bold">
      <Icon>
        <ArrowsHorizontal />
      </Icon>
      1 积分 = X Token
    </div>
    <el-input-number v-model="onePoint2Tokens" class="config-item" :min="1"></el-input-number>
    <span>&nbsp;&nbsp;个</span>

    <div class="subject-title text-bold">
      <Icon>
        <Calendar />
      </Icon>
      积分有效期
    </div>
    <el-input-number v-model="expireDays" class="config-item" :min="1"></el-input-number>
    <span>&nbsp;&nbsp;天</span>
    <div class="subject-title text-bold">
      <Icon>
        <UserAdmin />
      </Icon>
      审批人
    </div>
    <el-select v-model="approverUser" placeholder="请选择审批人" class="config-item">
      <el-option v-for="(item, k) in approvers" :key="k" :label="item.name" :value="item.phone" :disabled="currentUserPhone == item.phone"/>
    </el-select>

    <div>
      <el-button type="primary" class="w400px mt-4" @click="handleUpdate" :disabled="approverUser == ''">提交变更</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ArrowsHorizontal, Calendar } from '@vicons/carbon'
  import { UserAdmin } from '@vicons/carbon'
  import { Icon } from '@vicons/utils'
  import { getPriceUnits, getExpireDays, updateConfig } from '@/api/config'
  import { getApproverList } from '@/api/dept'
  import { useUserStore } from '@/store'
  
  const userStore = useUserStore()
  const userInfo = userStore.getUserInfo()
  const currentUserPhone = ref(userInfo.phone)

  const oneRmb2Points = ref(1)
  const onePoint2Tokens = ref(1)
  const expireDays = ref(1)
  const approverUser = ref('')
  const approvers = ref([])

  function init() {
    getPriceUnits().then(res => {
      if (res.state == 200) {
        res.data.forEach(item => {
          if (item.type == 'RMBTOPOINTS') {
            oneRmb2Points.value = item.target
          }

          if (item.type == 'POINTTOTOKENS') {
            onePoint2Tokens.value = item.target
          }
        })
      }
    })

    getExpireDays().then(res => {
      if (res.state == 200) {
        expireDays.value = res.data
      }
    })

    getApproverList().then(res => {
      if (res.state == 200) {
        approvers.value = res.data || []
      }
    })
  }

  init()

  const handleUpdate = () => {
      let req = {
        howPointsPerRMB: oneRmb2Points.value,
        howTokensPerPoint: onePoint2Tokens.value,
        expireDays: expireDays.value,
        approver: approverUser.value
      }
      updateConfig(req).then(res => {
        if (res.state == 200) {
          ElMessage.success('提交变更配置成功！')
        }
      })
  }
</script>

<style lang="scss" scoped>
  .subject-title {
    @apply flex items-center mt-6 mb-2 font-semibold;

    &:first-child {
      @apply mt-0;
    }

    span,
    .el-icon {
      @apply mr-1;
    }
  }

  .config-item {
    width: 200px;
  }
</style>
