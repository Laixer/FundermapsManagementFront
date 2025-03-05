/**
 * Generates a strong random password
 * @param length Length of the password
 * @returns A strong random password
 */
export const generateStrongPassword = (length = 12): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  // const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?'

  // Ensure at least one character from each group
  let password = ''
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  // password += specialChars.charAt(Math.floor(Math.random() * specialChars.length))

  // Fill the rest with random characters from all groups
  const allChars = lowercase + uppercase + numbers //+ specialChars
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password to make it more random
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}
