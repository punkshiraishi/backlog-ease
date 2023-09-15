import { defineConfig } from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#42CE9F',
        darken: '#1D8260',
      },
      danger: {
        DEFAULT: '#CF4D2D',
      },
    },
    fontSize: {
      '2xs': '0.625rem',
    },
  },
})
