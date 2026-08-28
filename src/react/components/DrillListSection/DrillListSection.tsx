import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DrillListItem from "../DrillListItem/DrillListItem"
import type { Drill } from "../../../shared/models/drill"
import style from "./DrillListSection.module.css"
import { useContext, useEffect, useState } from "react"
import { NavigationContext } from "../../App"
import AlertsList from "../AlertsList/AlertsList"
import { AnimatePresence, LayoutGroup } from "motion/react"
import { useAlerts } from "../../context/AlertContext"

type TagFilter = {
    id: number,
    toggled: boolean
}

export default function DrillListSection() {
    const queryClient = useQueryClient()
    const { addAlert } = useAlerts()
    const navigation = useContext(NavigationContext)

    const { data: result, isLoading, error, isError } = useQuery({
        queryFn: () => window.api.getDrills(),
        queryKey: ["drills"],
    })

    // get event data
    const { data: eventResponse } = useQuery({
        queryKey: ["events"],
        queryFn: () => window.api.getEvents(),
    })
    const events = eventResponse?.success ? eventResponse.data : null

    // get level data
    const { data: levelResponse } = useQuery({
        queryKey: ["levels"],
        queryFn: () => window.api.getLevels(),
    })
    const levels = levelResponse?.success ? levelResponse.data : null

    // handle potential errors
    useEffect(() => {
        if (isError) {
            addAlert({
                message: "Failed to load drills: " + error.message,
                type: "danger"
            })
        }

        if (result?.success == false) {
            addAlert({
                message: result.error,
                type: "danger"
            })
        }
    }, [isError, error, result]);

    // TODO: Add error handling for events and levels queries

    const [ eventFilters, setEventFilters ] = useState<TagFilter[] | null>(null)
    const [ levelFilters, setLevelFilters ] = useState<TagFilter[] | null>(null)

    useEffect(() => {
        if (!events || !levels)
            return

        setEventFilters(
            events.map(event => ({
                id: event.id,
                toggled: false
            }))
        )
        setLevelFilters(
            levels.map(level => ({
                id: level.id,
                toggled: false
            }))
        )
    }, [events, levels])

    function filterAndSortDrills(drills: Drill[]) {
        let filteredDrills = drills.map(d => d) // copy

        let selectedEvents = eventFilters?.filter(x => x.toggled).map(x => x.id)
        if (selectedEvents && selectedEvents.length > 0) {
            selectedEvents.forEach(eventId => {
                filteredDrills = filteredDrills.filter(d => d.pinned || d.events.find(e => e?.id === eventId) != undefined)
            })
        }

        let selectedLevels = levelFilters?.filter(x => x.toggled).map(x => x.id)
        if (selectedLevels && selectedLevels.length > 0) {
            selectedLevels.forEach(levelId => {
                filteredDrills = filteredDrills.filter(d => d.pinned || d.levels.find(e => e?.id === levelId) != undefined)
            })
        }

        const sortedDrills = filteredDrills.sort((a, b) => {
            // if (a.pinned !== b.pinned) {
            //     return Number(b.pinned) - Number(a.pinned)
            // }

            return b.dateCreated.getTime() - a.dateCreated.getTime()
        }) ?? null

        const sortedWithPinned = sortedDrills.sort((a, b) => {
            return Number(b.pinned) - Number(a.pinned)
        })

        return sortedWithPinned
    }

    const drills = result?.success ? filterAndSortDrills(result.data) : null
    
    const { mutateAsync: editDrillMutation } = useMutation({
        mutationFn: (drill: Drill) => window.api.editDrill(drill),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["drills"] })
        }
    })

    async function pinDrill(id: number): Promise<void> {
        // console.log(`pinning drill "${drills?.find(d => d.id === id)?.name}"`)

        const originalDrill = drills?.find(d => d.id === id)
        if (!originalDrill)
            return

        const editedDrill: Drill = { ...originalDrill }
        editedDrill.pinned = !editedDrill.pinned

        try {
            await editDrillMutation(editedDrill)
        } catch (_) {
            // TODO
            console.log("edit failed.")
        }
    }

    function applyTagFilter(tagType: "event" | "level", id: number) {
        const tagButtonData = tagType == "event" ? eventFilters : levelFilters

        if (!tagButtonData) return

        // create copy of data
        const tagData = tagButtonData.map(item => ({ ...item }));

        const tag = tagData.find(x => x.id === id)
        if (!tag) {
            console.log(`no tag data attached to this button. Type: "${tagType}", Id: ${id}`)
            return
        }

        tag.toggled = !tag.toggled

        if (tagType == "event")
            setEventFilters(tagData)
        else
            setLevelFilters(tagData)
    }

    function RenderDrillList(drills: Drill[]) {
        return (<>
            <LayoutGroup>
                <div className={style.drillList}>
                    <AnimatePresence initial={false} mode="popLayout">
                        {drills.map(drill => (
                            <DrillListItem
                                key={drill.id}
                                drill={drill}
                                onPin={pinDrill}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </LayoutGroup>
        </>)
    }

    return (<section className={style.drillListSection}>
        <h1>Drill Tracker</h1>

        <AlertsList />

        <div className="formHorizontalDiv">
            <label>Filter by events:</label>
            <div className="tagContainer">
                { events && events.map(event => (
                    <button
                        key={event.id}
                        className="tag clickable"
                        onClick={() => applyTagFilter("event", event.id)}
                        style={eventFilters?.find(filter => filter.id === event.id)?.toggled
                            ? { backgroundColor: event.color, color: "#FFFFFF" }
                            : undefined}
                    >{ event.name }</button>
                )) }
            </div>
        </div>

        <div className="formHorizontalDiv">
            <label>Filter by levels:</label>
            <div className="tagContainer">
                { levels && levels.map(level => (
                    <button
                        key={level.id}
                        className="tag clickable"
                        onClick={() => applyTagFilter("level", level.id)}
                        style={levelFilters?.find(filter => filter.id === level.id)?.toggled
                            ? { backgroundColor: level.color, color: "#FFFFFF" }
                            : undefined}
                    >{ level.name }</button>
                )) }
            </div>
        </div>

        <div className={style.controlButtons}>
            <button
                onClick={() => {
                    navigation?.navigateToPage({
                        page: "add drill page",
                        drillId: null
                    })
                }}
            >Add Drill</button>
        </div>

        {isLoading && <p>Loading...</p>}

        {drills && drills.length > 0 &&
            RenderDrillList(drills)
        }
    </section>)
}