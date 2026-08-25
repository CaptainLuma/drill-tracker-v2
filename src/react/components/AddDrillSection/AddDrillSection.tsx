import { useContext, useEffect, useRef } from "react"
import { NavigationContext } from "../../App"
import style from "./AddDrillSection.module.css"
import type { Drill, NewDrill } from "../../../shared/models/drill"
import { useAlerts } from "../../context/AlertContext"
import AlertsList from "../AlertsList/AlertsList"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export default function AddDrillSection() {
    const navigation = useContext(NavigationContext)
    const { clearAlerts, addAlert } = useAlerts()
    const queryClient = useQueryClient()

    const drillId = navigation?.navigationState.page == "add drill page"
        ? navigation.navigationState.drillId
        : null

    const nameInputRef = useRef<HTMLInputElement>(null)
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

    const { data: drillResponse } = useQuery({
        queryKey: ["drill", drillId],
        queryFn: () => window.api.getDrill(drillId!),
        enabled: drillId !== null,
    })

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
            createdAt: drillResponse?.success ? drillResponse.data.createdAt : new Date()
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

        const succeeded = drillId === null
            ? await addDrill(name, description)
            : await editDrill(name, description)

        if (!succeeded)
            return

        navigation?.navigateToPage({
            page: "drill list page"
        }, false)
    }

    return (<section className={style.addDrillSection}>
        <h1>{drillId !== null ? "Edit Drill" : "Add Drill"}</h1>

        <AlertsList />

        <div className="formHorizontalDiv">
            <label>Name:</label>
            <input ref={nameInputRef} type="text" />
        </div>

        <div className="mv-2">
            <label className="mv-1">Description:</label>
            <textarea ref={descriptionInputRef} rows={5}></textarea>
        </div>

        <div className="flex">
            <button
                onClick={onAddDrillButtonClicked}>Add</button>
            <button
                onClick={() => navigation?.navigateToPage({
                    page: "drill list page"
                })}
            >Cancel</button>
            { drillId !== null &&
                <button
                    className={style.deleteButton}
                    onClick={onDeleteDrillButtonClicked}
                >Delete</button>
            }
            
        </div>
        
    </section>)
}