<script lang="ts" setup>
import type { SlackMessage } from '~/types/slack'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  getSlackMessages: {
    type: Function as PropType<(keyword: string) => Promise<SlackMessage[]>>,
    required: true,
  },
})
const { text, getSlackMessages } = toRefs(props)
const dialog = ref(false)
const messages = ref<SlackMessage[]>([])
const loading = ref(false)

const onSearch = async () => {
  try {
    loading.value = true
    dialog.value = true
    messages.value = await getSlackMessages.value(text.value)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <button
      class="
        h-5 w-5 rounded-full transition-all text-xs
        bg-gray-200 hover:bg-gray-300 text-gray-500
        grid place-items-center shrink-0
      "
      @click.prevent.stop="onSearch"
    >
      <bx:bxl-slack />
    </button>
    <BaseDialog v-model="dialog">
      <div
        max-w="600px" max-h="900px" w-90vw h-90vh flex flex-col space-y-2
        @click="dialog = false"
      >
        <div
          text-black opacity-70 font-bold text-left
          flex flex-col items-start
        >
          <div flex flex-row items-center justify-between w-full>
            <div flex flex-row items-center space-x-1 text-sm>
              <bx:bxl-slack /> <div>Slack 検索結果 </div>
            </div>
            <button rounded-full p-1 hover:bg-white hover:opacity-30>
              <ic:sharp-close justify-self-end text-lg @click="dialog = false" />
            </button>
          </div>
          <div text-2xs>
            "{{ text }}"
          </div>
        </div>
        <div v-if="loading" flex items-center justify-center p-10>
          <LoadingSpinner />
        </div>
        <div
          v-else-if="messages.length > 0"
          grow overflow-auto scrollbar p-4 rounded
          flex flex-col space-y-2
        >
          <SlackMessageCard
            v-for="message in messages"
            :key="message.iid"
            :slack-message="message"
          />
        </div>
        <div v-else flex items-center justify-center p-10>
          <div text-black opacity-70>
            該当するメッセージがありませんでした
          </div>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>
