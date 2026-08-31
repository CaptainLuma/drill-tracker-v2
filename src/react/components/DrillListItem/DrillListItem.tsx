import type { Drill } from "../../../shared/models/drill";
import { useContext, useState } from "react";
import style from "./DrillListItem.module.css"
import imageDropdown from "../../../assets/images/dropdown.svg"
import imageHollowPin from "../../../assets/images/pin-hollow.svg"
import imageFilledPin from "../../../assets/images/pin-filled.svg"
import { AnimatePresence, motion } from "motion/react"
import { NavigationContext } from "../../App";
import TagList from "../TagList/TagList";

interface Props {
    drill: Drill;
    onPin: (id: number) => void
}

const animationMovementSpeed = 0.3
// const animationInOutSpeed = 0.1

export default function DrillListItem({ drill, onPin }: Props) {
    const [ expanded, setExpanded ] = useState(false)
    // const [ pinned, setPinned ] = useState(false)

    const navigation = useContext(NavigationContext)

    return (<motion.div
        className={style.drillListItem}
        layout
        initial={false}
        transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            layout: {
                duration: animationMovementSpeed,
                ease: "easeInOut"
            }
        }}
    >
        <div className={`${style.header} ${drill.pinned ? style.headerPinned : ""}`}>
            <img
                src={imageDropdown} 
                alt="expand" 
                onClick={() => setExpanded(!expanded)}
            />
            <h3>{drill.name}</h3>

            <TagList
                tags={drill.events}
                notButtons={true}
            />
            
            <div className={style.headerControls}>
                <button
                    onClick={() => navigation?.navigateToPage({
                        page: "add drill page",
                        drillId: drill.id
                    })}
                >Edit</button>
                <img 
                    // src={pinned ? imageFilledPin : imageHollowPin}
                    src={drill.pinned ? imageFilledPin : imageHollowPin}
                    alt="Pin"
                    onClick={() => onPin(drill.id)}
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
                    transition={{ duration: animationMovementSpeed, ease: "easeInOut" }}
                >
                    <div className={style.body}>
                        <p>{drill.description}</p>

                        { drill.levels && drill.levels.length > 0 && <>
                            <h4>Levels:</h4>
                            <TagList
                                tags={drill.levels}
                                notButtons={true}
                            />
                        </>}
                        
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>)
}