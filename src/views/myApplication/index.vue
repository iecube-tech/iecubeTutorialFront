<template>
  <div class="app-container">
    <div class="mb-4">
      <div class="flex justify-between items-start gap-4">
        <el-button type="primary" icon="Plus" @click="openRechargeDialog">申请积分充值</el-button>
        <div class="flex flex-row gap-4 w-[400px]">
          <el-select v-model="searchForm.statsus" placeholder="状态筛选" clearable>
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
          <el-input
            v-model="searchForm.text"
            placeholder="搜索内容"
            clearable
            suffix-icon="Search"
          />
        </div>
      </div>
    </div>

    <div>
      <el-table :data="tableData">
        <el-table-column prop="id" label="申请编号" />
        <el-table-column prop="parentGroup" label="父组织" />
        <el-table-column prop="subGroup" label="子组织" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="text-red-400 font-bold">{{ row.amount.toLocaleString() }} RMB</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="approver" label="审批人" />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link icon="View">查看</el-button>
            <el-button type="primary" link icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
            :disabled="!rechargeForm.parentGroup"
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
              :min="1"
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
  </div>
</template>

<script setup lang="ts">
  const searchForm = reactive({
    statsus: '',
    text: '',
  });

  const statusOptions = ref([
    { label: '已批准', value: 'approved', type: 'success' },
    { label: '待批准', value: 'pending', type: 'info' },
    { label: '已拒绝', value: 'rejected', type: 'danger' },
  ]);

  const getStatusLabel = (status) => {
    const item = statusOptions.value.find((item) => item.value === status);
    return item ? item.label : status;
  };

  const getStatusType = (status) => {
    const item = statusOptions.value.find((item) => item.value === status);
    return item ? item.type : status;
  };

  const tableData = ref([
    {
      id: 1,
      applicationNo: 'APP202401001',
      parentGroup: '总公司',
      subGroup: '华北分公司',
      amount: 150000,
      status: 'approved',
      submitTime: '2024-01-15 14:30:25',
      approver: '张经理',
    },
    {
      id: 2,
      applicationNo: 'APP202401002',
      parentGroup: '总公司',
      subGroup: '华南分公司',
      amount: 280000,
      status: 'pending',
      submitTime: '2024-01-16 09:15:42',
      approver: '李总监',
    },
    {
      id: 3,
      applicationNo: 'APP202401003',
      parentGroup: '华北分公司',
      subGroup: '北京办事处',
      amount: 95000,
      status: 'rejected',
      submitTime: '2024-01-17 16:22:18',
      approver: '王主管',
    },
    {
      id: 4,
      applicationNo: 'APP202401004',
      parentGroup: '华南分公司',
      subGroup: '广州办事处',
      amount: 320000,
      status: 'approved',
      submitTime: '2024-01-18 11:45:33',
      approver: '陈总',
    },
    {
      id: 5,
      applicationNo: 'APP202401005',
      parentGroup: '总公司',
      subGroup: '华东分公司',
      amount: 180000,
      status: 'pending',
      submitTime: '2024-01-19 13:20:07',
      approver: '刘经理',
    },
    {
      id: 6,
      applicationNo: 'APP202401006',
      parentGroup: '华东分公司',
      subGroup: '上海办事处',
      amount: 210000,
      status: 'approved',
      submitTime: '2024-01-20 10:35:51',
      approver: '赵主任',
    },
  ]);

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
        min: 1,
        max: 100000,
        message: '充值积分数量必须在1-100000之间',
        trigger: 'blur',
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
  const openRechargeDialog = () => {
    rechargeVisible.value = true;
  };
</script>

<style lang="scss" scoped></style>
