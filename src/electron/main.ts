import fs from 'node:fs/promises'
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { isDev, ipcMainHandle, getErrorMessage } from './util.js'
import { spawn } from 'node:child_process'
import * as database from './database.js'
import { Drill, NewDrill } from '../shared/models/drill.js'
import { Event, NewEvent } from '../shared/models/event.js'
import { Level, NewLevel } from '../shared/models/level.js'

// const isDev = !app.isPackaged;
const isMac = process.platform === 'darwin'

let mainWindow: BrowserWindow

const dataPath = path.join(app.getPath('userData'), 'data')
console.log(`Datapath: ${dataPath}`)

function getPreloadPath() {
    return path.join(
        app.getAppPath(),
        'dist-electron',
        'electron',
        'preload.cjs'
    )
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Drill Tracker',
        fullscreen: true,
        width: 800,
        height: 600,
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    // open devtools if in dev environment
    if (isDev()) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.maximize()

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5173')
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"))
    }
}

app.whenReady().then(() => {
    createMainWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length == 0)
            createMainWindow()
    })

    mainWindow.on("close", (event) => {
        if (!isMac)
            app.quit()
    })
})



async function exportDrillsAsMarkdown(drills: Drill[]) {
    const exportsDir = path.join(dataPath, "exports");

    // Create exports directory if it doesn't exist
    await fs.mkdir(exportsDir, { recursive: true });

    // Generate filename from current date/time
    const now = new Date();
    const timestamp = now
        .toISOString()
        .replace(/T/, "_")
        .replace(/:/g, "-")
        .replace(/\..+/, "");

    const filePath = path.join(exportsDir, `${timestamp}.md`);

    // Generate Markdown
    const markdown = drills
        .map((drill) => {
            const name = `- ${drill.name}:`
            const description = drill.description?.trim()
            ? `\n  - ${drill.description.trim()}`
            : ''

            return `${name}${description}`
        })
        .join('\n\n')

    // Write file
    await fs.writeFile(filePath, markdown, "utf8");

    // Open the directory in the OS file explorer
    // await shell.openPath(exportsDir);

    // open the file
    spawn("notepad.exe", [filePath], {
        detached: true,
        stdio: "ignore"
    }).unref();

    return filePath;
}

ipcMainHandle("exportDrills", async (_, drills: Drill[]) => {
    const result = await exportDrillsAsMarkdown(drills)

    try {
        return {success: true, data: result}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("createBackup", async () => {
    try {
        return {success: true, data: await database.createBackup()}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getDrills", () => {
    try {
        return {success: true, data: database.getDrills()}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getDrill", (_, id: number) => {
    try {
        return {success: true, data: database.getDrill(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("addDrill", async (_, drill: NewDrill) => {
    try {
        return {success: true, data: await database.addDrill(drill)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("editDrill", async (_, drill: Drill) => {
    try {
        return {success: true, data: await database.editDrill(drill)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("deleteDrill", async (_, id: number) => {
    try {
        return {success: true, data: await database.deleteDrill(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getEvents", () => {
    try {
        return {success: true, data: database.getEvents()}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getEvent", (_, id: number) => {
    try {
        return {success: true, data: database.getEvent(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("addEvent", async (_, event: NewEvent) => {
    try {
        return {success: true, data: await database.addEvent(event)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("editEvent", async (_, event: Event) => {
    try {
        return {success: true, data: await database.editEvent(event)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("deleteEvent", async (_, id: number) => {
    try {
        return {success: true, data: await database.deleteEvent(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getLevels", () => {
    try {
        return {success: true, data: database.getLevels()}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getLevel", (_, id: number) => {
    try {
        return {success: true, data: database.getLevel(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("addLevel", async (_, level: NewLevel) => {
    try {
        return {success: true, data: await database.addLevel(level)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("editLevel", async (_, level: Level) => {
    try {
        return {success: true, data: await database.editLevel(level)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("deleteLevel", async (_, id: number) => {
    try {
        return {success: true, data: await database.deleteLevel(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

