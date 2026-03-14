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
