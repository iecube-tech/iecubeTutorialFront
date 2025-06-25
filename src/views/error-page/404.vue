<script setup lang="ts">
import { useRouter } from "vue-router";

defineOptions({
  name: "Page404",
});

const router = useRouter();

function back() {
  router.back();
}
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- <div class="absolute top-12px left-12px" >
      <el-button link type="primary" @click.prevent="back">
        返回
      </el-button>
    </div> -->
    <div class="w-1/2">
      <img class="pic-404__parent" src="@/assets/images/404.png" alt="404" />
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
