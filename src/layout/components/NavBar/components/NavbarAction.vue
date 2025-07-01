<template>
  <div class="flex">
    <div class="flex items-center hello-tip">
      <span class="mr-16px">{{ firstGroup.name }}</span>
      <span class="mr-16px">{{ secondGroup.name }}</span>
      <span class="text-ms mr-10px text-blod">{{ userInfoFirstName }}老师, 你好 !</span>
    </div>

    <el-dropdown class="nav-action-item" trigger="click" @command="handleCommand">
      <div class="flex-center h100% p10px">
        <img :src="userImg" class="rounded-full mr-10px w24px h24px" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="transactionRecord">消费明细</el-dropdown-item>

          <el-dropdown-item>
            <contact-us></contact-us>
          </el-dropdown-item>

          <el-dropdown-item>
            <el-popover placement="left" width="300">
              <template #default>
                <div
                  class="cursor-pointer account-wrapper"
                  v-for="(item, k) in groupList"
                  :key="k"
                  @click="handleGroupClick(item)"
                >
                  <div class="group-wrapper">{{ item.orgTop.name.charAt(0) }}</div>
                  <div class="flex-1">
                    <div class="group-name">{{ item.name }}</div>
                    <div class="usesr-name">{{ userInfo.name }}</div>
                  </div>
                  <el-icon class="text-xl icon-font">
                    <ArrowRightBold />
                  </el-icon>
                </div>
              </template>
              <template #reference>账号切换</template>
            </el-popover>
          </el-dropdown-item>
          <el-dropdown-item @click="logout" divided>
            {{ $t('navbar.logout') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 设置 -->
    <template v-if="defaultSettings.showSettings">
      <div class="nav-action-item" @click="settingStore.settingsVisible = true">
        <svg-icon icon-class="setting" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { useAppStore, useTagsViewStore, useUserStore, useSettingsStore } from '@/store'
  import defaultSettings from '@/settings'
  import { DeviceEnum } from '@/enums/DeviceEnum'
  import { MessageTypeEnum, MessageTypeLabels } from '@/enums/MessageTypeEnum'
  import { getOrgList, reLogin } from '@/api/login'

  import userImg from '@/assets/images/userImg.png'
  import { TOKEN_KEY, TOKEN_REFRESH_KEY } from '@/enums/CacheEnum'
  
  import { debounce } from 'lodash'

  const appStore = useAppStore()
  const tagsViewStore = useTagsViewStore()
  const userStore = useUserStore()
  const userInfo = ref(null)
  userInfo.value = userStore.getUserInfo()

  const firstGroup = computed(() => {
    return userInfo.value.orgSec.orgTop
  })

  const secondGroup = computed(() => {
    return userInfo.value.orgSec
  })

  const userInfoFirstName = computed(() => {
    let firstName = ''
    try {
      firstName = userInfo.value.name.charAt(0)
    } catch (e) {
      firstName = ''
    }
    return firstName
  })

  const settingStore = useSettingsStore()

  const route = useRoute()
  const router = useRouter()

  const groupList = ref([])

  function getGroupList() {
    getOrgList().then(res => {
      if (res.state == 200) {
        groupList.value = res.data
      }
    })
  }

  getGroupList()

  function groupClick(group) {
    reLogin(group.id).then(res => {
      if (res.state == 200) {
        let { login, user, orgSec, accessToken, refreshToken } = res.data
        userStore.setLogin(login)
        localStorage.setItem(TOKEN_KEY, accessToken)
        localStorage.setItem(TOKEN_REFRESH_KEY, refreshToken)
        user.orgSec = orgSec
        userStore.setUserInfo(user)
        userInfo.value = user
        window.location.reload(true);
      }
    })
  }
  
  const handleGroupClick = debounce(group=> {
    groupClick(group)
  }, 500)

  /* 注销 */
  function logout() {
    ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }).then(() => {
      userStore
        .logout()
        // .then(() => {
        //   tagsViewStore.delAllViews();
        // })
        .then(() => {
          router.push(`/login?redirect=${route.fullPath}`)
        })
    })
  }

  // 处理命令
  const handleCommand = (command: string) => {
    if (command === 'transactionRecord') {
      let path = router.resolve({ path: '/transactionRecord' })
      window.open(path.href, '_blank')
    }
  }
</script>
<style lang="scss" scoped>
  .nav-action-item {
    display: inline-block;
    min-width: 40px;
    height: $navbar-height;
    line-height: $navbar-height;
    color: var(--el-text-color);
    text-align: center;
    cursor: pointer;

    &:hover {
      background: rgb(0 0 0 / 10%);
    }
  }

  :deep(.message .el-badge__content.is-fixed.is-dot) {
    top: 5px;
    right: 10px;
  }

  :deep(.el-divider--horizontal) {
    margin: 10px 0;
  }

  .dark .nav-action-item:hover {
    background: rgb(255 255 255 / 20%);
  }

  .layout-top .nav-action-item,
  .layout-mix .nav-action-item {
    color: #fff;
  }

  // 切换账号样式
  .account-wrapper {
    @apply h-[60px] mb-2 p-[10px] flex justify-center items-center rounded-md;
    border-bottom: 0.5px solid var(--border-color);
  }

  .account-wrapper:hover {
    background: rgb(0 0 0 / 10%);
  }

  .dark .account-wrapper:hover {
    background: rgb(255 255 255 / 20%);
  }

  .account-wrapper:last-of-type {
    margin-bottom: 0;
    border-bottom: none;
  }

  .group-wrapper {
    background: linear-gradient(to right, #3578fe, #6095ff);
    width: 30px;
    height: 30px;
    border-radius: 20%;
    margin-right: 10px;
    color: white;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .group-name {
    @apply text-bold;
    font-size: 14px;
    font-weight: 600;
  }

  .user-name {
    font-size: 12px;
  }

  /* .hello-tip {
    font-family: '楷体';
    font-size: 20px;
  } */
</style>
