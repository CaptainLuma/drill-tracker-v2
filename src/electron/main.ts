// const fs = require('node:fs/promises');
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { isDev, ipcMainHandle, getErrorMessage } from './util.js'
import * as database from './database.js'
import { Drill, NewDrill } from '../shared/models/drill.js'

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



ipcMainHandle("test", () => {
    return "This is a test to retrieve data from the backend. If this text is rendered to the UI, it means the data was successfully retrieved from the main process.";
})

ipcMainHandle("getDrills", () => {
    try {
        return {success: true, data: database.getDrills()}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("getDrill", (_event, id: number) => {
    try {
        return {success: true, data: database.getDrill(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("addDrill", (_event, drill: NewDrill) => {
    try {
        return {success: true, data: database.addDrill(drill)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("editDrill", (_event, drill: Drill) => {
    try {
        return {success: true, data: database.editDrill(drill)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("deleteDrill", (_event, id: number) => {
    try {
        return {success: true, data: database.deleteDrill(id)}
    } catch (err) {
        return {success: false, error: getErrorMessage(err)}
    }
})