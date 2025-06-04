<template>
  <div class="app-container">
    <div class="h-full flex flex-col">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="组织名称" prop="deptName">
          <el-input v-model="queryParams.deptName" placeholder="请输入组织名称" clearable style="width: 200px"
            @keyup.enter="handleQuery" />
        </el-form-item>

        <el-form-item class="ml-[-20px]">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <!--  <el-button icon="Refresh" @click="resetQuery">重置</el-button> -->
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb-4">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
        </el-col> -->
      </el-row>

      <div class="flex-1 w-full">
        <el-table ref="tableRef" v-if="refreshTable" :max-height="maxHeight" row-key="id" :data="groupList"
          :default-expand-all="isExpandAll" :tree-props="{ children: 'children' }">
          <el-table-column prop="date" label="日期" width="200" />
          <el-table-column prop="school" label="学校" />
          <el-table-column prop="college" label="学院" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)">新增</el-button>
              <el-button v-if="scope.row.parentId != 0" link type="primary" icon="Delete"
                @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加或修改组织对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
        <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="24" v-if="form.parentId !== 0">
              <el-form-item label="上级组织" prop="parentId">
                <el-tree-select v-model="form.parentId" :data="groupList"
                  :props="{ value: 'id', label: 'school', children: 'children' }" value-key="id" placeholder="选择上级组织"
                  check-strictly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="组织名称" prop="deptName">
                <el-input v-model="form.deptName" placeholder="请输入组织名称" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="显示排序" prop="orderNum">
                <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="负责人" prop="leader">
                <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
              </el-form-item>
            </el-col>

          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/dept"

const tableRef = ref(null)
const maxHeight = ref(400)
const computeHeight = async () => {
  maxHeight.value = window.innerHeight - 178;
  refreshTable.value = false
  await nextTick();
  refreshTable.value = true
}

onMounted(() => {
  computeHeight();
  window.addEventListener("resize", computeHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", computeHeight)
})

const { proxy } = getCurrentInstance()
// const { sys_normal_disable } = proxy.useDict("sys_normal_disable")

const groupList = ref([{
  id: 1,
  date: '2016-05-02',
  school: 'wangxiaohu',
  college: 'No. 189, Grove St, Los Angeles',
},
{
  id: 2,
  date: '2016-05-04',
  school: 'wangxiaohu',
  college: 'No. 189, Grove St, Los Angeles',
},
{
  id: 3,
  date: '2016-05-01',
  school: 'wangxiaohu',
  college: 'No. 189, Grove St, Los Angeles',
  children: [
    {
      id: 31,
      date: '2016-05-01',
      school: 'wangxiaohu',
      college: 'No. 189, Grove St, Los Angeles',
    },
    {
      id: 32,
      date: '2016-05-02',
      school: 'zhangsan',
      college: 'No. 200, Main St, New York',
    },
    {
      id: 33,
      date: '2016-05-03',
      school: 'lisi',
      college: 'No. 300, Oak Ave, Chicago',
    },
    {
      id: 34,
      date: '2016-05-04',
      school: 'wangwu',
      college: 'No. 400, Pine Rd, Houston',
    },
    {
      id: 35,
      date: '2016-05-05',
      school: 'zhaoliu',
      college: 'No. 500, Elm St, Phoenix',
    },
    {
      id: 36,
      date: '2016-05-06',
      school: 'chenqi',
      college: 'No. 600, Maple Dr, Philadelphia',
    },


  ],
},
{
  id: 4,
  date: '2016-05-03',
  school: 'wangxiaohu',
  college: 'No. 189, Grove St, Los Angeles',
  children: [
    {
      id: 37,
      date: '2016-05-07',
      school: 'sunba',
      college: 'No. 700, Cedar Ln, San Antonio',
    },
    {
      id: 38,
      date: '2016-05-08',
      school: 'lijiu',
      college: 'No. 800, Birch St, San Diego',
    },
    {
      id: 39,
      date: '2016-05-09',
      school: 'zhoushi',
      college: 'No. 900, Willow Way, Dallas',
    },
    {
      id: 40,
      date: '2016-05-10',
      school: 'wuyi',
      college: 'No. 1000, Rose Rd, San Jose',
    },
  ]
},
])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
// const groupList = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)

const data = reactive({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined
  },
  rules: {
    parentId: [{ required: true, message: "上级组织不能为空", trigger: "blur" }],
    deptName: [{ required: true, message: "组织名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询组织列表 */
function getList() {
  return groupList.value;
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  }
  // proxy.resetForm("deptRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  // proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset()
  // listDept().then(response => {
  //   groupList.value = proxy.handleTree(response.data, "id")
  // })
  if (row != undefined) {
    form.value.parentId = row.id
  }
  open.value = true
  title.value = "添加组织"
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  // reset()
  // listDeptExcludeChild(row.id).then(response => {
  //   groupList.value = proxy.handleTree(response.data, "id")
  // })
  // getDept(row.id).then(response => {
  //   form.value = response.data
  //   open.value = true
  //   title.value = "修改组织"
  // })
  form.value = row
  open.value = true
  title.value = "修改组织"
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deptRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateDept(form.value).then(response => {
          open.value = false
          getList()
        })
      } else {
        addDept(form.value).then(response => {
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除名称为"' + row.deptName + '"的数据项?').then(function () {
    return delDept(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

getList()
</script>
