import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'
import type { Drill, NewDrill } from '../shared/models/drill.js'
import { Event, NewEvent } from '../shared/models/event.js'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as table from './drizzle/schema.js'
import { eq } from 'drizzle-orm'
import { initializeDatabase } from './db-init.js'


// type SqliteDatabase = InstanceType<typeof Database>

const dataPath = path.join(app.getPath('userData'), 'data') // uncomment for production ready version
// const dataPath = path.join(process.cwd(), 'data')
fs.mkdirSync(dataPath, { recursive: true }) // ensure that data folder exists
const dbPath = path.join(dataPath, 'drill-tracker.db')

const sqlite = new Database(dbPath)

initializeDatabase(sqlite)

const db = drizzle({ client: sqlite })

export function getDrills(): Drill[] {
    const result = db
        .select()
        .from(table.drills)
        .all()

    return result.map((drill => ({
        id: drill.id,
        name: drill.name,
        description: drill.description,
        dateCreated: new Date(drill.dateCreated),
        dateModified: new Date(drill.dateModified),
        pinned: drill.pinned,
    })))
}

export function getDrill(id: number): Drill {
    const drill = db
        .select()
        .from(table.drills)
        .where(eq(table.drills.id, id))
        .get()
    
    if (!drill)
        throw new Error(`Drill not found with id: ${id}`)

    return {
        id: drill.id,
        name: drill.name,
        description: drill.description,
        dateCreated: new Date(drill.dateCreated),
        dateModified: new Date(drill.dateModified),
        pinned: drill.pinned,
    }
}

export async function addDrill(drill: NewDrill): Promise<number> {
    const dateCreated = new Date().toISOString()

    const result = await db
        .insert(table.drills)
        .values({
            name: drill.name,
            description: drill.description,
            dateCreated: dateCreated,
            dateModified: dateCreated
        })
        .returning({
            id: table.drills.id
        })

    if (result.length == 0)
        throw new Error("no result from table insert")

    return result[0].id
}

export async function editDrill(drill: Drill): Promise<number> {
    const dateModified = new Date().toISOString()

    const result = await db
        .update(table.drills)
        .set({
            name: drill.name,
            description: drill.description,
            dateModified: dateModified,
            pinned: drill.pinned,
        })
        .where(eq(table.drills.id, drill.id))
        .returning({
            id: table.drills.id
        })
    
    if (result.length == 0)
        throw new Error("no result from table edit")
    
    return result[0].id
}

export async function deleteDrill(id: number): Promise<number> {
    const result = await db
        .delete(table.drills)
        .where(eq(table.drills.id, id))
        .returning({ id: table.drills.id })
    
    if (result.length == 0)
        throw new Error("no result from table delete")
    
    return result[0].id
}

export function getEvents(): Event[] {
    const result = db
        .select()
        .from(table.events)
        .all()
    
    return result.map(event => ({
        id: event.id,
        name: event.name,
        color: event.color,
        dateCreated: new Date(event.dateCreated),
        dateModified: new Date(event.dateModified)
    }))
}

export function getEvent(id: number): Event {
    const event = db
        .select()
        .from(table.events)
        .where(eq(table.events.id, id))
        .get()

    if (!event)
        throw new Error(`Event not found with ID: "${id}"`)
    
    return {
        id: event.id,
        name: event.name,
        color: event.color,
        dateCreated: new Date(event.dateCreated),
        dateModified: new Date(event.dateModified)
    }
}

export async function addEvent(event: NewEvent): Promise<number> {
    const dateCreated = new Date().toISOString()

    const result = await db
        .insert(table.events)
        .values({
            name: event.name,
            color: event.color,
            dateCreated: dateCreated,
            dateModified: dateCreated
        })
        .returning({
            id: table.events.id
        })

    if (result.length == 0)
        throw new Error("no result from table insert")

    return result[0].id
}

export async function editEvent(event: Event): Promise<number> {
    const dateCreated = new Date().toISOString()

    const result = await db
        .update(table.events)
        .set({
            name: event.name,
            color: event.color,
            dateCreated: dateCreated,
            dateModified: dateCreated
        })
        .where(eq(table.events.id, event.id))
        .returning({
            id: table.events.id
        })

    if (result.length == 0)
        throw new Error("no result from table edit")

    return result[0].id
}

export async function deleteEvent(id: number): Promise<number> {
    const result = await db
        .delete(table.events)
        .where(eq(table.events.id, id))
        .returning({ id: table.events.id })
    
    if (result.length == 0)
        throw new Error("no result from table delete")
    
    return result[0].id
}