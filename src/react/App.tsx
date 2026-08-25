import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DrillListSection from "./components/DrillListSection/DrillListSection"
import { useRef, useState, createContext } from "react"
import AddDrillSection from "./components/AddDrillSection/AddDrillSection"
import { AlertProvider, useAlerts } from "./context/AlertContext"
import ConfirmModal from "./components/ConfirmModal/ConfirmModal"

// type Page = "drill list page" | "add drill page"

type NavigationState = {
	page: "drill list page"
} | {
	page: "add drill page"
	drillId: number | null
}

type NavigationContextType = {
	navigationState: NavigationState,
	navigateToPage: (navigationState: NavigationState, removeAlerts?: boolean) => void
}

type ConfirmModalState = {
	message: string
	forceYes?: boolean
} | null

type ConfirmModalContextType = {
	openConfirmModal: (message: string, forceYes?: boolean) => Promise<boolean>
}

export const NavigationContext = createContext<NavigationContextType | null>(null)
export const ConfirmModalContext = createContext<ConfirmModalContextType | null>(null)

const queryClient = new QueryClient()

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AlertProvider>
				<AppContent />
			</AlertProvider>
		</QueryClientProvider>
	)
}



function AppContent() {
	const [ navigationState, setNavigationState ] = useState<NavigationState>({
		page: "drill list page"
	})

	const [ confirmModalState, setConfirmModalState ] = useState<ConfirmModalState>(null)
	const confirmResolverRef = useRef<((response: boolean) => void) | null>(null)
	
	const { clearAlerts } = useAlerts()
	
	function navigateToPage(navigationState: NavigationState, removeAlerts = true) {
		if (removeAlerts) clearAlerts()
		setNavigationState(navigationState)
	}

	function openConfirmModal(message: string, forceYes?: boolean): Promise<boolean> {
		confirmResolverRef.current?.(false) // if a confirm modal is opened before the previous is closed, this will resolve the previous confirmation as false

		return new Promise(resolve => {
			confirmResolverRef.current = resolve
			setConfirmModalState({ 
				message: message,
				forceYes: forceYes
			})
		})
	}

	function closeConfirmModal(response: boolean) {
		setConfirmModalState(null)
		confirmResolverRef.current?.(response)
		confirmResolverRef.current = null
	}

	function onConfirmModalNo() {
		closeConfirmModal(false)
	}

	function onConfirmModalYes() {
		closeConfirmModal(true)
	}

	function getOpenPageComponent() {
		switch (navigationState.page) {
			case "drill list page": return <DrillListSection />;
			case "add drill page": return <AddDrillSection />;
		}
	}

	return (<>
		<NavigationContext.Provider value={{
			navigationState: navigationState,
			navigateToPage: navigateToPage
		}}>
			<ConfirmModalContext value={{
				openConfirmModal: openConfirmModal
			}}>
				{getOpenPageComponent()}
			</ConfirmModalContext>

			{ confirmModalState &&
				<ConfirmModal
					message={confirmModalState.message}
					onNo={onConfirmModalNo}
					onYes={onConfirmModalYes}
					forceYes={confirmModalState.forceYes}
				/>
			}
			

		</NavigationContext.Provider>
	</>)
}