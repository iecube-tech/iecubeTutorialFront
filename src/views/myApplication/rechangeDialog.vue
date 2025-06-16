<template>
      <el-dialog
      v-model="rechargeVisible"
      title="积分充值"
      width="720px"
      :close-on-click-modal="false"
      class="recharge-dialog"
    >
      <el-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-width="100px"
      >
        <el-form-item label="父组织" prop="parentGroup">
          <el-select
            v-model="rechargeForm.parentGroup"
            placeholder="请选择父组织"
            clearable
            filterable
            class="w-full"
            @change="handlePrimaryOrgChange"
            :disabled="disabled"
          >
            <el-option
              v-for="org in primaryOrganizations"
              :key="org.value"
              :label="org.label"
              :value="org.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="子组织" prop="subGroup">
          <el-select
            v-model="rechargeForm.subGroup"
            placeholder="请选择子组织"
            clearable
            filterable
            class="w-full"
            :disabled="!rechargeForm.parentGroup || disabled"
          >
            <el-option
              v-for="org in filteredSecondaryOrganizations"
              :key="org.value"
              :label="org.label"
              :value="org.value"
            />
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
// 充值相关数据
  const rechargeVisible = ref(false);
  const rechargeFormRef = ref(null);

  // 充值表单数据
  const rechargeForm = ref({
    parentGroup: '',
    subGroup: '',
    amountCents: 0,
    remarks: '',
  });

  // 表单验证规则
  const rechargeRules = {
    parentGroup: [{ required: true, message: '请选择父组织', trigger: 'change' }],
    subGroup: [{ required: true, message: '请选择子组织', trigger: 'change' }],
    amountCents: [
      { required: true, message: '请输入充值积分数量', trigger: 'blur' },
      {
        type: 'number',
        min: 0,
        max: 100000,
        message: '充值积分数量必须在0-100000之间',
        trigger: ['blur', 'change'],
      },
    ],
  };

  // 组织数据
  const primaryOrganizations = ref([
    { value: 'tech', label: '技术部' },
    { value: 'sales', label: '销售部' },
    { value: 'marketing', label: '市场部' },
    { value: 'hr', label: '人力资源部' },
    { value: 'finance', label: '财务部' },
  ]);

  const secondaryOrganizations = ref([
    { value: 'tech-frontend', label: '前端组', parentId: 'tech' },
    { value: 'tech-backend', label: '后端组', parentId: 'tech' },
    { value: 'tech-mobile', label: '移动端组', parentId: 'tech' },
    { value: 'sales-online', label: '线上销售组', parentId: 'sales' },
    { value: 'sales-offline', label: '线下销售组', parentId: 'sales' },
    { value: 'marketing-digital', label: '数字营销组', parentId: 'marketing' },
    { value: 'marketing-brand', label: '品牌推广组', parentId: 'marketing' },
    { value: 'hr-recruit', label: '招聘组', parentId: 'hr' },
    { value: 'hr-training', label: '培训组', parentId: 'hr' },
    { value: 'finance-accounting', label: '会计组', parentId: 'finance' },
    { value: 'finance-audit', label: '审计组', parentId: 'finance' },
  ]);

  // 计算属性
  const filteredSecondaryOrganizations = computed(() => {
    if (!rechargeForm.value.parentGroup) return [];
    return secondaryOrganizations.value.filter(
      (org) => org.parentId === rechargeForm.value.parentGroup
    );
  });

  const isFormValid = computed(() => {
    return (
      rechargeForm.value.parentGroup &&
      rechargeForm.value.subGroup &&
      rechargeForm.value.amountCents &&
      rechargeForm.value.amountCents > 0
    );
  });

  // 方法
  const handlePrimaryOrgChange = () => {
    rechargeForm.value.subGroup = '';
  };

  const handleCancelRecharge = () => {
    rechargeVisible.value = false;
    resetRechargeForm();
  };

  const handleConfirmRecharge = async () => {
    if (!rechargeFormRef.value) return;

    try {
      await rechargeFormRef.value.validate();

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000));

      ElMessage.success('积分充值成功！');
      rechargeVisible.value = false;
      resetRechargeForm();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
    }
  };

  const resetRechargeForm = () => {
    rechargeForm.value = {
      parentGroup: '',
      subGroup: '',
      amountCents: 0,
      remarks: '',
    };
    rechargeFormRef.value!.resetFields();
    rechargeFormRef.value!.clearValidate();
  };

  // 打开充值弹框的方法
  const open = () => {
    rechargeVisible.value = true;
  };
  
  const disabled = ref(false)
  
  const disabledOpen = (groupId, subGroupId) => {
    rechargeForm.value.parentGroup = groupId
    rechargeForm.value.subGroup = subGroupId
    disabled.value = true
    rechargeVisible.value = true;
  }
  
  defineExpose({
    open,
    disabledOpen
  })

</script>


<style lang="scss" scoped>

</style>
