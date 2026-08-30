import style from "./TagList.module.css"

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

interface Props {
    tags: Tag[]
    toggleData?: TagButtonData[]
    onTagClicked?: (id: number) => void
    notButtons?: boolean
}

export default function TagList({ tags, toggleData = [], onTagClicked, notButtons = false }: Props) {
    function getButtonStyle(tag: Tag) {
        if (notButtons)
            return { backgroundColor: tag.color, color: "#FFFFFF" }

        return toggleData.find(b => b.id === tag.id)?.toggled ? 
            { backgroundColor: tag.color, color: "#FFFFFF" }
            : undefined
    }

    return (<div className={style.tagContainer}>
        {tags && 
            tags.map(tag => (
                <button
                    key={tag.id}
                    className={`${style.tag} clickable`}
                    onClick={() => onTagClicked?.(tag.id)}
                    style={getButtonStyle(tag)}
                >{tag.name}</button>
            ))
        }
    </div>)
}