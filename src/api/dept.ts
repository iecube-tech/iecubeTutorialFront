import request from '@/utils/request'

// 获取一级部门列表
export const getFirstGroupList = (params: any) => {
  return request({
    url: '/sm/o/org/top',
    method: 'get',
  })
}

// 修改一级部门
export const updateFirstGroup = (data: any) => {
  return request({
    url: '/sm/o/org/top',
    method: 'post',
    data: data,
  })
}

// 删除一级部门
export const deleteFirstGroup = (data: any) => {
  return request({
    url: `/sm/o/org/top`,
    method: 'delete',
    data: data
  })
}


// 获取第二组列表
export const getSecondGroupList = (id: any) => {
  return request({
    url: `/sm/o/org/sec/${id}`,
  })
}

// 新建一级部门
export const createFirstGroup = (name: any) => {
  return request({
    url: '/sm/o/org/top/create',
    method: 'post',
    data: {name, type: 'ORGANIZATION'},
  })
}

// 新建二级部门
export const createSecondGroup = (data: any) => {
  return request({
    url: '/sm/o/org/sec/create',
    method: 'post',
    data: data,
  })
}

// 获取审批人列表
export const getApproverList = (params: any) => {
  return request({
    url: '/sm/o/approves',
    method: 'get',
  })
}


// 用于获取消费详情
export const getConsumedDetail = (secondGroupId: any) => {
  return request({
    url: `/sm/o/org/points/consumed/${secondGroupId}`,
    method: 'get',
  })
}

// 用于获取金额详情
export const getAmountDetail = (secondGroupId: any) => {
  return request({
    url: `/sm/o/org/points/valid/${secondGroupId}`,
    method: 'get',
  })
}

// 查询一二级部门树
export const getDeptTree = (params: any) => {
  return request({
    url: '/sm/o/org/list',
    method: 'get',
  })
}

export const getSecondGroupBill = (secondGroupId: any) => {
  return request({
    url: `/sm/o/org/points/bill/${secondGroupId}`,
    method: 'get',
  })
}
