import style from "./ConfirmModal.module.css"

interface Props {
    message: string;
    onNo: () => void;
    onYes: () => void;
    forceYes?: boolean;
}

export default function ConfirmModal({ message, onNo, onYes, forceYes = false }: Props) {
    return (<>
        <div className={style.background}>
            <div className={style.modal}>
                <h3>{message}</h3>
                <div className={style.modalButtons}>
                    {!forceYes && <button onClick={onNo}>No</button>}
                    <button onClick={onYes}>Yes</button>
                </div>
            </div>
        </div>
    </>)
}