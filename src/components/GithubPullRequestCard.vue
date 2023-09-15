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

const repoName = computed(() => {
  return githubPullRequest.value.repository_url.match(/repos\/[^/]+\/([^/]+)$/)?.[1] ?? ''
})

const onOpenGithubPullRequest = () => {
  browser.tabs.create({ url: githubPullRequest.value.html_url })
}
</script>

<template>
  <div
    w-full p-1 shadow cursor-pointer hover:bg-gray-100
    transition duration-100
    border border-gray-200 border-rounded
    flex flex-col items-start
    @click="onOpenGithubPullRequest"
  >
    <div flex flex-row items-center space-x-1>
      <!-- github icon -->
      <mdi-github />
      <GithubPullRequestStatusLabel
        :github-pull-request="githubPullRequest"
      />
      <div>{{ repoName }}</div>
    </div>
    <div truncate text-2xs font-bold>
      {{ githubPullRequest.title }}
    </div>
  </div>
</template>
