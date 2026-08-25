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
    pinned: number
}

const dataPath = path.join(app.getPath('userData'), 'data') // uncomment for production ready version
// const dataPath = path.join(process.cwd(), 'data')
fs.mkdirSync(dataPath, { recursive: true }) // ensure that data folder exists
const dbPath = path.join(dataPath, 'drill-tracker.db')

const db = new Database(dbPath)


function initializeDatabase() {
    // creates database table if it doesn't already exit
    // adds missing columns if db is outdated

    db.exec(`
        CREATE TABLE IF NOT EXISTS drills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            date_created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            date_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            pinned BOOL NOT NULL DEFAULT 0
        )
    `)

    function addMissingColumn(
        tableName: string,
        columnName: string,
        definition: string
    ) {
        const columns = db
            .prepare(`PRAGMA table_info(${tableName})`)
            .all() as { name: string }[]

        if (!columns.some(column => column.name === columnName)) {
            db.exec(`
                ALTER TABLE ${tableName}
                ADD COLUMN ${columnName} ${definition}
            `)
        }
    }

    addMissingColumn(
        'drills',
        'pinned',
        'BOOL NOT NULL DEFAULT 0'
    )
}

initializeDatabase()

export function getDrills(): Drill[] {
    const drills = db
        .prepare(`
            SELECT 
                id, 
                name, 
                description, 
                date_created, 
                date_modified,
                pinned
            FROM drills
            ORDER BY pinned DESC, date_created DESC
        `)
        .all() as DrillRow[]

    return drills.map((drill => ({
        id: drill.id,
        name: drill.name,
        description: drill.description,
        dateCreated: new Date(drill.date_created),
        dateModified: new Date(drill.date_modified),
        pinned: drill.pinned != 0
    })))
}

export function getDrill(id: number): Drill {
    const drill = db.prepare(`
        SELECT 
            id, 
            name, 
            description, 
            date_created,
            date_modified,
            pinned
        FROM drills
        WHERE id = ?
        LIMIT 1
    `)
    .get(id) as DrillRow | null

    if (!drill) {
        throw new Error(`Drill with ID "${id}" does not exist`)
    }

    return {
        id: drill.id,
        name: drill.name,
        description: drill.description,
        dateCreated: new Date(drill.date_created),
        dateModified: new Date(drill.date_modified),
        pinned: drill.pinned != 0
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

    // convert to drillRow first to ensure correct types
    const drillRow: DrillRow = {
        id: drill.id,
        name: drill.name,
        description: drill.description,
        date_created: drill.dateCreated.toISOString(),
        date_modified: dateModified,
        pinned: drill.pinned ? 1 : 0,
    }

    db.prepare(`
        UPDATE drills
        SET 
            name = ?, 
            description = ?,
            date_modified = ?,
            pinned = ?
        WHERE 
            id = ?
    `).run(
        drillRow.name,
        drillRow.description,
        drillRow.date_modified,
        drillRow.pinned,

        drillRow.id,
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