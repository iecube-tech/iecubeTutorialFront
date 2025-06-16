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
          @click="AddGroup"
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
          @node-click="clickTreeNode"
          class="h-full"
        >
          <template #default="{ node, data }">
            <div class="w-full flex justify-between items-center">
              <span>{{ node.label }}</span>
              <span>
                <el-icon class="mr-2">
                  <Edit @click.stop="updateGroup(data)" />
                </el-icon>
                <el-icon @click.stop="removeGroup(node, data)">
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
          <span class="mr-2">父组织:</span>
          <el-tag type="primary" v-show="currentGroup !== ''">{{ currentGroup }}</el-tag>
        </span>
      </div>
      <div class="flex justify-between items-center mb-4">
        <el-button
          type="primary"
          :disabled="currentGroupId === ''"
          title="先选择一个父组织"
          @click="AddSubGroup"
        >
          <Icon size="20">
            <Add></Add>
          </Icon>
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
          <el-table-column type="expand">
            <template #default="props">
              <div class="px-4">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="负责人">{{ props.row.leader }}</el-descriptions-item>
                  <el-descriptions-item label="电话">{{ props.row.phone }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ props.row.email }}</el-descriptions-item>
                  <el-descriptions-item label="已用积分">
                    <span class="text-red-400">{{ props.row.consumed }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="剩余积分">
                    <span class="text-green-400">{{ props.row.remainPoint }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="子组织" />
          <el-table-column
            label="操作"
            align="center"
            class-name="small-padding fixed-width"
            width="300"
          >
            <template #default="scope">
              <el-button link type="primary" icon="Wallet" @click="openRechargeDialog(scope.row)">
                充值
              </el-button>
              <el-button link type="primary" icon="Document" @click="openBillPage(scope.row)">
                账单
              </el-button>
              <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">
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
      <el-form ref="groupFormRef" :model="groupFormData" label-width="80px">
        <el-form-item label="组织名称" prop="name" :rules="groupFormRules.name">
          <el-input v-model="groupFormData.name" placeholder="请输入组织名称" />
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
        ref="subGroupFormRef"
        :model="subGroupFormData"
        :rules="groupFormRules"
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
        <el-form-item label="电话" prop="phone">
          <el-input v-model="subGroupFormData.phone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="subGroupFormData.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubGroupSubmit">确 定</el-button>
          <el-button @click="handleSubGroupClose">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    
    <rechangeDialog ref="rechangeDialogRef" />

  </div>
</template>

<script setup name="Dept" lang="ts">
  import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue'
  import { Icon } from '@vicons/utils'
  import { Add, Statement } from '@vicons/carbon'
  import rechangeDialog  from '../myApplication/rechangeDialog.vue'
  import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from '@/api/dept'
  const router = useRouter()

  //
  const handleExpandChange = (row: any, expandedRows: any) => {
    row.leader = '张三'
    row.phone = 'aaaaaaaaaa'
    row.email = 'aaaaaaaaaa'
    row.consumed = 1000
    row.remainPoint = 200
  }

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

  // const { proxy } = getCurrentInstance()

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

  // 子组织
  const openSubGroup = ref(false)
  const subGroupTitle = ref('')
  const subGroupFormRef = ref(null)
  const refreshTable = ref(true)
  const subGroupFormData = ref({
    id: '',
    parentId: '',
    name: '',
    leader: '',
    phone: '',
    email: ''
  })

  import { validatePhone, validateEmail } from '@/utils/validate'

  const groupFormRules = reactive({
    parentId: [{ required: true, message: '上级组织不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '请输入子组织名称', trigger: ['blur', 'change'] }],
    leader: [{ required: true, message: '请输入负责人', trigger: ['blur', 'change'] }],
    phone: [
      { required: true, message: '请输入正确电话号码', trigger: ['blur', 'change'] },
      { validator: validatePhone, trigger: ['blur', 'change'] }
    ],
    email: [{ required: true,  type: 'email', message: '请输入正确邮箱', trigger: ['blur', 'change'] }]
  })

  /** 查询组织列表 */
  function getList() {
    return groupList.value
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
  function resetSubGroupForm() {
    subGroupFormData.value.id = ''
    subGroupFormData.value.parentId = currentGroupId.value
    subGroupFormData.value.name = ''
    subGroupFormData.value.leader = ''
    subGroupFormData.value.phone = ''
    subGroupFormData.value.email = ''
  }
  
    /** 取消按钮 */
  function handleSubGroupClose() {
    openSubGroup.value = false
    resetSubGroupForm();
    subGroupFormRef.value.resetFields()
    subGroupFormRef.value.clearValidate()
  }
  
  function AddSubGroup(row) {
    subGroupTitle.value = '新建子组织'
    openSubGroup.value = true
    subGroupFormData.value.parentId = currentGroupId.value
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    subGroupFormData.value = row
    subGroupTitle.value = '修改子组织'
    openSubGroup.value = true
  }

  /** 提交按钮 */
  function handleSubGroupSubmit() {
    subGroupFormRef.value.validate(valid => {
      if (valid) {
        if (subGroupFormData.value.id != undefined) {
          // updateDept(subGroupFormData.value).then(response => {
          //   openSubGroup.value = false
          //   getList()
          // })
          handleSubGroupClose()
        } else {
          // addDept(subGroupFormData.value).then(response => {
          //   openSubGroup.value = false
          //   getList()
          // })
          handleSubGroupClose()
        }
      }
    })
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    ElMessageBox.confirm(`确认删除 [${row.name}] ?`)
      .then(function () {
        return delDept(row.id)
      })
      .then(() => {
        getList()
        ElMessage.success('删除成功')
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
  const clickTreeNode = data => {
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

  const removeGroup = node => {
    ElMessageBox.confirm(`确认删除 ${node.data.label} ?`)
      .then(function () {
        // delDept(node.data.id)
        const parent = node.parent
        const children = parent.data.children || parent.data
        const index = children.findIndex(d => d.id === node.data.id)
        children.splice(index, 1)
        
        ElMessage.success('删除成功')
      })
      .catch(() => {})
  }

  // 父组织
  const groupTitle = ref('新建组织')
  const groupFormRef = ref(null)
  const groupOpen = ref(false)
  const groupFormData = ref({
    id: '',
    name: ''
  })
  
  const resetGroupForm = () => {
    groupFormData.value.id = ''
    groupFormData.value.name = ''
  }

  // 打开父组织弹框
  const AddGroup = () => {
    groupTitle.value = '新建组织'
    groupOpen.value = true
  }

  // 关闭父组织弹框
  const handleGroupClose = () => {
    groupOpen.value = false
    resetGroupForm();
    groupFormRef.value.resetFields()
    groupFormRef.value.clearValidate()
  }

  // 提交父组织表单
  const handleGroupSubmit = () => {
    groupFormRef.value.validate(valid => {
      if (valid) {
        if (groupFormData.value.id != undefined) {
          handleGroupClose()
        } else {
          handleGroupClose()
        }
      }
    })
  }

  const updateGroup = data => {
    let rawData = toRaw(data)
    groupTitle.value = '修改组织'
    groupFormData.value.id = rawData.id
    groupFormData.value.name = rawData.label
    groupOpen.value = true
  }

  // 打开充值弹框的方法
  const rechangeDialogRef = ref(null)
  const openRechargeDialog = (row) => {
    rechangeDialogRef.value.disabledOpen(currentGroupId, row.id)
  }

  //
  const openBillPage = row => {
    let path = router.resolve({ path: '/transactionRecord' })
    window.open(path.href, '_blank')
  }
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
