import { useQuery } from "@tanstack/react-query"

export default function DemoComponent() {
    // this line is to test that the api call works without useQuery
    // window.api.test().then(res => console.log(res))

    const { data: testData, isLoading } = useQuery({
        queryFn: () => window.api.test(),
        queryKey: ["test"],
    })

    if (isLoading) {
        return (<p>Loading...</p>)
    }

    return (<>
        <p>{testData}</p>
    </>)
}