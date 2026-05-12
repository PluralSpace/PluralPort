const SP_BASE = '/sp-proxy'

export interface SpMember {
  id: string
  content: {
    name?: string
    displayName?: string
    pronouns?: string
    description?: string
    birthday?: string
    color?: string
    avatarUrl?: string
    avatarUuid?: string
    preventsFronting?: boolean
    supportDescriptionColor?: string
    archived?: boolean
    created?: number
    info?: Record<string, unknown>
    [k: string]: unknown
  }
}

export interface SpFrontEntry {
  id: string
  content: {
    member: string
    custom?: boolean
    startTime: number
    endTime?: number | null
    live?: boolean
    comment?: string
    [k: string]: unknown
  }
}

export interface SpGroup {
  id: string
  content: {
    name?: string
    desc?: string
    color?: string
    emoji?: string
    parent?: string
    members?: string[]
    [k: string]: unknown
  }
}

export interface SpNote {
  id: string
  content: {
    title?: string
    note?: string
    date?: number
    member?: string
    color?: string
    [k: string]: unknown
  }
}

export interface SpCustomFront {
  id: string
  content: {
    name?: string
    desc?: string
    color?: string
    avatarUrl?: string
    avatarUuid?: string
    [k: string]: unknown
  }
}

export interface SpPoll {
  id: string
  content: {
    question?: string
    options?: { name: string; votes?: string[] }[]
    created?: number
    closed?: boolean
    [k: string]: unknown
  }
}

export interface SpUser {
  id: string
  username?: string
  fields?: Record<string, { name: string; order: number; private?: boolean; preventTrusted?: boolean; type?: string }>
  [k: string]: unknown
}

export async function spFetch<T = unknown>(path: string, token: string): Promise<T> {
  const res = await fetch(`${SP_BASE}${path}`, {
    headers: { 'x-sp-token': token }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`SP API ${path}: ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export async function verifyToken(token: string): Promise<{ userId: string; systemName: string; user: SpUser }> {
  const data = await spFetch<SpUser>('/me', token)
  return {
    userId: data.id,
    systemName: data.username || data.id,
    user: data,
  }
}

export function countAll(
  token: string,
  userId: string,
  onCount: (key: string, value: number | 'error') => void
): void {
  const simple: { key: string; path: string }[] = [
    { key: 'custom_fronts', path: `/customFronts/${userId}` },
    { key: 'groups',        path: `/groups/${userId}` },
    { key: 'fronting',      path: '/frontHistory' },
    { key: 'polls',         path: `/polls/${userId}` },
  ]
  for (const e of simple) {
    spFetch(e.path, token)
      .then(d => onCount(e.key, Array.isArray(d) ? d.length : 0))
      .catch(() => onCount(e.key, 'error'))
  }

  spFetch<SpMember[]>(`/members/${userId}`, token)
    .then(async (members) => {
      onCount('members', members.length)
      try {
        const results = await Promise.all(
          members.map(m =>
            spFetch<SpNote[]>(`/notes/${userId}/${m.id}`, token)
              .then(d => Array.isArray(d) ? d.length : 0)
              .catch(() => 0)
          )
        )
        onCount('notes', results.reduce((a, b) => a + b, 0))
      } catch {
        onCount('notes', 'error')
      }
    })
    .catch(() => {
      onCount('members', 'error')
      onCount('notes', 'error')
    })
}
