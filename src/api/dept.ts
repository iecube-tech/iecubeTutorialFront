import request from '@/utils/request'

// 获取一级部门列表
export const getFirstGroup = (params: any) => {
  return request({
    url: '/sm/o/osg/top',
    method: 'get',
  })
}

// 获取第二组列表
export const getSecondGroupList = (id: any) => {
  return request({
    url: `/sm/o/osg/sec/${id}`,
  })
}

// 新建一级组织
export const createFirstGroup = (name: any) => {
  return request({
    url: '/sm/o/org/top/create',
    method: 'post',
    data: {name, type: 'ORGANIZATION'},
  })
}