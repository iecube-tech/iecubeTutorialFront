<template>
  <el-dialog
    v-model="rechargeVisible"
    title="积分充值"
    width="720px"
    :close-on-click-modal="false"
    class="recharge-dialog"
  >
    <el-form ref="rechargeFormRef" :model="rechargeForm" :rules="rechargeRules" label-width="100px">
      <el-form-item label="父组织" prop="firstGroupId">
        <el-select
          v-model="rechargeForm.firstGroupId"
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

      <el-form-item label="子组织" prop="oSecId">
        <el-select
          v-model="rechargeForm.oSecId"
          placeholder="请选择子组织"
          clearable
          filterable
          class="w-full"
          :disabled="!rechargeForm.firstGroupId || disabled"
        >
          <el-option v-for="org in secondGroup" :key="org.id" :label="org.name" :value="org.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="充值金额" prop="rmb">
        <div class="w-full flex justify-between items-center">
          <div class="flex-1">
            <el-input-number
              v-model="rechargeForm.rmb"
              :min="1"
              :max="100000"
              :step="100"
              :precision="0"
              placeholder="请输入充值金额"
              style="width: 100%"
            />
          </div>
          <span class="w80px text-right">单位：元</span>
        </div>
      </el-form-item>
      <el-form-item label="换算积分">
        <el-input v-model="rmb2Point" readonly />
      </el-form-item>

      <el-form-item label="审批人" prop="approver">
        <el-select v-model="rechargeForm.approver" placeholder="请选择审批人">
          <el-option
            v-for="item in approverOptions"
            :key="item.phone"
            :label="item.name"
            :value="item.phone"
          />
        </el-select>
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
  import { getFirstGroupList, getSecondGroupList, getApproverList } from '@/api/dept'
  import { rmb2point, inChange } from '@/api/change'

  // 充值相关数据
  const rechargeVisible = ref(false)
  const rechargeFormRef = ref(null)

  const rmb2Point = ref(0)

  // 充值表单数据
  const rechargeForm = ref({
    firstGroupId: '',
    oSecId: '',
    rmb: 1,
    approver: ''
  })

  // 表单验证规则
  const rechargeRules = {
    firstGroupId: [{ required: true, message: '请选择父组织', trigger: 'change' }],
    oSecId: [{ required: true, message: '请选择子组织', trigger: 'change' }],
    rmb: [
      { required: true, message: '请输入充值金额', trigger: 'blur' },
      {
        type: 'number',
        min: 1,
        max: 100000,
        message: '充值金额必须在0-100000之间',
        trigger: ['blur', 'change']
      }
    ],
    approver: [{ required: true, message: '请选择审批人', trigger: 'change' }]
  }

  const approverOptions = ref([])

  const initApproverList = async () => {
    getApproverList().then(res => {
      if (res.state == 200) {
        approverOptions.value = res.data
      }
    })
  }
  initApproverList()

  // 组织数据
  const firstGroup = ref([])

  const secondGroup = ref([])

  const isFormValid = computed(() => {
    return rechargeForm.value.firstGroupId && rechargeForm.value.oSecId && rechargeForm.value.rmb
  })

  // 方法
  const handleChangeFirstGroup = () => {
    rechargeForm.value.oSecId = ''
    getSecondGroup()
  }

  const handleCancelRecharge = () => {
    rechargeVisible.value = false
    resetRechargeForm()
  }

  const handleConfirmRecharge = async () => {
    rechargeFormRef.value.validate(async valid => {
      if (valid) {
        let req = {
          "approver": rechargeForm.value.approver,
          "rmb": rechargeForm.value.rmb,
          "pointsComputed": rmb2Point.value,
          "oSecId": rechargeForm.value.oSecId
        }
        inChange(req).then(res=>{
          if(res.state == 200){
            ElMessage.success("充值成功")
            rechargeVisible.value = false
            resetRechargeForm()
          }
        })
      }
    })
  }

  const resetRechargeForm = () => {
    rechargeForm.value = {
      firstGroupId: '',
      oSecId: '',
      rmb: 1,
      approver: ''
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

  const disabledOpen = (groupId, oSecId) => {
    rechargeForm.value.firstGroupId = groupId
    rechargeForm.value.oSecId = oSecId
    disabled.value = true
    rechargeVisible.value = true
    getFirstGroup()
    getSecondGroup()
  }

  // 一级部门
  const getFirstGroup = () => {
    getFirstGroupList().then(res => {
      firstGroup.value = res.data || []
    })
  }

  // 二级部门
  const getSecondGroup = () => {
    let firstGroupId = rechargeForm.value.firstGroupId
    getSecondGroupList(firstGroupId).then(res => {
      secondGroup.value = res.data || []
    })
  }

  watchEffect(() => {
    rmb2point(rechargeForm.value.rmb).then(res => {
      if (res.state == 200) {
        rmb2Point.value = res.data
      }
    })
  })

  defineExpose({
    open,
    disabledOpen
  })
</script>

<style lang="scss" scoped></style>
