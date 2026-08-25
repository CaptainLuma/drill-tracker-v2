import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import DrillListSection from "./components/DrillListSection/DrillListSection"
import { useState, createContext } from "react"
import AddDrillSection from "./components/AddDrillSection/AddDrillSection"
import { AlertProvider } from "./context/AlertContext"

type Page = "drill list page" | "add drill page"

type NavigationContextType = {
	openPage: Page,
	navigateToPage: (page: Page) => void
}

export const NavigationContext = createContext<NavigationContextType | null>(null)

const queryClient = new QueryClient()

export default function App() {
	const [ openPage, setOpenPage ] = useState<Page>("drill list page")

	function getOpenPageComponent() {
		switch (openPage) {
			case "drill list page": return <DrillListSection />;
			case "add drill page": return <AddDrillSection />;
		}
	}
	
	function navigateToPage(page: Page) {
		setOpenPage(page)
	}

	return (<>
		<QueryClientProvider client={queryClient}>
			<AlertProvider>
				<NavigationContext.Provider value={{
					openPage,
					navigateToPage
				}}>
					{getOpenPageComponent()}
				</NavigationContext.Provider>
			</AlertProvider>
		</QueryClientProvider>
	</>)
}