import style from "./Alert.module.css"
import imageClose from "../../../assets/images/close-ellipse.svg"
import type { AlertType } from "../../context/AlertContext"

interface Props {
    message: string
    type?: AlertType
    onClose: () => void
}

export default function Alert({ message, type = "info", onClose }: Props) {
    return (<>
        <div 
            className={`${style.alert} ${type == "info" ? style.info : style.danger}`}
        >
            <p>{message}</p>
            <img 
                src={imageClose} 
                alt="close" 
                onClick={onClose}
            />
        </div>
    </>)
}