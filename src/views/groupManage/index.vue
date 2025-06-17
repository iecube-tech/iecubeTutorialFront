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
        <Icon class="text-zeng text-2xl mr-2 cursor-pointer" @click="AddGroup" title="新建父组织">
          <Add></Add>
        </Icon>
      </div>
      <div class="flex-1 pr-2 pb-2 overflow-y-auto overflow-x-hidden">
        <el-tree
          ref="treeRef"
          :data="GroupTree"
          :props="defaultProps"
          node-key="id"
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
               <!--  <el-icon @click.stop="removeGroup(node, data)">
                  <Delete />
                </el-icon> -->
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
          :data="filterTableData"
          @expand-change="handleExpandChange"
        >
          <el-table-column type="expand">
            <template #default="props">
              <div class="px-4">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="已用积分">
                    <span class="text-red-400">{{ props.row.consumed }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="剩余积分">
                    <span class="text-green-400">{{ props.row.remainPoint }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间">
                    <span>{{ moment(props.row.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="人数限制">
                    {{ props.row.limit }}
                  </el-descriptions-item>
                  <el-descriptions-item label="组织类型">
                    {{ getGroupTypeZn(props.row.type).label }}
                  </el-descriptions-item>
                  <el-descriptions-item label="状态">
                    {{ getGroupStatusZn(props.row.status).label }}
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
  import moment from 'moment'
  import { getGroupTypeZn, getGroupStatusZn } from '@/utils/cnMap'
  import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue'
  import { Icon } from '@vicons/utils'
  import { Add, Statement } from '@vicons/carbon'
  import rechangeDialog from '../myApplication/rechangeDialog.vue'
  import { getFirstGroup, getSecondGroupList, createFirstGroup } from '@/api/dept'
  const router = useRouter()

  onMounted(() => {
    computeHeight()
    window.addEventListener('resize', computeHeight)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', computeHeight)
  })

  //
  const handleExpandChange = (row: any, expandedRows: any) => {
    
    row.consumed = 1000
    row.remainPoint = 200
  }

  // 右侧相关数据
  const currentGroupId = ref('')
  const currentGroup = ref('')
  const searchText = ref('')
  
  const filterTableData = computed(() =>
  subGroupList.value.filter(
    (data) =>
      !searchText.value ||
      data.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
)
  

  const tableRef = ref(null)
  const maxHeight = ref(400)
  const computeHeight = async () => {
    maxHeight.value = window.innerHeight - 178
    refreshTable.value = false
    await nextTick()
    refreshTable.value = true
  }

  const subGroupList = ref([])

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
    email: [
      { required: true, type: 'email', message: '请输入正确邮箱', trigger: ['blur', 'change'] }
    ]
  })

  /** 搜索按钮操作 */
  function handleQuery() {
    getSubGroupList()
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
    resetSubGroupForm()
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
          handleSubGroupClose()
        } else {
          handleSubGroupClose()
        }
      }
    })
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    ElMessageBox.confirm(`确认删除 [${row.name}] ?`)
      .then(function () {
        // return delDept(row.id)
      })
      .then(() => {
        getSubGroupList()
        ElMessage.success('删除成功')
      })
      .catch(() => {})
  }

  // 左侧树相关操作
  const GroupTree = ref([])

  // 一级部门
  function getFirstGroupTree() {
    getFirstGroup().then(res => {
      GroupTree.value = res.data
    })
  }

  getFirstGroupTree()

  // 二级部门
  function getSubGroupList() {
    let firstGroupId = currentGroupId.value
    getSecondGroupList(firstGroupId).then(res => {
      subGroupList.value = res.data
    })
  }

  const treeRef = ref(null)
  const filterText = ref('') // 树形控件过滤
  const defaultProps = {
    children: '', // 默认只显示一级树不显示子集 children为空
    label: 'name'
  }
  const clickTreeNode = data => {
    let rawData = toRaw(data)
    subGroupFormData.value.parentId = rawData.id
    currentGroupId.value = rawData.id
    currentGroup.value = rawData.name
    searchText.value = ''
    getSubGroupList()
  }
  const filterNode = (value, data) => {
    if (!value) return true
    return data.name.includes(value)
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
    resetGroupForm()
    groupFormRef.value.resetFields()
    groupFormRef.value.clearValidate()
  }

  // 提交父组织表单
  const handleGroupSubmit = async () => {
    groupFormRef.value.validate(async valid => {
      if (valid) {
        if (groupFormData.value.id != '') {
          // 更新
        } else {
          // 新增
          await createFirstGroup(groupFormData.value.name).then( res=>{
          })
        }
        handleGroupClose()
        getFirstGroupTree()
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
  const openRechargeDialog = row => {
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
