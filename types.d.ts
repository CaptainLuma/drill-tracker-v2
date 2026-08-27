import type { IpcResult } from './src/shared/ipc.js'
import type { Drill, NewDrill } from './src/shared/models/drill.js'
import type { Event, NewEvent } from './src/shared/models/event.ts'

declare global {
    interface Window {
        api: {
            test: () => Promise<string>,

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
        }
    }

    type EventPayloadMapping = {
        test: string,
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
    }
}