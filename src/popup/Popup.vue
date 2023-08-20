<script setup lang="ts">
import { getMyIssues } from '~/api/backlog'
import type { BacklogIssue } from '~/types/backlog'

const myIssues = ref<BacklogIssue[]>([]) // 変数名をmyIssuesに変更
const errorMessage = ref('')

onMounted(async () => {
  try {
    myIssues.value = await getMyIssues() // 変数名をmyIssuesに変更
  }
  catch (error) {
    errorMessage.value = 'Failed to get projects'
  }
})

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}
</script>

<template>
  <main
    class="
      w-[400px] px-4 py-5 text-center text-gray-700
      flex flex-col space-y-2
    "
  >
    <h1 font-bold text-left text-sm>
      Your Issues
    </h1>
    <div class="space-y-1 overflow-auto max-h-[300px]">
      <IssueCard
        v-for="issue in myIssues"
        :key="issue.id"
        :issue="issue"
      />
      <div v-if="myIssues.length === 0">
        No issues
      </div>
    </div>
    <div>
      {{ errorMessage }}
    </div>
    <button
      class="cursor-pointer self-end text-gray-500 underline flex items-center space-x-1"
      @click="openOptionsPage"
    >
      <mdi-settings inline p-auto />
      <div>
        Settings
      </div>
    </button>
  </main>
</template>
