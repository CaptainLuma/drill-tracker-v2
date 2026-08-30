import { useEffect, useImperativeHandle, useState, type Ref } from "react"
// import style from "./TagList.module.css"

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

export default function TagList({ tags, toggledTags, ref }: Props) {
    const toggledIds = new Set(toggledTags.map(t => t.id))

    const [ tagButtons, setTagButtons ] = useState<TagButtonData[]>(tags.map(t => ({
        id: t.id, 
        toggled: toggledIds.has(t.id)
    })))

    // update tagButtonData when the toggledTags prop is changed
    useEffect(() => {
        const toggledIds = new Set(toggledTags.map(t => t.id))
        
        setTagButtons(tags.map(t => ({
            id: t.id, 
            toggled: toggledIds.has(t.id)
        })))
    }, [tags, toggledTags]) 

    useImperativeHandle(ref, () => ({
        getToggledTags: () => {
            return tagButtons.filter(t => t.toggled).map(t => t.id)
        },
    }), [tagButtons])

    function handleTagToggled(id: number) {
        setTagButtons(prev => prev.map(item =>
            item.id === id ? { ...item, toggled: !item.toggled } : item
        ))
    }

    return (<div className="tagContainer">
        {tags && 
            tags.map(tag => (
                <button
                    key={tag.id}
                    className="tag clickable"
                    onClick={() => handleTagToggled(tag.id)}
                    style={tagButtons.find(b => b.id === tag.id)?.toggled
                        ? { backgroundColor: tag.color, color: "#FFFFFF" }
                        : undefined}
                >{tag.name}</button>
            ))
        }
    </div>)
}