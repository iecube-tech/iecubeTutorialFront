<template>
  <div class="app-container configurationContainer">
   
      <div class="subject-title text-bold">
        <Icon>
          <ArrowsHorizontal />
        </Icon>
        积分与 RMB 兑换比例
      </div>
      <el-input-number v-model="rmb" style="width: 200px"></el-input-number>
      <span>&nbsp;&nbsp;元&nbsp;</span>
      <span>= 1 积分 </span>

      <div class="subject-title text-bold">
        <Icon>
          <Purchase />
        </Icon>
        生成一次教案消耗积分
      </div>
      <el-input-number v-model="rmb" style="width: 200px"></el-input-number>
      <span>&nbsp;&nbsp;个</span>

      <div class="subject-title text-bold">
        <Icon>
          <Calendar />
        </Icon>
        积分有效期
      </div>
      <el-input-number v-model="rmb" style="width: 200px"></el-input-number>
      <span>&nbsp;&nbsp;天</span>

      <!-- <div class="subject-title text-bold">
        <Icon>
          <Gift />
        </Icon>
        首次注册赠送积分
      </div>
      <el-input-number v-model="rmb" style="width: 200px"></el-input-number>
      <span>&nbsp;&nbsp;个</span> -->

      <div class="subject-title text-bold">
        <el-icon>
          <Open />
        </el-icon>
        赠送积分全局开关
      </div>
      <el-switch v-model="openGive" active-text="开启赠送" inactive-text="关闭赠送" />
      <div>
        <el-button type="primary" class="w400px mt-4">保存</el-button>
      </div>
      
      
     
  </div>
</template>

<script setup lang="ts">
import { ArrowsHorizontal, Calendar, Gift, Purchase, User, } from '@vicons/carbon'
import { UserAltSlash } from '@vicons/fa'
import { Icon } from '@vicons/utils'

import {getPriceUnits} from '@/api/config'

const rmb = ref(1);
const openGive = ref(true)

function init() {
  getPriceUnits().then(res => {
    console.log(res)
  })
}

init()
</script>

<style lang="scss" scoped>
.subject-title {
  @apply flex items-center mt-6 mb-2 font-semibold;

  &:first-child  {
    @apply mt-0;
  }

  span,
  .el-icon {
    @apply mr-1
  }


}
</style>
