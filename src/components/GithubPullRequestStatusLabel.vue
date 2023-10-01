<script lang="ts" setup>
import { defineProps } from 'vue'
import type { GithubPullRequest } from '~/types/github'

const props = defineProps({
  githubPullRequest: {
    type: Object as PropType<GithubPullRequest>,
    required: true,
  },
})

const { githubPullRequest } = toRefs(props)

const pullRequestStatus = computed(() => {
  if (githubPullRequest.value.draft)
    return 'draft'

  else if (githubPullRequest.value.pull_request.merged_at)
    return 'merged'

  else if (githubPullRequest.value.closed_at)
    return 'closed'

  else
    return 'open'
})
</script>

<template>
  <div
    :class="{
      'text-green-500': pullRequestStatus === 'open',
      'text-gray-400': pullRequestStatus === 'draft',
      'text-purple-500': pullRequestStatus === 'merged',
      'text-red-500': pullRequestStatus === 'closed',
    }"
    class="rounded-full text-2xs"
  >
    <div flex flex-row justify-center items-center>
      <tabler:git-merge v-if="pullRequestStatus === 'merged'" />
      <tabler:git-pull-request v-else-if="pullRequestStatus === 'open'" />
      <tabler:git-pull-request-draft v-else-if="pullRequestStatus === 'draft'" />
      <tabler:git-pull-request-closed v-else-if="pullRequestStatus === 'closed'" />
      <div>{{ pullRequestStatus }}</div>
    </div>
  </div>
</template>

<style>

</style>
