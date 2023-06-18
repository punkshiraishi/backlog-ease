import type { BacklogIssue } from '~/types/backlog'

async function createUrl(path: string) {
  const { backlogHost, backlogApiKey } = JSON.parse((await browser.storage.local.get('options')).options)
  return `https://${backlogHost}/api/v2/${path}?apiKey=${backlogApiKey}`
}

async function getRequest<Response>(path: string) {
  const response = await fetch(await createUrl(path), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return response.json() as Promise<Response>
}

export const getIssue = async (issueIdOrKey: string) => {
  return await getRequest<BacklogIssue>(`issues/${issueIdOrKey}`)
}
