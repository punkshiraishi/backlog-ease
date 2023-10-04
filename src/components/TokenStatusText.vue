<script lang="ts" setup>
import type { TokenStatus } from './TokenStatusText'

defineProps({
  status: {
    type: String as PropType<TokenStatus>,
    required: true,
  },
  tokenName: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div
    v-if="status === 'invalid'"
    class="text-danger text-xs flex flex-row space-x-1 items-center justify-center"
  >
    <ic:baseline-close />
    <div>{{ tokenName }} が無効です。</div>
  </div>
  <div
    v-else-if="status === 'valid'"
    class="text-primary text-xs flex flex-row space-x-1 items-center justify-center"
  >
    <ic:baseline-check />
    <div>{{ tokenName }} が有効です。</div>
  </div>
</template>
