import { useContext, useRef } from "react"
import { NavigationContext } from "../../App"
import style from "./AddDrillSection.module.css"
import type { NewDrill } from "../../../shared/models/drill"
import { useAlerts } from "../../context/AlertContext"
import AlertsList from "../AlertsList/AlertsList"

export default function AddDrillSection() {
    const navigation = useContext(NavigationContext)
    const { addAlert } = useAlerts()

    const nameInputRef = useRef<HTMLInputElement>(null)
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

    async function onAddDrillButtonClicked() {
        // get input values
        const name = nameInputRef.current?.value
        const description = descriptionInputRef.current?.value

        console.log("add button clicked.")

        if (name == undefined || description == undefined) {
            addAlert({ message: "Please enter a drill name and description.", type: "danger" })
            return
        }

        // validate input
        if (name.trim() == "") {
            addAlert({ message: "A drill name is required.", type: "danger" })
            return
        }

        if (description.trim() == "") {
            addAlert({ message: "A drill description is required.", type: "danger" })
            return
        }

        console.log("creating drill...")

        const drill: NewDrill = {
            name: name,
            description: description
        }

        console.log("adding drill: ", drill)
        const response = await window.api.addDrill(drill)

        if (!response.success) {
            addAlert({ message: response.error, type: "danger" })
            return
        }

        // success
        console.log(`successfully added drill with id: ${response.data}`)
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