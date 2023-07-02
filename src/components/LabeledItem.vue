<template>
  <label class="flex flex-col justify-start items-center w-full">
    <div class="text-left p-2 w-full">
      <slot name="label">
        &nbsp;
      </slot>
    </div>
    <slot name="content" />
  </label>
</template>
