<template>
  <div class="app-container configurationContainer">
    <div class="subject-title text-bold">
      <Icon>
        <ArrowsHorizontal />
      </Icon>
      积分与 RMB 兑换比例
    </div>
    <el-input-number v-model="rmb2OnePoint" class="config-item" :min="0.01"></el-input-number>
    <span>&nbsp;&nbsp;元&nbsp;</span>
    <span>= 1 积分</span>

    <div class="subject-title text-bold">
      <Icon>
        <Purchase />
      </Icon>
      生成一次教案消耗积分
    </div>
    <el-input-number v-model="oneComsumePoints" class="config-item" :min="1"></el-input-number>
    <span>&nbsp;&nbsp;个</span>

    <div class="subject-title text-bold">
      <Icon>
        <Calendar />
      </Icon>
      积分有效期
    </div>
    <el-input-number v-model="expireDays" class="config-item" :min="1"></el-input-number>
    <span>&nbsp;&nbsp;天</span>

    <!-- <div class="subject-title text-bold">
        <Icon>
          <Gift />
        </Icon>
        首次注册赠送积分
      </div>
      <el-input-number v-model="rmb" style="width: 200px"></el-input-number>
      <span>&nbsp;&nbsp;个</span> -->

    <!-- <div class="subject-title text-bold">
        <el-icon>
          <Open />
        </el-icon>
        赠送积分全局开关
      </div>
      <el-switch v-model="openGive" active-text="开启赠送" inactive-text="关闭赠送" /> -->
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
  import { ArrowsHorizontal, Calendar, Gift, Purchase, User } from '@vicons/carbon'
  import { UserAltSlash } from '@vicons/fa'
  import { UserAdmin } from '@vicons/carbon'
  import { Icon } from '@vicons/utils'

  import { getPriceUnits, getExpireDays, updateConfig } from '@/api/config'
  import { getApproverList } from '@/api/dept'
  
  import { useUserStore } from '@/store'
  
  const userStore = useUserStore()
  const userInfo = userStore.getUserInfo()
  const currentUserPhone = ref(userInfo.phone)

  const rmb2OnePoint = ref(1)
  const oneComsumePoints = ref(1)
  const expireDays = ref(1)
  const approverUser = ref('')
  const approvers = ref([])

  function init() {
    getPriceUnits().then(res => {
      if (res.state == 200) {
        res.data.forEach(item => {
          if (item.type == 'RECHARGE') {
            rmb2OnePoint.value = item.need
          }

          if (item.type == 'CONSUME') {
            oneComsumePoints.value = item.need
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
        howRmbToOnePoint: rmb2OnePoint.value,
        howPointsToOneGenerate: oneComsumePoints.value,
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
