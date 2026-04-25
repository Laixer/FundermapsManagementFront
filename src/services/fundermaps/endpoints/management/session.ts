import { del, get } from '../../client'
import type { ISession } from '../../interfaces/ISession'

export const getAllSessions = async function getAllSessions(opts?: {
  userId?: string
  includeExpired?: boolean
}): Promise<ISession[]> {
  const params = new URLSearchParams()
  if (opts?.userId) params.set('user_id', opts.userId)
  if (opts?.includeExpired) params.set('include_expired', 'true')

  const qs = params.toString()
  return await get({
    endpoint: `management/session${qs ? `?${qs}` : ''}`,
  })
}

export const deleteSession = async function deleteSession(sessionId: string) {
  return await del({
    endpoint: `management/session/${sessionId}`,
  })
}
