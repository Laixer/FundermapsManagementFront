const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const ALL = LOWERCASE + UPPERCASE + NUMBERS

/** Cryptographically secure random integer in the range [0, max). */
const randomInt = (max: number): number => {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] % max
}

const randomChar = (chars: string): string => chars.charAt(randomInt(chars.length))

/**
 * Generates a strong random password containing at least one lowercase,
 * uppercase and numeric character. Uses the Web Crypto API for randomness.
 * @param length Length of the password (minimum 4)
 * @returns A strong random password
 */
export const generateStrongPassword = (length = 12): string => {
  const size = Math.max(length, 4)
  const chars = [randomChar(LOWERCASE), randomChar(UPPERCASE), randomChar(NUMBERS)]
  while (chars.length < size) chars.push(randomChar(ALL))

  // Fisher–Yates shuffle so the guaranteed characters aren't always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
