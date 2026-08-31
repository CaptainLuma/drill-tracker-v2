import type { Event } from "./event.js"
import type { Level } from "./level.js"

export interface Drill {
    id: number
    name: string
    description: string
    dateCreated: Date
    dateModified: Date
    pinned: boolean
    events: Event[]
    levels: Level[]
    image: string | null
}

export interface NewDrill {
    name: string
    description: string
    events: number[]
    levels: number[]
    image: string | null
}