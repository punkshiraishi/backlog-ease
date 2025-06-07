import { getPrStatusColor, getPrStatusIcon } from './prStatus'
import { getGithubPullRequests } from '~/api/github'

/**
 * Backlog ガントチャート上に GitHub PR を表示する UI を注入する。
 */
export function initGanttPrLinks() {
  const prCache = new Map<string, { prs: any[]; expanded: boolean }>()

  // PR 情報を描画する共通関数
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
    prList.style.flexWrap = 'nowrap'
    prList.style.gap = '4px'
    prList.style.overflowX = 'auto'
    prList.style.maxWidth = '600px'
    prList.style.paddingRight = '150px'
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
      // prevent gantt row click propagation
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

  async function mainLogic(mutations: MutationRecord[] | null) {
    const url = window.location.href
    const isOnGanttPage = url.match(/^https:\/\/.*\.backlog\.com\/gantt\/.*$/)

    if (!isOnGanttPage) {
      prCache.clear() // clear cache when leaving the page
      return
    }

    // オプションチェック
    const options = await browser.storage.local.get('options')
    if (!options.options)
      return
    const enableGanttPRButton = JSON.parse(options.options).enableGanttPRButton
    if (!enableGanttPRButton)
      return

    // Process all summary-links in the document, or just the new ones from mutations
    const linksToProcess = new Set<Element>()

    if (mutations) {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) {
            if (node.matches('.summary-link'))
              linksToProcess.add(node)

            node.querySelectorAll('.summary-link').forEach(link => linksToProcess.add(link))
          }
        }
      }
    }
    else {
      document.querySelectorAll('.summary-link').forEach(link => linksToProcess.add(link))
    }

    for (const link of Array.from(linksToProcess)) {
      if (!(link instanceof HTMLAnchorElement) || link.dataset.prProcessed === 'true')
        continue

      link.dataset.prProcessed = 'true'

      const href = link.href
      const ticketMatch = href.match(/.*\/(.*-\d+)$/)
      if (!ticketMatch)
        continue

      const ticketId = ticketMatch[1]

      // ボタンコンテナを作成（flexbox用）
      const container = document.createElement('div')
      container.style.display = 'flex'
      container.style.alignItems = 'flex-start'
      container.style.gap = '8px'

      // PRボタンを作成
      const prButton = document.createElement('button')
      prButton.innerHTML = 'Show<br>PRs'
      prButton.style.fontSize = '8px'
      prButton.style.border = '1px solid #ddd'
      prButton.style.borderRadius = '4px'
      prButton.style.backgroundColor = '#fff'
      prButton.style.cursor = 'pointer'
      prButton.style.width = '32px'
      prButton.style.minWidth = '32px'
      prButton.style.height = '24px'
      prButton.style.lineHeight = '1.2'
      prButton.style.padding = '2px 0'
      prButton.style.alignSelf = 'center'

      // リンクコンテナを作成
      const linkContainer = document.createElement('div')
      linkContainer.style.display = 'flex'
      linkContainer.style.flexDirection = 'column'
      linkContainer.style.flex = '1'

      // 既存の要素を新しい構造に組み替え
      link.parentElement?.insertBefore(container, link)
      container.appendChild(prButton)
      container.appendChild(linkContainer)
      linkContainer.appendChild(link)

      // PR情報を表示するコンテナ
      const prContainer = document.createElement('div')
      prContainer.style.marginTop = '4px'
      prContainer.style.fontSize = '12px'
      prContainer.style.display = 'none'
      linkContainer.appendChild(prContainer)

      // ボタンクリックイベントの設定
      let prsLoaded = false

      // キャッシュが存在する場合は即描画
      const cached = prCache.get(ticketId)
      if (cached) {
        renderPrContainer(prContainer, cached.prs)
        prContainer.style.display = cached.expanded ? 'block' : 'none'
        prButton.innerHTML = cached.expanded ? 'Hide<br>PRs' : 'Show<br>PRs'
        prsLoaded = true
      }

      prButton.addEventListener('click', async () => {
        if (!prsLoaded) {
          prButton.innerHTML = '...'
          prButton.disabled = true
          try {
            const prs = await getGithubPullRequests(ticketId)
            renderPrContainer(prContainer, prs)
            prsLoaded = true
            prButton.innerHTML = 'Hide<br>PRs'
            prContainer.style.display = 'block'
            prCache.set(ticketId, { prs, expanded: true })
          }
          catch (error) {
            console.error('Failed to fetch GitHub PRs:', error)
            prButton.innerHTML = 'Error'
            setTimeout(() => {
              prButton.innerHTML = 'Show<br>PRs'
              prButton.disabled = false
            }, 2000)
            return
          }
        }
        else {
          // Toggle visibility
          const isVisible = prContainer.style.display === 'block'
          prContainer.style.display = isVisible ? 'none' : 'block'
          prButton.innerHTML = isVisible ? 'Show<br>PRs' : 'Hide<br>PRs'
          const cachedData = prCache.get(ticketId)
          if (cachedData)
            prCache.set(ticketId, { ...cachedData, expanded: !isVisible })
        }
        prButton.disabled = false
      })
    }
  }

  const ganttObserver = new MutationObserver(async (mutations) => {
    mainLogic(mutations)
  })

  ganttObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Initial run in case the content is already there
  mainLogic(null)
}
