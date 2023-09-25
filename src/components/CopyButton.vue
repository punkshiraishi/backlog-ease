<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
})
const { text } = toRefs(props)
const showCopied = ref(false)

const onCopy = () => {
  showCopied.value = true
  navigator.clipboard.writeText(text.value)
  setTimeout(() => {
    showCopied.value = false
  }, 1000)
}
</script>

<template>
  <transition>
    <button
      class="h-6 w-6 rounded-full transition-all grid place-items-center shrink-0"
      :class="showCopied ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-500'"
      @click.prevent="onCopy"
    >
      <ic:baseline-check v-if="showCopied" />
      <slot v-else />
    </button>
  </transition>
</template>
