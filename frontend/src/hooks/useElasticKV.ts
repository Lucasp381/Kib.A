// hooks/useElasticKV.ts
import { useCallback } from "react"

type ElasticKVResponse<T> =

  | { ok: true; value?: T }
  | { ok: false; error: string }

export function useElasticKV<T = string>() {
  const baseUrl = "/api/backend/elastic/variables"

  const set = useCallback(async (key: string, value: string): Promise<ElasticKVResponse<T>> => {
    if (!key) return { ok: false, error: "Key is required" }
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || "Unknown error" }
      return { ok: true }
    } catch (error) {
      const e = error as Error
      return { ok: false, error: e.message }
    }
  }, [])

  const get = useCallback(async (key: string): Promise<ElasticKVResponse<T>> => {
    if (!key) return { ok: false, error: "Key is required" }
    try {
      const url = new URL(`${baseUrl}/${key}`, location.origin)

      const res = await fetch(url.toString())
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || "Unknown error" }
      if (data.length > 0) return { ok: true, value: data[0]._source?.data }
      return { ok: false, error: "Not found" }
    } catch (error) {
      const e = error as Error
      return { ok: false, error: e.message }
    }
  }, [])

  const del = useCallback(async (key: string): Promise<ElasticKVResponse<unknown>> => {
    if (!key) return { ok: false, error: "Key is required" }
    try {
      const url = new URL(`${baseUrl}/${key}`, location.origin)


      const res = await fetch(url.toString(), { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || "Unknown error" }
      return { ok: true }
    } catch (error) {
      const e = error as Error
      return { ok: false, error: e.message }
    }
  }, [])

  return { set, get, del }
}
