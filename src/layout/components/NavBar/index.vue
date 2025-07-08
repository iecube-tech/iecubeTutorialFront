<template>
  <div class="navbar-container">
    <!-- 导航栏面包屑 -->
    <!-- <div class="flex">
      <hamburger
        :is-active="appStore.sidebar.opened"
        @toggle-click="toggleSideBar"
      />
      <breadcrumb />
    </div> -->

    <!-- 导航栏右侧 -->
    <div
      class="flex flex-row justify-center items-center space-x-2 ml-4"
      @click="goHome"
    >
      <div class="logo-image"></div>
      <img :src="logo" class="h40px" />
      <img :src="logo_text" class="h40px" />
      <!-- <span class="logo-title text-20px font-bold" style="color: #339498">
        {{ defaultSettings.title }}
      </span> -->
    </div>

    <!-- 导航栏右侧 -->
    <NavbarAction />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import logo from "@/assets/logo.svg";
import logo_text from "@/assets/logo_text.svg";
import defaultSettings from "@/settings";

import route from "@/router";

const appStore = useAppStore();

function toggleSideBar() {
  appStore.toggleSidebar();
}

function goHome() {
  route.push({ path: "/dashboard" });
}
</script>

<style lang="scss" scoped>
.navbar-container {
  @apply flex-x-between;

  height: $navbar-height;
  background: var(--el-bg-color);
}

</style>
