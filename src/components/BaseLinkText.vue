<script lang="ts" setup>
defineProps({
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: '_blank',
  },
})
</script>

<template>
  <a :href="href" :target="target" underline><slot /></a>
</template>
