import request from '@/utils/request'

// 新建二级组织下用户
export function addSecondUser(data: any) {
  return request({
    url: '/sm/o/org/sec/users/add',
    method: 'post',
    data // {users： []}
  })
}

// 获取二级组织下用户
export function getSecondUser(oSecId: any) {
  return request({
    url: `/sm/o/org/users/${oSecId}`,
    method: 'get'
  })
}
