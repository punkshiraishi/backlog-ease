<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'radix-vue'

defineProps<{
  modelValue: string
  options: string[]
  placeholder: string
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <ComboboxRoot
    :model-value="modelValue"
    class="relative"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <ComboboxAnchor
      class="
        min-w-[160px] inline-flex items-center justify-between rounded
        px-2 leading-none h-[28px] gap-[5px] bg-white outline-none
        border border-gray-400 w-full
      "
    >
      <ComboboxInput
        class="
          bg-transparent outline-none h-full
        "
        :placeholder="placeholder"
      />
      <ComboboxTrigger>
        <radix-icons:chevron-down class="h-4 w-4" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxContent
      class="
        absolute z-10 w-full mt-2 min-w-[160px] bg-white overflow-hidden rounded
        drop-shadow-lg border border-gray-200
      "
    >
      <ComboboxViewport class="p-[5px]">
        <ComboboxItem
          v-for="(option, index) in options" :key="index"
          class="
            text-[13px] leading-none text-grass11 rounded-[3px] flex items-center
            h-[25px] pr-[35px] pl-[25px] relative select-none hover:bg-primary
          "
          :value="option"
          @click.stop.prevent
        >
          <ComboboxItemIndicator
            class="absolute left-0 w-[25px] inline-flex items-center justify-center"
          >
            <ic:baseline-check />
          </ComboboxItemIndicator>
          <span>
            {{ option }}
          </span>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
