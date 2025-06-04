<template>
  <div class="w-screen h-screen overflow-y-auto">
    <markdown-it class="w-[900px] mx-auto my-0" :source="text" />
  </div>
</template>

<script lang="ts" setup>
import MarkdownIt from "vue3-markdown-it";
import "markdown-it-highlightjs";

import { userAgreement } from "./userAgreement";
const text = ref("");
text.value = userAgreement;
</script>

<style lang="scss" scoped></style>