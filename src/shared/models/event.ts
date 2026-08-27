export interface Event {
    id: number
    name: string
    color: string
    dateCreated: Date
    dateModified: Date
}

export interface NewEvent {
    name: string
    color: string
}