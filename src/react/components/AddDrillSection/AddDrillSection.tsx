import { useContext, useEffect, useRef, useState } from "react"
import { ConfirmModalContext, NavigationContext } from "../../App"
import style from "./AddDrillSection.module.css"
import type { Drill, NewDrill } from "../../../shared/models/drill"
import { useAlerts } from "../../context/AlertContext"
import AlertsList from "../AlertsList/AlertsList"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import AddEditTagModal from "../AddEditTagModal/AddEditTagModal"

type ButtonData = {
    id: number,
    toggled: boolean
}

type TagModalState = {
	mode: "add" | "edit"
} | null

export default function AddDrillSection() {
    const navigation = useContext(NavigationContext)
    const confirmModal = useContext(ConfirmModalContext)

    const { clearAlerts, addAlert } = useAlerts()
    const queryClient = useQueryClient()

    const drillId = navigation?.navigationState.page == "add drill page"
        ? navigation.navigationState.drillId
        : null
    const addEditMode = drillId == null ? "add" : "edit"

    const nameInputRef = useRef<HTMLInputElement>(null)
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

    const [ eventButtonData, setEventButtonData ] = useState<ButtonData[] | null>(null)

    const [ tagModalState, setTagModalState ] = useState<TagModalState>(null)

    // get drill data (if in edit mode)
    const { data: drillResponse } = useQuery({
        queryKey: ["drill", drillId],
        queryFn: () => window.api.getDrill(drillId!),
        enabled: drillId !== null,
    })

    // get event data
    const { data: eventResponse } = useQuery({
        queryKey: ["events"],
        queryFn: () => window.api.getEvents(),
    })
    const events = eventResponse?.success ? eventResponse.data : null
    const eventDataKey = events ? JSON.stringify(events) : null // used to refresh the events button data if there are changes to events.

    // fill inputs with drill values when in edit mode
    useEffect(() => {
        if (drillId === null) {
            nameInputRef.current!.value = ""
            descriptionInputRef.current!.value = ""
            return
        }

        if (drillResponse?.success) {
            const drillToEdit = drillResponse.data
            nameInputRef.current!.value = drillToEdit.name
            descriptionInputRef.current!.value = drillToEdit.description
        }
    }, [drillId, drillResponse])

    // reset tag data if needed
    useEffect(() => {
        if (!events)
            return

        setEventButtonData(
            events.map(event => ({
                id: event.id,
                toggled: false
            }))
        )

        console.log("set event button data.")
    }, [eventDataKey])

    async function addDrill(name: string, description: string): Promise<boolean> {
        const allDrills = await window.api.getDrills()
        if (allDrills.success && allDrills.data.find(d => d.name.trim() == name)) {
            addAlert({ message: "A drill already has this name. Please choose another name.", type: "danger"})
            return false
        }

        const drill: NewDrill = {
            name,
            description
        }

        const response = await window.api.addDrill(drill)

        if (!response.success) {
            addAlert({ message: response.error, type: "danger" })
            return false
        }

        addAlert({ message: `Successfully added drill "${drill.name}".` })
        return true
    }

    async function editDrill(name: string, description: string): Promise<boolean> {
        const drill: Drill = {
            id: drillId!,
            name,
            description,
            dateCreated: drillResponse?.success ? drillResponse.data.dateCreated : new Date(),
            dateModified: new Date(),
            pinned: false,
        }

        // ensure unique name:
        const allDrills = await window.api.getDrills()
        if (allDrills.success && allDrills.data.find(d => d.name.trim() == name && d.id !== drill.id)) {
            addAlert({ message: "A drill already has this name. Please choose another name.", type: "danger"})
            return false
        }

        const response = await window.api.editDrill(drill)

        if (!response.success) {
            addAlert({ message: response.error, type: "danger" })
            return false
        }

        await queryClient.invalidateQueries({ queryKey: ["drill", drillId] })

        addAlert({ message: `Successfully edited drill "${drill.name}".` })
        return true
    }

    async function onDeleteDrillButtonClicked() {
        if (drillId == null)
            return

        // ask user to confirm action
        if (confirmModal) {
            const userResponse = await confirmModal.openConfirmModal("Are you sure you want to delete this drill?")

            if (!userResponse) {
                return
            }
        }
        

        const response = await window.api.deleteDrill(drillId)

        if (!response.success) {
            addAlert({ message: response.error, type: "danger" })
            return false
        }

        clearAlerts()
        if (drillResponse?.success) {
            addAlert({ message: `Successfully deleted drill "${drillResponse.data.name}".` })
        }
        
        navigation?.navigateToPage({
            page: "drill list page"
        }, false)
    }

    async function onAddDrillButtonClicked() {
        clearAlerts()

        const name = nameInputRef.current?.value.trim()
        const description = descriptionInputRef.current?.value.trim()

        if (name == undefined || description == undefined) {
            addAlert({ message: "Please enter a drill name and description.", type: "danger" })
            return
        }

        if (name == "") {
            addAlert({ message: "A drill name is required.", type: "danger" })
            return
        }

        const succeeded = addEditMode == "add"
            ? await addDrill(name, description)
            : await editDrill(name, description)

        if (!succeeded)
            return

        navigation?.navigateToPage({
            page: "drill list page"
        }, false)
    }

    function handleEventToggled(id: number) {
        // create copy of data
        const eventData = eventButtonData?.map(item => ({ ...item }));
        if (!eventData) return

        const event = eventData.find(x => x.id === id)
        if (!event) {
            console.log(`no event data attached to this button. Id: ${id}`)
            return
        }

        event.toggled = !event.toggled

        setEventButtonData(eventData)
    }

    return (<section className={style.addDrillSection}>
        <h1>{drillId !== null ? "Edit Drill" : "Add Drill"}</h1>

        <AlertsList />

        <div className="formHorizontalDiv">
            <label>Name:</label>
            <input ref={nameInputRef} type="text" />
        </div>

        <div className="mv-2">
            <div className="flex">
                <label className="mv-1">Events:</label>
                <button 
                    className={style.tagControlButton}
                    onClick={() => setTagModalState({ mode: "add" })}
                >Add</button>
                <button
                    className={style.tagControlButton}
                    onClick={() => setTagModalState({ mode: "edit" })}
                >Edit</button>
            </div>
            
            <div className={style.tagContainer}>
                {events && 
                    events.map(event => (
                        <button
                            key={event.id}
                            className={style.tag}
                            onClick={() => handleEventToggled(event.id)}
                            style={eventButtonData?.find(buttonData => buttonData.id === event.id)?.toggled
                                ? { backgroundColor: event.color, color: "#FFFFFF" }
                                : undefined}
                        >{event.name}</button>
                    ))
                }
            </div>
        </div>

        <div className="mv-2">
            <label className="mv-1">Description:</label>
            <textarea ref={descriptionInputRef} rows={5}></textarea>
        </div>

        <div className="flex">
            <button
                onClick={onAddDrillButtonClicked}
            >{addEditMode == "add" ? "Add" : "Edit"}</button>

            <button
                onClick={() => navigation?.navigateToPage({
                    page: "drill list page"
                })}
            >Cancel</button>

            {drillId !== null &&
                <button
                    className={style.deleteButton}
                    onClick={onDeleteDrillButtonClicked}
                >Delete</button>
            }
            
        </div>

        {tagModalState &&
            <AddEditTagModal
                mode={tagModalState.mode}
                onClose={() => setTagModalState(null)}
                events={events}
            />
        }
        
    </section>)
}