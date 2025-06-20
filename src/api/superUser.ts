// [SUPER] 管理端用户管理
import request from '@/utils/request'

// 导出一个函数getUsers，用于获取用户列表
export const getUsers = (params: any) => {
  return request({
    url: '/sm/s/user/list',
    method: 'get',
  })
}

// 导出一个函数，用于获取角色列表
export const getRoles = (params: any) => {
  return request({
    url: '/sm/s/user/roles',
    method: 'get',
  })
}

// 导出一个函数，用于删除用户
export const delUser = (data: any) => { // {name, phone, role}
  // 发送删除用户的请求
  return request({
    url: '/sm/s/user/del',
    method: 'delete',
    data: data
  })
}

// 导出一个函数addUser，用于添加用户
export const addUser = (data: any) => { // {name, phone, role}
  // 发送post请求，url为'/sm/s/user/add'，data为传入的参数
  return request({
    url: '/sm/s/user/add',
    method: 'post',
    data: data
  })
}
// 导出一个函数updateUser，用于更新用户信息
export const updateUser = (data: any) => { // {name, phone, role}
  // 发送post请求，url为'/sm/s/user/update'，data为传入的参数
  return request({
    url: '/sm/s/user/up',
    method: 'post',
    data: data
  })
}

// 导出一个函数disableUser，用于启用用户
export const enableUser = (data: any) => { // {name, phone, role}
  // 发送post请求，url为'/sm/s/user/update'，data为传入的参数
  return request({
    url: '/sm/s/user/enable',
    method: 'post',
    data: data
  })
}

// 导出一个函数disableUser，用于禁用用户
export const disableUser = (data: any) => { // {name, phone, role}
  // 发送post请求，url为'/sm/s/user/update'，data为传入的参数 
  return request({
    url: '/sm/s/user/disable',
    method: 'post',
    data: data
  })
}




