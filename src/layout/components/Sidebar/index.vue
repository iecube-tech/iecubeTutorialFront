<template>
  <div :class="{ 'has-logo': sidebarLogo }">
    <!-- layout mix-->
    <!-- <div class="flex w-full">
      <SidebarLogo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
      <SidebarMixTopMenu class="flex-1" />
      <NavbarAction />
    </div> -->
    <!-- layout left || layout top -->
    <!-- <template v-else> -->
    <!-- <SidebarLogo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" /> -->
    <el-scrollbar>
      <SidebarMenu :menu-list="filterRoutes" base-path="" />
    </el-scrollbar>
    <!--  <NavbarAction v-if="layout === LayoutEnum.TOP" /> -->
    <!-- </template> -->
  </div>
</template>

<script setup lang="ts">
  import { useSettingsStore, usePermissionStore, useAppStore, useUserStore } from '@/store'
  import { LayoutEnum } from '@/enums/LayoutEnum'

  const appStore = useAppStore()
  const settingsStore = useSettingsStore()
  const permissionStore = usePermissionStore()
  const userStore = useUserStore()

  const sidebarLogo = computed(() => settingsStore.sidebarLogo)
  const layout = computed(() => settingsStore.layout)

  const filterRoutes = computed(() => {
    let role = userStore.getUserInfo().role.toLowerCase()
    let res = permissionStore.routes.filter(item => {
      if (item.meta == undefined) return true
      if (
        item.meta?.roles == null ||
        item.meta?.roles == undefined ||
        item.meta?.roles.length == 0 ||
        item.meta?.roles.includes('*')
      )
        return true
      if (item.meta?.roles.includes(role)) {
        return true
      }else{
        return false
      }
    })
    return res
  })
</script>

<style lang="scss" scoped>
  .has-logo {
    .el-scrollbar {
      height: calc(100vh - $navbar-height);
    }
  }
</style>
