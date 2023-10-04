import type slackSearchMessageResponseSample from './slack-search-message-Response-sample.json'

export type SlackSearchMessageResponse = typeof slackSearchMessageResponseSample.messages
export type SlackMessage = SlackSearchMessageResponse['matches'][0]
