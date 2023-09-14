import browser from 'webextension-polyfill'
import type { GithubPullRequest } from '~/types/github'

interface Queries { [key: string]: string | number | string[] | number[] }

async function createGithubUrl(path: string, queries: Queries = {}) {
  const queryString = Object.entries(queries).map(([key, value]) =>
    Array.isArray(value)
      ? value.map(v => `${key}[]=${v}`).join('&')
      : `${key}=${value}`,
  ).join('&')

  return `https://api.github.com/${path}?${queryString}`
}

async function getGithubRequest<Response>(path: string, queries?: Queries) {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const response = await fetch(await createGithubUrl(path, queries), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${options.githubToken}`,
    },
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return (await (response.json())).items as Response
}

export const getGithubPullRequests = async (keyword: string) => {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  return await getGithubRequest<GithubPullRequest[]>(
    'search/issues',
    { q: `${keyword} in:title org:${options.githubOrg} type:pr` },
  )
}
