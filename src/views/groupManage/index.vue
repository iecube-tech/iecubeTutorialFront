<template>
  <div class="app-container flex flex-row">
    <div class="tree-container">
      <div class="tree-header">
        <el-input
          v-model="filterText"
          placeholder="请输入组织名称"
          clearable
          class="mr-2"
          :suffix-icon="Search"
        />
        <Icon
          class="text-zeng text-2xl mr-2 cursor-pointer"
          @click="handleAddRoot"
          title="新建父组织"
        >
          <Add></Add>
        </Icon>
      </div>
      <div class="flex-1 pr-2 pb-2 overflow-y-auto overflow-x-hidden">
        <el-tree
          ref="treeRef"
          :data="GroupTree"
          :props="defaultProps"
          :filter-node-method="filterNode"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
          class="h-full"
        >
          <template #default="{ node, data }">
            <div class="w-full flex justify-between items-center">
              <span>{{ node.label }}</span>
              <span>
                <el-icon class="mr-2">
                  <Edit @click.stop="handleGroupUpdate(data)" />
                </el-icon>
                <el-icon @click.stop="removeGroupNode(node, data)">
                  <Delete />
                </el-icon>
              </span>
            </div>
          </template>
        </el-tree>
      </div>
    </div>

    <div class="group-content">
      <div class="mb-4">
        <span class="text-bold">
          <span>父组织名称:</span>
          <el-tag type="primary" v-show="currentGroup !== ''">{{ currentGroup }}</el-tag>
        </span>
      </div>
      <div class="flex justify-between items-center">
        <el-button
          type="primary"
          icon="Plus"
          :disabled="currentGroupId === ''"
          title="先选择一个父组织"
          @click="handleAddSubGroup"
        >
          新建子组织
        </el-button>
        <el-input
          v-model="searchText"
          placeholder="搜索内容"
          class="w200px"
          :suffix-icon="Search"
          clearable
        />
      </div>
      <div class="flex-1 w-full">
        <el-table
          ref="tableRef"
          v-if="refreshTable"
          :max-height="maxHeight"
          :data="groupList"
          @expand-change="handleExpandChange"
        >
          <!-- <el-table-column prop="parentName" label="父组织" /> -->
          <el-table-column type="expand">
            <template #default="props">
              <div class="px-4">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="负责人">{{ props.row.leader }}</el-descriptions-item>
                  <el-descriptions-item label="电话">{{ props.row.phone }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ props.row.email }}</el-descriptions-item>
                  <el-descriptions-item label="已用积分">
                    <span class="text-red-500">{{ props.row.consumed }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="剩余积分">
                    <span class="text-green-500">{{ props.row.remainPoint }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="子组织" />
          <!-- <el-table-column prop="leader" label="负责人" />
          <el-table-column prop="phone" label="电话" />
           <el-table-column prop="email" label="邮箱" /> -->
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="240px"
          >
            <template #default="scope">
              <el-button link type="primary" icon="Wallet" @click="openRechargeDialog(scope.row)">
                充值
              </el-button>
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">
                修改
              </el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog :title="groupTitle" v-model="groupOpen" width="600px" append-to-body>
      <el-form ref="deptRef" :model="groupFormData" :rules="groupFormRules" label-width="80px">
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="groupFormData.name" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="groupFormData.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="groupFormData.phone" maxlength="11" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="groupFormData.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleGroupSubmit">确 定</el-button>
          <el-button @click="handleGroupClose">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="subGroupTitle" v-model="openSubGroup" width="600px" append-to-body>
      <el-form
        ref="deptRef"
        :model="subGroupFormData"
        :rules="subGroupFormRules"
        label-width="80px"
      >
        <el-form-item label="父组织" prop="parentId">
          <el-select v-model="subGroupFormData.parentId" placeholder="请选择父组织" disabled>
            <el-option
              v-for="(item, k) in GroupTree"
              :key="k"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子组织" prop="name">
          <el-input v-model="subGroupFormData.name" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="subGroupFormData.leader" placeholder="请输入负责人" maxlength="20" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="subGroupFormData.phone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="subGroupFormData.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

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

<script setup name="Dept" lang="ts">
  import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue'
  import { Icon } from '@vicons/utils'
  import { Add } from '@vicons/carbon'
  import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from '@/api/dept'

  //
  const handleExpandChange = (row: any, expandedRows: any) => {
    console.log(expandedRows)
    row.leader = '张三'
    row.phone = 'aaaaaaaaaa'
    row.email = 'aaaaaaaaaa'
    row.consumed = 1000
    row.remainPoint = 200
  }
  
  
  // 充值弹框
  

  // 当前组织名称
  const currentGroupId = ref('')
  const currentGroup = ref('')
  const searchText = ref('')

  const tableRef = ref(null)
  const maxHeight = ref(400)
  const computeHeight = async () => {
    maxHeight.value = window.innerHeight - 178
    refreshTable.value = false
    await nextTick()
    refreshTable.value = true
  }

  onMounted(() => {
    computeHeight()
    window.addEventListener('resize', computeHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', computeHeight)
  })

  const { proxy } = getCurrentInstance()

  const groupList = ref([
    {
      id: 1,
      parentId: 1,
      date: '2016-05-02',
      parentName: '西安电子科技大学',
      name: '计算机科学与技术学院'
    },
    {
      id: 2,
      parentId: 2,
      date: '2016-05-04',
      parentName: '西安电子科技大学',
      name: '软件学院'
    },
    {
      id: 3,
      parentId: 3,
      date: '2016-05-01',
      parentName: '西安电子科技大学',
      name: '信息科学与工程学院'
    },
    {
      id: 4,
      parentId: 1,
      date: '2016-05-03',
      parentName: '西安电子科技大学',
      name: '电子信息与电气工程学院'
    }
  ])
  const openSubGroup = ref(false)
  const subGroupTitle = ref('')

  const refreshTable = ref(true)

  const subGroupFormData = ref({})

  const subGroupFormRules = ref({
    parentId: [{ required: true, message: '上级组织不能为空', trigger: 'blur' }],
    deptName: [{ required: true, message: '组织名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  })

  /** 查询组织列表 */
  function getList() {
    return groupList.value
  }

  /** 取消按钮 */
  function cancel() {
    openSubGroup.value = false
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList()
  }

  /** 重置按钮操作 */
  function resetQuery() {
    handleQuery()
  }

  /** 新增按钮操作 */
  function handleAddSubGroup(row) {
    subGroupFormData.value.id = ''
    subGroupFormData.value.parentId = currentGroupId.value
    subGroupFormData.value.name = ''
    subGroupFormData.value.leader = ''
    subGroupFormData.value.phone = ''
    subGroupFormData.value.email = ''

    subGroupTitle.value = '新建子组织'
    openSubGroup.value = true
  }

  /** 修改按钮操作 */
  function handleUpdate(row) {
    subGroupFormData.value = row
    subGroupTitle.value = '修改子组织'
    openSubGroup.value = true
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs['deptRef'].validate(valid => {
      if (valid) {
        if (subGroupFormData.value.id != undefined) {
          updateDept(subGroupFormData.value).then(response => {
            openSubGroup.value = false
            getList()
          })
        } else {
          addDept(subGroupFormData.value).then(response => {
            openSubGroup.value = false
            getList()
          })
        }
      }
    })
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    ElMessageBox.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?')
      .then(function () {
        return delDept(row.id)
      })
      .then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
      })
      .catch(() => {})
  }

  getList()

  // 左侧树相关操作
  const GroupTree = ref([])
  GroupTree.value = [
    {
      id: 1,
      label: '西安电子科技大学'
    },
    {
      id: 2,
      label: '北京大学'
    },
    {
      id: 3,
      label: '清华大学'
    }
  ]

  const treeRef = ref(null)
  const filterText = ref('') // 树形控件过滤
  const defaultProps = {
    children: 'children',
    label: 'label'
  }
  const handleNodeClick = data => {
    let rawData = toRaw(data)
    subGroupFormData.value.parentId = rawData.id
    currentGroupId.value = rawData.id
    currentGroup.value = rawData.label
    getList()
  }
  const filterNode = (value, data) => {
    if (!value) return true
    return data.label.includes(value)
  }
  watch(filterText, val => {
    treeRef.value!.filter(val)
  })

  const removeGroupNode = node => {
    const parent = node.parent
    const children = parent.data.children || parent.data
    const index = children.findIndex(d => d.id === node.data.id)
    children.splice(index, 1)

    // 确认删除弹框
    ElMessageBox.confirm('是否确认删除名称为"' + node.data.label + '"的数据项?')
      .then(function () {
        return delDept(node.data.id)
      })
      .then(() => {
        getList()
        proxy.$modal.msgSuccess('删除成功')
      })
      .catch(() => {})
  }

  const groupTitle = ref('新建组织')
  const groupOpen = ref(false)
  const groupFormData = reactive({
    name: '',
    leader: '',
    phone: '',
    email: ''
  })

  import { validatePhone, validateEmail } from '@/utils/validate'

  const groupFormRules = reactive({
    name: [{ required: true, message: '请输入组织名称', trigger: 'blur' }],
    leader: [{ required: true, message: '请输入组织负责人', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入组织负责人电话', trigger: 'blur' },
      { validator: validatePhone, trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入组织负责人邮箱', trigger: 'blur' }]
  })

  const handleAddRoot = () => {
    groupTitle.value = '新建组织'
    groupOpen.value = true
  }

  const handleGroupClose = () => {
    groupOpen.value = false
  }

  const handleGroupSubmit = () => {
    proxy.$refs['groupFormRef'].validate(valid => {
      if (valid) {
        if (subGroupFormData.value.id != undefined) {
          updateDept(subGroupFormData.value).then(response => {
            openSubGroup.value = false
            getList()
          })
        } else {
        }
      }
    })
  }

  const handleGroupUpdate = data => {
    let rawData = toRaw(data)
    groupTitle.value = '修改组织'
    groupOpen.value = true
    groupFormData.id = rawData.id
    groupFormData.name = rawData.label
    groupFormData.leader = rawData.leader
    groupFormData.phone = rawData.phone
    groupFormData.email = rawData.email
  }
  
  
  
  
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

<style lang="scss" scoped>
  .tree-container {
    @apply flex flex-col mr-2;
    width: $left-tree-weidth;
    border-right: 0.5px solid var(--border-color);
    box-sizing: border-box;
  }

  .tree-header {
    @apply flex justify-between items-center mb-2 pb-2;
    border-bottom: 0.5px solid var(--border-color);
  }

  .group-content {
    @apply flex-1 flex flex-col;
  }
</style>
