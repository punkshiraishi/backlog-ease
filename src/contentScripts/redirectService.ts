/**
 * Backlog のチケット URL が 404 の場合、ユーザー定義のリダイレクトマッピングに従って
 * 別 URL へ遷移させる。
 */
export async function initRedirectService() {
  const url = window.location.href

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

  const matchedRedirectMapping = redirectMappings.find(({ from }: { from: string }) => url.includes(from))
  if (matchedRedirectMapping && matchedRedirectMapping.to && matchedRedirectMapping.from) {
    const { from, to } = matchedRedirectMapping
    window.location.href = url.replace(from, to)
  }
}
