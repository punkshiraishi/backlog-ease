import { conversionKeys } from './conversion'
import type { BacklogIssue, BacklogStatus } from '~/types/backlog'
import { useStorageLocal } from '~/composables/useStorageLocal'
import type { GithubPullRequest } from '~/types/github'

export interface OptionStorage {
  backlogHost: string
  backlogApiKey: string
  backlogIdPrefixes: string[]
  githubOrg: string
  githubToken: string
  slackToken: string
  slackChannel: string
  enableInputPRTitle: boolean
  prTitle: string
  enableInputPRDescription: boolean
  prDescription: string
}

export const storage = useStorageLocal<OptionStorage>('options', {
  backlogHost: '',
  backlogApiKey: '',
  backlogIdPrefixes: [],
  githubOrg: '',
  githubToken: '',
  slackToken: '',
  slackChannel: '',
  enableInputPRTitle: true,
  prTitle: `${conversionKeys.ISSUE_KEY} ${conversionKeys.ISSUE_NAME}`,
  enableInputPRDescription: true,
  prDescription: `# チケット\n${conversionKeys.ISSUE_URL}`,

})

export interface BacklogStatusesCache { [key: string]: BacklogStatus[] }
export interface GithubPullRequestsCache { [backlogIssueId: string]: GithubPullRequest[] }

interface CacheStorage {
  backlogIssues: BacklogIssue[]
  backlogStatuses: BacklogStatusesCache
  githubPullRequests: GithubPullRequestsCache
}

export const cacheStorage = useStorageLocal<CacheStorage>('cache', {
  backlogIssues: [],
  backlogStatuses: {},
  githubPullRequests: {},
})
