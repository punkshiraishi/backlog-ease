<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const { modelValue } = toRefs(props)

function closeDialog() {
  modelValue.value = false
  emit('update:modelValue', false)
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget)
    closeDialog()
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex items-center justify-center z-50"
    @click.stop.prevent
  >
    <div
      class="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-default transition-opacity duration-500"
      @click.stop.prevent="closeOnOutsideClick"
    />
    <div class="z-10 cursor-default">
      <slot />
    </div>
  </div>
</template>
