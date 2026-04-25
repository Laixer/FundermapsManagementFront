export interface ISession {
  id: string
  user_id: string
  expires_at: string
  created_at: string
  updated_at: string
  ip_address: string | null
  user_agent: string | null
}
