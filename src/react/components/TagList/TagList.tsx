import { useImperativeHandle, useState, type Ref } from "react"
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
    ref: Ref<TagListRef>
}

export default function TagList({ tags, ref }: Props) {
    const [ tagButtons, setTagButtons ] = useState<TagButtonData[]>(tags.map(t => ({
        id: t.id, 
        toggled: false
    })))

    useImperativeHandle(ref, () => ({
        getToggledTags: () => {
            return tagButtons.filter(t => t.toggled).map(t => t.id)
        },
    }));

    function handleTagToggled(id: number) {
        const tagButtonsCopy = tagButtons.map(item => ({ ...item }));
        const tagButton = tagButtonsCopy.find(x => x.id === id)!
        tagButton.toggled = !tagButton.toggled
        setTagButtons(tagButtonsCopy)
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