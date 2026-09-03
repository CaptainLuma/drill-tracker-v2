import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react"
import TagList from "../TagList/TagList"

interface Tag {
    id: number
    name: string
    color: string
    dateCreated: Date,
    dateModified: Date
}

interface TagButtonData {
    id: number,
    toggled: boolean
}

export type TagListRef = {
    getToggledTags: () => number[]
}

interface Props {
    tags: Tag[]
    toggledTags: Tag[]
    ref: Ref<TagListRef>
}

export default function TagListState({ tags, toggledTags, ref }: Props) {
    const toggledIds = new Set(toggledTags.map(t => t.id))
    const previousToggledTagIds = useRef(toggledTags.map(t => t.id))

    const [ tagButtons, setTagButtons ] = useState<TagButtonData[]>(tags.map(t => ({
        id: t.id, 
        toggled: toggledIds.has(t.id)
    })))

    // update tagButtonData when the toggledTags prop is changed
    useEffect(() => {
        const toggledIds = new Set(toggledTags.map(t => t.id))
        const currentToggledTagIds = toggledTags.map(t => t.id)
        const toggledTagsChanged = currentToggledTagIds.length !== previousToggledTagIds.current.length ||
            currentToggledTagIds.some((id, index) => id !== previousToggledTagIds.current[index])

        setTagButtons(prev => tags.map(t => ({
            id: t.id,
            toggled: toggledTagsChanged
                ? toggledIds.has(t.id)
                : prev.find(button => button.id === t.id)?.toggled ?? false
        })))
        previousToggledTagIds.current = currentToggledTagIds
    }, [tags, toggledTags]) 

    useImperativeHandle(ref, () => ({
        getToggledTags: () => {
            return tagButtons.filter(t => t.toggled).map(t => t.id)
        },
    }), [tagButtons])

    function handleTagToggled(id: number) {
        setTagButtons(prev => {
            if (!prev.some(item => item.id === id))
                return [...prev, { id, toggled: true }]

            return prev.map(item =>
                item.id === id ? { ...item, toggled: !item.toggled } : item
            )
        })
    }

    return (<>
        <TagList
            tags={tags}
            toggleData={tagButtons}
            onTagClicked={handleTagToggled}
        />
    </>)
}