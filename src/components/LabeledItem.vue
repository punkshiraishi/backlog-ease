<template>
  <label class="flex flex-row justify-start items-center space-x-3">
    <div class="w-[10rem] text-right p-2 bg-gray-200 self-stretch">
      <slot name="label">
        &nbsp;
      </slot>
    </div>
    <slot name="content" />
  </label>
</template>
