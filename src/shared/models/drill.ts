export interface Drill {
    id: number
    name: string
    description: string
    dateCreated: Date
    dateModified: Date
    pinned: boolean
}

export interface NewDrill {
    name: string
    description: string
}