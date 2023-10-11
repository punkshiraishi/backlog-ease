<script setup lang="ts">
import type { PropType } from 'vue'
import { defineProps } from 'vue'
import { storage } from '~/logic/storage'
import type { BacklogIssue, BacklogIssueUpdateRequest, BacklogStatus } from '~/types/backlog'
import type { SlackMessage } from '~/types/slack'

const props = defineProps({
  modelValue: {
    type: Object as PropType<BacklogIssue>,
    required: true,
  },
  getBacklogIssue: {
    type: Function as PropType<(id: number) => Promise<BacklogIssue>>,
    required: true,
  },
  updateBacklogIssue: {
    type: Function as PropType<(issueId: number, data: BacklogIssueUpdateRequest) => Promise<BacklogIssue>>,
    required: true,
  },
  statuses: {
    type: Array as PropType<BacklogStatus[]>,
    required: true,
  },
  getSlackMessages: {
    type: Object as PropType<((keyword: string) => Promise<SlackMessage[]>) | null>,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const { modelValue, updateBacklogIssue, getBacklogIssue } = toRefs(props)

const parentBacklogIssue = ref<BacklogIssue>()

onMounted(async () => {
  if (modelValue.value.parentIssueId)
    parentBacklogIssue.value = await getBacklogIssue.value(modelValue.value.parentIssueId)
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
  return `${modelValue.value.issueKey} ${modelValue.value.summary}`
})

const url = computed(() => {
  return createUrl(modelValue.value.issueKey)
})

async function onSelectStatus(status: BacklogStatus) {
  const updatedIssue = await updateBacklogIssue.value(modelValue.value.id, {
    statusId: status.id,
  })
  emit('update:modelValue', updatedIssue)
}
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

          <BacklogIssueStatusLabelSelector
            :status="modelValue.status"
            :statuses="statuses"
            @select="onSelectStatus"
          />
          <a v-if="parentUrl" :href="parentUrl" target="_blank" @click.stop>
            <carbon:parent-child
              v-tooltip="'親課題を開く'"
              hover:text-primary
            />
          </a>
          <div>
            {{ modelValue.issueKey }}
          </div>
        </div>
        <div text-left truncate w-full font-bold>
          {{ modelValue.summary }}
        </div>
      </div>
      <div class="flex flex-row space-x-1">
        <CopyButton :text="issueInfoText">
          <ic:baseline-content-copy />
        </CopyButton>
        <CopyButton :text="url">
          <ic:baseline-link />
        </CopyButton>
        <SlackSearchButton
          v-if="getSlackMessages"
          :get-slack-messages="getSlackMessages"
          :text="issueInfoText"
        />
      </div>
    </div>
  </a>
</template>
