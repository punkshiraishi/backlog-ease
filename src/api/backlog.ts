import browser from 'webextension-polyfill'
import type { BacklogIssue, BacklogMyself, BacklogProject } from '~/types/backlog'

interface Queries { [key: string]: string | number }

async function createUrl(path: string, queries: Queries = {}) {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const queryString = Object.entries(queries).map(([key, value]) => `${key}=${value}`).join('&')
  return `https://${options.backlogHost}/api/v2/${path}?apiKey=${options.backlogApiKey}&${queryString}`
}

async function getRequest<Response>(path: string, queries?: Queries) {
  const response = await fetch(await createUrl(path, queries), {
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

export const getMyIssues = async () => {
  const myself = await getMyself()
  return await getRequest<BacklogIssue[]>('issues', { 'assigneeId[]': myself.id })
}
