import { useContext, useRef } from "react"
import { NavigationContext } from "../../App"
import style from "./AddDrillSection.module.css"
import type { NewDrill } from "../../../shared/models/drill"
import { useAlerts } from "../../context/AlertContext"
import AlertsList from "../AlertsList/AlertsList"

export default function AddDrillSection() {
    const navigation = useContext(NavigationContext)
    const { clearAlerts, addAlert } = useAlerts()

    const nameInputRef = useRef<HTMLInputElement>(null)
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

    async function onAddDrillButtonClicked() {
        clearAlerts()

        // get input values
        const name = nameInputRef.current?.value.trim()
        const description = descriptionInputRef.current?.value.trim()

        if (name == undefined || description == undefined) {
            addAlert({ message: "Please enter a drill name and description.", type: "danger" })
            return
        }

        // validate input
        if (name == "") {
            addAlert({ message: "A drill name is required.", type: "danger" })
            return
        }

        const allDrills = await window.api.getDrills()
        if (allDrills.success && allDrills.data.find(d => d.name.trim() == name)) {
            addAlert({ message: "A drill already has this name. Please choose another name.", type: "danger"})
            return
        }

        const drill: NewDrill = {
            name: name,
            description: description
        }

        // add drill
        const response = await window.api.addDrill(drill)

        if (!response.success) {
            addAlert({ message: response.error, type: "danger" })
            return
        }

        // success
        addAlert({ message: `Successfully added drill "${drill.name}".` })
        navigation?.navigateToPage("drill list page")
    }

    return (<section className={style.addDrillSection}>
        <h1>Add Drill</h1>

        <AlertsList />

        <div className="formHorizontalDiv">
            <label>Drill Name:</label>
            <input ref={nameInputRef} type="text" />
        </div>

        <div className="mv-2">
            <label className="mv-1">Drill Name:</label>
            <textarea ref={descriptionInputRef} rows={5}></textarea>
        </div>

        <div className="flex">
            <button
                onClick={onAddDrillButtonClicked}>Add</button>
            <button
                onClick={() => navigation?.navigateToPage("drill list page")}
            >Cancel</button>
        </div>
        
    </section>)
}