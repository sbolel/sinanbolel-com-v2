import { Timestamp } from 'firebase/firestore'

export interface Message {
  body: string
  createdAt: Timestamp
  from: string
}

export interface Chat {
  id: string
  userId: string
  createdAt: Timestamp
}
