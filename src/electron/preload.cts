import { Drill, NewDrill } from "../shared/models/drill";
import { Event, NewEvent } from "../shared/models/event"
import { Level, NewLevel } from "../shared/models/level"

const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('api', {
    // send: (channel, data) => ipcRenderer.send(channel, data),
    // on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    // invoke: (channel, data) => ipcRenderer.invoke(channel, data),

    createBackup: () => ipcRenderer.invoke("createBackup"),
    exportDrills: (drills: Drill[]) => ipcRenderer.invoke("exportDrills", drills),

    getDrills: () => ipcRenderer.invoke("getDrills"),
    getDrill: (id: number) => ipcRenderer.invoke("getDrill", id),
    addDrill: (drill: NewDrill) => ipcRenderer.invoke("addDrill", drill),
    editDrill: (drill: Drill) => ipcRenderer.invoke("editDrill", drill),
    deleteDrill: (id: number) => ipcRenderer.invoke("deleteDrill", id),

    getEvents: () => ipcRenderer.invoke("getEvents"),
    getEvent: (id: number) => ipcRenderer.invoke("getEvent", id),
    addEvent: (event: NewEvent) => ipcRenderer.invoke("addEvent", event),
    editEvent: (event: Event) => ipcRenderer.invoke("editEvent", event),
    deleteEvent: (id: number) => ipcRenderer.invoke("deleteEvent", id),

    getLevels: () => ipcRenderer.invoke("getLevels"),
    getLevel: (id: number) => ipcRenderer.invoke("getLevel", id),
    addLevel: (level: NewLevel) => ipcRenderer.invoke("addLevel", level),
    editLevel: (level: Level) => ipcRenderer.invoke("editLevel", level),
    deleteLevel: (id: number) => ipcRenderer.invoke("deleteLevel", id),

} satisfies Window['api']);