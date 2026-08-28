import Database from 'better-sqlite3'
type SqliteDatabase = InstanceType<typeof Database>

function addMissingColumn(
    sqlite: SqliteDatabase,
    tableName: string,
    columnName: string,
    definition: string
) {
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

export function initializeDatabase(sqlite: SqliteDatabase) {
    initializeDrillTable(sqlite)
    initializeEventTable(sqlite)
    initializeLevelTable(sqlite)
}

function initializeDrillTable(sqlite: SqliteDatabase) {
    // creates database table if it doesn't already exit
    // adds missing columns if db is outdated
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS drills (
            id integer PRIMARY KEY AUTOINCREMENT,
            name text NOT NULL UNIQUE,
            description text NOT NULL,
            date_created text DEFAULT CURRENT_TIMESTAMP NOT NULL,
            date_modified text DEFAULT CURRENT_TIMESTAMP NOT NULL,
            pinned integer DEFAULT false NOT NULL,
            events text DEFAULT '[]' NOT NULL,
            levels text DEFAULT '[]' NOT NULL
        );
    `)

    addMissingColumn(
        sqlite,
        "drills",
        "pinned",
        "BOOL NOT NULL DEFAULT 0"
    )

    addMissingColumn(
        sqlite,
        "drills",
        "events",
        "text DEFAULT '[]' NOT NULL"
    )

    addMissingColumn(
        sqlite,
        "drills",
        "levels",
        "text DEFAULT '[]' NOT NULL"
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

function initializeLevelTable(sqlite: SqliteDatabase) {
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS levels (
            id integer PRIMARY KEY AUTOINCREMENT,
            name text NOT NULL UNIQUE,
            color text NOT NULL,
            date_created text DEFAULT CURRENT_TIMESTAMP NOT NULL,
            date_modified text DEFAULT CURRENT_TIMESTAMP NOT NULL,
            CONSTRAINT "levels_color_hex_check" CHECK(length("color") = 7 AND "color" GLOB '#[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]')
        );  
    `)
}