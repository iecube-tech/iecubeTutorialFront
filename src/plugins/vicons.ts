import type { App } from "vue";
import { Icon } from '@vicons/utils'

// 注册所有图标
export function setupVIcon(app: App<Element>) {
  app.component("Icon", Icon);
}