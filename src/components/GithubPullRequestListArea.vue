<script lang="ts" setup>
import { defineProps } from 'vue'
import type { BacklogIssue } from '~/types/backlog'
import type { GithubPullRequest } from '~/types/github'
const props = defineProps({
  issue: {
    type: Object as PropType<BacklogIssue>,
    required: true,
  },
  getGithubPullRequests: {
    type: Function as PropType<(keyword: string) => Promise<GithubPullRequest[]>>,
    required: true,
  },
})
const { issue, getGithubPullRequests } = toRefs(props)

const githubPullRequests = ref<GithubPullRequest[]>([])

onMounted(async () => {
  try {
    githubPullRequests.value = await getGithubPullRequests.value(issue.value.issueKey)
  }
  catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div space-y-1>
    <GithubPullRequestCard
      v-for="pullRequest in githubPullRequests"
      :key="pullRequest.id"
      class="my-1"
      :github-pull-request="pullRequest"
    />
  </div>
</template>

<style>

</style>
