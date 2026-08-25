import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DrillListItem from "../DrillListItem/DrillListItem"
import type { Drill } from "../../../shared/models/drill"
import style from "./DrillListSection.module.css"
import { useContext, useEffect, useState } from "react"
import { NavigationContext } from "../../App"
import AlertsList from "../AlertsList/AlertsList"
import { LayoutGroup } from "motion/react"
import { useAlerts } from "../../context/AlertContext"

export default function DrillListSection() {
    const queryClient = useQueryClient()
    const { addAlert } = useAlerts()
    const navigation = useContext(NavigationContext)

    const { data: result, isLoading, error, isError } = useQuery({
        queryFn: () => window.api.getDrills(),
        queryKey: ["drills"],
    })

    const drills = result?.success ? result.data : null

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
            console.log("edit successful.")
        } catch (_) {
            // TODO
            console.log("edit failed.")
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

        <div className={style.controls}>
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