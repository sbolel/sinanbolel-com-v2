export type ChatLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ChatLoadState {
  status: ChatLoadStatus
  error: string | null
}

export interface ChatLoadResult extends ChatLoadState {
  retry: () => void
}
