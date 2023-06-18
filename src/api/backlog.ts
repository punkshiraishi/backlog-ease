import type { BacklogIssue } from '~/types/backlog'

function baseUrl(backlogHost: string) {
  return `https://${backlogHost}/api/v2/issues`
}

export const getIssue = async (issueIdOrKey: string) => {
  const { backlogHost, backlogApiKey } = JSON.parse((await browser.storage.local.get('options')).options)
  const response = await fetch(`${baseUrl(backlogHost)}/${issueIdOrKey}?apiKey=${backlogApiKey}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return response.json() as Promise<BacklogIssue>
}
