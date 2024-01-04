<script lang="ts" setup>
import type { BacklogRedirectMapping } from '~/types/backlog'

defineProps({
  modelValue: {
    type: Array as PropType<BacklogRedirectMapping[]>,
    required: true,
  },
  options: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div flex flex-col space-y-5>
    <div
      v-for="({ to, from }, index) in modelValue"
      :key="index"
    >
      <div flex flex-row items-center space-x-3>
        <div flex-grow flex flex-col space-y-1 justify-start items-start>
          <div flex flex-row items-center space-x-2 w-full>
            <span class="w-[40px] text-right text-gray-400">From: </span>
            <BaseInput
              :model-value="from"
              class="w-full"
              placeholder="OLD_PROJECT_KEY"
              @update:model-value="$emit('update:modelValue', modelValue.map((v, i) => i === index ? { ...v, from: $event } : v))"
            />
          </div>
          <div flex flex-row items-center space-x-2 w-full>
            <span class="w-[40px] text-right text-gray-400">To: </span>
            <BaseSelect
              :model-value="to"
              class="w-full"
              :options="options"
              placeholder="NEW_PROJECT_KEY"
              @update:model-value="$emit('update:modelValue', modelValue.map((v, i) => i === index ? { ...v, to: $event } : v))"
            />
          </div>
        </div>
        <button
          flex flex-row items-center space-x-1
          @click.prevent="$emit('update:modelValue', modelValue.filter((_, i) => i !== index))"
        >
          <span text-danger>削除</span>
        </button>
      </div>
    </div>
    <button
      self-center flex flex-row items-center space-x-1
      @click.prevent="$emit('update:modelValue', [...(modelValue || []), { from: '', to: '' }])"
    >
      <ic:baseline-add bg-primary text-white rounded-full /><span text-primary>追加</span>
    </button>
  </div>
</template>
