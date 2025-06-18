/**
 * 全局状态映射中文对照关系表
 */

export const getGroupTypeZn = (en: string) => {
  const ar = [
    {en: 'ORGANIZATION', label: '组织', type: 'success'},
    {en: 'INDIVIDUAL', label: '个人', type: 'info'},
  ]
  let item = ar.find((item) => item.en === en)
  return item
}

export const getGroupStatusZn = (en: string) => {
  const ar = [
    {en: 'ENABLED', label: '已启用', type: 'success'},
  ]
  let item = ar.find((item) => item.en === en)
  return item
}