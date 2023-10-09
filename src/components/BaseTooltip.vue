<template>
  <VTooltip w-fit>
    <slot />
    <template #popper>
      <slot name="popper" />
    </template>
  </VTooltip>
</template>
