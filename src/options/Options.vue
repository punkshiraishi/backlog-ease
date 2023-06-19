<script setup lang="ts">
import { getMyself } from '~/api/backlog'
import { storage } from '~/logic/storage'

const status: Ref<'valid' | 'invalid' | 'unchecked'> = ref('unchecked')

onMounted(async () => {
  await validateConfigs()
})

async function validateConfigs() {
  try {
    // 有効性確認のために適当なエンドポイントを叩く
    await getMyself()
    status.value = 'valid'
  }
  catch {
    status.value = 'invalid'
  }
}
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <div class="flex flex-col space-y-5 items-center">
      <h1 class="text-xl">
        Settings
      </h1>
      <div class="flex flex-col">
        <label class="flex flex-row justify-start items-center space-x-3">
          <div class="w-[10rem] text-right p-2 bg-gray-200">Backlog Host</div>
          <input
            v-model="storage.backlogHost"
            class="border border-gray-400 rounded px-2 py-1"
            placeholder="xxx.backlog.jp"
          >
        </label>
        <label class="flex flex-row justify-start items-center space-x-3">
          <div class="w-[10rem] text-right p-2 bg-gray-200">Backlog API Key</div>
          <input
            v-model="storage.backlogApiKey"
            class="border border-gray-400 rounded px-2 py-1"
          >
        </label>
        <label class="flex flex-row justify-start items-center space-x-3">
          <div class="w-[10rem] text-right p-2 bg-gray-200 h-14">&nbsp;</div>
          <div class="flex flex-col items-start space-y-1">
            <button
              class="
              bg-blue text-white px-2 py-1 rounded
                transform active:scale-75 transition-transform
              "
              @click="validateConfigs"
            >
              <div class="flex flex-row space-x-1 items-center justify-center">
                <pixelarticons-check />
                <div>有効性のチェック</div>
              </div>
            </button>
            <div
              v-if="status === 'invalid'"
              class="text-red text-xs flex flex-row space-x-1 items-center justify-center"
            >
              <pixelarticons-close />
              <div>Backlog Host または Backlog API Key が正しくありません。</div>
            </div>
            <div
              v-else-if="status === 'valid'"
              class="text-green text-xs flex flex-row space-x-1 items-center justify-center"
            >
              <pixelarticons-check />
              <div>Backlog Host と Backlog API Key が正しく設定されています。</div>
            </div>
          </div>
        </label>
      </div>
    </div>
  </main>
</template>
