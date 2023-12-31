import { sendMessage } from 'webext-bridge/content-script'
import { storage } from '~/logic/storage'
import { replaceKeys } from '~/logic/conversion'

const observer = new MutationObserver(async () => {
  const elements = document.querySelectorAll('.css-truncate.css-truncate-target')
  // いずれかの prefix にマッチする文字列を取得
  const pattern = new RegExp(storage.value.backlogIdPrefixes.map(prefix => `${prefix}-(\\d+)`).join('|'))
  const matches: string[] = []

  elements.forEach((element) => {
    const textContent = element.textContent
    if (textContent === null)
      return

    const match = textContent.match(pattern)
    if (match)
      matches.push(match[0])
  })

  if (matches.length === 0)
    return

  const issue = await sendMessage('get-backlog-ticket', { ticketId: matches[0] })

  if (!issue)
    return

  // issue URL 取得
  const host = storage.value.backlogHost
  const url = `https://${host}/view/${issue.issueKey}`

  // PR タイトルの挿入
  if (storage.value.enableInputPRTitle === true) {
    const titleInput = document.getElementById('pull_request_title')

    if (!(titleInput instanceof HTMLInputElement))
      return

    titleInput.value = replaceKeys(storage.value.prTitle, issue, url)
  }

  // PR 本文の挿入
  if (storage.value.enableInputPRDescription === true) {
    const descriptionInput = document.getElementById('pull_request_body')

    if (!(descriptionInput instanceof HTMLTextAreaElement))
      return

    descriptionInput.value = replaceKeys(storage.value.prDescription, issue, url)
  }

  // 全て完了したら監視を終了する
  observer.disconnect()
})
observer.observe(document.body, { childList: true, subtree: true })

const url = window.location.href

const redirectService = async () => {
  // storage.value は取得されるまで初期値が返ってくるので生の browser.storage.local を使う
  const options = await browser.storage.local.get('options')
  const redirectMappings = JSON.parse(options.options).redirectMappings

  if (!Array.isArray(redirectMappings))
    return

  if (!url.match(/^https:\/\/.*\.backlog\.com\/view\/.*$/))
    return

  const result = await fetch(url)

  if (result.status !== 404)
    return

  const matchedRedirectMapping = redirectMappings.find(({ from }) => url.includes(from))
  if (matchedRedirectMapping && matchedRedirectMapping.to && matchedRedirectMapping.from) {
    const { from, to } = matchedRedirectMapping
    window.location.href = url.replace(from, to)
  }
}

redirectService()
