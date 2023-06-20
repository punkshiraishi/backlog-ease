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
        <LabeledItem>
          <template #label>
            Backlog Host
          </template>
          <template #content>
            <BaseInput
              v-model="storage.backlogHost"
              placeholder="xxx.backlog.jp"
            />
          </template>
        </LabeledItem>
        <LabeledItem>
          <template #label>
            Backlog API Key
          </template>
          <template #content>
            <BaseInput v-model="storage.backlogApiKey" />
          </template>
        </LabeledItem>
        <LabeledItem>
          <template #content>
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
          </template>
        </LabeledItem>
        <LabeledItem />
        <LabeledItem>
          <template #label>
            Backlog ID Prefix
          </template>
          <template #content>
            <BaseInput v-model="storage.backlogIdPrefix" />
          </template>
        </LabeledItem>
      </div>
    </div>
  </main>
</template>
