import Alert from "../Alert/Alert"
import { useAlerts } from "../../context/AlertContext"

export default function AlertsList() {
    const { alerts, removeAlert } = useAlerts()

    return (<div>
        {alerts.map(alert => (
            <Alert
                key={alert.id}
                message={alert.message}
                type={alert.type}
                onClose={() => removeAlert(alert.id)}
            />
        ))}
    </div>)
}