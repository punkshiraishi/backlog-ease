<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps } from 'vue'
import { storage } from '~/logic/storage'
import type { BacklogIssue } from '~/types/backlog'

const props = defineProps({
  issue: {
    type: Object as PropType<BacklogIssue>,
    required: true,
  },
})

const { issue } = toRefs(props)

const issueInfoText = computed(() => {
  return `${issue.value.issueKey} ${issue.value.summary}`
})

const onOpenIssue = () => {
  browser.tabs.create({
    url: `https://${storage.value.backlogHost}/view/${issue.value.issueKey}`,
  })
}
</script>

<template>
  <div
    w-full p-1 shadow cursor-pointer hover:bg-gray-100
    transition duration-100
    border border-gray-200 border-rounded
    flex flex-row justify-between items-center space-x-1
    @click="onOpenIssue"
  >
    <div min-w-0 flex flex-col items-start space-y-1>
      <div flex flex-row space-x-1>
        <div
          :style="{ background: issue.status.color }"
          class="w-[50px] text-white truncate rounded-full px-1 "
        >
          {{ issue.status.name }}
        </div>
        <div font-bold>
          {{ issue.issueKey }}
        </div>
      </div>
      <div text-left truncate w-full>
        {{ issue.summary }}
      </div>
    </div>
    <CopyButton :text="issueInfoText" />
  </div>
</template>
