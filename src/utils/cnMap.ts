/**
 * 全局状态映射中文对照关系表
 */

export const getGroupTypeZn = (label_en: string) => {
  const ar = [
    {label_en: 'ORGANIZATION', label: '团队类型', type: 'success'},
    {label_en: 'INDIVIDUAL', label: '个人类型', type: 'info'},
  ]
  let item = ar.find((item) => item.label_en === label_en)
  return item
}

export const getGroupStatusZn = (label_en: string) => {
  const ar = [
    {label_en: 'ENABLED', label: '已启用', type: 'success'},
  ]
  let item = ar.find((item) => item.label_en === label_en)
  return item
}