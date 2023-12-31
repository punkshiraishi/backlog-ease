<script lang="ts" setup>
import { defineProps } from 'vue'
import type { GithubPullRequest } from '~/types/github'
import type { SlackMessage } from '~/types/slack'
const props = defineProps({
  githubPullRequest: {
    type: Object as PropType<GithubPullRequest>,
    required: true,
  },
  getSlackMessages: {
    type: Object as PropType<((keyword: string) => Promise<SlackMessage[]>) | null>,
    default: null,
  },
})
const { githubPullRequest } = toRefs(props)

const repoName = computed(() => {
  return githubPullRequest.value.repository_url.match(/repos\/[^/]+\/([^/]+)$/)?.[1] ?? ''
})
</script>

<template>
  <a
    :href="githubPullRequest.html_url" target="_blank"
    w-full py-1 pl-3 pr-2 cursor-pointer shadow hover:bg-gray-100 bg-white
    transition duration-100
    border border-gray-200 border-rounded-lb-2xl border-rounded-r
    flex flex-row justify-between items-center
  >
    <div min-w-0 w-full flex flex-col items-start space-y-1 text-2xs>
      <div w-full flex flex-row items-center space-x-1>
        <mdi-github text-sm />
        <GithubPullRequestStatusLabel
          :github-pull-request="githubPullRequest"
        />
        <div font-bold whitespace-nowrap>
          {{ repoName }}
        </div>
        <div>#{{ githubPullRequest.number }}</div>
        <div grow relative flex flex-row items-center space-x-1 overflow-hidden>
          <GithubPullRequestLabel
            v-for="label in githubPullRequest.labels"
            :key="label.id"
            :github-pull-request-label="label"
          />
          <div class="absolute inset-y-0 right-0 w-2 bg-gradient-to-r from-transparent to-white" />
        </div>
      </div>
      <div truncate w-full text-left>
        {{ githubPullRequest.title }}
      </div>
    </div>
    <div class="flex flex-row space-x-1">
      <CopyButton :text="githubPullRequest.html_url">
        <ic:baseline-link />
      </CopyButton>
      <SlackSearchButton
        v-if="getSlackMessages"
        :get-slack-messages="getSlackMessages"
        :text="githubPullRequest.html_url"
      />
    </div>
  </a>
</template>
