import type { BacklogIssue } from '~/types/backlog'

const host = 'yoriso.backlog.com'
const apiKey = 'HZuu17lY0baV1qSwAhoGx2K71DP1H0cvhLPyNzHRXYvfEFwmxRieDEQCL40fXzui'

export const getIssue = async (issueIdOrKey: string) => {
  const response = await fetch(`https://${host}/api/v2/issues/${issueIdOrKey}?apiKey=${apiKey}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return response.json() as Promise<BacklogIssue>
}
