import { conversionKeys } from './conversion'
import { useStorageLocal } from '~/composables/useStorageLocal'
export interface Storage {
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

export const storage = useStorageLocal<Storage>('options', {
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
