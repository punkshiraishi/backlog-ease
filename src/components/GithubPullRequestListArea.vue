<script lang="ts" setup>
import { defineProps } from 'vue'
import type { GithubPullRequest } from '~/types/github'
import type { SlackMessage } from '~/types/slack'
const props = defineProps({
  defaultGithubPullRequests: {
    type: Array as PropType<GithubPullRequest[]>,
    default: () => [],
  },
  getGithubPullRequests: {
    type: Function as PropType<() => Promise<GithubPullRequest[]>>,
    required: true,
  },
  getSlackMessages: {
    type: Object as PropType<((keyword: string) => Promise<SlackMessage[]>) | null>,
    default: null,
  },
})
const { getGithubPullRequests, defaultGithubPullRequests } = toRefs(props)

const githubPullRequests = ref<GithubPullRequest[]>(defaultGithubPullRequests.value)

onMounted(async () => {
  try {
    githubPullRequests.value = await getGithubPullRequests.value()
  }
  catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div
    class="area" space-y-1
    :class="githubPullRequests.length > 0 && 'fetched'"
  >
    <GithubPullRequestCard
      v-for="pullRequest in githubPullRequests"
      :key="pullRequest.id"
      class="my-1 last:mb-3"
      :github-pull-request="pullRequest"
      :get-slack-messages="getSlackMessages"
    />
  </div>
</template>

<style scoped>
.area {
  max-height: 0;
  transition: max-height .15s ease-in-out;
}
.fetched {
  max-height: 300vh;
}
</style>
