<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const _modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <input
    v-bind="$attrs"
    v-model="_modelValue"
    class="border border-gray-400 rounded px-2 py-1"
  >
</template>
