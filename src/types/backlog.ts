import type backlogIssueSample from './backlog-issue-sample.json'
import type backlogMyselfSample from './backlog-myself-sample.json'
import type backlogProjectSample from './backlog-project-sample.json'
import type backlogStatusSample from './backlog-status-sample.json'

export type BacklogIssue = typeof backlogIssueSample
export type BacklogMyself = typeof backlogMyselfSample
export type BacklogProject = typeof backlogProjectSample
export type BacklogStatus = typeof backlogStatusSample

export interface BacklogIssueUpdateRequest {
  summary?: string
  parentIssueId?: number
  description?: string
  statusId?: number
  resolutionId?: number
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  issueTypeId?: number
  categoryId?: number[]
  versionId?: number[]
  milestoneId?: number[]
  priorityId?: number
  assigneeId?: number
  notifiedUserId?: number[]
  attachmentId?: number[]
  comment?: string
}
