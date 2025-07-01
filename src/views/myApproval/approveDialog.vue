<template>
  <!-- 审批详情弹窗 -->
  <el-dialog v-model.lazy="visible" title="审批详情" width="60%" destroy-on-close>
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
      <el-descriptions-item label="申请人">
        {{ currentRow.creator.name }}
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
      <el-descriptions-item label="审批意见" v-if="remarkVisible(currentRow)">
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
      <el-descriptions-item label="申请人">
        {{ currentRow.creator.name }}
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

      <el-descriptions-item label="审批意见" v-if="remarkVisible(currentRow)">
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
      <el-descriptions-item label="申请人">
        {{ currentRow.creator.name }}
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
      <el-descriptions-item label="审批意见" v-if="remarkVisible(currentRow)">
        {{ getRemark(currentRow) }}
      </el-descriptions-item>
    </el-descriptions>
    
    <el-descriptions
      v-if="currentRow && currentRow.approvalType == 'PRICE_CHANGE'"
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
      <el-descriptions-item label="申请人">
       {{ currentRow.creator.name }}
      </el-descriptions-item>
      <el-descriptions-item label="一次消耗积分">
        <span class="text-red-400 font-bold">
          {{ currentRow.priceChangeQo.howPointsToOneGenerate }} 个
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="兑换一积分">
        <span class="text-red-400 font-bold">
          {{ currentRow.priceChangeQo.howRmbToOnePoint }} 元
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="积分过期时间">
        <span class="text-red-400 font-bold">{{ currentRow.priceChangeQo.expireDays }} 天</span>
      </el-descriptions-item>
      <el-descriptions-item label="审批意见" v-if="remarkVisible(currentRow)">
        {{ getRemark(currentRow) }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 审批操作区域 -->
    <div class="approval-actions" v-if="currentRow.status === 'PENDING'">
      <el-divider content-position="left">审批操作</el-divider>
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button type="success" @click="handleApproved('approved')">通过申请</el-button>
        <el-button type="danger" @click="handleRejected('rejected')">拒绝申请</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
  import moment from 'moment'
  import { getGroupTypeZn, getApplyStatusZn, getApplyTypeZn } from '@/utils/cnMap'
  import { getRemark, remarkVisible } from '@/utils/applyFuns'
  import { pass, reject } from '@/api/apply'

  const visible = ref(false)
  const currentRow = ref(null)

  const approvalForm = ref({
    id: '',
    remark: ''
  })

  const handleApproved = (status: string) => {
    pass(approvalForm.value).then(res => {
      if (res.state == 200) {
        visible.value = false
        ElMessage.success('审批通过')
        emit('refresh')
      }
    })
  }

  const handleRejected = (status: string) => {
    reject(approvalForm.value).then(res => {
      if (res.state == 200) {
        visible.value = false
        ElMessage.success('审批拒绝')
        emit('refresh')
      }
    })
  }

  const open = (row: any) => {
    visible.value = true
    currentRow.value = row
    approvalForm.value.id = row.id
    // console.log('row', row)
  }

  defineExpose({
    open: open
  })

  const emit = defineEmits(['refresh'])
</script>

<style lang="scss" scoped></style>
