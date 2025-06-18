<template>
  <el-dialog
    v-model="rechargeVisible"
    title="积分充值"
    width="720px"
    :close-on-click-modal="false"
    class="recharge-dialog"
  >
    <el-form ref="rechargeFormRef" :model="rechargeForm" :rules="rechargeRules" label-width="100px">
      <el-form-item label="父组织" prop="parentGrouptId">
        <el-select
          v-model="rechargeForm.parentGrouptId"
          placeholder="请选择父组织"
          clearable
          filterable
          class="w-full"
          @change="handleChangeFirstGroup"
          :disabled="disabled"
        >
          <el-option v-for="org in firstGroup" :key="org.id" :label="org.name" :value="org.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="子组织" prop="subGroupId">
        <el-select
          v-model="rechargeForm.subGroupId"
          placeholder="请选择子组织"
          clearable
          filterable
          class="w-full"
          :disabled="!rechargeForm.parentGrouptId || disabled"
        >
          <el-option v-for="org in secondGroup" :key="org.id" :label="org.name" :value="org.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="充值金额" prop="amountCents">
        <div class="w400px flex items-center gap-2">
          <el-input-number
            v-model="rechargeForm.amountCents"
            :min="0"
            :max="100000"
            :step="100"
            :precision="0"
            placeholder="请输入充值金额"
            controls-position="right"
            class="flex-1"
          />
          <span class="ml-2">单位：元</span>
        </div>
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="rechargeForm.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（选填）"
          maxlength="200"
          show-word-limit
          class="w-full"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <el-button type="primary" @click="handleConfirmRecharge" :disabled="!isFormValid">
          确认充值
        </el-button>
        <el-button @click="handleCancelRecharge">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { getFirstGroupList, getSecondGroupList } from '@/api/dept'

  // 充值相关数据
  const rechargeVisible = ref(false)
  const rechargeFormRef = ref(null)

  // 充值表单数据
  const rechargeForm = ref({
    parentGrouptId: '',
    subGroupId: '',
    amountCents: 0,
    remarks: ''
  })

  // 表单验证规则
  const rechargeRules = {
    parentGrouptId: [{ required: true, message: '请选择父组织', trigger: 'change' }],
    subGroupId: [{ required: true, message: '请选择子组织', trigger: 'change' }],
    amountCents: [
      { required: true, message: '请输入充值积分数量', trigger: 'blur' },
      {
        type: 'number',
        min: 0,
        max: 100000,
        message: '充值积分数量必须在0-100000之间',
        trigger: ['blur', 'change']
      }
    ]
  }

  // 组织数据
  const firstGroup = ref([])

  const secondGroup = ref([])


  const isFormValid = computed(() => {
    return (
      rechargeForm.value.parentGrouptId &&
      rechargeForm.value.subGroupId &&
      rechargeForm.value.amountCents &&
      rechargeForm.value.amountCents > 0
    )
  })

  // 方法
  const handleChangeFirstGroup = () => {
    rechargeForm.value.subGroupId = ''
    getSecondGroup()
  }

  const handleCancelRecharge = () => {
    rechargeVisible.value = false
    resetRechargeForm()
  }

  const handleConfirmRecharge = async () => {
    if (!rechargeFormRef.value) return

    try {
      await rechargeFormRef.value.validate()

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))

      ElMessage.success('积分充值成功！')
      rechargeVisible.value = false
      resetRechargeForm()
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
    }
  }

  const resetRechargeForm = () => {
    rechargeForm.value = {
      parentGrouptId: '',
      subGroupId: '',
      amountCents: 0,
      remarks: ''
    }
    rechargeFormRef.value!.resetFields()
    rechargeFormRef.value!.clearValidate()
  }

  // 打开充值弹框的方法
  const open = () => {
    rechargeVisible.value = true
    getFirstGroup()
  }

  const disabled = ref(false)

  const disabledOpen = (groupId, subGroupId) => {
    rechargeForm.value.parentGrouptId = groupId
    rechargeForm.value.subGroupId = subGroupId
    disabled.value = true
    rechargeVisible.value = true
    getFirstGroup()
    getSecondGroup()
  }
  
    // 一级部门
  const getFirstGroup = ()=> {
    getFirstGroupList().then(res => {
      firstGroup.value = res.data || []
    })
  }

  // 二级部门
  const getSecondGroup = () => {
    let firstGroupId = rechargeForm.value.parentGrouptId
    getSecondGroupList(firstGroupId).then(res => {
      secondGroup.value = res.data || []
    })
  }

  defineExpose({
    open,
    disabledOpen
  })
</script>

<style lang="scss" scoped></style>
