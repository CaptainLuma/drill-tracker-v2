import type { Drill } from "../../../shared/models/drill";
import { useState } from "react";
import style from "./DrillListItem.module.css"
import imageDropdown from "../../../assets/images/dropdown.svg"
import imageHollowPin from "../../../assets/images/pin-hollow.svg"
import imageFilledPin from "../../../assets/images/pin-filled.svg"

interface Props {
    drill: Drill
}

export default function DrillListItem({ drill }: Props) {
    const [ expanded, setExpanded ] = useState(false)
    const [ pinned, setPinned ] = useState(false)

    return (<div className={style.drillListItem}>
        <div className={style.header}>
            <img
                src={imageDropdown} 
                alt="expand" 
                onClick={() => setExpanded(!expanded)}
                />
            <h3>{drill.name}</h3>
            <div className={style.headerControls}>
                <button>Edit</button>
                <img 
                    src={pinned ? imageFilledPin : imageHollowPin}
                    alt="Pin"
                    onClick={() => setPinned(!pinned)}
                    />
            </div>
        </div>

        <div className={`${style.body} ${expanded ? "" : style.hidden}`}>
            <p>{drill.description}</p>
        </div>
    </div>)
}