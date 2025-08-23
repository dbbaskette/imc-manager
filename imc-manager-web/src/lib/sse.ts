import { useEffect, useRef, useState } from 'react'

export type EventDto = {
  app?: string
  stage?: string
  event?: 'INIT' | 'HEARTBEAT' | 'FILE_PROCESSED'
  instanceId?: string
  docId?: string
  timestamp: number
  latencyMs?: number
  status?: string
  message?: string
  url?: string
  uptime?: string
  hostname?: string
  publicHostname?: string
  currentFile?: string | null
  filesProcessed?: number
  filesTotal?: number
  totalChunks?: number
  processedChunks?: number
  processingRate?: number
  errorCount?: number
  memoryUsedMB?: number
  pendingMessages?: number | null
  filename?: string | null
}

let sharedES: EventSource | null = null
let sharedListeners: Array<(e: EventDto) => void> = []
let sharedDebug: EventDto[] = []
let sharedConnected = false
let sharedError: string | null = null
let started = false
let lastMessageAt = 0
let reconnectDelayMs = 1000
let missedChecks = 0

function startEventSource(url: string, withCredentials: boolean) {
  if (sharedES) sharedES.close()
  const es = new EventSource(url, { withCredentials })
  sharedES = es
  es.onopen = () => {
    sharedConnected = true
    sharedError = null
    reconnectDelayMs = 1000
  }
  es.onerror = () => {
    sharedConnected = false
    sharedError = 'disconnected'
    try { es.close() } catch {}
    sharedES = null
    setTimeout(() => {
      if (!started) return
      startEventSource(url, withCredentials)
    }, reconnectDelayMs)
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, 15000)
  }
  es.addEventListener('heartbeat', () => {
    lastMessageAt = Date.now()
    missedChecks = 0
  })
  es.onmessage = (msg) => {
    try {
      lastMessageAt = Date.now()
      missedChecks = 0
      const data = JSON.parse(msg.data) as EventDto
      sharedDebug.push(data)
      if (sharedDebug.length > 200) sharedDebug.shift()
      for (const cb of sharedListeners) cb(data)
    } catch {
      // ignore
    }
  }
}

function ensureEventSource(url: string, withCredentials: boolean) {
  if (!started) {
    started = true
    startEventSource(url, withCredentials)
    setInterval(() => {
      // allow 2 missed 5s heartbeats (approx 12s) plus buffer → 20s
      if (Date.now() - lastMessageAt > 20000) {
        missedChecks++
      } else {
        missedChecks = 0
      }
      if (missedChecks >= 2) {
        sharedConnected = false
        sharedError = 'timeout'
      }
    }, 5000)
  }
}

export function useSharedSSE(url: string, options?: { withCredentials?: boolean; onEvent?: (e: EventDto) => void }) {
  const [connected, setConnected] = useState(sharedConnected)
  const [error, setError] = useState<string | null>(sharedError)
  const [debug, setDebug] = useState<EventDto[]>(sharedDebug)
  const listenerRef = useRef<(e: EventDto) => void>(() => {})

  useEffect(() => {
    if (options?.onEvent) listenerRef.current = options.onEvent
  }, [options?.onEvent])

  useEffect(() => {
    ensureEventSource(url, options?.withCredentials ?? false)
    const cb = (e: EventDto) => listenerRef.current && listenerRef.current(e)
    sharedListeners.push(cb)
    const id = setInterval(() => {
      setConnected(sharedConnected)
      setError(sharedError)
      setDebug(sharedDebug.slice(-50))
    }, 1000)
    return () => {
      sharedListeners = sharedListeners.filter(x => x !== cb)
      clearInterval(id)
    }
  }, [url, options?.withCredentials])

  return { connected, error, debug }
}
