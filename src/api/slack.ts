import browser from 'webextension-polyfill'
import type { SlackSearchMessageResponse } from '~/types/slack'

interface Queries { [key: string]: string | number | string[] | number[] }

async function createSlackUrl(path: string, queries: Queries = {}) {
  const queryString = Object.entries(queries).map(([key, value]) =>
    Array.isArray(value)
      ? value.map(v => `${key}[]=${v}`).join('&')
      : `${key}=${value}`,
  ).join('&')

  return `https://slack.com/api/${path}?${queryString}`
}

async function getSlackRequest<Response>(path: string, queries?: Queries) {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const response = await fetch(await createSlackUrl(path, queries), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${options.slackToken}`,
      'Authorization': `Bearer ${options.slackToken}`,
    },
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return (await (response.json())) as Response
}

export const getSlackMessages = async (query: string) => {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const res = (await getSlackRequest<SlackSearchMessageResponse>(
    'search.messages',
    { query: options.slackChannel ? `in: ${options.slackChannel}${query}` : query },
  ))

  // 200 でもエラーになる場合があるのでチェック
  if (!res.ok)
    throw new Error(`Slack API error! error: ${res.error}`)

  return res.messages.matches
}
