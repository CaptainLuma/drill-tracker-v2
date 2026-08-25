export interface Drill {
    id: number
    name: string
    description: string
    dateCreated: Date
    dateModified: Date
}

export interface NewDrill {
    name: string
    description: string
}