import type githubPullRequestSample from './github-pull-request-sample.json'

export type GithubPullRequest = typeof githubPullRequestSample
export type GithubPullRequestLabel = GithubPullRequest['labels'][0]
