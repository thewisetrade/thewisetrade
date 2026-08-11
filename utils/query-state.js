export const queriesEqual = (a, b) => {
  const left = a || {}
  const right = b || {}
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  for (const key of keys) {
    if (String(left[key] ?? '') !== String(right[key] ?? '')) {
      return false
    }
  }
  return true
}

export const replaceQuery = (router, route, patch) => {
  const next = { ...route.query }

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === '') {
      delete next[key]
    } else {
      next[key] = String(value)
    }
  }

  if (queriesEqual(next, route.query)) return
  router.replace({ query: next })
}

export const pickAllowed = (value, allowed, fallback) => {
  return allowed.includes(value) ? value : fallback
}
