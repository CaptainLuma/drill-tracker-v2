import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DrillListItem from "../DrillListItem/DrillListItem"
import type { Drill } from "../../../shared/models/drill"
import style from "./DrillListSection.module.css"
import { useContext, useEffect, useMemo, useState } from "react"
import { NavigationContext } from "../../App"
import AlertsList from "../AlertsList/AlertsList"
import { LayoutGroup } from "motion/react"
import { useAlerts } from "../../context/AlertContext"
import TagList from "../TagList/TagList"
import imageDice from "../../../assets/images/dice (3).svg"

type TagFilter = {
    id: number,
    toggled: boolean
}

type SearchType = "name" | "description" | "name description"
type SearchOptionInfo = {
    value: SearchType
    displayName: string
}

const searchOptions: SearchOptionInfo[] = [
    {
        value: "name",
        displayName: "Name:"
    },
    {
        value: "description",
        displayName: "Description:"
    },
    {
        value: "name description",
        displayName: "Name & Desc:"
    }
]

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

    const [ searchType, setSearchType ] = useState<SearchType>(searchOptions[0].value)
    const [ searchString, setSearchString ] = useState<string>("")

    const [ resultLimit, setResultLimit ] = useState(0)

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
        let result = [...drills]

        // apply event filters
        const selectedEvents = eventFilters?.filter(x => x.toggled).map(x => x.id)
        if (selectedEvents && selectedEvents.length > 0) {
            selectedEvents.forEach(eventId => {
                result = result.filter(d => d.pinned || d.events.find(e => e?.id === eventId) != undefined)
            })
        }

        // apply level filters
        const selectedLevels = levelFilters?.filter(x => x.toggled).map(x => x.id)
        if (selectedLevels && selectedLevels.length > 0) {
            selectedLevels.forEach(levelId => {
                result = result.filter(d => d.pinned || d.levels.find(e => e?.id === levelId) != undefined)
            })
        }

        // apply search filter
        const searchTerms = searchString.trim().toLowerCase().split(" ")
        result = result.filter(drill => {
            if (drill.pinned)
                return true

            let textToSearch: string

            if (searchType == "name") {
                textToSearch = drill.name
            } else if (searchType == "description") {
                textToSearch = drill.description
            } else {
                textToSearch = drill.name + " " + drill.description
            }

            // return if name or description includes at least one of the terms
            return searchTerms.some(term => textToSearch.toLowerCase().includes(term))
        })

        // sort by newest first
        result = [...result].sort((a, b) => {
            return b.dateCreated.getTime() - a.dateCreated.getTime()
        })

        // move pinned to front while preserving newest-first ordering within each group
        result = [...result].sort((a, b) => {
            return Number(b.pinned) - Number(a.pinned)
        })

        // limit drills
        let numPinned = 0
        while (result[numPinned] && result[numPinned].pinned) {
            numPinned++
        }

        if (resultLimit > 0) {
            result = result.slice(0, resultLimit + numPinned)
        }

        return result
    }

    const drills = useMemo(() => {
        if (!result?.success)
            return null

        return filterAndSortDrills(result.data)
    }, [result, eventFilters, levelFilters, searchString, searchType, resultLimit])

    // const drills = result?.success ? result.data : null

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
            // await queryClient.refetchQueries({ queryKey: ["drills"], type: "active" })
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
                    {drills.map(drill => (
                        <DrillListItem
                            key={drill.id}
                            drill={drill}
                            onPin={pinDrill}
                        />
                    ))}
                </div>
            </LayoutGroup>
        </>)
    }

    return (<section className={style.drillListSection}>
        <h1>Drill Tracker</h1>

        <AlertsList />

        <div className="formHorizontalDiv">
            <label>Filter by events:</label>
            { events && eventFilters &&
                <TagList
                    tags={events}
                    toggleData={eventFilters}
                    onTagClicked={(id) => applyTagFilter("event", id)}
                />
            }
        </div>

        <div className="formHorizontalDiv">
            <label>Filter by levels:</label>

            { levels && levelFilters &&
                <TagList
                    tags={levels}
                    toggleData={levelFilters}
                    onTagClicked={(id) => applyTagFilter("level", id)}
                />
            }
        </div>

        <div className={style.controls}>
            <div className={style.searchControls}>
                <label>Search by</label>
                <select
                    onChange={(event) => {
                        setSearchType(event.target.value as SearchType)
                    }}
                >
                    { searchOptions.map(x => (
                        <option
                            key={x.value}
                            value={x.value}
                        >{x.displayName}</option>
                    )) }
                </select>
                <input
                    type="text"
                    onChange={(event) => {
                        setSearchString(event.target.value)
                    }}
                />
                <label>Top:</label>
                <input 
                    className={style.resultLimitInput}
                    type="number" 
                    min="0" 
                    step="1"
                    value={resultLimit === 0 ? "" : resultLimit}
                    onChange={(event) => {
                        const limit = event.target.value != "" ?
                            parseInt(event.target.value) : 0
                        
                        setResultLimit(limit)
                    }}
                />
                <img 
                    className={style.inlineImageButton}
                    src={imageDice} 
                    alt="randomize" 
                />
            </div>
            
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

        {drills &&
            RenderDrillList(drills)
        }
    </section>)
}