import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'
import type { Drill, NewDrill } from '../shared/models/drill.js'

type DrillRow = {
    id: number
    name: string
    description: string
    date_created: string
    date_modified: string
}



const dataPath = path.join(app.getPath('userData'), 'data') // uncomment for production ready version
// const dataPath = path.join(process.cwd(), 'data')
fs.mkdirSync(dataPath, { recursive: true }) // ensure that data folder exists
const dbPath = path.join(dataPath, 'drill-tracker.db')

const db = new Database(dbPath)

// Create tables if they don't already exist
db.exec(`
    CREATE TABLE IF NOT EXISTS drills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        date_created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        date_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`)

export function getDrills(): Drill[] {
    const drills = db
        .prepare(`
            SELECT 
                id, 
                name, 
                description, 
                date_created, 
                date_modified
            FROM drills
            ORDER BY date_created DESC
        `)
        .all() as DrillRow[]

    return drills.map((drill => ({
        id: drill.id,
        name: drill.name,
        description: drill.description,
        dateCreated: new Date(drill.date_created),
        dateModified: new Date(drill.date_modified)
    })))
}

export function getDrill(id: number): Drill {
    const result = db.prepare(`
        SELECT 
            id, 
            name, 
            description, 
            date_created,
            date_modified
        FROM drills
        WHERE id = ?
        LIMIT 1
    `)
    .get(id) as DrillRow | null

    if (!result) {
        throw new Error(`Drill with ID "${id}" does not exist`)
    }

    return {
        id: result.id,
        name: result.name,
        description: result.description,
        dateCreated: new Date(result.date_created),
        dateModified: new Date(result.date_modified)
    }
}

export function addDrill(drill: NewDrill): number {
    const dateCreated = new Date().toISOString()

    const result = db.prepare(`
        INSERT INTO drills (
            name, 
            description, 
            date_created,
            date_modified
        )
        VALUES (?, ?, ?, ?)
    `).run(
        drill.name, 
        drill.description,
        dateCreated,
        dateCreated
    )

    return result.lastInsertRowid as number
}

export function editDrill(drill: Drill): number {
    const dateModified = new Date().toISOString()

    db.prepare(`
        UPDATE drills
        SET 
            name = ?, 
            description = ?
            date_modified = ?
        WHERE 
            id = ?
    `).run(
        drill.name,
        drill.description,
        dateModified,

        drill.id,
    )

    return drill.id
}

export function deleteDrill(id: number): number {
    db.prepare(`
        DELETE FROM drills
        WHERE id = ?
    `).run(id)

    return id
}