import type { IpcResult } from './src/shared/ipc.js'
import type { Drill, NewDrill } from './src/shared/models/drill.js'
import type { Event, NewEvent } from './src/shared/models/event.ts'
import type { Level, NewLevel } from './src/shared/models/level.ts'
import type { ImageData } from './src/shared/imageData.ts'

declare global {
    interface Window {
        api: {
            createBackup: () => Promise<IpcResult<string>>,
            exportDrills: (drills: Drill[]) => Promise<IpcResult<string>>

            getDrills: () => Promise<IpcResult<Drill[]>>,
            getDrill: (id: number) => Promise<IpcResult<Drill>>,
            addDrill: (drill: NewDrill) => Promise<IpcResult<number>>,
            editDrill: (drill: Drill) => Promise<IpcResult<number>>,
            deleteDrill: (id: number) => Promise<IpcResult<number>>,

            getEvents: () => Promise<IpcResult<Event[]>>,
            getEvent: (id: number) => Promise<IpcResult<Event>>,
            addEvent: (event: NewEvent) => Promise<IpcResult<number>>,
            editEvent: (event: Event) => Promise<IpcResult<number>>,
            deleteEvent: (id: number) => Promise<IpcResult<number>>,

            getLevels: () => Promise<IpcResult<Level[]>>,
            getLevel: (id: number) => Promise<IpcResult<Level>>,
            addLevel: (level: NewLevel) => Promise<IpcResult<number>>,
            editLevel: (level: Level) => Promise<IpcResult<number>>,
            deleteLevel: (id: number) => Promise<IpcResult<number>>,

            promptUserImage: () => Promise<IpcResult<string | null>>,
            getDrillImage: (imageName: string) => Promise<IpcResult<ImageData>>,
            deleteUnusedImages: () => Promise<IpcResult<string[]>>,
        }
    }

    type EventPayloadMapping = {
        createBackup: Promise<IpcResult<string>>,
        exportDrills: Promise<IpcResult<string>>

        getDrills: IpcResult<Drill[]>,
        getDrill: IpcResult<Drill>,
        addDrill: Promise<IpcResult<number>>,
        editDrill: Promise<IpcResult<number>>,
        deleteDrill: Promise<IpcResult<number>>,

        getEvents: IpcResult<Event[]>,
        getEvent: IpcResult<Event>,
        addEvent: Promise<IpcResult<number>>,
        editEvent: Promise<IpcResult<number>>,
        deleteEvent: Promise<IpcResult<number>>,

        getLevels: IpcResult<Level[]>,
        getLevel: IpcResult<Level>,
        addLevel: Promise<IpcResult<number>>,
        editLevel: Promise<IpcResult<number>>,
        deleteLevel: Promise<IpcResult<number>>,

        promptUserImage: Promise<IpcResult<string | null>>,
        getDrillImage: Promise<IpcResult<ImageData>>,
        deleteUnusedImages: Promise<IpcResult<string[]>>,
    }
}