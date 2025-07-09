<template>
  <div class="w-screen h-screen overflow-y-auto">
    <MdPreview class="w-[900px] mx-auto my-0 px-4" :modelValue="text" :theme="settingsStore.theme" />
  </div>
</template>

<script lang="ts" setup>
import { userAgreement } from "./userAgreement";
const text = ref("");
text.value = userAgreement;

import {  useSettingsStore } from "@/store";
const settingsStore = useSettingsStore();

</script>

<style lang="scss" scoped></style>