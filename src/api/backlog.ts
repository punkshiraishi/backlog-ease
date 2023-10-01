import _ from 'lodash'
import browser from 'webextension-polyfill'
import type { BacklogIssue, BacklogIssueUpdateRequest, BacklogMyself, BacklogProject, BacklogStatus } from '~/types/backlog'

interface Queries { [key: string]: string | number | string[] | number[]}

async function createUrl(path: string, queries: Queries = {}) {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const queryString = Object.entries(queries).map(([key, value]) =>
    Array.isArray(value)
      ? value.map(v => `${key}[]=${v}`).join('&')
      : `${key}=${value}`,
  ).join('&')

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

export const getIssue = async (issueIdOrKey: number | string) => {
  return await getRequest<BacklogIssue>(`issues/${issueIdOrKey}`)
}

export const getMyself = async () => {
  return await getRequest<BacklogMyself>('users/myself')
}

export const getProjects = async () => {
  return await getRequest<BacklogProject[]>('projects')
}

export const getStatuses = async (projectId: number) => {
  return await getRequest<BacklogStatus[]>(`projects/${projectId}/statuses`)
}

export const updateIssue = async (issueIdOrKey: number | string, data: BacklogIssueUpdateRequest) => {
  const response = await fetch(await createUrl(`issues/${issueIdOrKey}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return response.json() as Promise<BacklogIssue>
}

export const getMyInformation = async () => {
  const projects = await getProjects()
  const [myself, ...projectStatuses] = await Promise.all([
    getMyself(),
    ...projects.map(async project => getStatuses(project.id)
      .then(statuses => ({ projectId: project.id, statuses })),
    ),
  ])

  return {
    projectStatuses: _(projectStatuses)
      .keyBy('projectId')
      .mapValues(item => item.statuses)
      .value(),
    issues: await getRequest<BacklogIssue[]>('issues', {
    // 自分の課題だけ取得
      assigneeId: [myself.id],
      // 重複を排除し完了以外の課題だけ取得
      statusId: _(projectStatuses)
        .map(item => item.statuses)
        .flatten()
        .map(s => s.id)
        .uniq()
        .filter(id => id !== 4)
        .value(),
    }),
  }
}
