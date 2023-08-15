<script setup lang="ts">
import { getMyIssues } from '~/api/backlog'
import type { BacklogIssue } from '~/types/backlog'

const myIssue = ref<BacklogIssue[]>([])
const errorMessage = ref('')

onMounted(async () => {
  try {
    myIssue.value = await getMyIssues()
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
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <button class="btn" @click="openOptionsPage">
      Open Options
    </button>
    <div>
      <ul>
        <li v-for="project in myIssue" :key="project.id">
          {{ project.summary }}
        </li>
      </ul>
    </div>
    <div>
      {{ errorMessage }}
    </div>
  </main>
</template>
