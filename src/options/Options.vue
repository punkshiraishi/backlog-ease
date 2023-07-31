<script setup lang="ts">
import { debounce } from 'lodash'
import { getMyself, getProjects } from '~/api/backlog'
import { storage } from '~/logic/storage'

const status: Ref<'valid' | 'invalid' | 'unchecked'> = ref('unchecked')

const backlogHost = computed({
  get: () => {
    return storage.value.backlogHost
  },
  set: (value: string) => {
    // URL っぽい場合はホスト名だけ抽出する
    const pattern = /(https?:\/\/)?([\w.-]+)/
    const match = value.match(pattern)
    if (match && match[2])
      storage.value.backlogHost = match[2]
    else
      storage.value.backlogHost = value
  },
})

watch(
  () => [storage.value.backlogHost, storage.value.backlogApiKey],
  debounce(() => {
    validateConfigs()
  }, 500),
  { immediate: true },
)

async function validateConfigs() {
  try {
    // 有効性確認のために適当なエンドポイントを叩く
    await getMyself()

    // 有効な場合はプロジェクト一覧を取得して storage に保存する
    storage.value.backlogIdPrefixes = (await getProjects()).map(project => project.projectKey)

    status.value = 'valid'
  }
  catch {
    storage.value.backlogIdPrefixes = []
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
      <div class="flex flex-col w-[22rem]">
        <LabeledItem>
          <template #label>
            Backlog Host
          </template>
          <template #content>
            <BaseInput
              v-model="backlogHost"
              placeholder="xxx.backlog.jp"
              class="w-full"
            />
          </template>
        </LabeledItem>
        <LabeledItem>
          <template #label>
            Backlog API Key
          </template>
          <template #content>
            <BaseInput
              v-model="storage.backlogApiKey"
              type="password"
              class="w-full"
            />
          </template>
        </LabeledItem>
        <LabeledItem>
          <template #content>
            <div class="flex flex-col items-start space-y-1">
              <div
                v-if="status === 'invalid'"
                class="text-danger text-xs flex flex-row space-x-1 items-center justify-center"
              >
                <pixelarticons-close />
                <div>Backlog Host または Backlog API Key が無効です。</div>
              </div>
              <div
                v-else-if="status === 'valid'"
                class="text-primary text-xs flex flex-row space-x-1 items-center justify-center"
              >
                <pixelarticons-check />
                <div>Backlog Host と Backlog API Key が有効です。</div>
              </div>
            </div>
          </template>
        </LabeledItem>
        <LabeledItem />
        <LabeledItem class="mb-7">
          <template #label>
            <div class="flex flex-row justify-between items-center space-x-3">
              <div>GitHub PR タイトルに Backlog 課題名自動入力</div>
              <BaseToggle v-model="storage.enableInputPRTitle" />
            </div>
          </template>
          <template #content>
            <BaseInput
              v-model="storage.prTitle"
              :disabled="!storage.enableInputPRTitle"
              class="border border-gray-400 rounded px-2 py-1 w-full"
            />
          </template>
        </LabeledItem>
        <LabeledItem>
          <template #label>
            <div class="flex flex-row justify-between items-center space-x-3">
              <div>GitHub PR 本文に Backlog URL 自動入力</div>
              <BaseToggle v-model="storage.enableInputPRDescription" />
            </div>
          </template>
          <template #content>
            <BaseTextarea
              v-model="storage.prDescription"
              :disabled="!storage.enableInputPRDescription"
              class="border border-gray-400 rounded px-2 py-1 w-full"
            />
          </template>
        </LabeledItem>
      </div>
    </div>
  </main>
</template>
