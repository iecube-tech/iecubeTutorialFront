import request from '@/utils/request'

// 申请内测码
export const applyTestCode = (params: any) => {
  return request({
    url: '/invitation/code/apply',
    method: 'post',
    params: params
  })
}

// 注册用户
export const registerUser = (data: any) => {
  return request({
    url: '/account/register',
    method: 'post',
    data: data
  })
}

// 用户登录
export const login = (data: any) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: data
  })
}

// 用户登出
export const userLogout = () => {
  return request({
    url: '/account/logout',
    method: 'post'
  })
}

// 发送验证码
export const getVerifCode = (phone: any) => {
  return request({
    url: '/auth/login',
    method: 'get',
    params: { phone }
  })
}

// 检查手机号是否已经注册用户 每次发送验证码前调用
export const checkPhoneIsRegisterUser = (phone: string) => {
  return request({
    url: '/account/hasregister',
    method: 'post',
    params: { phone }
  })
}

  // 刷新token
export const apiRefreshToken = () => {
  return request({
    url: '/auth/refresh',
    method: 'post',
    data: {
      refreshToken: localStorage.getItem('refreshToken')
    }
  })
}
