<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const _modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <label
    :class="{ 'w-8 h-4': compact, 'w-11 h-6': !compact }"
    class="relative inline-flex items-center cursor-pointer"
  >
    <input v-model="_modelValue" type="checkbox" class="sr-only peer">
    <div
      :class="compact
        ? 'w-7 h-4 after:h-3 after:w-3 after:top-[2px] after:left-[2px]'
        : 'w-11 h-6 after:h-6 after:w-6 after:top-[2px] after:left-[2px]'
      "
      class="
        bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full
        peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
        after:content-[''] after:absolute  after:bg-white after:border-gray-300 after:border after:rounded-full
        after:transition-all dark:border-gray-600 peer-checked:bg-primary
      "
    />
  </label>
</template>

<style>

</style>
