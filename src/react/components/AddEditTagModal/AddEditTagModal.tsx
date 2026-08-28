import { useRef, useState } from "react"
import style from "./AddEditTagModal.module.css"
import type { Event, NewEvent } from "../../../shared/models/event"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
    mode: "add" | "edit",
    onClose: () => void,
    events: Event[] | null
}

export default function AddEditTagModal(props: Props) {
    const queryClient = useQueryClient()

    const [ alertMessage, setAlertMessage ] = useState<string | null>(null)

    const nameInputRef = useRef<HTMLInputElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const tagSelectRef = useRef<HTMLSelectElement>(null)
    
    async function addTag(name: string, color: string) {
        const event: NewEvent = {
            name: name,
            color: color,
        }

        const response = await window.api.addEvent(event)

        if (!response.success) {
            setAlertMessage(response.error)
            return false
        }

        return true
    }

    async function editTag(id: number, name: string, color: string) {
        const event: Event = {
            id: id,
            name: name,
            color: color,
            dateCreated: new Date(),
            dateModified: new Date(),
        }

        const response = await window.api.editEvent(event)

        if (!response.success) {
            setAlertMessage(response.error)
            return false
        }

        return true
    }

    async function onTagAddEditButtonClicked() {
        const name = nameInputRef.current?.value
        const color = colorInputRef.current?.value
        const id = tagSelectRef.current ? Number(tagSelectRef.current.value) : null
        
        // validate
        if (name == undefined || color == undefined) {
            setAlertMessage("Please enter a name and color.")
            return
        }

        if (name.trim() == "") {
            setAlertMessage("Please enter a name.")
            return
        }

        if (props.mode == "edit" && id == undefined) {
            setAlertMessage("please select the tag you want to edit.")
            return
        }
        
        let success = false
        if (props.mode == "add") {
            success = await addTag(name, color)
        } else {
            success = await editTag(id!, name, color)
        }
        
        if (success) {
            queryClient.invalidateQueries({
                queryKey: ["events"],
            });

            props.onClose()
        }
    }

    async function onDeleteButtonPressed() {
        const id = tagSelectRef.current ? Number(tagSelectRef.current.value) : null
        if (!id) return

        const success = await window.api.deleteEvent(id)

        if (success) {
            queryClient.invalidateQueries({
                queryKey: ["events"],
            });

            props.onClose()
        }
    }

    function autoFillInputs() {
        const id = tagSelectRef.current ? Number(tagSelectRef.current.value) : null
        if (!id) return

        if (props.mode == "edit" && 
            props.events && 
            nameInputRef.current && 
            colorInputRef.current
        ) {
            const event = props.events.find(e => e.id === id)
            if (!event) return

            nameInputRef.current.value = event.name
            colorInputRef.current.value = event.color
        }
    }

    autoFillInputs()

    return (<>
        <div className={style.background}>
            <div className={style.modal}>
                <h3>{props.mode == "add" ? "Add Tag" : "Edit Tag"}</h3>
                
                { alertMessage && <p className={style.alert}>{alertMessage}</p> }

                { props.mode == "edit" && props.events &&
                    <div className="formHorizontalDiv">
                        <label>Event to Edit:</label>
                        <select 
                            ref={tagSelectRef}
                            onChange={autoFillInputs}
                        >
                            { props.events.map(event => (
                                <option
                                    key={event.id}
                                    value={event.id}
                                >{event.name}</option>
                            )) }
                        </select>
                    </div>
                }

                <div className="formHorizontalDiv">
                    <label>Name:</label>
                    <input type="text" ref={nameInputRef} />
                </div>

                <div className="formHorizontalDiv mb-3">
                    <label>Color:</label>
                    <input type="color" ref={colorInputRef} />
                </div>

                <div className={style.modalButtons}>
                    <button
                        onClick={onTagAddEditButtonClicked}
                    >{props.mode == "add" ? "Add" : "Edit"}</button>
                    <button
                        onClick={props.onClose}
                    >Cancel</button>
                    { props.mode == "edit" && 
                        <button
                            className="danger"
                            onClick={onDeleteButtonPressed}
                        >Delete</button> 
                    } 
                </div>
            </div>
        </div>
    </>)
}