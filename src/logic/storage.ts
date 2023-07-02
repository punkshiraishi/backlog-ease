import { conversionKeys } from './conversion'
import { useStorageLocal } from '~/composables/useStorageLocal'

export const storageDemo = useStorageLocal('webext-demo', 'Storage Demo')

export const storage = useStorageLocal('options', {
  backlogHost: '',
  backlogApiKey: '',
  backlogIdPrefixes: [] as string[],
  enableInputPRTitle: true,
  prTitle: `${conversionKeys.ISSUE_KEY} ${conversionKeys.ISSUE_NAME}`,
  enableInputPRDescription: true,
  prDescription: `# チケット\n${conversionKeys.ISSUE_URL}`,
})
