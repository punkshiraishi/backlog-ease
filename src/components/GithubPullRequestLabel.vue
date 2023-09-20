<script lang="ts" setup>
import type { GithubPullRequestLabel } from '~/types/github'

defineProps({
  githubPullRequestLabel: {
    type: Object as PropType<GithubPullRequestLabel>,
    required: true,
  },
})
</script>

<template>
  <div
    px-1 py-0.5 rounded-full text-2xs text-white
    flex flex-row items-center
    :style="{ background: `#${githubPullRequestLabel.color}` }"
  >
    {{ githubPullRequestLabel.name }}
  </div>
</template>
