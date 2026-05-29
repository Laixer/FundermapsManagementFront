export interface IOrganization {
  id: string
  name: string
  /** The user's membership role within this organisation (reader/writer/verifier/superuser). Present on a user's organisation list. */
  role?: string | null
}
