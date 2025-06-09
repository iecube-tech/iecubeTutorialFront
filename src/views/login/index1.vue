<template>
  <div class="login-container">

    <div class="login-header">
      <img :src="logo" class="logo-image w30px h30px mr10px" />
      <span class="logo-title">
        {{ defaultSettings.title }}
      </span>
    </div>

    <div class="flex-1 flex flex-col justify-center items-center">
      <el-card class="login-card">

        <!-- step one -->
        <main v-show="step === 1" class="wh-full flex flex-col justify-between">
          <div>
            <div class="step-title">
              欢迎使用 {{ defaultSettings.title }}
            </div>
            <div class="mb-4 text-sm">
              <span style="color:#3370ff;">手机号</span>
            </div>
            <el-input v-model="phone" maxlength="11" placeholder="请输入手机号" size="large" class="mb-4">
              <template #prepend>
                <span>+86</span>
              </template>
            </el-input>
            <el-button type="primary" class="w-full mb-4" size="large" :disabled="phone.length !== 11"
              @click="nextStepTwo">
              下一步
            </el-button>
            <span class="text-sm flex items-center">
              <el-checkbox v-model="agreed" size="large" />
              <span class="ml-1" @click="agreed = true">
                我已阅读并同意 <span style="color:#3370ff;" class="cursor-pointer" @click="handleAgreementClick">《用户协议》</span>
              </span>
            </span>
          </div>
          <div class="flex flex-col justify-center items-center text-sm">
            <el-divider>没有账号?</el-divider>
            <span style="color:#3370ff;" class="cursor-pointer" @click="handleRegister">立即注册</span>
          </div>
        </main>

        <!-- step two -->
        <main v-show="step === 2" class="wh-full relative">
          <!-- 返回按钮 -->
          <el-button link class=" back-button" @click="handleBack">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            <span>返回</span>
          </el-button>

          <!-- 标题和描述 -->
          <div class="mt-4 mb-2">
            <div class="step-title">输入手机号验证码</div>
            <p class="text-sm">
              请输入发送至 <span class="font-bold text-bold">+86{{ maskedPhone }}</span> 的 6 位验证码，5 分钟内有效。
            </p>
          </div>

          <!-- 验证码输入框组 -->
          <div class="code-inputs-wrapper">
            <!-- 前三个输入框 -->
            <div class="code-group">
              <el-input v-for="index in 3" :key="index - 1" ref="codeInputs" v-model="code[index - 1]"
                :class="getInputClass(index - 1)" type="text" inputmode="numeric" maxlength="1" autocomplete="off"
                size="large" @input="handleInput(index - 1, $event)" @keydown="handleKeydown(index - 1, $event)"
                @focus="handleFocus(index - 1)" @blur="handleBlur" @paste="handlePaste" />
            </div>

            <!-- 中划线分隔符 -->
            <div class="code-separator">
              <span class="separator-line">-</span>
            </div>

            <!-- 后三个输入框 -->
            <div class="code-group">
              <el-input v-for="index in 3" :key="index + 2" ref="codeInputs" v-model="code[index + 2]"
                :class="getInputClass(index + 2)" type="text" inputmode="numeric" maxlength="1" autocomplete="off"
                size="large" @input="handleInput(index + 2, $event)" @keydown="handleKeydown(index + 2, $event)"
                @focus="handleFocus(index + 2)" @blur="handleBlur" @paste="handlePaste" />
            </div>
          </div>

          <p class="mb-2">
            <span v-if="time > 0"> {{ time }} 秒后可重新获取验证码</span>
            <span v-else class="cursor-pointer text-blue-500">重新获取验证码</span>
          </p>

          <el-button type="primary" class="w-full mb-4 absolute bottom-0" size="large" :disabled="!isCodeComplete"
            @click="nextStepThree">
            下一步
          </el-button>
        </main>

        <!-- step three -->
        <main v-show="step === 3" class="wh-full flex flex-col relative">
          <!-- 返回按钮 -->
          <div>
            <el-button link class=" back-button" @click="handleBack">
              <el-icon>
                <ArrowLeft />
              </el-icon>
              <span>返回</span>
            </el-button>
          </div>
          <div class="step-title mt-4">
            你可以进入一下组织
          </div>
          <div class="text-sm">
            <span class="font-bold text-bold">+86{{ maskedPhone }}</span> 已在以下组织绑定了账号，你可以进入以下任意组织
          </div>
          <div class="flex-1 mt-6 px-2">
            <div class="h-[70px] border-1 rounded-md mb-2 p-[10px]
           flex justify-center items-center border-wrapper" v-for="item in 2" :key="item">

              <div class="group-wrapper">
                曾
              </div>
              <div class="flex-1">
                <div class="group-name">曾益慧创</div>
                <div class="usesr-name">朱晓曦</div>
              </div>
              <el-icon class="cursor-pointer text-xl icon-font">
                <ArrowRightBold />
              </el-icon>

            </div>
          </div>
        </main>
      </el-card>

    </div>
  </div>
</template>

<script setup lang="ts">


import logo from "@/assets/logo.svg";
// import "@/styles/login.scss";
import defaultSettings from "@/settings";
import router from "@/router"
import { LocationQuery, useRoute } from "vue-router";
import { useUserStore } from "@/store";
const route = useRoute();
const userStore = useUserStore();

import { login, getVerifCode, checkPhoneIsRegisterUser } from "@/api/login"

// 手机登录相关
const step = ref(3)
const phone = ref('')
const agreed = ref(false)

const maskedPhone = computed(() => {
  return phone.value.replace(/(\d{3})\d{6}(\d{2})/, '$1******$2')
})

// 返回按钮
const handleBack = () => {
  step.value--;
}

// 下一步按钮
const handleNext = () => {
  step.value++;
}

// 用户协议
const handleAgreementClick = () => {
  let path = router.resolve("/terms");
  window.open(path.href, "_blank")
}

const handleRegister = () => {
  router.push({ path: "signup" });
};

// 发送验证码
const sendCode = (phone) => {
  return new Promise((resolve, reject) => {
    checkPhoneIsRegisterUser(phone).then(res => {
      if (res.state == 200 && res.data == true) {
        getVerifCode({
          usage: "login",
          phone: phone
        }).then(res => {
          if (res.state == 200) {
            // ElMessage.success("验证码发送成功")
            resolve(true)
          }
        })
      } else {
        ElMessage.error("该手机号未注册,请先注册")
        reject(false)
        return
      }
    })
  })
}

/** 登录表单提交 */
function doLogin() {
  console.log("fullCode", fullCode.value);
  let req = {
    "phone": phone.value,
    "verifyCode": fullCode.value,
    "invitationCode": '222222',
  }

  login(req)
    .then(res => {
      if (res.state == 200) {
        let { token, user } = res.data;
        localStorage.setItem("token", token);
        userStore.setUserInfo(user);
      }

      const { path, queryParams } = parseRedirect();
      router.push({ path: path, query: queryParams });
    })
    .catch(() => {

    })
    .finally(() => {
      // loading.value = false;
    });
}

/** 解析 redirect 字符串 为 path 和  queryParams */
function parseRedirect(): {
  path: string;
  queryParams: Record<string, string>;
} {
  const query: LocationQuery = route.query;
  const redirect = (query.redirect as string) ?? "/";

  const url = new URL(redirect, window.location.origin);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return { path, queryParams };
}

const nextStepTwo = async () => {
  if (agreed.value) {
    let reg = /^1[3-9]\d{9}$/;
    if (!reg.test(phone.value)) {
      ElMessage.error("请输入正确的手机号")
      return
    }
    await sendCode(phone.value)
    handleNext();
    startTime()
  } else {
    ElMessageBox({
      title: '提示',
      message: () => {
        return h('div',
          {
            class: 'text-sm'
          },
          [
            h('span', '请先同意'),
            h("span",
              {
                class: 'cursor-pointer',
                style: 'color:#3370ff;',
                onClick: handleAgreementClick,
              }, '《用户协议》'),
          ])
      },
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      showCancelButton: true,
      showClose: false,
      type: 'info',
    }).then(res => {
      agreed.value = true
    }).catch(err => {
    })
  }
}

// 验证码相关
const emit = defineEmits([
  'complete',
  'change',
  'resend',
  'focus',
  'blur',
  'error'
])

const codeLength = 6 // 验证码长度
const validatePattern = /^\d$/ // 数字正则表达式
const codeInputs = ref([]) // 输入框组件引用

const code = ref(new Array(codeLength).fill('')) // 验证码数组
const currentFocusIndex = ref(-1) // 当前聚焦的输入框索引
const time = ref(60) // 倒计时
const nInterval = ref<any>() // 定时器

// 设置初始值
const setDefault = () => {
  code.value = new Array(codeLength).fill('')
  currentFocusIndex.value = -1
  time.value = 60
}


// 倒计时
const startTime = () => {
  setDefault();
  if (nInterval.value) {
    clearInterval(nInterval.value)
  }
  nInterval.value = setInterval(() => {
    time.value--
    if (time.value === 0) {
      clearInterval(nInterval.value)
    }
  }, 1000)
}

// 计算属性
const isCodeComplete = computed(() => {
  return code.value.every(digit => digit !== '' && validatePattern.test(digit))
})

// 监听验证码变化
const fullCode = computed(() => code.value.join(''))

// 输入框样式类
const getInputClass = (index) => {
  return [
    'code-input',
    `code-input--large`,
    {
      'code-input--filled': code.value[index] !== '',
      'code-input--focused': currentFocusIndex.value === index,
    }
  ]
}

// 聚焦到合适的位置
const focusInput = async (index) => {
  if (index >= 0 && index < codeLength) {
    await nextTick()
    const inputComponent = codeInputs.value[index]
    if (inputComponent?.focus) {
      inputComponent.focus()
      // 选中输入框内容
      const inputElement = inputComponent.input
      if (inputElement) {
        inputElement.select()
      }
      currentFocusIndex.value = index
    }
  }
}

// 核心逻辑函数
const handleInput = async (index, value) => {
  // 只保留最后一个字符
  const char = value.slice(-1)

  // 验证输入字符
  if (char && !validatePattern.test(char)) {
    code.value[index] = ''
    return
  }

  // 更新当前位置的值
  code.value[index] = char
  emit('change', fullCode.value, index)

  // 自动聚焦到下一个输入框
  if (char && index < codeLength - 1) {
    await focusInput(index + 1)
  }
}

const handleKeydown = async (index, event) => {
  switch (event.key) {
    case 'Backspace':
      event.preventDefault()
      if (code.value[index]) {
        // 如果当前框有内容，清空
        code.value[index] = ''
      } else if (index > 0) {
        // 如果当前框为空，聚焦到前一个框并清空
        await focusInput(index - 1)
        code.value[index - 1] = ''
      }
      break

    case 'ArrowLeft':
      event.preventDefault()
      if (index > 0) {
        await focusInput(index - 1)
      }
      break

    case 'ArrowRight':
      event.preventDefault()
      if (index < codeLength - 1) {
        await focusInput(index + 1)
      }
      break

    case 'Enter':
      event.preventDefault()
      if (isCodeComplete.value) {
        emit('complete', fullCode.value)
      }
      break

    case 'Delete':
      event.preventDefault()
      code.value[index] = ''
      break
  }
}

// 输入框聚焦事件
const handleFocus = (index) => {
  currentFocusIndex.value = index
  emit('focus', index)
}

// 输入框失焦事件
const handleBlur = () => {
  currentFocusIndex.value = -1
  emit('blur')
}

// 输入框粘贴事件
const handlePaste = async (event) => {
  event.preventDefault()

  const pasteData = event.clipboardData?.getData('text') || ''
  const numbers = pasteData.replace(/\D/g, '').slice(0, codeLength)

  if (numbers.length === 0) {
    return
  }

  // 清空所有位置
  code.value = new Array(codeLength).fill('')

  // 填入粘贴的数字
  for (let i = 0; i < numbers.length; i++) {
    code.value[i] = numbers[i]
  }

  // 聚焦到合适的位置
  const focusIndex = Math.min(numbers.length, codeLength - 1)
  await focusInput(focusIndex)
}

// 公共方法
const clear = async () => {
  code.value = new Array(codeLength).fill('')
  await focusInput(0)
}

const nextStepThree = () => {
  doLogin()
}



// 生命周期
onUnmounted(() => {
  if (nInterval.value) {
    clearInterval(nInterval.value)
  }
})

</script>

<style lang="scss" scoped>
.login-container {
  @apply text-sm;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: url("@/assets/images/login-background-light.jpg") no-repeat center right;
}

html.dark .login-container {
  background: url("@/assets/images/login-background-dark.jpg") no-repeat center right;
}

.login-header {
  width: 100%;
  height: 70px;
  padding-left: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.logo-title {
  @apply text-20px font-bold text-zeng;
}
.login-card {
  width: 500px;
  height: 500px;
  padding: 20px;
  border: none;
  border-radius: 2%;
}

.step-title {
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
  margin-bottom: 20px;
  @apply text-bold;
}

:deep(.el-card__body) {
  // 背景色透明度调整到 50%
  // opacity: 50%;
  height: 100%;
  width: 100%;
}

.code-inputs-wrapper {
  @apply flex justify-center items-center;
}

.code-inputs-wrapper.has-error {
  @apply mb-2;
}

/* 输入框组 */
.code-group {
  @apply flex gap-3;
}

/* 分隔符 */
.code-separator {
  @apply flex items-center justify-center mx-4;
}

.separator-line {
  @apply text-2xl font-bold select-none text-bold;
}

/* 输入框样式 */
.code-input :deep(.el-input__wrapper) {
  @apply rounded-xl transition-all duration-200;
  @apply flex items-center justify-center;
}

.code-input :deep(.el-input__inner) {
  @apply text-center font-semibold p-0;
  @apply caret-transparent;
  text-align: center;
}

/* 不同尺寸的输入框 */
.code-input--large :deep(.el-input__wrapper) {
  @apply w-12 h-14;
}

.code-input--large :deep(.el-input__inner) {
  @apply text-xl;
}

.code-input--default :deep(.el-input__wrapper) {
  @apply w-10 h-12;
}

.code-input--default :deep(.el-input__inner) {
  @apply text-lg;
}

.code-input--small :deep(.el-input__wrapper) {
  @apply w-8 h-10;
}

.code-input--small :deep(.el-input__inner) {
  @apply text-base;
}

/* 聚焦状态 */
.code-input--focused :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;

}

/* 已填充状态 */
.code-input--filled :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
}

.border-wrapper {
  border: .5px solid var(--border-color);
}

.icon-font {
  color: var(--icon-color);
}

.group-wrapper {
  background: linear-gradient(to right, #3578FE, #6095FF);
  width: 50px;
  height: 50px;
  border-radius: 20%;
  margin-right: 10px;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-name {
  font-size: 16px;
  font-weight: 600;
  @apply text-bold;
}

.user-name {
  font-size: 14px;
}
</style>