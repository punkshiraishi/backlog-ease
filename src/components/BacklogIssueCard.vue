<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps } from 'vue'
import { storage } from '~/logic/storage'
import type { BacklogIssue } from '~/types/backlog'

const props = defineProps({
  backlogIssue: {
    type: Object as PropType<BacklogIssue>,
    required: true,
  },
})

const { backlogIssue } = toRefs(props)

const issueInfoText = computed(() => {
  return `${backlogIssue.value.issueKey} ${backlogIssue.value.summary}`
})

const url = computed(() => {
  return `https://${storage.value.backlogHost}/view/${backlogIssue.value.issueKey}`
})

const onOpenIssue = () => {
  browser.tabs.create({ url: url.value })
}
</script>

<template>
  <div
    w-full px-2 py-1 shadow cursor-pointer hover:bg-gray-100 bg-white
    transition duration-100
    border border-gray-200 border-rounded
    flex flex-col space-y-1
    @click="onOpenIssue"
  >
    <div flex flex-row justify-between items-center space-x-1>
      <div min-w-0 flex flex-col items-start space-y-1>
        <div flex flex-row space-x-1>
          <div
            :style="{ background: backlogIssue.status.color }"
            class="w-[80px] text-white truncate rounded-full px-1 "
          >
            {{ backlogIssue.status.name }}
          </div>
          <div>
            {{ backlogIssue.issueKey }}
          </div>
        </div>
        <div text-left truncate w-full font-bold>
          {{ backlogIssue.summary }}
        </div>
      </div>
      <div class="flex flex-row space-x-1">
        <CopyButton :text="issueInfoText">
          <pixelarticons-copy />
        </CopyButton>
        <CopyButton :text="url">
          <pixelarticons-link />
        </CopyButton>
      </div>
    </div>
  </div>
</template>
