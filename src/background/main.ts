import { onMessage } from 'webext-bridge/background'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

onMessage('get-backlog-ticket', async ({ data: { ticketId } }) => {
  return {
    ticketUrl: `https://yoriso-cloud.backlog.jp/view/${ticketId}`,
    ticketTitle: `【${ticketId}】`,
  }
})
