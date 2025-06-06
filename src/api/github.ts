import browser from 'webextension-polyfill'
import type { GithubPullRequest } from '~/types/github'

const EMPTY_USER = {
  login: '',
  id: 0,
  node_id: '',
  avatar_url: '',
  gravatar_id: '',
  url: '',
  html_url: '',
  followers_url: '',
  following_url: '',
  gists_url: '',
  starred_url: '',
  subscriptions_url: '',
  organizations_url: '',
  repos_url: '',
  events_url: '',
  received_events_url: '',
  type: 'User',
  site_admin: false,
} as const

function toGitHubLabel(owner: string, repo: string, name: string, color: string) {
  return {
    id: 0,
    node_id: '',
    url: `https://api.github.com/repos/${owner}/${repo}/labels/${name}`,
    name,
    color,
    default: false,
    description: '',
  } as const
}

async function graphqlRequest<Response>(query: string, variables: Record<string, any> = {}) {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.githubToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  const result = await response.json()

  if (result.errors)
    throw new Error(`GraphQL error: ${result.errors.map((e: any) => e.message).join(', ')}`)

  return result.data as Response
}

export const getGithubPullRequests = async (keyword: string) => {
  const options: any = JSON.parse((await browser.storage.local.get('options')).options)

  const query = `
    query SearchPullRequests($searchQuery: String!, $first: Int!) {
      search(query: $searchQuery, type: ISSUE, first: $first) {
        issueCount
        edges {
          node {
            ... on PullRequest {
              id
              number
              title
              url
              state
              createdAt
              updatedAt
              author {
                login
              }
              repository {
                name
                owner {
                  login
                }
              }
              labels(first: 10) {
                edges {
                  node {
                    name
                    color
                  }
                }
              }
              mergedAt
              isDraft
              closedAt
              closed
              merged
            }
          }
        }
      }
    }
  `

  const variables = {
    searchQuery: `${keyword} in:title org:${options.githubOrg} type:pr`,
    first: 50, // 必要に応じて調整
  }

  const result = await graphqlRequest<{
    search: {
      issueCount: number
      edges: Array<{
        node: {
          id: string
          number: number
          title: string
          url: string
          state: string
          createdAt: string
          updatedAt: string
          author: {
            login: string
          }
          repository: {
            name: string
            owner: {
              login: string
            }
          }
          labels: {
            edges: Array<{
              node: {
                name: string
                color: string
              }
            }>
          }
          mergedAt: string | null
          isDraft: boolean
          closedAt: string | null
          closed: boolean
          merged: boolean
        }
      }>
    }
  }>(query, variables)

  // REST APIの形式に合わせて変換
  return result.search.edges.map(edge => ({
    url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/issues/${edge.node.number}`,
    repository_url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}`,
    labels_url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/issues/${edge.node.number}/labels{/name}`,
    comments_url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/issues/${edge.node.number}/comments`,
    events_url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/issues/${edge.node.number}/events`,
    html_url: edge.node.url,
    id: parseInt(edge.node.id.replace(/\D/g, '')) || 0, // GraphQL IDから数値部分を抽出
    node_id: edge.node.id,
    number: edge.node.number,
    title: edge.node.title,
    user: {
      ...EMPTY_USER,
      ...(edge.node.author && {
        login: edge.node.author.login,
        url: `https://api.github.com/users/${edge.node.author.login}`,
        html_url: `https://github.com/${edge.node.author.login}`,
        followers_url: `https://api.github.com/users/${edge.node.author.login}/followers`,
        following_url: `https://api.github.com/users/${edge.node.author.login}/following{/other_user}`,
        gists_url: `https://api.github.com/users/${edge.node.author.login}/gists{/gist_id}`,
        starred_url: `https://api.github.com/users/${edge.node.author.login}/starred{/owner}{/repo}`,
        subscriptions_url: `https://api.github.com/users/${edge.node.author.login}/subscriptions`,
        organizations_url: `https://api.github.com/users/${edge.node.author.login}/orgs`,
        repos_url: `https://api.github.com/users/${edge.node.author.login}/repos`,
        events_url: `https://api.github.com/users/${edge.node.author.login}/events{/privacy}`,
        received_events_url: `https://api.github.com/users/${edge.node.author.login}/received_events`,
      }),
    },
    labels: edge.node.labels.edges.map(labelEdge =>
      toGitHubLabel(
        edge.node.repository.owner.login,
        edge.node.repository.name,
        labelEdge.node.name,
        labelEdge.node.color,
      ),
    ),
    state: (() => {
      if (edge.node.merged || edge.node.mergedAt)
        return 'merged'
      if (edge.node.closed || edge.node.closedAt)
        return 'closed'
      return edge.node.state.toLowerCase()
    })(),
    locked: false,
    assignee: { ...EMPTY_USER },
    assignees: [],
    milestone: null,
    comments: 0,
    created_at: edge.node.createdAt,
    updated_at: edge.node.updatedAt,
    closed_at: edge.node.closedAt,
    author_association: 'NONE',
    active_lock_reason: null,
    draft: edge.node.isDraft,
    pull_request: {
      url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/pulls/${edge.node.number}`,
      html_url: edge.node.url,
      diff_url: `${edge.node.url}.diff`,
      patch_url: `${edge.node.url}.patch`,
      merged_at: edge.node.mergedAt,
    },
    body: '',
    reactions: {
      'url': `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/issues/${edge.node.number}/reactions`,
      'total_count': 0,
      '+1': 0,
      '-1': 0,
      'laugh': 0,
      'hooray': 0,
      'confused': 0,
      'heart': 0,
      'rocket': 0,
      'eyes': 0,
    },
    timeline_url: `https://api.github.com/repos/${edge.node.repository.owner.login}/${edge.node.repository.name}/issues/${edge.node.number}/timeline`,
    performed_via_github_app: null,
    state_reason: null,
    score: 1,
  })) as unknown as GithubPullRequest[]
}
