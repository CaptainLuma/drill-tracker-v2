import Database from 'better-sqlite3'
type SqliteDatabase = InstanceType<typeof Database>

export function initializeDatabase(sqlite: SqliteDatabase) {
    initializeDrillTable(sqlite)
    initializeEventTable(sqlite)
}

function addMissingColumn(
    sqlite: SqliteDatabase,
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

function initializeDrillTable(sqlite: SqliteDatabase) {
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
        sqlite,
        'drills',
        'pinned',
        'BOOL NOT NULL DEFAULT 0'
    )
}

function initializeEventTable(sqlite: SqliteDatabase) {
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id integer PRIMARY KEY AUTOINCREMENT,
            name text NOT NULL UNIQUE,
            color text NOT NULL,
            date_created text DEFAULT CURRENT_TIMESTAMP NOT NULL,
            date_modified text DEFAULT CURRENT_TIMESTAMP NOT NULL,
            CONSTRAINT "events_color_hex_check" CHECK(length("color") = 7 AND "color" GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')
        )
    `)
}