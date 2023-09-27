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
  getBacklogIssue: {
    type: Function as PropType<(id: number) => Promise<BacklogIssue>>,
    required: true,
  },
})

const { backlogIssue } = toRefs(props)

const parentBacklogIssue = ref<BacklogIssue>()

onMounted(async () => {
  if (backlogIssue.value.parentIssueId)
    parentBacklogIssue.value = await props.getBacklogIssue(backlogIssue.value.parentIssueId)
})

const createUrl = (issueKey: string) => {
  return `https://${storage.value.backlogHost}/view/${issueKey}`
}

const parentUrl = computed(() => {
  if (!parentBacklogIssue.value)
    return ''

  return createUrl(parentBacklogIssue.value.issueKey)
})

const issueInfoText = computed(() => {
  return `${backlogIssue.value.issueKey} ${backlogIssue.value.summary}`
})

const url = computed(() => {
  return createUrl(backlogIssue.value.issueKey)
})
</script>

<template>
  <a
    w-full px-2 py-1 shadow cursor-pointer hover:bg-gray-100 bg-white
    transition duration-100
    border border-gray-200 border-rounded
    flex flex-col space-y-1
    :href="url"
    target="_blank"
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
          <a v-if="parentUrl" :href="parentUrl" target="_blank" @click.stop>
            <fluent:window-arrow-up-24-filled hover:text-primary title="aaa" />
          </a>
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
          <ic:baseline-content-copy />
        </CopyButton>
        <CopyButton :text="url">
          <ic:baseline-link />
        </CopyButton>
      </div>
    </div>
  </a>
</template>
