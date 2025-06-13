<template>
  <el-popover :placement="placement" :width="width" effect="dark">
    <template #default>
      <el-icon class="mr-2"><Phone /></el-icon>
      <span>联系客服</span>
      <br />
      <span>电话：400-123-4567</span>
    </template>
    <template #reference>
      <slot>我要充值</slot>
    </template>
  </el-popover>
</template>
<script setup lang="ts">
defineProps({
  placement: {
    type: String,
    default: 'left'
  },
  width: {
    type: String,
    default: '300'
  }
})

</script>


<style lang="scss" scoped>

</style>
