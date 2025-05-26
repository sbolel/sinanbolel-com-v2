/**
 * @module hooks/useFetch
 */
import { useEffect, useState } from 'react'

/**
 * Custom hook to fetch data from an API.
 * @param {string} url - URL to fetch
 * @returns {object} - An object containing the data, error, and loading state
 */
const useFetch = (
  url: string
): {
  loading: boolean
  error: Error | null
  data: unknown
} => {
  const [data, setData] = useState(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    ;(async function () {
      try {
        setLoading(true)
        const response = await fetch(url, { signal: controller.signal })
        const data = await response.json()
        if (!controller.signal.aborted) {
          setData(data)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error as Error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    })()
    return () => controller.abort()
  }, [url])

  return { data, error, loading }
}

export default useFetch
