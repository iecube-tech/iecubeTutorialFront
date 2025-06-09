<template>
  <div class="app-container configurationContainer">
    <el-card class="box-card">
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

      <div class="subject-title text-bold">
        <Icon>
          <Gift />
        </Icon>
        首次注册赠送积分
      </div>
      <el-input-number v-model="rmb" style="width: 200px"></el-input-number>
      <span>&nbsp;&nbsp;个</span>

      <div class="subject-title text-bold">
        <el-icon>
          <Open />
        </el-icon>
        赠送积分全局开关
      </div>
      <el-switch v-model="openGive" active-text="开启赠送" inactive-text="关闭赠送" />
      <el-divider></el-divider>

      <div class="subject-title text-bold">
        <Icon>
          <UserAltSlash />
        </Icon>
        指定不赠送积分的用户
      </div>
      <div>
        <el-input placeholder="输入用户电话号" v-model="phone" style="width: 200px" class="mr-2"></el-input>
        <el-button type="primary" @click="addPhone">添加</el-button>
        <el-button type="primary" plain>批量添加</el-button>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="姓名"/>
          <el-table-column prop="phone" label="电话" />
          <el-table-column label="操作">
            <template #default="{ $index}">
              <el-button type="primary" link @click="handleRemove( $index )">删除</el-button>
            </template>
          </el-table-column>
  
        </el-table>


      </div>


    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ArrowsHorizontal, Calendar, Gift, Purchase, User, } from '@vicons/carbon'
import { UserAltSlash } from '@vicons/fa'
import { Icon } from '@vicons/utils'

const rmb = ref(1);
const openGive = ref(true)

const phone = ref('')
const addPhone = () => {
  console.log(phone.value)
  tableData.value.push({ name: 'xxx', phone: phone.value })
}

const tableData = ref([])
tableData.value = [
  { name: '张三', phone: '13800138000' },
  { name: '李四', phone: '13900139000' },
  { name: '王五', phone: '13700137000' },
  { name: '赵六', phone: '13600136000' },
  { name: '钱七', phone: '13500135000' }
]

const handleRemove = ( index) => {

  ElMessageBox.confirm('确定要删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.splice(index, 1)
  })
}
</script>

<style lang="scss" scoped>
.subject-title {
  @apply flex items-center mt-6 mb-2 font-semibold;

  &:first-of-type {
    @apply mt-0;
  }

  span,
  .el-icon {
    @apply mr-1
  }


}
</style>
