<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps } from 'vue'
import { storage } from '~/logic/storage'
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

const issueInfoText = computed(() => {
  return `${issue.value.issueKey} ${issue.value.summary}`
})

const url = computed(() => {
  return `https://${storage.value.backlogHost}/view/${issue.value.issueKey}`
})

const onOpenIssue = () => {
  browser.tabs.create({ url: url.value })
}

const githubPullRequests = ref<GithubPullRequest[]>([])

onMounted(async () => {
  try {
    githubPullRequests.value = await getGithubPullRequests.value(issue.value.issueKey)
  }
  catch (error) {
    console.error(error)
  }
})

function repoName(pullRequest: GithubPullRequest) {
  return pullRequest.repository_url.match(/repos\/[^/]+\/([^/]+)$/)?.[1] ?? ''
}
</script>

<template>
  <div
    w-full p-1 shadow cursor-pointer hover:bg-gray-100
    transition duration-100
    border border-gray-200 border-rounded
    flex flex-col space-y-1
    @click="onOpenIssue"
  >
    <div flex flex-row justify-between items-center space-x-1>
      <div min-w-0 flex flex-col items-start space-y-1>
        <div flex flex-row space-x-1>
          <div
            :style="{ background: issue.status.color }"
            class="w-[80px] text-white truncate rounded-full px-1 "
          >
            {{ issue.status.name }}
          </div>
          <div>
            {{ issue.issueKey }}
          </div>
        </div>
        <div text-left truncate w-full font-bold>
          {{ issue.summary }}
        </div>
      </div>
      <div class="flex flex-row space-x-1 pr-1">
        <CopyButton :text="issueInfoText">
          <pixelarticons-copy />
        </CopyButton>
        <CopyButton :text="url">
          <pixelarticons-link />
        </CopyButton>
      </div>
    </div>
    <a
      v-for="pullRequest in githubPullRequests"
      :key="pullRequest.id"
      :href="pullRequest.html_url"
      text-blue underline hover:bg-gray-200 text-left
      @click.stop
    >
      [{{ repoName(pullRequest) }}] {{ pullRequest.title }}
    </a>
  </div>
</template>
