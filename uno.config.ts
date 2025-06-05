// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  shortcuts: {
    "flex-center": "flex justify-center items-center",
    "flex-x-center": "flex justify-center",
    "flex-y-center": "flex items-center",
    "wh-full": "w-full h-full",
    "flex-x-between": "flex items-center justify-between",
    "flex-x-end": "flex items-center justify-end",
    "absolute-lt": "absolute left-0 top-0",
    "absolute-rt": "absolute right-0 top-0 ",
    "fixed-lt": "fixed left-0 top-0",
    // 添加 Element Plus 组件快捷样式
    "el-primary-btn": "bg-primary hover:bg-primary_dark! transition-300",
    "el-primary-text": "text-primary hover:text-primary_dark",
  },
  theme: {
    colors: {
      primary: "var(--el-color-primary)",
      primary_light3: "var(--el-color-primary-light-3)", // #5AA9AD
      primary_light5: "var(--el-color-primary-light-5)", // #81BEC2
      primary_light7: "var(--el-color-primary-light-7)", // #A8D3D7
      // primary_dark: "var(--el-color-primary-dark-2)",    // #287578
      primary_dark: "var(--el-color-primary-light-5)",
      bold: "var(--text-bold)",
      zeng: "var(--zeng)",
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
