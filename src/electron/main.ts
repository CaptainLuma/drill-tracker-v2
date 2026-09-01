import fs from 'node:fs/promises'
import { app, BrowserWindow, dialog, protocol, net } from 'electron'
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

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'drill-image',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
            stream: true,
        },
    },
]);

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

    protocol.handle('drill-image', async (request) => {
        const url = new URL(request.url);

        // const filename = url.pathname.slice(1);
        const filename = url.hostname
        
        const imagePath = path.join(
            dataPath,
            'drill-images',
            filename
        );

        // console.log("imagePath:", imagePath)

        return net.fetch(`file://${imagePath}`);
    });
})

async function getFileExists(pathElements: string[]) {
    const fullPath = path.join(dataPath, ...pathElements)

    try {
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

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

async function getAndCopyUserSelectedImage() {
    const validImageExtensions = new Set([
        '.png',
        '.jpg',
        '.jpeg',
        '.webp',
        '.bmp',
        '.gif',
        '.svg',
        '.avif'
    ])

    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Select Drill Image",
        properties: ["openFile"],
        filters: [
            {
                name: "Images",
                extensions: [
                    "png",
                    "jpg",
                    "jpeg",
                    "webp",
                    "bmp",
                    "gif",
                    "svg",
                    "avif"
                ]
            }
        ]
    });

    if (canceled || filePaths.length === 0) {
        return null;
    }

    const sourcePath = filePaths[0];
    const extension = path.extname(sourcePath).toLowerCase();

    if (!validImageExtensions.has(extension)) {
        throw new Error(`Unsupported image type: ${extension || 'none'}. Supported types: .png, .jpg, .jpeg, .webp, .bmp, .gif, .svg, .avif`)
    }

    const destinationDirectory = path.join(
        dataPath,
        "drill-images"
    );

    await fs.mkdir(destinationDirectory, { recursive: true });

    const parsed = path.parse(sourcePath);

    let fileName = parsed.base;
    let destinationPath = path.join(destinationDirectory, fileName);

    // ensure name is unqiue
    let counter = 1
    while (await getFileExists(["drill-images", fileName])) {
        fileName = `${parsed.name} (${counter})${parsed.ext}`;
        destinationPath = path.join(destinationDirectory, fileName);
        counter++;
    }

    await fs.copyFile(sourcePath, destinationPath);

    return fileName;
}

async function getFileNames(directory: string) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    return entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
}

async function deleteUnusedImages() {
    const directory = path.join(dataPath, "drill-images");

    const usedImages = new Set(database.getDrills().map(d => d.image).filter(i => i != null))
    const allImages = await getFileNames(directory)
    const unusedImages = allImages.filter(img => !usedImages.has(img))

    let deletedFileNames = []
    for (const fileName of unusedImages) {
        const filePath = path.join(directory, fileName);

        try {
            const stats = await fs.stat(filePath);

            // Only delete regular files, never directories.
            if (stats.isFile()) {
                await fs.unlink(filePath);
                deletedFileNames.push(fileName)
            }
        } catch {
            console.log(`failed to delete image: ${fileName}`)    
        }
    }

    return deletedFileNames
}

ipcMainHandle("exportDrills", async (_, drills: Drill[]) => {
    try {
        const result = await exportDrillsAsMarkdown(drills)

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

ipcMainHandle("promptUserImage", async () => {
    try {
        const fileName = await getAndCopyUserSelectedImage()

        return { success: true, data: fileName }
    } catch (err) {
        return { success: false, error: getErrorMessage(err)}
    }
})

ipcMainHandle("deleteUnusedImages", async () => {
    try {
        const result = await deleteUnusedImages()

        return { success: true, data: result }
    } catch (err) {
        return { success: false, error: getErrorMessage(err)}
    }
})