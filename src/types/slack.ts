import slackSearchMessageResponseSample from './slack-search-message-response-sample.json'
import slackSearchMessageResponseErrorSample from './slack-search-message-response-error-sample.json'

const slackSearchMessageResponse = {
  ...slackSearchMessageResponseSample,
  ok: true as const,
}

const slackSearchMessageResponseError = {
  ...slackSearchMessageResponseErrorSample,
  ok: false as const,
}

type SlackSearchMessageResponseSample = typeof slackSearchMessageResponse
type SlackSearchMessageResponseErrorSample = typeof slackSearchMessageResponseError

export type SlackSearchMessageResponse = SlackSearchMessageResponseSample | SlackSearchMessageResponseErrorSample
export type SlackMessage = SlackSearchMessageResponseSample['messages']['matches'][0]
