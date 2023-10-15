<script setup lang="ts">
import { getIssue, getMyInformation, updateIssue } from '~/api/backlog'
import { getGithubPullRequests } from '~/api/github'
import BacklogIssueCard from '~/components/BacklogIssueCard.vue'
import { getSlackMessages } from '~/api/slack'
import { cacheStorage } from '~/logic'
import type { BacklogIssue } from '~/types/backlog'

defineProps({
  popup: {
    type: Boolean,
    required: false,
  },
})

const errorMessage = ref('')
const slackEnabled = ref(false)
const loading = ref(false)

onMounted(async () => {
  await fetchInformation()

  // Slack が有効かどうか適当なリクエストで確認
  await getSlackMessages('a')
  slackEnabled.value = true
})

async function onReload() {
  await fetchInformation()
}

async function fetchInformation() {
  loading.value = true
  try {
    const information = await getMyInformation()
    cacheStorage.value.backlogIssues = information.issues
    cacheStorage.value.backlogStatuses = information.projectStatuses
  }
  catch (error) {
    errorMessage.value = 'Failed to get projects'
  }
  finally {
    loading.value = false
  }
}

function openDashboardPage() {
  browser.tabs.create({
    url: 'dist/dashboard/index.html',
  })
}

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

const showGithubPullRequestList = ref(true)
const showGithubPullRequestListToggle = ref(false)

async function _getGithubPullRequests(issue: BacklogIssue) {
  const res = await getGithubPullRequests(issue.issueKey)
  cacheStorage.value.githubPullRequests[issue.id] = res
  showGithubPullRequestListToggle.value = true
  return res
}
</script>

<template>
  <main
    class="
      text-center text-gray-700
      flex flex-col space-y-1 relative
    "
  >
    <div flex flex-row items-center justify-between>
      <h1 font-bold text-left text-sm flex flex-row items-center>
        担当中の課題
        <button
          v-if="popup"
          v-tooltip="'新しいタブで開く'"
          cursor-pointer self-end text-gray-500 mb-0.5 ml-1
          @click="openDashboardPage"
        >
          <ic:round-open-in-new />
        </button>
        <button
          cursor-pointer self-end text-gray-500 mb-0.5 ml-1
          @click="onReload"
        >
          <ic:baseline-refresh text-base :class="loading && 'animate-spin'" />
        </button>
      </h1>
      <div mr-3 flex flex-row items-center>
        <template v-if="showGithubPullRequestListToggle">
          <BaseToggle
            v-model="showGithubPullRequestList"
            compact
            :disabled="true"
            text-left mr-1
          />
          <div mr-3>
            GitHub PR を表示
          </div>
        </template>
        <button
          cursor-pointer self-end text-gray-500 underline
          flex items-center space-x-1
          @click="openOptionsPage"
        >
          <ic:baseline-settings />
          <div>
            設定
          </div>
        </button>
      </div>
    </div>
    <div
      class="overflow-auto scrollbar pb-1 pr-1 space-y-2"
      scrollbar="track-color-transparent thumb-color-gray-400"
      style="scrollbar-gutter: stable"
    >
      <div v-if="(cacheStorage.backlogIssues || []).length === 0" p-10>
        担当中の課題はありません
      </div>
      <div
        v-for="(issue, index) in cacheStorage.backlogIssues"
        v-else
        :key="issue.id"
      >
        <BacklogIssueCard
          v-model="cacheStorage.backlogIssues[index]"
          :get-backlog-issue="getIssue"
          :update-backlog-issue="updateIssue"
          :statuses="cacheStorage.backlogStatuses[issue.projectId]"
          :get-slack-messages="slackEnabled ? getSlackMessages : null"
        />
        <GithubPullRequestListArea
          v-show="showGithubPullRequestList"
          :default-github-pull-requests="cacheStorage.githubPullRequests[issue.id] || []"
          :get-github-pull-requests="() => _getGithubPullRequests(issue)"
          :get-slack-messages="slackEnabled ? getSlackMessages : null"
          ml-6
        />
      </div>
    </div>
    <div>
      {{ errorMessage }}
    </div>
  </main>
</template>
