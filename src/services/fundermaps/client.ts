
import { loginRedirect } from '@/services/auth'

import { getAPIKeyAuthHeader, hasAPIKey } from './api-key'
import { APICallError, APIClientError, APIErrorResponse, APITokenError } from './errors'

export interface AuthorizationHeader {
  Authorization: string
}

/******************************************************************************
 * The function thats is calling the shots
 */

/**
 * Auth is the Better Auth session cookie (or the API key override); the
 * server decides. A 401 on a requireAuth call is handled after the response.
 */
const makeCall = async function makeCall({
  endpoint,
  method = 'GET',
  body,
  queryString,
  requireAuth = true,
  autoredirect = true,
}: {
  endpoint: string | URL
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: BodyInit | Record<string, unknown>
  queryString?: URLSearchParams | Record<string, string> | string
  requireAuth?: boolean
  autoredirect?: boolean
}) {
  let fetchOptions = {}
  let authHeader: AuthorizationHeader | Record<string, never> = {}
  const headers: Record<string, string> = {}
  let responseBody = null
  let url: URL

  try {
    // Auth header: only the API-key override adds one; the session cookie
    // travels by itself (credentials: 'include' below).
    if (requireAuth) {
      authHeader = getAPIKeyAuthHeader() || {}
    }

    if (typeof endpoint === 'string') {
      url = combineEndpoint(endpoint)
    } else {
      url = endpoint
    }

    try {
      // If queryString is empty, and body either contains URLSearchParams, or is GET and contains a string
      if (
        !queryString &&
        (body instanceof URLSearchParams || (method === 'GET' && typeof body === 'string'))
      ) {
        queryString = body
        body = undefined
      }

      // Convert Record<string, string> or string into URLSearchParams
      if (queryString && !(queryString instanceof URLSearchParams)) {
        queryString = new URLSearchParams(queryString)
      }

      if (queryString instanceof URLSearchParams) {
        queryString.forEach((value, key) => {
          url.searchParams.append(key, value)
        })
      }
    } catch {
      throw new Error('Failed to process query string')
    }

    if (body && typeof body !== 'string' && !(body instanceof FormData)) {
      try {
        body = JSON.stringify(body)
        headers['Content-Type'] = 'application/json'
      } catch {
        // Ignore failed JSON stringify attempts. Body may be a something fetch accepts directly
      }
    }

    // Options. The Better Auth session cookie is the credential, on every call.
    fetchOptions = {
      method,
      headers: Object.assign(authHeader, headers),
      body,
      credentials: 'include' as RequestCredentials,
    }

    const response = await fetch(url, fetchOptions)

    // Get the response body, preferrably processed as json
    // Note: A failed call can often still have a valid json body, containing info about the error
    try {
      if (response.status !== 204) {
        responseBody = await response.json()
      }
    } catch {
      // Only make an issue out of a status code 200 failing
      if (response.ok && response.status === 200) {
        throw new Error('Failed to process response body')
      }
    }

    if (!response.ok) {
      // Session gone (expired, revoked, signed out elsewhere): go and log in
      // again; the auth app brings the user back to this page.
      if (response.status === 401 && requireAuth && autoredirect && !hasAPIKey()) {
        loginRedirect()
        throw new APITokenError('Session expired')
      }
      throw new APIErrorResponse(response.status, responseBody)
    }

    return responseBody
  } catch (err: unknown) {
    if (err instanceof APIClientError) {
      throw err
    }

    throw new APICallError(err, endpoint, fetchOptions, responseBody)
  }
}

/******************************************************************************
 * Shortcuts
 */
export const get = async function get({
  endpoint,
  body,
  queryString,
  requireAuth,
  autoredirect,
}: {
  endpoint: string
  body?: BodyInit | Record<string, unknown>
  queryString?: URLSearchParams | Record<string, string> | string
  requireAuth?: boolean
  autoredirect?: boolean
}) {
  return await makeCall({ endpoint, method: 'GET', body, queryString, requireAuth, autoredirect })
}

export const post = async function post({
  endpoint,
  body,
  queryString,
  requireAuth,
  autoredirect,
}: {
  endpoint: string
  body?: BodyInit | Record<string, unknown>
  queryString?: URLSearchParams | Record<string, string> | string
  requireAuth?: boolean
  autoredirect?: boolean
}) {
  return await makeCall({ endpoint, method: 'POST', body, queryString, requireAuth, autoredirect })
}

export const put = async function put({
  endpoint,
  body,
  queryString,
  requireAuth,
  autoredirect,
}: {
  endpoint: string
  body?: BodyInit | Record<string, unknown>
  queryString?: URLSearchParams | Record<string, string> | string
  requireAuth?: boolean
  autoredirect?: boolean
}) {
  return await makeCall({ endpoint, method: 'PUT', body, queryString, requireAuth, autoredirect })
}

export const del = async function del({
  endpoint,
  body,
  queryString,
  requireAuth,
  autoredirect,
}: {
  endpoint: string
  body?: BodyInit | Record<string, unknown>
  queryString?: URLSearchParams | Record<string, string> | string
  requireAuth?: boolean
  autoredirect?: boolean
}) {
  return await makeCall({
    endpoint,
    method: 'DELETE',
    body,
    queryString,
    requireAuth,
    autoredirect,
  })
}

/******************************************************************************
 * Internal helper methods
 */

/**
 * Combine the endpoint with the base path while removing the trailing & leading / of the two segments
 */
function combineEndpoint(endpoint: string) {
  const base = (import.meta.env.VITE_FUNDERMAPS_URL || '').replace(/\/+$/, '')
  return new URL(`${base}/api/${endpoint.replace(/^\/+/, '')}`)
}
