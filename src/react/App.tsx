import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DrillListSection from "./components/DrillListSection/DrillListSection"
import { useState, createContext } from "react"
import AddDrillSection from "./components/AddDrillSection/AddDrillSection"
import { AlertProvider, useAlerts } from "./context/AlertContext"

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

export const NavigationContext = createContext<NavigationContextType | null>(null)

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
	
	const { clearAlerts } = useAlerts()

	function getOpenPageComponent() {
		switch (navigationState.page) {
			case "drill list page": return <DrillListSection />;
			case "add drill page": return <AddDrillSection />;
		}
	}
	
	function navigateToPage(navigationState: NavigationState, removeAlerts = true) {
		if (removeAlerts) clearAlerts()
		setNavigationState(navigationState)
	}

	return (<>
		<NavigationContext.Provider value={{
			navigationState: navigationState,
			navigateToPage: navigateToPage
		}}>
			{getOpenPageComponent()}
		</NavigationContext.Provider>
	</>)
}