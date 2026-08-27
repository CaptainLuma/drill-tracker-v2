// import type { Event } from "./event"

export interface Drill {
    id: number
    name: string
    description: string
    dateCreated: Date
    dateModified: Date
    pinned: boolean
    // events: Event[]
}

export interface NewDrill {
    name: string
    description: string
    // events: number[]
}