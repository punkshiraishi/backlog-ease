import type { BacklogIssue } from '~/types/backlog'

export const conversionKeys = Object.freeze({
  ISSUE_KEY: '{{issue-key}}',
  ISSUE_NAME: '{{issue-name}}',
  ISSUE_URL: '{{issue-url}}',
})

export function replaceKeys(text: string, issue: BacklogIssue, url: string) {
  return text
    .replaceAll(conversionKeys.ISSUE_KEY, issue.issueKey)
    .replaceAll(conversionKeys.ISSUE_NAME, issue.summary)
    .replaceAll(conversionKeys.ISSUE_URL, url)
}
