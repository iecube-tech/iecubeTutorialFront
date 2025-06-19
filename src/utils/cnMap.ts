/**
 * 全局状态映射中文对照关系表
 */

export const getGroupTypeZn = (en: string) => {
  const ar = [
    { en: 'ORGANIZATION', label: '组织', type: 'success' },
    { en: 'INDIVIDUAL', label: '个人', type: 'info' }
  ]
  let item = ar.find(item => item.en === en)
  return item
}

export const getGroupStatusZn = (en: string) => {
  const ar = [{ en: 'ENABLED', label: '已启用', type: 'success' }]
  let item = ar.find(item => item.en === en)
  return item
}

export const getApplyTypeZn = (en: string) => {
  const ar = [
    { label: '添加用户', en: 'ACCOUNT_ADD', type: 'info' },
    { label: '添加组织', en: 'ORG_SEC_ADD', type: 'success' },
    { label: '定价变更', en: 'PRICE_CHANGE', type: 'warning' },
    { label: '充值', en: 'RECHARGE', type: 'primary' }
  ]
  let item = ar.find(item => item.en === en)
  return item
}

export const applyStatus = [
  { label: '待审核', value: 'PENDING', type: 'info' },
  { label: '已通过', value: 'APPROVED', type: 'success' },
  { label: '已拒绝', value: 'REJECTED', type: 'danger' }
]

export const getApplyStatusZn = (value: string) => {
  let item = applyStatus.find(item => item.value === value)
  return item
}
