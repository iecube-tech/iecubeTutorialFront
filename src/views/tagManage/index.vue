<template>
  <div class="app-container">
    <div class="wh-full flex flex-col">
      <div>
        <el-button type="primary" @click="handleAdd">
          <Icon size="20"><Add></Add></Icon>
          新建
        </el-button>
      </div>
      <el-divider class="!my-2"></el-divider>
      <div class="h-0 flex-1">
        <el-table class="h-full" :data="tagList">
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="confirmDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <el-dialog title="新建标签" v-model="tagDialog.visible" width="30%" :show-close="false">
      <el-form ref="tagformRef" :model="tagDialog.form" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagDialog.form.name" maxlength="20" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleSumbit">确 定</el-button>
          <el-button @click="close">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
  import { Add } from '@vicons/carbon'

  import { getTagList, addTag, deleteTag } from '@/api/caseApi'

  const tagList = ref([])

  const getList = () => {
    getTagList().then(res => {
      if (res.state == 200) {
        tagList.value = res.data
      }
    })
  }
  
  const init= ()=>{
    getList()
  }
  
  init();
  
  
  const tagformRef = ref(null)
  const tagDialog = ref({
    visible: false,
    title: '新建标签',
    type: 'add',
    form: {
      name: '',
    },
  })
  
  const rules = ref({
    name: [
      { required: true, message: '请输入标签名称', trigger: ['blur', 'change'] },
    ],
  })
  
  const handleAdd = () => {
    tagDialog.value.title = '新建标签'
    tagDialog.value.visible = true
    tagDialog.value.type = 'add'
    tagformRef.value.clearValidate()
  }
  
  const close = () => {
    tagDialog.value.form.name = ''
    tagformRef.value.clearValidate()
    tagDialog.value.visible = false
  }
  
  const handleSumbit = () => {
    tagformRef.value.validate((valid: boolean) => {
      if (valid) {
        addTag(tagDialog.value.form).then(res=>{
          if(res.state == 200){
            close()
            getList()
          }
        })
      }
    })
  }
  
  const confirmDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除该标签 [ ${row.name} ]吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        deleteTag(row).then(res => {
          if (res.state == 200) {
            getList()
          }
        })
      })
      .catch(() => {})
  }


</script>

<style lang="scss" scoped></style>
