import { sendMessage } from 'webext-bridge/content-script'
import { storage } from '~/logic/storage'

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

  // プルリクエストタイトルの挿入
  const titleInput = document.getElementById('pull_request_title')

  if (!(titleInput instanceof HTMLInputElement))
    return

  titleInput.value = `${issue.issueKey} ${issue.summary}`

  // チケット URL の挿入
  const descriptionInput = document.getElementById('pull_request_body')

  if (!(descriptionInput instanceof HTMLTextAreaElement))
    return

  // host 名取得
  const host = (await browser.storage.local.get('options')).options.backlogHost
  descriptionInput.value = `# チケット\nhttps://${host}/view/${issue.issueKey}`

  // 全て完了したら監視を終了する
  observer.disconnect()
})

observer.observe(document.body, { childList: true, subtree: true })
