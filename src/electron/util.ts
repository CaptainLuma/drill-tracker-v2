import { ipcMain, WebContents } from "electron"

export function isDev(): boolean {
    return process.env.NODE_ENV === "developement"
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: (...args: any) => EventPayloadMapping[Key]
) {
    ipcMain.handle(key, (...args) => handler(...args))
}

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    webContents: WebContents,
    payload: EventPayloadMapping[Key]
) {
    webContents.send(key, payload)
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    handler: (...args: any) => EventPayloadMapping[Key]
) {
    ipcMain.on(key, (...args) => handler(...args))
}

export function getErrorMessage(error: unknown): string {
    console.log(error)

    if (!(error instanceof Error)) {
        return String(error)
    }

    const errorMessage = error.message.toLowerCase()

    // return errorMessage

    if (errorMessage.includes("does not exist"))
        return "The drill could not be found."

    if (
        errorMessage.includes("unique constraint failed") ||
        errorMessage.includes("sqlite_constraint_unique")
    )
        return "A drill with this name already exists."

    if (
        errorMessage.includes("not null constraint failed") ||
        errorMessage.includes("sqlite_constraint_notnull")
    )
        return "A drill name and description are required."

    if (
        errorMessage.includes("database is locked") ||
        errorMessage.includes("database is busy")
    )
        return "The database is busy. Please try again."

    if (errorMessage.includes("readonly"))
        return "The database cannot be modified right now."

    if (errorMessage.includes("database or disk is full"))
        return "There is not enough storage space to complete this action."

    if (
        errorMessage.includes("database disk image is malformed") ||
        errorMessage.includes("malformed database")
    )
        return "The drill database appears to be damaged."

    if (errorMessage.includes("constraint failed"))
        return "The drill could not be saved because some information is invalid."

    if (errorMessage.includes("no such table") || errorMessage.includes("no such column"))
        return "The drill database is not set up correctly."

    if (errorMessage.includes("i/o error") || errorMessage.includes("disk i/o error"))
        return "The database could not be accessed."

    return errorMessage
}