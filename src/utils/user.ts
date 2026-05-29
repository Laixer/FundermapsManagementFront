import type { IUser } from '@/services/fundermaps/interfaces/IUser'

export function renderUserName(user: IUser): string {
  if (user.given_name && user.family_name) {
    return `${user.given_name} ${user.family_name}`
  }
  if (user.given_name) {
    return user.given_name
  }
  if (user.family_name) {
    return user.family_name
  }
  return ''
}

/**
 * Two-letter initials for a user — first + last name initial when a name is
 * known, otherwise the first two characters of the email.
 */
export function getInitials(user: IUser): string {
  const name = renderUserName(user).trim()
  if (name) {
    const parts = name.split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || user.email.slice(0, 2).toUpperCase()
  }
  return user.email.slice(0, 2).toUpperCase()
}
