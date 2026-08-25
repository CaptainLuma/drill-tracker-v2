import { createContext, useContext, useState, type ReactNode } from "react"

export type AlertType = "info" | "danger"

export interface AlertData {
    id: string
    message: string
    type?: AlertType
}

interface NewAlert {
    message: string
    type?: AlertType
}

interface AlertContextValue {
    alerts: AlertData[]
    addAlert: (alert: NewAlert) => void
    removeAlert: (id: string) => void
    clearAlerts: () => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<AlertData[]>([])

    function addAlert(alert: NewAlert) {
        setAlerts(currentAlerts => [
            ...currentAlerts,
            { ...alert, id: crypto.randomUUID() }
        ])
    }

    function removeAlert(id: string) {
        setAlerts(currentAlerts => currentAlerts.filter(alert => alert.id !== id))
    }

    function clearAlerts() {
        setAlerts([])
    }

    return (
        <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
            {children}
        </AlertContext.Provider>
    )
}

export function useAlerts() {
    const context = useContext(AlertContext)

    if (!context)
        throw new Error("useAlerts must be used inside an AlertProvider")

    return context
}