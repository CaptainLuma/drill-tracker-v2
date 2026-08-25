import type { IpcResult } from './src/shared/ipc.js'
import type { Drill } from './src/shared/models/drill.js'

declare global {
    interface Window {
        api: {
            test: () => Promise<string>,
            getDrills: () => Promise<IpcResult<Drill[]>>,
            getDrill: (id: number) => Promise<IpcResult<Drill>>,
            addDrill: (drill: NewDrill) => Promise<IpcResult<number>>,
            editDrill: (drill: Drill) => Promise<IpcResult<number>>,
            deleteDrill: (id: number) => Promise<IpcResult<number>>
        }
    }

    type EventPayloadMapping = {
        test: string,
        getDrills: IpcResult<Drill[]>,
        getDrill: IpcResult<Drill>,
        addDrill: IpcResult<number>,
        editDrill: IpcResult<number>,
        deleteDrill: IpcResult<number>
    }
}