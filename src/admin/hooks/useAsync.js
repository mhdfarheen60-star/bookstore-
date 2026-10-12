import { useEffect, useRef, useState } from 'react'

/**
 * Runs an async loader and exposes { data, loading, error, reload }.
 *
 * `fn` is kept in a ref so callers can pass an inline arrow without the effect
 * re-firing every render, while `deps` still controls *when* it reloads. The
 * reload is driven straight from the effect rather than a memoised callback,
 * which keeps the hook free of dependency-array gymnastics.
 */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  // Serialise deps so array identity does not re-trigger the effect.
  const depKey = JSON.stringify(deps)

  // Bumped by the effect to request a fresh load; also incremented by reload().
  const [nonce, setNonce] = useState(0)

  const reload = () => setNonce((n) => n + 1)

  const run = async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fnRef.current())
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Data fetch on mount and whenever deps/nonce change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run()
  }, [depKey, nonce])

  return { data, loading, error, reload, setData }
}

export default useAsync
