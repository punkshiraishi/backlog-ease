import { onMessage } from 'webext-bridge/background'
import { getIssue, getMyInformation } from '~/api/backlog'
import { getGithubPullRequests } from '~/api/github'
import type { GithubPullRequestsCache } from '~/logic'

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
  return await getIssue(ticketId)
})

// 一定時間おきにデータフェッチ
browser.alarms.create('fetch-data', {
  periodInMinutes: 5,
  // ブラウザ起動直後に最初の一階を実行する
  delayInMinutes: 0,
})

browser.alarms.onAlarm.addListener(async () => {
  const information = await getMyInformation()

  const githubPullRequests: GithubPullRequestsCache = {}

  for (const issue of information.issues)
    githubPullRequests[issue.id] = await getGithubPullRequests(issue.issueKey)

  await browser.storage.local.set({
    cache: JSON.stringify({
      ...information,
      githubPullRequests,
    }),
  })
})
