<template>
  <div class="app-container flex flex-row">
    <div class="tree-container">
      <div class="tree-header">
        <el-input
          v-model="filterText"
          placeholder="请输入组织名称"
          clearable
          class="mr-2"
          suffix-icon="Search"
        />
      </div>
      <div class="flex-1 pr-2 pb-2 overflow-y-auto overflow-x-hidden">
        <el-tree
          ref="treeRef"
          node-key="id"
          :data="deptTreeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          highlight-current
          accordion
          @node-click="handleNodeClick"
          class="h-full"
        ></el-tree>
      </div>
    </div>
    <div class="user-container">
      <div class="flex justify-between items-center mb-4">
        <span class="text-bold">
          <span class="mr-2">当前组织名称:</span>
          <el-tag type="primary" v-show="currentNode.name != ''">
            {{ currentNode.parentName }}
            <span class="px-1">-</span>
            {{ currentNode.name }}
          </el-tag>
        </span>
      </div>
      <div class="flex justify-between items-center mb-4">
        <div>
          <el-button type="primary" @click="addNewUser" :disabled="currentNode.id == ''">
            <Icon size="20">
              <Add />
            </Icon>
            添加新用户
          </el-button>
          <!--   <el-button type="primary" @click="addExsistUser" :disabled="currentNode.id == ''">
            <Icon size="20">
              <Link />
            </Icon>
            关联已有用户
          </el-button> -->
        </div>
        <div>
          <el-input
            v-model="filterTableText"
            placeholder="请输入用户名"
            clearable
            suffix-icon="Search"
          />
        </div>
      </div>

      <div class="flex-1 w-full">
        <el-table :data="filterTableData" show-overflow-tooltip>
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="role" label="角色">
            <template #default="{ row }">
              {{ getClientRoleZn(row.role).label }}
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="电话" />
          <el-table-column prop="email" label="邮箱" />
          
          <!-- <el-table-column prop="osecName" label="组织" /> -->
           
          <!-- <el-table-column prop="lastOperateTime" label="更新时间" width="200">
            <template #default="{ row }">
              {{ moment(row.lastOperateTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </el-table-column> -->
          
          <!-- <el-table-column prop="operation" label="操作" width="160">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">修改</el-button>
              <el-button type="primary" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
    </div>
    <el-dialog :title="addUserTitle" v-model="addUserDialogVisible" width="600px">
      <el-form
        ref="addUserFormRef"
        :model="addUserForm"
        label-width="70px"
        :rules="addUserFormRules"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addUserForm.name" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="addUserForm.phone" maxlength="11" @input="handlePhoneInput" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addUserForm.role" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审批人" prop="approver">
          <el-select v-model="addUserForm.approver" placeholder="请选择审批人">
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
        <span class="dialog-footer">
          <el-button type="primary" @click="handleSubmitUser">确 定</el-button>
          <el-button @click="closeAddUserDialog">取 消</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog title="添加已有用户" v-model="addExsistUserDialogVisible" width="1000px">
      <div>
        <el-form :model="searchForm">
          <el-row :gutter="4">
            <el-col :span="5">
              <el-form-item label="父组织">
                <el-select
                  v-model="searchForm.parentGroupId"
                  placeholder="请选择父组织"
                ></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="子组织">
                <el-select v-model="searchForm.subGroupId" placeholder="请选择子组织"></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="姓名">
                <el-input v-model="searchForm.name" placeholder="请输入姓名"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="电话">
                <el-input v-model="searchForm.phone" placeholder="请输入电话"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <el-button link icon="Search" type="primary" class="mt6px">搜索</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-table>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="email" label="邮箱" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="addExsistUserDialogVisible = false">确 定</el-button>
          <el-button @click="addExsistUserDialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { Add, Link } from '@vicons/carbon'
  import { validateEmail, validatePhone } from '@/utils/validate'

  import { addSecondUser, getSecondUser } from '@/api/user'
  import { getDeptTree, getApproverList } from '@/api/dept'

  import { getClientRoleZn } from '@/utils/cnMap'

  import moment from 'moment'

  // left content
  const treeRef = ref(null)
  const filterText = ref('')
  const defaultProps = ref({
    children: 'osecList',
    label: 'name'
  })

  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.name.includes(value)
  }
  watch(filterText, val => {
    treeRef.value!.filter(val)
  })

  const handleNodeClick = (nodeData, node, tree, event) => {
    if (node.level == 1) {
      currentNode.value.id = ''
      currentNode.value.name = ''
      currentNode.value.parentName = ''
      tableData.value = []
    }
    if (node.level == 2) {
      let parentNodeData = toRaw(node.parent.data)
      let rawData = toRaw(node.data)
      currentNode.value.id = rawData.id
      currentNode.value.name = rawData.name
      currentNode.value.parentName = parentNodeData.name

      getSecondUser(currentNode.value.id).then(res => {
        if (res.state == 200) {
          tableData.value = res.data
        }
      })
    }
  }

  const deptTreeData = ref([])
  const initDeptTreeData = async () => {
    getDeptTree().then(res => {
      if (res.state == 200) {
        deptTreeData.value = res.data
      }
    })
  }
  initDeptTreeData()

  // right content
  const filterTableText = ref('')

  const filterTableData = computed(() => {
    let tmp = tableData.value

    if (filterTableText.value) {
      tmp = tableData.value.filter(data =>
        data.name.toLowerCase().includes(filterTableText.value.toLowerCase())
      )
    }
    return tmp
  })

  const currentNode = ref({
    id: '',
    name: '',
    parentName: ''
  })

  const tableData = ref([])

  const addUserFormRef = ref(null)
  const addUserDialogVisible = ref(false)

  const handleSubmitUser = () => {
    addUserFormRef.value.validate((valid: boolean) => {
      if (valid) {
        if (addUserForm.value.id == '') {
          let user = toRaw(addUserForm.value)
          delete user.id
          addSecondUser({
            approver: addUserForm.value.approver,
            users: [user],
            oSecId: currentNode.value.id
          }).then(res => {
            if (res.state == 200) {
              ElMessage.success('提交审批成功！')
              addUserDialogVisible.value = false
            }
          })
        } else {
          // 更新
        }
      }
    })
  }

  const closeAddUserDialog = () => {
    setDefaultValue()
    addUserDialogVisible.value = false
  }

  const setDefaultValue = () => {
    addUserForm.value.name = ''
    addUserForm.value.phone = ''
    addUserForm.value.email = ''
    addUserForm.value.role = 'USER'
    addUserForm.value.approver = ''

    addUserFormRef.value.resetFields()
    addUserFormRef.value.clearValidate()
  }

  const handlePhoneInput = event => {
    addUserForm.value.phone = addUserForm.value.phone.replace(/\D/g, '')
  }

  const addUserTitle = ref('添加新用户')
  const addUserForm = ref({
    id: '',
    name: '',
    phone: '',
    email: '',
    role: 'USER',
    approver: ''
  })

  const approverOptions = ref([])

  const initApproverList = async () => {
    getApproverList().then(res => {
      if (res.state == 200) {
        approverOptions.value = res.data
      }
    })
  }
  initApproverList()

  const roleOptions = ref([
    {
      label: '管理员',
      value: 'USER_M'
    },
    {
      label: '普通用户',
      value: 'USER'
    }
  ])

  const addUserFormRules = ref({
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入电话', trigger: 'blur' },
      { validator: validatePhone, trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { validator: validateEmail, trigger: 'blur' }
    ],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }],
    approver: [{ required: true, message: '请选择审批人', trigger: 'change' }]
  })

  const handleEdit = row => {
    addUserTitle.value = '编辑用户'
    addUserDialogVisible.value = true
    addUserForm.value = row
  }

  const handleDelete = row => {
    ElMessageBox.confirm(`确定删除该用户 [${row.name}] 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage({
        type: 'success',
        message: '删除成功!'
      })
    })
  }

  const addNewUser = () => {
    addUserTitle.value = '添加新用户'
    addUserDialogVisible.value = true
  }

  const addExsistUser = () => {
    addExsistUserDialogVisible.value = true
  }

  const addExsistUserDialogVisible = ref(false)

  const searchForm = ref({
    parentGroupId: '',
    subGroupId: '',
    name: '',
    phone: '',
    email: ''
  })
</script>

<style scoped lang="scss">
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

  .user-container {
    @apply flex-1 flex flex-col;
  }
</style>
