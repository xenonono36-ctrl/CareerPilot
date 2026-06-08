'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { setApiTokenGetter } from '@/lib/api'

/**
 * Mounts inside ClerkProvider to register the live session-token getter
 * with the axios apiClient. Render once in the root layout.
 */
export default function ApiClientBootstrap() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    setApiTokenGetter(async () => {
      if (!isSignedIn) return null
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken, isSignedIn])

  return null
}
