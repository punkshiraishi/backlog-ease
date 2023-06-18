<script setup lang="ts">
import { storage } from '~/logic/storage'
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    <div class="flex flex-col space-y-5 items-center">
      <h1 class="text-xl">
        Settings
      </h1>
      <div class="flex flex-col space-y-5">
        <label class="flex flex-col items-start">
          <div>Backlog Host</div>
          <input
            v-model="storage.backlogHost"
            class="border border-gray-400 rounded px-2 py-1"
            placeholder="xxx.backlog.jp"
          >
        </label>
        <label class="flex flex-col items-start">
          <div>Backlog API Key</div>
          <input
            v-model="storage.backlogApiKey"
            class="border border-gray-400 rounded px-2 py-1"
          >
        </label>
      </div>
    </div>
  </main>
</template>
