<template>
  <div class="app-container flex flex-col">
    <div class="flex justify-between mb-4">
      <div>
        <el-button type="primary" link @click="handleOpenAddDialog">
          <Icon>
            <Add />
          </Icon>
          新建管理员
        </el-button>
      </div>
      <div>
        <el-button type="primary" link @click="initTable">
          <Icon>
            <Renew />
          </Icon>
          刷新
        </el-button>
      </div>
    </div>
    <div>
      <el-table :data="tableData">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getUserStatusZn(row.status).type">
              {{ getUserStatusZn(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="180">
          <template #default="{ row }">
            <el-tag :type="getRoleZn(row.role).type">
              {{ getRoleZn(row.role).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="180" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              v-if="row.status == 'ENABLED'"
              type="danger"
              link
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button v-else type="primary" link @click="handleEnable(row)">启用</el-button>
            <el-button type="primary" link @click="handleOpenUpdateDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="handleDel(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="superUserDialog.title" v-model="superUserDialog.visible" width="30%">
      <el-form
        :model="superUserDialog.formData"
        ref="formDataRef"
        :rules="superUserDialog.rules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="superUserDialog.formData.name" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input
            v-model="superUserDialog.formData.phone"
            maxlength="11"
            :disabled="superUserDialog.state == 'update'"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="superUserDialog.formData.role">
            <el-option
              v-for="item in manageUserRoles"
              :label="item.label"
              :key="item.value"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="close">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
  import { Add, Renew } from '@vicons/carbon'
  import { manageUserRoles, getRoleZn, getUserStatusZn } from '@/utils/cnMap'
  import { validatePhone } from '@/utils/validate'

  import { getUsers, addUser, updateUser, delUser, enableUser, disableUser } from '@/api/superUser'
  const tableData = ref([])

  function initTable() {
    getUsers().then(res => {
      if (res.state == 200) {
        tableData.value = res.data
      }
    })
  }

  initTable()

  const formDataRef = ref(null)
  const superUserDialog = ref({
    title: '新建管理员',
    visible: false,
    state: 'add',
    formData: {
      name: '',
      role: '',
      phone: ''
    },
    rules: {
      name: [{ required: true, message: '请输入姓名', trigger: ['blur', 'change'] }],
      phone: [
        { required: true, message: '请输入电话', trigger: ['blur', 'change'] },
        { validator: validatePhone, trigger: ['blur', 'change'] }
      ],
      role: [{ required: true, message: '请选择角色', trigger: ['blur', 'change'] }]
    }
  })

  const resetFormData = () => {
    superUserDialog.value.formData = {
      name: '',
      role: '',
      phone: ''
    }
  }

  const handleOpenAddDialog = () => {
    superUserDialog.value.title = '新建管理员'
    superUserDialog.value.state = 'add'
    superUserDialog.value.visible = true
    resetFormData()
    formDataRef.value.resetFields()
    formDataRef.value.clearValidate()
  }

  const handleOpenUpdateDialog = row => {
    superUserDialog.value.title = '编辑管理员'
    superUserDialog.value.state = 'update'
    superUserDialog.value.visible = true
    let { name, phone, role } = toRaw(row)
    superUserDialog.value.formData = { name, phone, role }
  }

  const close = () => {
    superUserDialog.value.title = '新建管理员'
    superUserDialog.value.state = 'add'
    superUserDialog.value.visible = false
    resetFormData()
    formDataRef.value.resetFields()
    formDataRef.value.clearValidate()
  }

  const handleSubmit = () => {
    formDataRef.value.validate((valid: boolean) => {
      if (valid) {
        if (superUserDialog.value.state == 'add') {
          addUser(superUserDialog.value.formData).then(res => {
            if (res.state == 200) {
              close()
              initTable()
            }
          })
        } else {
          updateUser(superUserDialog.value.formData).then(res => {
            if (res.state == 200) {
              close()
              initTable()
            }
          })
        }
      }
    })
  }

  const handleDisable = row => {
    disableUser(row).then(res => {
      if (res.state == 200) {
        initTable()
      }
    })
  }

  const handleEnable = row => {
    enableUser(row).then(res => {
      if (res.state == 200) {
        initTable()
      }
    })
  }

  const handleDel = row => {
    ElMessageBox.confirm(`确定删除该管理员[${row.name}]吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      let { name, phone, role } = toRaw(row)
      delUser({ name, phone, role }).then(res => {
        if (res.state == 200) {
          initTable()
        }
      })
    })
  }
</script>

<style lang="scss" scoped>
  :deep(.el-tag) {
    width: 80px;
  }
</style>
