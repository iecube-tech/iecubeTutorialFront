import request from '@/utils/request'

// 获取部门列表
export const listDept = (params: any) => {
  return request({
    url: '/dept/list',
    method: 'get',
    params: params
  })
}

// 获取部门详情
export const getDept = (id: string | number) => {
  return request({
    url: `/dept/${id}`,
    method: 'get'
  })
}

// 删除部门
export const delDept = (id: string | number) => {
  return request({
    url: `/dept/${id}`,
    method: 'delete'
  })
}

// 添加部门
export const addDept = (data: any) => {
  return request({
    url: '/dept',
    method: 'post',
    data: data
  })
}

// 更新部门
export const updateDept = (id: string | number, data: any) => {
  return request({
    url: `/dept/${id}`,
    method: 'put',
    data: data
  })
}

// 获取部门列表（排除子部门）
export const listDeptExcludeChild = (params: any) => {
  return request({
    url: '/dept/list/exclude-child',
    method: 'get',
    params: params
  })
}


