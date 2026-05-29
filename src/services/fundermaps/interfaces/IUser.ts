import type { IOrganization } from './IOrganization'

export interface IUser {
  id: string
  given_name: string | null
  family_name: string | null
  email: string
  picture: string | null
  job_title: string | null
  phone_number: string | null
  role: string
  created_at?: string | null
  updated_at?: string | null
  organizations: IOrganization[] | null
}
