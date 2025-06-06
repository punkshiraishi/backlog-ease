export function getPrStatusIcon(state: string, merged: boolean, draft: boolean): string {
  // draft 判定を最初に行う
  if (draft)
    return '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0m12 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 8v8m12-5h.01M18 6h.01"></path></svg>'

  // マージ済み判定
  if (merged)
    return '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M5 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0m10 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 8v8"></path><path d="M7 8a4 4 0 0 0 4 4h4"></path></g></svg>'

  // closed 判定
  if (state === 'closed')
    return '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0m12 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 8v8m12-5v5M16 4l4 4m0-4l-4 4"></path></svg>'

  // それ以外は open
  return '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0m12 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 8v8"></path><path d="M11 6h5a2 2 0 0 1 2 2v8"></path><path d="m14 9l-3-3l3-3"></path></g></svg>'
}

export function getPrStatusColor(state: string, merged: boolean, draft: boolean): string {
  if (draft)
    return '#9ca3af'
  if (merged)
    return '#a855f7'
  if (state === 'closed')
    return '#ef4444'
  return '#22c55e'
}
