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
          :data="levelTreeData"
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
      <div class="flex justify-between items-center">
        <span class="text-bold">
          <span class="mr-2">当前组织名称:</span>
          <el-tag type="primary" v-show="currentGroup != ''">
            {{ currentParentGroup }}
            <span class="px-1">-</span>
            {{ currentGroup }}
          </el-tag>
        </span>
      </div>
      <div class="flex justify-between items-center mt-2">
        <div>
          <el-button type="primary" icon="Plus" @click="addNewUser">添加新用户</el-button>
          <el-button type="primary" icon="Plus" @click="addExsistUser">添加已有用户</el-button>
        </div>
        <div>
          <el-input
            v-model="filterText"
            placeholder="请输入用户名"
            clearable
            suffix-icon="Search"
          />
        </div>
      </div>

      <div class="flex-1 w-full">
        <el-table :data="tableData">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="phone" label="电话" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="gouprs" label="组织" />
          <el-table-column prop="time" label="更新时间" width="200" />
          <el-table-column prop="operation" label="操作" width="160">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">修改</el-button>
              <el-button type="primary" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
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
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="addUserDialogVisible = false">确 定</el-button>
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
  import { validateEmail, validatePhone } from '@/utils/validate'
  // left content
  const filterText = ref('')

  const defaultProps = ref({
    children: 'children',
    label: 'label'
  })

  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.label.includes(value)
  }

  const handleNodeClick = (nodeData, node, tree, event) => {
    let rawData = toRaw(node)
    if (rawData.isLeaf) {
      currentGroupId.value = rawData.id
      currentGroup.value = rawData.label

      currentParentGroup.value = rawData.parent.data.label
    }
  }

  const levelTreeData = ref([])
  levelTreeData.value = [
    {
      id: 1,
      label: '西安电子科技大学',
      children: [
        {
          id: 11,
          label: '计算机科学与技术学院'
        },
        {
          id: 12,
          label: '电子工程学院'
        },
        {
          id: 13,
          label: '通信工程学院'
        },
        {
          id: 14,
          label: '软件学院'
        },
        {
          id: 15,
          label: '网络与信息安全学院'
        }
      ]
    },
    {
      id: 2,
      label: '北京大学',
      children: [
        {
          id: 21,
          label: '信息科学技术学院'
        },
        {
          id: 22,
          label: '数学科学学院'
        },
        {
          id: 23,
          label: '物理学院'
        },
        {
          id: 24,
          label: '化学与分子工程学院'
        },
        {
          id: 25,
          label: '生命科学学院'
        }
      ]
    },
    {
      id: 3,
      label: '清华大学',
      children: [
        {
          id: 31,
          label: '计算机科学与技术系'
        },
        {
          id: 32,
          label: '电子工程系'
        },
        {
          id: 33,
          label: '自动化系'
        },
        {
          id: 34,
          label: '软件学院'
        },
        {
          id: 35,
          label: '网络科学与网络空间研究院'
        }
      ]
    }
  ]

  // right content
  const currentGroupId = ref('')
  const currentParentGroup = ref('')
  const currentGroup = ref('')

  const tableData = ref([
    {
      name: '张三',
      time: '2023-01-01 12:00:00'
    },
    {
      name: '李四',
      time: '2023-01-01 12:00:00'
    },
    {
      name: '王五',
      time: '2023-01-01 12:00:00'
    }
  ])

  const addUserFormRef = ref(null)
  const addUserDialogVisible = ref(false)
  const closeAddUserDialog = () => {
    setDefaultValue()
    addUserDialogVisible.value = false
  }

  const setDefaultValue = () => {
    addUserForm.value.name = ''
    addUserForm.value.phone = ''
    addUserForm.value.email = ''

    addUserFormRef.value.resetFields()
    addUserFormRef.value.clearValidate()
  }

  const handlePhoneInput = event => {
    addUserForm.value.phone = addUserForm.value.phone.replace(/\D/g, '')
  }

  const addUserTitle = ref('添加新用户')
  const addUserForm = ref({
    name: '',
    phone: '',
    email: ''
  })

  const addUserFormRules = ref({
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入电话', trigger: 'blur' },
      { validator: validatePhone, trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { validator: validateEmail, trigger: 'blur' }
    ]
  })

  const handleEdit = row => {
    addUserTitle.value = '编辑用户'
    addUserDialogVisible.value = true
    addUserForm.value = row
  }

  const handleDelete = row => {
    console.log(ElMessage)
    ElMessageBox.confirm('确定删除该用户吗？', '提示', {
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
