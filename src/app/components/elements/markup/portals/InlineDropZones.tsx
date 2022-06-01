import {ClozeDropRegionContext} from "../../../../../IsaacAppTypes";
import {Draggable, Droppable, DropResult} from "react-beautiful-dnd";
import ReactDOM from "react-dom";
import React, {useCallback, useContext, useEffect} from "react";
import {ItemDTO} from "../../../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "../../../content/IsaacContentValueOrChildren";
import {Badge} from "reactstrap";

export function Item({item}: {item: ItemDTO}) {
    return <Badge className="m-2 p-2">
        <IsaacContentValueOrChildren value={item.value} encoding={item.encoding || "html"}>
            {item.children}
        </IsaacContentValueOrChildren>
    </Badge>;
}

// Inline droppables rendered for each registered drop region
function InlineDropRegion({id, index, rootElement}: {id: string; index: number; rootElement?: HTMLElement}) {
    const dropRegionContext = useContext(ClozeDropRegionContext);

    useEffect(() => {
        // Register with the current cloze question on first render
        dropRegionContext?.register(id, index);
    }, []);

    const clearInlineDropZone = useCallback(() => {
        if (!dropRegionContext) return;
        dropRegionContext.updateAttemptCallback({source: {droppableId: id, index: 0}, draggableId: (dropRegionContext.inlineDropValueMap[id]?.replacementId as string)} as DropResult);
    }, [dropRegionContext]);

    const item = dropRegionContext ? dropRegionContext.inlineDropValueMap[id] : undefined;

    const droppableTarget = rootElement?.querySelector(`#${id}`);

    if (dropRegionContext && droppableTarget) {
        return ReactDOM.createPortal(
            <div style={{minHeight: "inherit", position: "relative", margin: "2px"}} className={"cloze-drop-zone"}>
                <Droppable droppableId={id} isDropDisabled={dropRegionContext.readonly} direction="vertical" >
                    {(provided, snapshot) => <div
                        ref={provided.innerRef} {...provided.droppableProps}
                        className={`d-flex justify-content-center align-items-center bg-grey rounded w-100 overflow-hidden ${dropRegionContext.borderMap[id] && "border border-dark"}`}
                        style={{minHeight: "inherit"}}
                    >
                        {item && <Draggable key={item.replacementId} draggableId={item?.replacementId as string} index={0} isDragDisabled={true}>
                            {(provided, snapshot) =>
                                <div
                                    className={"cloze-draggable mr-4"} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                >
                                    <Item item={item}/>
                                </div>
                            }
                        </Draggable>}
                        {!item && "\u00A0"}
                    </div>}
                </Droppable>
                {item && <button aria-label={`Clear drop zone ${index + 1}`} className={"cloze-inline-clear no-print"} onClick={clearInlineDropZone} tabIndex={0}>
                    <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"
                         className="cloze-clear-cross">
                        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"/>
                    </svg>
                </button>}
            </div>,
            droppableTarget);
    }
    return null;
}
export default InlineDropRegion;