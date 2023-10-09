<script lang="ts" setup>
defineProps({
  text: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <BaseTooltip
    inline
    :triggers="['hover']"
    :popper-triggers="['hover']"
  >
    <mdi:information-slab-circle text-sm inline mb-0.5 />
    <template #popper>
      <slot>
        {{ text }}
      </slot>
    </template>
  </BaseTooltip>
</template>
