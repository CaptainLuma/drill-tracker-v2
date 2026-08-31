import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'
import type { Drill, NewDrill } from '../shared/models/drill.js'
import { Event, NewEvent } from '../shared/models/event.js'
import { Level, NewLevel } from '../shared/models/level.js'
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



export async function createBackup(): Promise<string> {
    const backupRoot = path.join(dataPath, 'backups')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(backupRoot, timestamp)
    const backupPath = path.join(backupDir, 'drill-tracker.db')

    fs.mkdirSync(backupDir, { recursive: true })

    await sqlite.backup(backupPath)

    return backupPath
}

export function getDrills(): Drill[] {
    const eventsMap = new Map(getEvents().map(obj => [obj.id, obj]));
    const levelsMap = new Map(getLevels().map(obj => [obj.id, obj]));

    return db
        .select()
        .from(table.drills)
        .all()
        .map((drill => ({
            id: drill.id,
            name: drill.name,
            description: drill.description,
            dateCreated: new Date(drill.dateCreated),
            dateModified: new Date(drill.dateModified),
            pinned: drill.pinned,
            events: drill.events.map(x => eventsMap.get(x)).filter(x => x != undefined),
            levels: drill.levels.map(x => levelsMap.get(x)).filter(x => x != undefined),
            image: drill.image
        })))
}

export function getDrill(id: number): Drill {
    const eventsMap = new Map(getEvents().map(obj => [obj.id, obj]));
    const levelsMap = new Map(getLevels().map(obj => [obj.id, obj]));

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
        events: drill.events.map(x => eventsMap.get(x)).filter(x => x != undefined),
        levels: drill.levels.map(x => levelsMap.get(x)).filter(x => x != undefined),
        image: drill.image
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
            dateModified: dateCreated,
            pinned: false,
            events: drill.events,
            levels: drill.levels,
            image: drill.image
        })
        .returning({
            id: table.drills.id
        })

    if (result.length == 0)
        throw new Error("no result from table insert")

    return result[0].id
}

export async function addDrills(drills: NewDrill[]): Promise<number[]> {
    if (drills.length == 0)
        throw new Error("cannot add zero drills")

    const dateCreated = new Date().toISOString()

    const result = await db
        .insert(table.drills)
        .values(drills.map(drill => ({
            name: drill.name,
            description: drill.description,
            dateCreated: dateCreated,
            dateModified: dateCreated,
            pinned: false,
            events: drill.events,
            levels: drill.levels,
            image: drill.image
        })))
        .returning({
            id: table.drills.id
        })

    if (result.length == 0)
        throw new Error("no result from table insert")

    return result.map(r => r.id)
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
            events: drill.events.filter(x => x != null).map(x => x.id),
            levels: drill.levels.filter(x => x != null).map(x => x.id),
            image: drill.image
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
    return db
        .select()
        .from(table.events)
        .all()
        .map(event => ({
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
    const drillsUsingTag = getDrills().filter(d => d.events.find(e => e.id == id))

    if (drillsUsingTag.length > 0)
        throw new Error(`Cannot delete this event because (${drillsUsingTag.length}) drills are using it.`)

    const result = await db
        .delete(table.events)
        .where(eq(table.events.id, id))
        .returning({ id: table.events.id })
    
    if (result.length == 0)
        throw new Error("no result from table delete")
    
    return result[0].id
}

export function getLevels(): Level[] {
    return db
        .select()
        .from(table.levels)
        .all()
        .map(level => ({
            id: level.id,
            name: level.name,
            color: level.color,
            dateCreated: new Date(level.dateCreated),
            dateModified: new Date(level.dateModified)
        }))
}

export function getLevel(id: number): Level {
    const level = db
        .select()
        .from(table.levels)
        .where(eq(table.levels.id, id))
        .get()

    if (!level)
        throw new Error(`Level not found with ID: "${id}"`)
    
    return {
        id: level.id,
        name: level.name,
        color: level.color,
        dateCreated: new Date(level.dateCreated),
        dateModified: new Date(level.dateModified)
    }
}

export async function addLevel(level: NewLevel): Promise<number> {
    const dateCreated = new Date().toISOString()

    const result = await db
        .insert(table.levels)
        .values({
            name: level.name,
            color: level.color,
            dateCreated: dateCreated,
            dateModified: dateCreated
        })
        .returning({
            id: table.levels.id
        })

    if (result.length == 0)
        throw new Error("no result from table insert")

    return result[0].id
}

export async function editLevel(level: Level): Promise<number> {
    const dateCreated = new Date().toISOString()

    const result = await db
        .update(table.levels)
        .set({
            name: level.name,
            color: level.color,
            dateCreated: dateCreated,
            dateModified: dateCreated
        })
        .where(eq(table.levels.id, level.id))
        .returning({
            id: table.levels.id
        })

    if (result.length == 0)
        throw new Error("no result from table edit")

    return result[0].id
}

export async function deleteLevel(id: number): Promise<number> {
    const drillsUsingTag = getDrills().filter(d => d.levels.find(l => l.id == id))

    if (drillsUsingTag.length > 0)
        throw new Error(`Cannot delete this level because (${drillsUsingTag.length}) drills are using it.`)

    const result = await db
        .delete(table.levels)
        .where(eq(table.levels.id, id))
        .returning({ id: table.levels.id })
    
    if (result.length == 0)
        throw new Error("no result from table delete")
    
    return result[0].id
}