<!--  <el-descriptions-item label="申请金额">
        <span class="text-red-400 font-bold">{{ currentRow.amount.toLocaleString() }}RMB</span>
      </el-descriptions-item> -->
<template>
  <el-dialog
    v-model="visible"
    title="审批详情"
    width="60%"
    destroy-on-close
    class="apply-detail-dialog"
  >
    <el-descriptions
      v-if="currentRow && currentRow.approvalType == 'ORG_SEC_ADD'"
      :column="2"
      border
      label-width="120px"
    >
      <el-descriptions-item label="申请编号">
        {{ currentRow.id }}
      </el-descriptions-item>
      <el-descriptions-item label="提交时间">
        {{ moment(currentRow.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="申请类型">
        <el-tag :type="getApplyTypeZn(currentRow.approvalType).type">
          {{ getApplyTypeZn(currentRow.approvalType).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="审批人">
        {{ approverName(currentRow.approverPhone) }}
      </el-descriptions-item>
      <el-descriptions-item label="组织类型">
        <el-tag :type="getGroupTypeZn(currentRow.orgSecQo.type).type">
          {{ getGroupTypeZn(currentRow.orgSecQo.type).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="getApplyStatusZn(currentRow.status).type">
          {{ getApplyStatusZn(currentRow.status).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="父组织">
        {{ currentRow.orgTop.name }}
      </el-descriptions-item>
      <el-descriptions-item label="人数上限">
        {{ currentRow.orgSecQo.limit }}
      </el-descriptions-item>
      <el-descriptions-item label="子组织">
        {{ currentRow.orgSecQo.name }}
      </el-descriptions-item>
      <el-descriptions-item label="赠送积分">
        <span class="text-red-400 font-bold">{{ currentRow.orgSecQo.giftPoints }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="审批意见">
        {{ getRemark(currentRow) }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      v-if="currentRow && currentRow.approvalType == 'ACCOUNT_ADD'"
      :column="2"
      border
      label-width="120px"
    >
      <el-descriptions-item label="申请编号">
        {{ currentRow.id }}
      </el-descriptions-item>
      <el-descriptions-item label="提交时间">
        {{ moment(currentRow.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="申请类型">
        <el-tag :type="getApplyTypeZn(currentRow.approvalType).type">
          {{ getApplyTypeZn(currentRow.approvalType).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="审批人">
        {{ approverName(currentRow.approverPhone) }}
      </el-descriptions-item>
      <el-descriptions-item label="组织类型">
        <el-tag :type="getGroupTypeZn(currentRow.orgSec.type).type">
          {{ getGroupTypeZn(currentRow.orgSec.type).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="getApplyStatusZn(currentRow.status).type">
          {{ getApplyStatusZn(currentRow.status).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="父组织">
        {{ currentRow.orgTop.name }}
      </el-descriptions-item>
      <el-descriptions-item label="添加数量">
        {{ currentRow.addUUserQo.users.length }}
      </el-descriptions-item>
      <el-descriptions-item label="子组织">
        {{ currentRow.orgSec.name }}
      </el-descriptions-item>

      <el-descriptions-item label="添加用户">
        {{ JSON.stringify(currentRow.addUUserQo.users) }}
      </el-descriptions-item>

      <el-descriptions-item label="审批意见">
        {{ getRemark(currentRow) }}
      </el-descriptions-item>
    </el-descriptions>
    
    <el-descriptions
      v-if="currentRow && currentRow.approvalType == 'RECHARGE'"
      :column="2"
      border
      label-width="120px"
    >
      <el-descriptions-item label="申请编号">
        {{ currentRow.id }}
      </el-descriptions-item>
      <el-descriptions-item label="提交时间">
        {{ moment(currentRow.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
      <el-descriptions-item label="申请类型">
        <el-tag :type="getApplyTypeZn(currentRow.approvalType).type">
          {{ getApplyTypeZn(currentRow.approvalType).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="审批人">
        {{ approverName(currentRow.approverPhone) }}
      </el-descriptions-item>
      <el-descriptions-item label="组织类型">
        <el-tag :type="getGroupTypeZn(currentRow.orgSec.type).type">
          {{ getGroupTypeZn(currentRow.orgSec.type).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="getApplyStatusZn(currentRow.status).type">
          {{ getApplyStatusZn(currentRow.status).label }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="父组织">
        {{ currentRow.orgTop.name }}
      </el-descriptions-item>
      <el-descriptions-item label="充值金额">
        <span class="text-red-400 font-bold">{{ currentRow.rechargeQo.rmb }} 元 </span>
      </el-descriptions-item>
      <el-descriptions-item label="子组织">
        {{ currentRow.orgSec.name }}
      </el-descriptions-item>
      <el-descriptions-item label="充值积分">
        <span class="text-red-400 font-bold">{{ currentRow.rechargeQo.pointsComputed }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="审批意见">
        {{ getRemark(currentRow) }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
  import moment from 'moment'
  import { getGroupTypeZn, getApplyStatusZn, getApplyTypeZn } from '@/utils/cnMap'
  import { getRemark } from '@/utils/applyFuns'

  const visible = ref(false)
  const currentRow = ref(null)

  function open(curRow: any) {
    // console.log('open', curRow)
    visible.value = true
    currentRow.value = curRow
  }

  const approverName = phone => {
    let name = props.appoverList.find(item => item.phone == phone)
    return name ? name.name : phone
  }

  const props = defineProps({
    appoverList: {
      type: Array,
      default: []
    }
  })

  defineExpose({
    open: open
  })
</script>

<style lang="scss" scoped>
  :deep(.el-tag) {
    width: 80px;
  }
</style>
