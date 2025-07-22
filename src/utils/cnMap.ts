/**
 * 全局状态映射中文对照关系表
 */

export const getGroupTypeZn = (en: string) => {
  const ar = [
    { en: 'ORGANIZATION', label: '组织', type: 'primary' },
    { en: 'INDIVIDUAL', label: '个人', type: 'info' }
  ]
  let item = ar.find(_ => _.en === en)
  return item
}

export const getGroupStatusZn = (en: string) => {
  const ar = [{ en: 'ENABLED', label: '已启用', type: 'success' }]
  let item = ar.find(_ => _.en === en)
  return item
}

export const getApplyTypeZn = (en: string) => {
  const ar = [
    { label: '添加用户', en: 'ACCOUNT_ADD', type: 'warning' },
    { label: '添加组织', en: 'ORG_SEC_ADD', type: 'success' },
    { label: '定价变更', en: 'PRICE_CHANGE', type: 'danger' },
    { label: '充值', en: 'RECHARGE', type: 'primary' }
  ]
  let item = ar.find(_ => _.en === en)
  return item
}

export const applyStatus = [
  { label: '待审核', value: 'PENDING', type: 'warning' },
  { label: '已通过', value: 'APPROVED', type: 'success' },
  { label: '已拒绝', value: 'REJECTED', type: 'danger' }
]

export const getApplyStatusZn = (value: string) => {
  let item = applyStatus.find(_ => _.value === value)
  return item
}

export const manageUserRoles = [
  { value: 'ADMIN', label: '管理员', type: 'primary' },
  { value: 'OPERATOR', label: '运营', type: 'warning' },
  { value: 'SUPER', label: '超级管理员', type: 'success' }
]

export const getRoleZn = (value: string) => {
  let item = manageUserRoles.find(_ => _.value === value)
  return item
}

export const userStatus = [
  { label: '已启用', value: 'ENABLED', type: 'success' },
  { label: '已禁用', value: 'DISABLED', type: 'danger' }
]

export const getUserStatusZn = (value: string) => {
  let item = userStatus.find(_ => _.value === value)
  return item
}

// 客户端角色映射
export const clientRoles = [
  {
    value: 'USER',
    label: '普通用户'
  },
  {
    value: 'USER_M',
    label: '组织管理员'
  }
]

export const getClientRoleZn = (value: string) => {
  let item = clientRoles.find(_ => _.value === value)
  return item
}


export const projectStatus = [
  { label: '准备中', value: 'NOTReady', type: 'info' },
  { label: '生成中', value: 'GENERATING', type: 'warning' },
  { label: '完成', value: 'DONE', type: 'success' },
  { label: '失败', value: 'FAILED', type: 'danger' }
]

export const getProjectStatusZn = (value: string) => {
  let item = projectStatus.find(_ => _.value === value)
  return item
}