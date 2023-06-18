import { sendMessage } from 'webext-bridge/content-script'

let completed = false

const observer = new MutationObserver(async () => {
  if (completed)
    return

  const elements = document.querySelectorAll('.css-truncate.css-truncate-target')
  const pattern = /YORISO_CLOUD_DEV-(\d+)/
  const matches: string[] = []

  elements.forEach((element) => {
    const textContent = element.textContent
    if (textContent === null)
      return

    const match = textContent.match(pattern)
    if (match) {
    // マッチしたものを配列に追加
      matches.push(match[0])
    }
  })

  if (matches.length === 0)
    return

  const ticketInfo = await sendMessage('get-backlog-ticket', { ticketId: matches[0] })

  if (!ticketInfo)
    return

  const titleInput = document.getElementById('pull_request_title')

  if (!(titleInput instanceof HTMLInputElement))
    return

  titleInput.value = ticketInfo.ticketTitle
  completed = true

  observer.disconnect()
})

observer.observe(document.body, { childList: true, subtree: true })
