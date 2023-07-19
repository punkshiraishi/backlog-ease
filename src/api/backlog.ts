import type { BacklogIssue, BacklogMyself, BacklogProject } from '~/types/backlog'
import { storage } from '~/logic/storage'

async function createUrl(path: string) {
  return `https://${storage.value.backlogHost}/api/v2/${path}?apiKey=${storage.value.backlogApiKey}`
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

export const getMyself = async () => {
  return await getRequest<BacklogMyself>('users/myself')
}

export const getProjects = async () => {
  return await getRequest<BacklogProject[]>('projects')
}
