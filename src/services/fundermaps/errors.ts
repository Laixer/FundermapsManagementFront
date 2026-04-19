/******************************************************************************
 * Error classes
 *  Note: this is a rather basic implementation
 *
 * TODO: Make Error properties consistent ...
 *
 */
export class APIClientError {}
export class APIErrorResponse extends APIClientError {
  // The status code of the error response
  status: number

  // The response (JSON parsed) body
  body: unknown

  constructor(status: number, body: unknown) {
    super()

    this.status = status
    this.body = body
  }
}

export class APIInputError extends APIClientError {
  status = 400
  message: string

  constructor(message: string) {
    super()

    this.message = message
  }
}

export class APIConfigError extends APIClientError {
  status = 500
  message: string

  constructor(message: string) {
    super()

    this.message = message
  }
}

export class APITokenError extends APIClientError {
  status = 403
  message: string

  constructor(message: string) {
    super()

    this.message = message
  }
}

export class APICallError extends APIClientError {
  status = 500
  body = 'The API call failed'

  // The thrown error
  err: unknown

  // Some api call context information
  endpoint: string | URL | undefined
  options: object
  responseBody: unknown

  constructor(
    err: unknown,
    endpoint: string | URL | undefined,
    options: object,
    responseBody: unknown
  ) {
    super()

    this.err = err
    this.endpoint = endpoint
    this.options = options
    this.responseBody = responseBody
  }
}

/**
 * Best-effort extraction of a human-readable message from a thrown API error.
 * Returns null if nothing useful can be found.
 */
export function getErrorMessage(err: unknown): string | null {
  if (err instanceof APIErrorResponse && err.body && typeof err.body === 'object') {
    const body = err.body as { message?: unknown; error?: unknown }
    if (typeof body.message === 'string' && body.message.trim()) return body.message
    if (typeof body.error === 'string' && body.error.trim()) return body.error
  }
  if (err instanceof APIInputError || err instanceof APIConfigError || err instanceof APITokenError) {
    return err.message
  }
  if (err instanceof APICallError) {
    return getErrorMessage(err.err) ?? getErrorMessage(err.responseBody)
  }
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return null
}
