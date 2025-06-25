import { resetRouter } from '@/router'
import { store } from '@/store'
import { userLogout, apiRefreshToken } from '@/api/login'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    userInfo: {},
    roles: [],
    perms: [],
    login: false
  })

  function setLogin(status: boolean) {
    user.value.login = status
    localStorage.setItem('login',status)
  }

  function getLogin() {
    return localStorage.getItem('login')
  }

  function setUserInfo(userInfo: any) {
    user.value.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  }

  // 获取信息(用户昵称、头像、角色集合、权限集合)
  function getUserInfo() {
    let info = localStorage.getItem('userInfo')
    let obj = JSON.parse(info as string)
    return obj
  }

  function isAdmin() {
    let userInfo = localStorage.getItem('userInfo')
    userInfo = JSON.parse(userInfo as string)
    let isAdmin = userInfo.role === 'admin'
    return isAdmin
  }

  // user logout
  function logout() {
    localStorage.removeItem('login')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    location.reload() // 清空路由
    return new Promise<void>((resolve, reject) => {
      userLogout()
        .then(() => {
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  // remove token
  function resetToken() {
    return new Promise<void>(resolve => {
      localStorage.setItem('token', '')
      resetRouter()
      resolve()
    })
  }

  function refreshUserToken() {
    apiRefreshToken().then(res => {
      if (res.state == 200) {
        let { accessToken, refreshToken } = res.data
        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
      }
    })
  }

  return {
    user,
    setLogin,
    getLogin,
    setUserInfo,
    getUserInfo,
    resetToken,
    refreshUserToken,
    logout,
    isAdmin
  }
})

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useUserStoreHook() {
  return useUserStore(store)
}
