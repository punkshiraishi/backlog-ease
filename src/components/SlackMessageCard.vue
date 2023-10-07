<script lang="ts" setup>
import { defineProps } from 'vue'
import type { SlackMessage } from '~/types/slack'
const props = defineProps({
  slackMessage: {
    type: Object as PropType<SlackMessage>,
    required: true,
  },
})
const { slackMessage } = toRefs(props)

const convertedText = computed(() => {
  const mentionRegex = /<@(U[A-Z0-9]+)\|([^>]+)>/g
  const linkWithTextRegex = /<([^|>]+)\|([^>]+)>/g
  const linkWithoutTextRegex = /<([^>]+)>/g

  const convertedText = slackMessage.value.text
    .replace(mentionRegex, (_match, _userId, displayName) => {
      return `@${displayName}`
    })
    .replace(linkWithTextRegex, (_match, _url, text) => {
      return text
    })
    .replace(linkWithoutTextRegex, (_match, url) => {
      return url
    })

  return convertedText
})

// ts → MM月DD日 HH:mm
const convertTsToDateTime = computed(() => {
  const date = new Date(Number(slackMessage.value.ts) * 1000)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${month}月${day}日 ${hours}:${minutes}`
})
</script>

<template>
  <div

    class="
      w-full  cursor-pointer text-white/50 rounded
      shadow hover:bg-black/30 bg-black/50 backdrop-blur
      transition duration-100
      flex flex-row justify-between items-center
    "
    @click.stop
  >
    <a
      p-2
      :href="slackMessage.permalink" target="_blank"
    >
      <div flex flex-col items-start>
        <div class="whitespace-nowrap pl-1 pb-1">
          # {{ slackMessage.channel.name }}
        </div>
        <div pl-3 min-w-0 w-full flex flex-col items-start text-xs>
          <div w-full flex flex-row items-center space-x-2 mb-1>
            <div font-bold whitespace-nowrap text-white>
              <ic:baseline-person-2 inline mr-1 />{{ slackMessage.username }}
            </div>
            <div text-2xs whitespace-nowrap>
              {{ convertTsToDateTime }}
            </div>
          </div>
          <div class="w-full text-left text-white/70 px-1 break-all">
            {{ convertedText }}
          </div>
        </div>
      </div>
    </a>
  </div>
</template>
