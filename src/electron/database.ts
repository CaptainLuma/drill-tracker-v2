import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'
import type { Drill, NewDrill } from '../shared/models/drill.js'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as table from './drizzle/schema.js'
import { eq } from 'drizzle-orm'

type DrillRow = {
    id: number
    name: string
    description: string
    date_created: string
    date_modified: string
    pinned: number
}

type EventRow = {
    id: number
    name: string
    date_created: string
    date_modified: string
}

const dataPath = path.join(app.getPath('userData'), 'data') // uncomment for production ready version
// const dataPath = path.join(process.cwd(), 'data')
fs.mkdirSync(dataPath, { recursive: true }) // ensure that data folder exists
const dbPath = path.join(dataPath, 'drill-tracker.db')

const sqlite = new Database(dbPath)

initializeDatabase()

const db = drizzle({ client: sqlite })

function initializeDatabase() {
    initializeDrillTable()
    // initializeEventTable()
}

function addMissingColumn(
    tableName: string,
    columnName: string,
    definition: string
) {
    const identifierPattern = /^[A-Za-z_][A-Za-z0-9_]*$/
    const definitionPattern = /^[A-Za-z0-9_ ]+$/

    if (!identifierPattern.test(tableName) || !identifierPattern.test(columnName)) {
        throw new Error('Invalid table or column name')
    }

    if (!definitionPattern.test(definition)) {
        throw new Error('Invalid column definition')
    }

    const columns = sqlite
        .prepare(`PRAGMA table_info("${tableName}")`)
        .all() as { name: string }[]

    if (!columns.some(column => column.name === columnName)) {
        sqlite.exec(`
            ALTER TABLE "${tableName}"
            ADD COLUMN "${columnName}" ${definition}
        `)
    }
}

function initializeDrillTable() {
    // creates database table if it doesn't already exit
    // adds missing columns if db is outdated
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS drills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            date_created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            date_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            pinned BOOL NOT NULL DEFAULT 0
        )
    `)

    addMissingColumn(
        'drills',
        'pinned',
        'BOOL NOT NULL DEFAULT 0'
    )
}

// function initializeEventTable() {
//     // creates database table if it doesn't already exit
//     // adds missing columns if db is outdated
//     db.exec(`
//         CREATE TABLE IF NOT EXISTS events (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name TEXT NOT NULL UNIQUE,
//             color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
//             date_created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//             date_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         )
//     `)

//     addMissingColumn(
//         'events',
//         'date_modified',
//         'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
//     )
// }

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
        throw new Error(`No drill with id: ${id}`)

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
        throw new Error("no result from table edit")
    
    return result[0].id
}