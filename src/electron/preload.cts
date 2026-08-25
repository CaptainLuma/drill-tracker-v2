import { Drill, NewDrill } from "../shared/models/drill";

const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('api', {
    // send: (channel, data) => ipcRenderer.send(channel, data),
    // on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    // invoke: (channel, data) => ipcRenderer.invoke(channel, data),

    test: () => ipcRenderer.invoke("test"),
    getDrills: () => ipcRenderer.invoke("getDrills"),
    getDrill: (id: number) => ipcRenderer.invoke("getDrill", id),
    addDrill: (drill: NewDrill) => ipcRenderer.invoke("addDrill", drill),
    editDrill: (drill: Drill) => ipcRenderer.invoke("editDrill", drill),
    deleteDrill: (id: number) => ipcRenderer.invoke("deleteDrill", id)
} satisfies Window['api']);