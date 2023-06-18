import { sendMessage } from 'webext-bridge/content-script'

const observer = new MutationObserver(async () => {
  const elements = document.querySelectorAll('.css-truncate.css-truncate-target')
  const pattern = /YORISO_CLOUD_DEV-(\d+)/
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

  descriptionInput.value = `# チケット\nhttps://yoriso.backlog.jp/view/${issue.issueKey}`

  // 全て完了したら監視を終了する
  observer.disconnect()
})

observer.observe(document.body, { childList: true, subtree: true })
