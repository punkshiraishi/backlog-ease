import { useStorageLocal } from '~/composables/useStorageLocal'

export const storageDemo = useStorageLocal('webext-demo', 'Storage Demo')

export const storage = useStorageLocal('options', {
  backlogHost: 'yoriso.backlog.com',
  backlogApiKey: 'HZuu17lY0baV1qSwAhoGx2K71DP1H0cvhLPyNzHRXYvfEFwmxRieDEQCL40fXzui',
})
