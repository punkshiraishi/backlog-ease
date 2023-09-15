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
    w-full py-1 px-2 shadow cursor-pointer hover:bg-gray-100
    transition duration-100
    border border-gray-200 border-rounded
    flex flex-row justify-between
    @click="onOpenGithubPullRequest"
  >
    <div min-w-0 flex flex-col items-start space-y-1 text-2xs>
      <div flex flex-row items-center space-x-1>
        <mdi-github text-sm />
        <GithubPullRequestStatusLabel
          :github-pull-request="githubPullRequest"
        />
        <div>{{ repoName }}</div>
      </div>
      <div truncate w-full font-bold>
        {{ githubPullRequest.title }}
      </div>
    </div>
    <CopyButton :text="githubPullRequest.html_url">
      <pixelarticons-link />
    </CopyButton>
  </div>
</template>
