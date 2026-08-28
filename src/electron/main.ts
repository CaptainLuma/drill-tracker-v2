// const fs = require('node:fs/promises');
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { isDev, ipcMainHandle, getErrorMessage } from './util.js'
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

