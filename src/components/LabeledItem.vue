<template>
  <label class="flex flex-col justify-start items-center">
    <div class="w-[10rem] text-left p-2">
      <slot name="label">
        &nbsp;
      </slot>
    </div>
    <slot name="content" />
  </label>
</template>
