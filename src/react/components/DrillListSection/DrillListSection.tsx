import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DrillListItem from "../DrillListItem/DrillListItem"
import type { Drill } from "../../../shared/models/drill"
import style from "./DrillListSection.module.css"
import { useContext, useEffect, useState } from "react"
import { ConfirmModalContext, NavigationContext } from "../../App"
import AlertsList from "../AlertsList/AlertsList"
import { LayoutGroup } from "motion/react"
import { useAlerts } from "../../context/AlertContext"
import TagList from "../TagList/TagList"
import imageDice from "../../../assets/images/dice (3).svg"
import imageBackup from "../../../assets/images/download-square-svgrepo-com.svg"
import imageDocument from "../../../assets/images/document (1).svg"
import { shuffle } from "../../../shared/helpers"

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
    const confirmModal = useContext(ConfirmModalContext)

    const [ drills, setDrills ] = useState<Drill[]>([])

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

    function filterAndSortDrills(randomOrder = false) {
        if (!result?.success)
            return

        let drillList = [...result.data]

        // apply event filters
        const selectedEvents = eventFilters?.filter(x => x.toggled).map(x => x.id)
        if (selectedEvents && selectedEvents.length > 0) {
            selectedEvents.forEach(eventId => {
                drillList = drillList.filter(d => d.pinned || d.events.find(e => e?.id === eventId) != undefined)
            })
        }

        // apply level filters
        const selectedLevels = levelFilters?.filter(x => x.toggled).map(x => x.id)
        if (selectedLevels && selectedLevels.length > 0) {
            selectedLevels.forEach(levelId => {
                drillList = drillList.filter(d => d.pinned || d.levels.find(e => e?.id === levelId) != undefined)
            })
        }

        // apply search filter
        const searchTerms = searchString.trim().toLowerCase().split(" ")
        drillList = drillList.filter(drill => {
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

        
        if (!randomOrder) {
            // sort by newest first
            drillList = [...drillList].sort((a, b) => {
                return b.dateCreated.getTime() - a.dateCreated.getTime()
            })
        } else {
            // random sort
            shuffle(drillList)
        }
        

        // move pinned to front while preserving newest-first ordering within each group
        drillList = [...drillList].sort((a, b) => {
            return Number(b.pinned) - Number(a.pinned)
        })

        // limit drills
        let numPinned = 0
        while (drillList[numPinned] && drillList[numPinned].pinned) {
            numPinned++
        }

        if (resultLimit > 0) {
            drillList = drillList.slice(0, resultLimit + numPinned)
        }

        setDrills(drillList)
    }

    useEffect(() => {
        filterAndSortDrills()
    }, [result, eventFilters, levelFilters, searchString, searchType, resultLimit])

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

    async function exportPinnedDrills() {
        if (!drills) return
                            
        const pinnedDrills = drills.filter(d => d.pinned)
        if (pinnedDrills.length == 0) {
            addAlert({ message: "no drills are pinned." })
            return
        }

        if (confirmModal) {
            const userResponse = await confirmModal.openConfirmModal("Export your pinned drills to a markdown file?")

            if (!userResponse) return
        }

        const result = await window.api.exportDrills(pinnedDrills)
        if (result.success)
            addAlert({ 
                message: `Exported ${pinnedDrills.length} drill${pinnedDrills.length == 1 ? "" : "s"}. Path: "${result.data}"`,
                type: "info"
            })
        else {
            addAlert({
                message: `failed to export. Error: ${result.error}`,
                type: "danger"
            })
        }
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
                <div className="flex vCenter">
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
                </div>
                
                <div className={style.inlineImageButtonContainer}>
                    <label className={style.inlineImageButtonLabel}>Randomize list order</label>
                    <img 
                        className={style.inlineImageButton}
                        src={imageDice} 
                        alt="randomize"
                        onClick={() => filterAndSortDrills(true)}
                    />
                </div>
                
                <div className={style.inlineImageButtonContainer}>
                    <label className={style.inlineImageButtonLabel}>Backup files</label>
                    <img 
                        className={style.inlineImageButton}
                        src={imageBackup} 
                        alt="backup"
                        onClick={async () => {
                            if (confirmModal) {
                                const userResponse = await confirmModal.openConfirmModal("Backup your files?")

                                if (!userResponse) return
                            }
                            
                            const result = await window.api.createBackup()
                            if (result.success)
                                addAlert({ 
                                    message: `backup has been created. Path: "${result.data}"`,
                                    type: "info"
                                })
                            else {
                                addAlert({
                                    message: `failed to create backup. Error: ${result.error}`,
                                    type: "danger"
                                })
                            }
                        }}
                    />
                </div>

                <div className={style.inlineImageButtonContainer}>
                    <label className={style.inlineImageButtonLabel}>Export Pinned</label>
                    <img 
                        className={style.inlineImageButton}
                        src={imageDocument} 
                        alt="export pinned"
                        onClick={exportPinnedDrills}
                    />
                </div>
                
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