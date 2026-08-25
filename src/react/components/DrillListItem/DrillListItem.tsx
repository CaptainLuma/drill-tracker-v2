import type { Drill } from "../../../shared/models/drill";
import { useState } from "react";
import style from "./DrillListItem.module.css"
import imageDropdown from "../../../assets/images/dropdown.svg"
import imageHollowPin from "../../../assets/images/pin-hollow.svg"
import imageFilledPin from "../../../assets/images/pin-filled.svg"
import { AnimatePresence, motion } from "motion/react"

interface Props {
    drill: Drill
}

const animationSpeed = 0.3

export default function DrillListItem({ drill }: Props) {
    const [ expanded, setExpanded ] = useState(false)
    const [ pinned, setPinned ] = useState(false)

    return (<motion.div
        className={style.drillListItem}
        layout="position"
        transition={{
            layout: {
                duration: animationSpeed,
                ease: "easeInOut"
            }
        }}
    >
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

        <AnimatePresence initial={false}>
            {expanded && (
                <motion.div
                    className={style.bodyWrapper}
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: animationSpeed, ease: "easeInOut" }}
                >
                    <div className={style.body}>
                        <p>{drill.description}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>)
}