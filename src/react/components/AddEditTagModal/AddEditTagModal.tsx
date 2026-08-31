import { useEffect, useRef, useState } from "react"
import style from "./AddEditTagModal.module.css"
import type { Event } from "../../../shared/models/event"
import { useQueryClient } from "@tanstack/react-query"
import type { IpcResult } from "../../../shared/ipc"
import type { Level } from "../../../shared/models/level"

interface Props {
    mode: "add" | "edit",
    tagType: "event" | "level"
    onClose: () => void,
    events: Event[] | null
    levels: Level[] | null
}

export default function AddEditTagModal(props: Props) {
    const queryClient = useQueryClient()

    const [ alertMessage, setAlertMessage ] = useState<string | null>(null)

    const nameInputRef = useRef<HTMLInputElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const tagSelectRef = useRef<HTMLSelectElement>(null)

    useEffect(() => {
        autoFillInputs()
    }, [nameInputRef, colorInputRef, tagSelectRef])
    
    async function addTag(name: string, color: string) {
        const tag = {
            name: name,
            color: color,
        }

        let response: IpcResult<number>
        if (props.tagType == "event")
            response = await window.api.addEvent(tag)
        else
            response = await window.api.addLevel(tag)

        if (!response.success) {
            setAlertMessage(response.error)
            return false
        }

        return true
    }

    async function editTag(id: number, name: string, color: string) {
        const tag = {
            id: id,
            name: name,
            color: color,
            dateCreated: new Date(),
            dateModified: new Date(),
        }

        let response: IpcResult<number>
        if (props.tagType == "event")
            response = await window.api.editEvent(tag)
        else
            response = await window.api.editLevel(tag)

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
                queryKey: props.tagType == "event" ? ["events"] : ["levels"]
            });
            
            props.onClose()
        }
    }

    async function onDeleteButtonPressed() {
        const id = tagSelectRef.current ? Number(tagSelectRef.current.value) : null
        if (!id) return

        let response: IpcResult<number>
        if (props.tagType == "event") {
            response = await window.api.deleteEvent(id)
        } else {
            response = await window.api.deleteLevel(id)
        }

        if (response.success) {
            queryClient.invalidateQueries({
                queryKey: props.tagType == "event" ? ["events"] : ["levels"],
            });

            props.onClose()
        } else {
            setAlertMessage(response.error)
        }
    }

    function getTagOptionElements() {
        const tags: Event[] | Level[] | null = props.tagType == "event" ? props.events : props.levels

        if (!tags) return null

        return tags.map(tag => (
            <option
                key={tag.id}
                value={tag.id}
            >{tag.name}</option>
        ))
    }

    function autoFillInputs() {
        const id = tagSelectRef.current ? Number(tagSelectRef.current.value) : null
        if (!id) return

        if (props.mode == "edit" && 
            props.events &&
            props.levels &&
            nameInputRef.current && 
            colorInputRef.current
        ) {
            const tag = props.tagType == "event" ? 
                props.events.find(e => e.id === id) : 
                props.levels.find(e => e.id === id)
            
            if (!tag) return

            nameInputRef.current.value = tag.name
            colorInputRef.current.value = tag.color
        }
    }

    return (<>
        <div className={style.background}>
            <div className={style.modal}>
                <h3>{props.mode == "add" ? "Add Tag" : "Edit Tag"}</h3>
                
                { alertMessage && <p className={style.alert}>{alertMessage}</p> }

                { props.mode == "edit" && props.events &&
                    <div className="formHorizontalDiv">
                        <label>{props.tagType == "event" ? "Event" : "Level"} to Edit:</label>
                        <select 
                            ref={tagSelectRef}
                            onChange={autoFillInputs}
                        >
                            { getTagOptionElements() }
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