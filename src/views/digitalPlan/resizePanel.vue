<template>
  <div class="resizable-container" ref="container">
    <div v-show="!props.rightPanelOnly" ref="leftPanel" class="panel left-panel" >
      <div class="mask" v-show="isDragging"></div>
      <slot name="left-content" />
    </div>

    <div
      v-show="!props.rightPanelOnly"
      class="resize-handle"
      ref="resizeHandle"
      @mousedown="startDrag"
    />

    <div class="panel right-panel" ref="rightPanel">
      <div class="mask" v-show="isDragging"></div>
      <slot name="right-content" />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const props = defineProps({
    rightPanelOnly: {
      type: Boolean,
      default: true
    }
  })

  const container = ref(null)
  const leftPanel = ref(null)
  const resizeHandle = ref(null)
  const rightPanel = ref(null)

  let isDragging = ref(false)
  let startX = 0
  let startWidth = 0

  const startDrag = e => {
    isDragging.value = true
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
    startWidth = leftPanel.value.offsetWidth

    document.addEventListener('mousemove', doDrag)
    document.addEventListener('touchmove', doDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchend', stopDrag)

    e.preventDefault()
  }

  const doDrag = e => {
    if (!isDragging.value) return

    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    const newWidth = startWidth + (currentX - startX)

    const minWidth = 400
    const maxWidth = container.value.offsetWidth - minWidth

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      leftPanel.value.style.width = `${newWidth}px`
    }
  }

  const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('touchmove', doDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchend', stopDrag)
  }

  onMounted(() => {
    // 初始化左侧面板宽度
    leftPanel.value.style.width = '30%'
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('touchmove', doDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchend', stopDrag)
  })
</script>

<style scoped lang="scss">
  .resizable-container {
    height: 100%;
    display: flex;
  }

  .panel {
    position: relative;
    overflow: hidden;
  }
  
  .left-panel {
    
  }

  .right-panel {
    width: 0;
    flex: 1;
    padding: 0 8px;
  }

  .resize-handle {
    width: 5px;
    background-color: #ccc;
    cursor: col-resize;
  }

  .resize-handle:hover {
    width: 5px;
    background-color: var(--zeng);
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
  }
</style>
