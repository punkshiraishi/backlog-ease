import { sendMessage } from 'webext-bridge/content-script'
import { storage } from '~/logic/storage'
import { replaceKeys } from '~/logic/conversion'

/**
 * GitHub の PR 作成画面で Backlog チケット ID を検知し、
 * テンプレートに置換してタイトル・本文へ自動入力する。
 */
export function initPrAutoFill() {
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
      if (titleInput instanceof HTMLInputElement)
        titleInput.value = replaceKeys(storage.value.prTitle, issue, url)
    }

    // PR 本文の挿入
    if (storage.value.enableInputPRDescription === true) {
      const descriptionInput = document.getElementById('pull_request_body')
      if (descriptionInput instanceof HTMLTextAreaElement)
        descriptionInput.value = replaceKeys(storage.value.prDescription, issue, url)
    }

    // 全て完了したら監視を終了する
    observer.disconnect()
  })

  observer.observe(document.body, { childList: true, subtree: true })
}
