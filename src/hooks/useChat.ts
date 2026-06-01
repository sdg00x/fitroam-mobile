import { useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserContext } from '../context/UserProvider'

const API_BASE = 'http://192.168.0.64:3000'
const ACTIVE_THREAD_KEY = 'fitroam:activeThreadId'

export interface ChatGym {
  id: string
  name: string
  address: string
  dayPassPence: number | null
  dayPassUrl: string | null
  equipmentTags: string[]
  photoUrls: string[]
  verified: boolean
  rating: number | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  gyms: ChatGym[]
  createdAt: string
  failed?: boolean
}

export interface ChatThread {
  id: string
  title: string | null
  createdAt: string
  lastMessageAt: string
}

export function useChat() {
  const { user } = useUserContext()
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true) // initial restore
  const [sending, setSending] = useState(false)
  const restoredRef = useRef(false)

  // ---------- Restore active thread on mount ----------
  useEffect(() => {
    if (!user?.id || restoredRef.current) return
    restoredRef.current = true
    ;(async () => {
      setLoading(true)
      try {
        // 1. Try locally cached active thread
        const cachedId = await AsyncStorage.getItem(ACTIVE_THREAD_KEY)
        if (cachedId) {
          const ok = await loadThread(cachedId)
          if (ok) return
        }
        // 2. Otherwise, load latest thread from server
        const res = await fetch(`${API_BASE}/api/concierge/threads`, {
          headers: { 'x-user-id': user.id },
        })
        if (!res.ok) throw new Error('thread list failed')
        const data = await res.json()
        const list: ChatThread[] = data.threads || []
        setThreads(list)
        if (list.length > 0) {
          await loadThread(list[0].id)
        }
      } catch (err) {
        console.warn('[useChat] restore failed', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  // ---------- Refresh threads list (for history sheet) ----------
  const refreshThreads = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`${API_BASE}/api/concierge/threads`, {
        headers: { 'x-user-id': user.id },
      })
      if (!res.ok) throw new Error('thread list failed')
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (err) {
      console.warn('[useChat] refreshThreads failed', err)
    }
  }, [user?.id])

  // ---------- Load a specific thread's messages ----------
  const loadThread = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user?.id) return false
      try {
        const res = await fetch(`${API_BASE}/api/concierge/threads/${id}/messages`, {
          headers: { 'x-user-id': user.id },
        })
        if (!res.ok) return false
        const data = await res.json()
        setThreadId(id)
        setMessages(data.messages || [])
        await AsyncStorage.setItem(ACTIVE_THREAD_KEY, id)
        return true
      } catch (err) {
        console.warn('[useChat] loadThread failed', err)
        return false
      }
    },
    [user?.id],
  )

  // ---------- Create a new thread (clears current view) ----------
  const newThread = useCallback(async () => {
    if (!user?.id) return null
    try {
      const res = await fetch(`${API_BASE}/api/concierge/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      })
      if (!res.ok) throw new Error('thread create failed')
      const data = await res.json()
      const id = data.thread?.id
      if (!id) throw new Error('no thread id')
      setThreadId(id)
      setMessages([])
      await AsyncStorage.setItem(ACTIVE_THREAD_KEY, id)
      refreshThreads()
      return id
    } catch (err) {
      console.warn('[useChat] newThread failed', err)
      return null
    }
  }, [user?.id, refreshThreads])

  // ---------- Send a message ----------
  const send = useCallback(
    async (content: string): Promise<void> => {
      if (!user?.id || !content.trim()) return

      // Ensure we have a thread
      let activeId = threadId
      if (!activeId) {
        activeId = await newThread()
        if (!activeId) return
      }

      // Optimistic user message
      const tempId = `temp-${Date.now()}`
      const optimistic: ChatMessage = {
        id: tempId,
        role: 'user',
        content: content.trim(),
        gyms: [],
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])
      setSending(true)

      try {
        const res = await fetch(`${API_BASE}/api/concierge/threads/${activeId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
          body: JSON.stringify({ content: content.trim() }),
        })
        if (!res.ok) throw new Error(`server ${res.status}`)
        const data = await res.json()

        // Replace optimistic with real, append assistant
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempId)
          return [...withoutTemp, data.userMessage, data.assistantMessage]
        })
        refreshThreads()
      } catch (err) {
        console.warn('[useChat] send failed', err)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, failed: true } : m,
          ),
        )
      } finally {
        setSending(false)
      }
    },
    [user?.id, threadId, newThread, refreshThreads],
  )

  // ---------- Retry a failed send ----------
  const retrySend = useCallback(
    async (messageId: string): Promise<void> => {
      const failed = messages.find((m) => m.id === messageId && m.failed)
      if (!failed) return
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      await send(failed.content)
    },
    [messages, send],
  )

  return {
    threadId,
    messages,
    threads,
    loading,
    sending,
    send,
    retrySend,
    newThread,
    loadThread,
    refreshThreads,
  }
}
