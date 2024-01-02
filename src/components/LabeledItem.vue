<template>
  <label class="flex flex-col justify-start items-center w-full">
    <div class="text-left py-2 w-full font-bold">
      <slot name="label">
        &nbsp;
      </slot>
    </div>
    <slot name="content" />
  </label>
</template>
