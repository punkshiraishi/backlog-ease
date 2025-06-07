import { getPrStatusColor, getPrStatusIcon } from './prStatus'
import { getGithubPullRequests } from '~/api/github'

/**
 * Backlog 課題詳細画面 (/view/) に GitHub PR リンク表示を追加する
 */
export function initIssueDetailPrLinks() {
  // PR キャッシュ (チケット単位)
  const prCache = new Map<string, { prs: any[]; expanded: boolean }>()

  // PR UI を描画する共通関数
  function renderPrContainer(prContainer: HTMLElement, prs: any[]) {
    prContainer.innerHTML = ''

    if (prs.length === 0) {
      const noPr = document.createElement('div')
      noPr.textContent = 'No related PRs found'
      noPr.style.fontSize = '11px'
      noPr.style.color = '#666'
      prContainer.appendChild(noPr)
      return
    }

    const prList = document.createElement('div')
    prList.style.display = 'flex'
    prList.style.flexDirection = 'row'
    prList.style.flexWrap = 'wrap'
    prList.style.gap = '4px'
    prList.style.width = '100%'

    prContainer.appendChild(prList)

    for (const pr of prs) {
      const prLink = document.createElement('a')
      prLink.href = pr.html_url
      prLink.target = '_blank'
      prLink.rel = 'noopener noreferrer'
      prLink.style.display = 'flex'
      prLink.style.alignItems = 'center'
      prLink.style.gap = '3px'
      prLink.style.height = '16px'
      prLink.style.border = '1px solid #ddd'
      prLink.style.borderRadius = '4px'
      prLink.style.backgroundColor = '#fff'
      prLink.style.cursor = 'pointer'
      prLink.style.fontSize = '9px'
      prLink.style.textDecoration = 'none'
      prLink.addEventListener('click', e => e.stopPropagation())

      // icon
      const iconSpan = document.createElement('span')
      iconSpan.style.display = 'inline-flex'
      iconSpan.style.alignItems = 'center'
      iconSpan.innerHTML = getPrStatusIcon(
        pr.state,
        pr.pull_request?.merged_at !== null,
        pr.draft,
      )
      iconSpan.style.color = getPrStatusColor(
        pr.state,
        pr.pull_request?.merged_at !== null,
        pr.draft,
      )
      prLink.appendChild(iconSpan)

      const numSpan = document.createElement('span')
      numSpan.textContent = `${pr.repository_url.match(/repos\/[^/]+\/([^/]+)$/)?.[1] ?? ''}#${pr.number}`
      numSpan.style.color = '#0052cc'
      prLink.appendChild(numSpan)

      // labels
      if (pr.labels && pr.labels.length) {
        for (const label of pr.labels) {
          const tag = document.createElement('span')
          tag.textContent = label.name
          tag.style.padding = '0 3px'
          tag.style.borderRadius = '9999px'
          tag.style.backgroundColor = `#${label.color}`
          tag.style.color = '#fff'
          tag.style.fontSize = '7px'
          tag.style.lineHeight = '12px'
          prLink.appendChild(tag)
        }
      }

      prList.appendChild(prLink)
    }
  }

  /** SPA遷移を検知してUIを挿入/削除するメインロジック */
  async function mainLogic() {
    const url = window.location.href
    const isOnDetailPage = url.match(/^https:\/\/.*\.backlog\.com\/view\/.+-\d+$/)

    // 詳細ページでない場合、既存の要素をクリーンアップして終了
    if (!isOnDetailPage) {
      document.querySelectorAll('[data-pr-container="true"]').forEach((el) => {
        // 処理済みフラグも削除
        el.closest<HTMLElement>('.ticket__header')?.removeAttribute('data-pr-processed')
        el.remove()
      })
      return
    }

    const headerEl = document.querySelector<HTMLDivElement>('.ticket__header')
    if (!headerEl)
      return

    // ヘッダーが既に処理済みなら何もしない（競合状態の防止）
    if (headerEl.dataset.prProcessed === 'true')
      return

    const keyWrapper = headerEl.querySelector<HTMLDivElement>('.ticket__key.-has-button')
    if (!keyWrapper)
      return

    // 競合防止のため、処理を開始する前にヘッダーを「処理済み」としてマーク
    headerEl.dataset.prProcessed = 'true'

    // オプションチェック (gantt のフラグを流用)
    const optRaw = await browser.storage.local.get('options')
    if (!optRaw.options) {
      delete headerEl.dataset.prProcessed // 処理失敗したのでフラグを戻す
      return
    }
    const enable = JSON.parse(optRaw.options).enableGanttPRButton
    if (!enable) {
      delete headerEl.dataset.prProcessed
      return
    }

    // チケットキー取得
    const keyEl = headerEl.querySelector<HTMLSpanElement>('.ticket__key-number')
    const ticketId = keyEl?.textContent?.trim() || ''
    if (!ticketId) {
      delete headerEl.dataset.prProcessed
      return
    }

    // コンテナ span を作成（一つ上の階層に配置）
    const prSpan = document.createElement('span')
    prSpan.dataset.prContainer = 'true'
    prSpan.style.marginTop = '-8px'
    prSpan.style.marginBottom = '4px'
    prSpan.style.display = 'flex'
    prSpan.style.flexDirection = 'column'
    prSpan.style.alignItems = 'flex-start'
    prSpan.style.width = '100%'
    headerEl.appendChild(prSpan)

    // toggle button
    const toggleBtn = document.createElement('button')
    toggleBtn.textContent = 'Show PRs'
    toggleBtn.style.fontSize = '8px'
    toggleBtn.style.border = '1px solid #ddd'
    toggleBtn.style.borderRadius = '4px'
    toggleBtn.style.backgroundColor = '#fff'
    toggleBtn.style.cursor = 'pointer'
    toggleBtn.style.height = '20px'
    toggleBtn.style.lineHeight = '20px'
    toggleBtn.style.padding = '0 6px'
    prSpan.appendChild(toggleBtn)

    // container for PR list
    const prContainer = document.createElement('div')
    prContainer.style.marginTop = '4px'
    prContainer.style.fontSize = '12px'
    prContainer.style.display = 'none'
    prContainer.style.width = '100%'
    prSpan.appendChild(prContainer)

    // load from cache if any
    let loaded = false
    const cached = prCache.get(ticketId)
    if (cached) {
      renderPrContainer(prContainer, cached.prs)
      prContainer.style.display = cached.expanded ? 'block' : 'none'
      toggleBtn.textContent = cached.expanded ? 'Hide PRs' : 'Show PRs'
      loaded = true
    }

    toggleBtn.addEventListener('click', async (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (!loaded) {
        toggleBtn.textContent = '...'
        toggleBtn.disabled = true
        try {
          const prs = await getGithubPullRequests(ticketId)
          renderPrContainer(prContainer, prs)
          loaded = true
          toggleBtn.textContent = 'Hide PRs'
          prContainer.style.display = 'block'
          prCache.set(ticketId, { prs, expanded: true })
        }
        catch (err) {
          console.error(err)
          toggleBtn.textContent = 'Error'
          setTimeout(() => {
            toggleBtn.textContent = 'Show PRs'
            toggleBtn.disabled = false
          }, 2000)
          return
        }
      }
      else {
        const visible = prContainer.style.display === 'block'
        prContainer.style.display = visible ? 'none' : 'block'
        toggleBtn.textContent = visible ? 'Show PRs' : 'Hide PRs'
        const data = prCache.get(ticketId)
        if (data)
          prCache.set(ticketId, { ...data, expanded: !visible })
      }
      toggleBtn.disabled = false
    })
  }

  // DOM 監視してチケットキー要素を待つ
  const observer = new MutationObserver(() => mainLogic())
  observer.observe(document.body, { childList: true, subtree: true })
}
