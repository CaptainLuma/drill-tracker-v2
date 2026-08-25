import { useQuery } from "@tanstack/react-query"
import DrillListItem from "../DrillListItem/DrillListItem"
import type { Drill } from "../../../shared/models/drill"
// import DrillList from "./DrillList"
import style from "./DrillListSection.module.css"
import { useContext } from "react"
import { NavigationContext } from "../../App"
import AlertsList from "../AlertsList/AlertsList"
import { useAlerts } from "../../context/AlertContext"

export default function DrillListSection() {
    const { clearAlerts } = useAlerts()

    const { data: result, isLoading } = useQuery({
        queryFn: () => window.api.getDrills(),
        queryKey: ["test"],
    })

    const navigation = useContext(NavigationContext)

    function RenderDrillList(drills: Drill[]) {
        return (<>
            <div className={style.drillList}>
                {drills.map(drill => (
                    <DrillListItem 
                        key={drill.id}
                        drill={drill} 
                    />
                ))}
            </div>
        </>)
    }

    return (<section className={style.drillListSection}>
        <h1>Drill Tracker</h1>

        <AlertsList />

        <div className={style.controls}>
            <button
                onClick={() => {
                    clearAlerts()
                    navigation?.navigateToPage("add drill page")
                }}
            >Add Drill</button>
        </div>

        {isLoading ? <p>Loading...</p> : null}

        {result?.success ? 
            RenderDrillList(result?.data) : null
        }
    </section>)
}