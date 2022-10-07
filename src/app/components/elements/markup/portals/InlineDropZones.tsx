import {ClozeDropRegionContext} from "../../../../../IsaacAppTypes";
import ReactDOM from "react-dom";
import React, {useContext, useEffect} from "react";
import {ContentDTO, ItemDTO} from "../../../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "../../../content/IsaacContentValueOrChildren";
import {Badge} from "reactstrap";
import {Immutable} from "immer";
import {useDroppable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {useSortable} from "@dnd-kit/sortable";
import classNames from "classnames";

export function Item({item, id, type, overrideOver}: {item: Immutable<ItemDTO>, id: string, type: "drop-zone" | "item-section", overrideOver?: boolean}) {
    const {attributes, listeners, setNodeRef, isDragging, isOver, transform, transition} = useSortable({
        id,
        data: { type }
    });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: (overrideOver || isOver) || isDragging ? "0.2" : "1"
    };

    return <Badge id={id} className={classNames(type === "item-section" && "m-2", "p-2 cloze-item")} style={style} innerRef={setNodeRef} {...listeners} {...attributes}>
        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
            {item.children as ContentDTO[]}
        </IsaacContentValueOrChildren>
    </Badge>;
}

// Inline droppables rendered for each registered drop region
function InlineDropRegion({id, index, emptyWidth, emptyHeight, rootElement}: {id: string; index: number; emptyWidth?: string; emptyHeight?: string; rootElement?: HTMLElement}) {
    const dropRegionContext = useContext(ClozeDropRegionContext);
    const droppableId = `drop-zone-${index + 1}`;

    useEffect(() => {
        // Register with the current cloze question on first render
        dropRegionContext?.register(droppableId, index);
    }, []);

    const item = dropRegionContext ? dropRegionContext.inlineDropValueMap[droppableId] : undefined;

    const droppableTarget = rootElement?.querySelector(`#${id}`);

    const {isOver, setNodeRef} = useDroppable({
        id: droppableId
    });

    const height = (item || !emptyHeight) ? "auto" : (emptyHeight + "px");
    const width = (item || !emptyWidth) ? "auto" : (emptyWidth + "px");

    if (dropRegionContext && droppableTarget) {
        return ReactDOM.createPortal(
            <span
                style={{minHeight: height, minWidth: width}}
                className={classNames("d-inline-block cloze-drop-zone", !item && `rounded bg-grey border ${isOver ? "border-dark" : "border-light"}`)}
                ref={setNodeRef}
            >
                {item
                    ? <Item item={item} id={item.replacementId as string} type={"drop-zone"} overrideOver={isOver}/>
                    : <>&nbsp;</>
                }
            </span>,
            droppableTarget
        );
    }
    return null;
}
export default InlineDropRegion;