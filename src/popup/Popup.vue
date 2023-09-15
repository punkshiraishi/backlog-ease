<script setup lang="ts">
import { getMyIssues } from '~/api/backlog'
import type { BacklogIssue } from '~/types/backlog'
import { getGithubPullRequests } from '~/api/github'
import BacklogIssueCard from '~/components/BacklogIssueCard.vue'

const myIssues = ref<BacklogIssue[]>([]) // 変数名をmyIssuesに変更
const errorMessage = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    myIssues.value = await getMyIssues() // 変数名をmyIssuesに変更
  }
  catch (error) {
    errorMessage.value = 'Failed to get projects'
  }
  finally {
    loading.value = false
  }
})

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

const showGithubPullRequestList = ref(true)
</script>

<template>
  <main
    class="
      w-[400px] pl-3 py-3 text-center text-gray-700
      flex flex-col space-y-2
    "
  >
    <div flex flex-row items-center justify-between>
      <h1 font-bold text-left text-sm>
        Your Issues
      </h1>
      <div mr-3 flex flex-row items-center>
        <BaseToggle
          v-model="showGithubPullRequestList"
          compact
          :disabled="true"
          class="text-left"
        />
        <div>
          Show GitHub Pull Requests
        </div>
      </div>
    </div>
    <div
      class="overflow-auto max-h-[400px] pb-1"
      :class="showGithubPullRequestList ? 'space-y-2' : 'space-y-2'"
      style="scrollbar-gutter: stable"
    >
      <div v-if="loading">
        loading...
      </div>
      <div v-else-if="myIssues.length === 0">
        No issues
      </div>
      <div
        v-for="issue in myIssues"
        v-else
        :key="issue.id"
      >
        <BacklogIssueCard
          :backlog-issue="issue"
          :show-github-pull-request-list="showGithubPullRequestList"
          :get-github-pull-requests="getGithubPullRequests"
        />
      </div>
    </div>
    <div>
      {{ errorMessage }}
    </div>
    <button
      pr-3 cursor-pointer self-end text-gray-500 underline
      flex items-center space-x-1
      @click="openOptionsPage"
    >
      <mdi-settings inline p-auto />
      <div>
        Settings
      </div>
    </button>
  </main>
</template>
