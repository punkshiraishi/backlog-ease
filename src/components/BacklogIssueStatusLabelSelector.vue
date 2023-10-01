<script setup lang="ts">
import type { BacklogStatus } from '~/types/backlog'

defineProps({
  status: {
    type: Object as PropType<BacklogStatus>,
    required: true,
  },
  statuses: {
    type: Array as PropType<BacklogStatus[]>,
    required: true,
  },
})

const emit = defineEmits(['select'])

const open = ref(false)

function onSelect(status: BacklogStatus) {
  open.value = false
  emit('select', status)
}
</script>

<template>
  <div class="relative">
    <button
      :style="{ background: status.color }"
      w-90px text-white truncate rounded-full px-3
      hover:ring-2 ring-primary ring-opacity-70 transition-all duration-50

      relative min-w-0
      @click.stop.prevent="open = !open"
    >
      <div truncate w-full>
        {{ status.name }}
      </div>
      <ic:baseline-keyboard-arrow-down
        absolute right-0 top-0 bottom-0 m-auto w-6 h-4 text-white
      />
    </button>
    <div
      v-if="open"
      role="menu" aria-orientation="vertical" aria-labelledby="options-menu"
      class="
        absolute z-10 rounded-lg shadow-xl bg-white mt-1 -ml-1 max-h-40 p-1
        border overflow-y-auto overflow-x-hidden
        ring-1 ring-black ring-opacity-5
        flex flex-col space-y-1
      "
      scrollbar="~ track-color-transparent thumb-color-gray-400 rounded"
      @click.stop.prevent
    >
      <div
        v-for="statusItem in statuses.filter(s => s.id !== status.id)"
        :key="statusItem.id"
        :style="{ background: statusItem.color }"
        role="menuitem"
        w-90px text-white truncate rounded-full px-1 flex-shrink-0
        hover:ring-2 ring-primary ring-opacity-70 transition-all duration-50
        @click="onSelect(statusItem)"
      >
        {{ statusItem.name }}
      </div>
    </div>
  </div>
</template>
