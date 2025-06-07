import { getPrStatusColor, getPrStatusIcon } from './prStatus'
import { getGithubPullRequests } from '~/api/github'

/**
 * Backlog 課題一覧画面 (#issues-table) に GitHub PR リンク列を追加する。
 * 行の一番左にボタン+PR一覧を描画する。
 */
export function initIssueListPrLinks() {
  const prCache = new Map<string, { prs: any[]; expanded: boolean }>()

  /** 共通描画関数 (ganttPrLinks と同仕様) */
  function renderPrContainer(prContainer: HTMLElement, prs: any[]) {
    prContainer.innerHTML = ''

    if (prs.length === 0) {
      const noPrText = document.createElement('div')
      noPrText.textContent = 'No related PRs found'
      noPrText.style.color = '#666'
      noPrText.style.fontSize = '11px'
      prContainer.appendChild(noPrText)
      return
    }

    const prList = document.createElement('div')
    prList.style.display = 'flex'
    prList.style.flexDirection = 'column'
    prList.style.gap = '4px'
    prList.style.overflowX = 'auto'
    prList.style.maxWidth = '100%'
    // スクロールバーを非表示
    ;(prList.style as any).msOverflowStyle = 'none' // IE, Edge
    prList.style.scrollbarWidth = 'none' // Firefox
    prList.style.cssText += '&::-webkit-scrollbar { display: none; }' // WebKit
    prContainer.appendChild(prList)

    for (const pr of prs) {
      const prLinkEl = document.createElement('a')
      prLinkEl.href = pr.html_url
      prLinkEl.target = '_blank'
      prLinkEl.rel = 'noopener noreferrer'
      prLinkEl.style.display = 'flex'
      prLinkEl.style.alignItems = 'center'
      prLinkEl.style.gap = '3px'
      prLinkEl.style.height = '16px'
      prLinkEl.style.border = '1px solid #ddd'
      prLinkEl.style.borderRadius = '4px'
      prLinkEl.style.backgroundColor = '#fff'
      prLinkEl.style.cursor = 'pointer'
      prLinkEl.style.fontSize = '9px'
      prLinkEl.style.textDecoration = 'none'
      prLinkEl.style.width = 'fit-content'
      // 行遷移抑止
      prLinkEl.addEventListener('click', (ev) => {
        ev.stopPropagation()
      })

      // ステータスアイコン
      const statusIcon = document.createElement('span')
      statusIcon.style.display = 'inline-flex'
      statusIcon.style.alignItems = 'center'
      statusIcon.innerHTML = getPrStatusIcon(
        pr.state,
        pr.pull_request?.merged_at !== null,
        pr.draft,
      )
      statusIcon.style.color = getPrStatusColor(
        pr.state,
        pr.pull_request?.merged_at !== null,
        pr.draft,
      )
      prLinkEl.appendChild(statusIcon)

      const prNumber = document.createElement('span')
      prNumber.textContent = `${pr.repository_url.match(/repos\/[^/]+\/([^/]+)$/)?.[1] ?? ''}#${pr.number}`
      prNumber.style.color = '#0052cc'
      prLinkEl.appendChild(prNumber)

      // ラベル
      if (pr.labels && pr.labels.length > 0) {
        for (const label of pr.labels) {
          const tagSpan = document.createElement('span')
          tagSpan.textContent = label.name
          tagSpan.style.padding = '0px 3px'
          tagSpan.style.borderRadius = '9999px'
          tagSpan.style.backgroundColor = `#${label.color}`
          tagSpan.style.color = '#fff'
          tagSpan.style.fontSize = '7px'
          tagSpan.style.lineHeight = '12px'
          prLinkEl.appendChild(tagSpan)
        }
      }

      prList.appendChild(prLinkEl)
    }
  }

  async function mainLogic() {
    const url = window.location.href
    const isOnIssueListPage = url.match(/^https:\/\/.*\.backlog\.com\/find\/.*$/)

    if (!isOnIssueListPage) {
      document.querySelectorAll('[data-pr-column]').forEach(el => el.remove())
      document.querySelectorAll('.cell-pr-links').forEach(el => el.remove())
      prCache.clear()
      return
    }

    const table = document.querySelector<HTMLTableElement>('#issues-table')
    if (!table)
      return

    // オプションチェック
    const storage = await browser.storage.local.get('options')
    if (!storage.options)
      return

    const enable = JSON.parse(storage.options).enableGanttPRButton
    if (!enable)
      return

    // ヘッダ列の追加 (一度だけ)
    const theadRow = table.querySelector('thead tr')
    if (theadRow && !theadRow.querySelector('[data-pr-column]')) {
      const th = document.createElement('th')
      th.dataset.prColumn = 'true'
      th.style.width = '100px'
      th.style.minWidth = '100px'
      th.style.maxWidth = '100px'
      theadRow.insertBefore(th, theadRow.firstChild)
    }

    // 行クリック抑止リスナーの追加（一度だけ）
    if (!table.dataset.prCaptureAdded) {
      table.dataset.prCaptureAdded = 'true'
      const stopIfInsidePrCell = (evt: Event) => {
        const target = evt.target as HTMLElement | null
        if (target?.closest('.cell-pr-links')) {
          evt.stopPropagation()
          evt.preventDefault()
        }
      }
      table.addEventListener('mousedown', stopIfInsidePrCell, true)
      table.addEventListener('pointerdown', stopIfInsidePrCell, true)
    }

    // データ行の処理
    const rows = table.querySelectorAll<HTMLTableRowElement>('tbody tr')
    rows.forEach((row) => {
      if (row.querySelector('.cell-pr-links'))
        return // 既に処理済み

      const keyAnchor = row.querySelector<HTMLAnchorElement>('.cell-key a')
      const ticketId = keyAnchor?.textContent?.trim() || ''
      if (!ticketId)
        return

      const td = document.createElement('td')
      td.className = 'cell-pr-links'
      td.style.verticalAlign = 'top'
      td.style.width = '100px'
      td.style.minWidth = '100px'
      td.style.maxWidth = '100px'
      td.style.overflowX = 'auto'
      td.style.whiteSpace = 'nowrap'
      row.insertBefore(td, row.firstChild)

      const container = document.createElement('div')
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      container.style.alignItems = 'flex-start'
      container.style.width = '100%'
      container.style.maxWidth = '100%'
      td.appendChild(container)

      const prButton = document.createElement('button')
      prButton.textContent = 'Show PRs'
      prButton.style.fontSize = '8px'
      prButton.style.border = '1px solid #ddd'
      prButton.style.borderRadius = '4px'
      prButton.style.backgroundColor = '#fff'
      prButton.style.cursor = 'pointer'
      prButton.style.alignSelf = 'center'
      container.appendChild(prButton)

      const prContainer = document.createElement('div')
      prContainer.style.marginTop = '4px'
      prContainer.style.fontSize = '12px'
      prContainer.style.display = 'none'
      prContainer.style.width = '100%'
      prContainer.style.overflowX = 'auto'
      container.appendChild(prContainer)

      let prsLoaded = false
      const cached = prCache.get(ticketId)
      if (cached) {
        renderPrContainer(prContainer, cached.prs)
        prContainer.style.display = cached.expanded ? 'block' : 'none'
        prButton.textContent = cached.expanded ? 'Hide PRs' : 'Show PRs'
        prsLoaded = true
      }

      prButton.addEventListener('click', async (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (!prsLoaded) {
          prButton.textContent = '...'
          prButton.disabled = true
          try {
            const prs = await getGithubPullRequests(ticketId)
            renderPrContainer(prContainer, prs)
            prsLoaded = true
            prButton.textContent = 'Hide PRs'
            prContainer.style.display = 'block'
            prCache.set(ticketId, { prs, expanded: true })
          }
          catch (error) {
            console.error('Failed to fetch GitHub PRs:', error)
            prButton.textContent = 'Error'
            setTimeout(() => {
              prButton.textContent = 'Show PRs'
              prButton.disabled = false
            }, 2000)
            return
          }
        }
        else {
          const isVisible = prContainer.style.display === 'block'
          prContainer.style.display = isVisible ? 'none' : 'block'
          prButton.textContent = isVisible ? 'Show PRs' : 'Hide PRs'
          const cachedData = prCache.get(ticketId)
          if (cachedData)
            prCache.set(ticketId, { ...cachedData, expanded: !isVisible })
        }
        prButton.disabled = false
      })
    })
  }

  const observer = new MutationObserver(() => mainLogic())
  observer.observe(document.body, { childList: true, subtree: true })
}
