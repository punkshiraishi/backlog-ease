<script setup lang="ts">
import { getMyIssues } from '~/api/backlog'
import type { BacklogIssue } from '~/types/backlog'
import { getGithubPullRequests } from '~/api/github'
import BacklogIssueCard from '~/components/BacklogIssueCard.vue'

const myIssues = ref<BacklogIssue[]>([])
const errorMessage = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    myIssues.value = await getMyIssues()
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
const showGithubPullRequestListToggle = ref(false)

async function _getGithubPullRequests(keyword: string) {
  const res = await getGithubPullRequests(keyword)
  showGithubPullRequestListToggle.value = true
  return res
}
</script>

<template>
  <main
    class="
      w-[400px] pl-3 py-3 bg-blueGray-100 text-center text-gray-700
      flex flex-col space-y-1
    "
  >
    <div flex flex-row items-center justify-between>
      <h1 font-bold text-left text-sm>
        担当中の課題
      </h1>
      <div
        mr-3 flex flex-row items-center
      >
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
      class="overflow-auto scrollbar max-h-[400px] pb-1 pr-1 space-y-2"
      scrollbar="track-color-transparent thumb-color-gray-400"
      style="scrollbar-gutter: stable"
    >
      <div v-if="loading" p-10>
        loading...
      </div>
      <div v-else-if="myIssues.length === 0" p-10>
        担当中の課題はありません
      </div>
      <div
        v-for="issue in myIssues"
        v-else
        :key="issue.id"
      >
        <BacklogIssueCard
          :backlog-issue="issue"
        />
        <GithubPullRequestListArea
          v-show="showGithubPullRequestList"
          ml-6
          :issue="issue"
          :get-github-pull-requests="_getGithubPullRequests"
        />
      </div>
    </div>
    <div>
      {{ errorMessage }}
    </div>
  </main>
</template>
