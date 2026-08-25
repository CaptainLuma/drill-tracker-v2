import style from "./ConfirmModal.module.css"

interface Props {
    message: string;
    onNo: () => void;
    onYes: () => void;
}

export default function ConfirmModal(props: Props) {
    return (<>
        <div className={style.background}>
            <div className={style.modal}>
                <h3>{props.message}</h3>
                <div className={style.modalButtons}>
                    <button onClick={props.onNo}>No</button>
                    <button onClick={props.onYes}>Yes</button>
                </div>
            </div>
        </div>
    </>)
}