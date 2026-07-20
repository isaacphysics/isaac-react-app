import React, {Dispatch, SetStateAction} from "react";
import {ParsonsItemDTO} from "../../../IsaacApiTypes";
import {
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    DraggingStyle,
    DropResult,
    NotDraggingStyle,
} from "@hello-pangea/dnd";
import _differenceBy from "lodash/differenceBy";
import {isDefined, PARSONS_MAX_INDENT} from "../../services";
import classNames from "classnames";
import {Immutable} from "immer";
import { Markup } from "../elements/markup";
import { Spacer } from "../elements/Spacer";

export const moveParsonsItem = (
    src: Immutable<ParsonsItemDTO>[] | undefined,
    fromIndex: number,
    dst: Immutable<ParsonsItemDTO>[] | undefined,
    toIndex: number,
    indent?: number
) => {
    if (!src || !dst) return;
    const srcItem = src.splice(fromIndex, 1)[0];
    dst.splice(toIndex, 0, {...srcItem, indentation: indent});
};

export const swapItemList = (
    srcItems: Immutable<ParsonsItemDTO>[],
    setSrcItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>> | ((items: Immutable<ParsonsItemDTO>[]) => void),
    dstItems: Immutable<ParsonsItemDTO>[],
    setDstItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>> | ((items: Immutable<ParsonsItemDTO>[]) => void),
    index: number,
    isParsons?: boolean
) => {
    const newSrcItems = [...srcItems];
    const newDstItems = [...dstItems];
    moveParsonsItem(newSrcItems, index, newDstItems, dstItems.length + 1, isParsons ? 0 : undefined);
    setSrcItems(newSrcItems);
    setDstItems(newDstItems);
};

export const handleParsonsItemDrag = (
    result: DropResult,
    availableItems: Immutable<ParsonsItemDTO>[],
    setAvailableItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>>,
    attemptItems: Immutable<ParsonsItemDTO>[],
    setAttemptItems: ((items: Immutable<ParsonsItemDTO>[]) => void),
    isParsons?: boolean,
    currentIndent?: number | null
) => {
    if (!result.source || !result.destination) {
        return;
    }
    if (result.source.droppableId === result.destination.droppableId && result.destination.droppableId === 'answerItems' && attemptItems) {
        // Reorder currentAttempt
        const items = [...attemptItems];
        moveParsonsItem(items, result.source.index, items, result.destination.index, isParsons ? (currentIndent || 0) : undefined);
        setAttemptItems(items);
    } else if (result.source.droppableId === result.destination.droppableId && result.destination.droppableId === 'availableItems') {
        // Reorder availableItems
        const items = [...availableItems];
        moveParsonsItem(items, result.source.index, items, result.destination.index, isParsons ? 0 : undefined);
        setAvailableItems(items);
    } else if (result.source.droppableId === 'availableItems' && result.destination.droppableId === 'answerItems') {
        // Move from availableItems to currentAttempt
        const srcItems = [...availableItems];
        const dstItems = [...attemptItems];
        moveParsonsItem(srcItems, result.source.index, dstItems, result.destination.index, isParsons ? (currentIndent || 0) : undefined);
        setAttemptItems(dstItems);
        setAvailableItems(srcItems);
    } else if (result.source.droppableId === 'answerItems' && result.destination.droppableId === 'availableItems' && attemptItems) {
        // Move from currentAttempt to availableItems
        const srcItems = [...attemptItems];
        const dstItems = [...availableItems];
        moveParsonsItem(srcItems, result.source.index, dstItems, result.destination.index, isParsons ? 0 : undefined);
        setAttemptItems(srcItems);
        setAvailableItems(dstItems);
    } else {
        console.error("Not sure how we got here...");
    }
};

export const onParsonsCurrentAttemptUpdate = (
    availableItems: Immutable<ParsonsItemDTO>[],
    setAvailableItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>>,
    attemptItems: Immutable<ParsonsItemDTO>[],
    docItems?: ParsonsItemDTO[]
) => {
    // This makes sure that available items and current attempt items contain different items.
    // This is because available items always start from the document's available items (see constructor)
    // and the current attempt is assigned afterwards, so we need to carve it out of the available items.
    // This also takes care of updating the two lists when a user moves items from one to the other.
    let fixedAvailableItems: ParsonsItemDTO[] = [];
    const currentAttemptItems = attemptItems;
    if (docItems) {
        fixedAvailableItems = docItems.filter(item => {
            let found = false;
            for (const i of currentAttemptItems) {
                if (i.id === item.id) {
                    found = true;
                    break;
                }
            }
            return !found;
        });
    }
    // WARNING: Inverting the order of the arrays breaks this.
    // TODO: Investigate if there is a method that gives more formal guarantees.
    const diff = _differenceBy(availableItems, fixedAvailableItems, 'id');
    // This stops re-rendering when availableItems have not changed from one state update to the next.
    // The set difference is empty if the two sets contain the same elements (by 'id', see above).
    if (diff.length > 0) {
        setAvailableItems(fixedAvailableItems);
    }
};

const getAccessibleItemName = (item: ParsonsItemDTO | Immutable<ParsonsItemDTO>) => {
    return (item?.altText || item?.value) 
        ? `item "${item?.altText || item?.value}"`
        : 'item';
};

interface ReorderButtonsProps {
    index: number;
    items: Immutable<ParsonsItemDTO>[];
    setItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>> | ((items: Immutable<ParsonsItemDTO>[]) => void);
    isParsons?: boolean;
    currentIndent?: number | null;
    inAvailableItems?: boolean;
}

const ReorderButtons = ({index, items, setItems, isParsons, currentIndent, inAvailableItems}: ReorderButtonsProps) => {
    const canReorderUp = index !== 0 && !inAvailableItems;
    const canReorderDown = index !== items.length - 1 && !inAvailableItems;
    return <div className="reorder-buttons">
        <button type="button" className={classNames("btn btn-blank py-1 px-0 m-0 border-0", {"disabled": !canReorderUp})}
            disabled={!canReorderUp} title={`Move ${getAccessibleItemName(items[index])} up`} onClick={() => {
                const newItems = [...items];
                moveParsonsItem(newItems, index, newItems, index-1, isParsons ? currentIndent || 0 : undefined);
                setItems(newItems);
            }}
        >
            <i className={classNames("icon icon-chevron-up", canReorderUp ? "icon-color-muted-hoverable icon-color-theme-on-hover" : "icon-color-disabled")} />
        </button>
        <button type="button" className={classNames("btn btn-blank py-1 px-0 m-0 border-0", {"disabled": !canReorderDown})}
            disabled={!canReorderDown} title={`Move ${getAccessibleItemName(items[index])} down`} onClick={() => {
                const newItems = [...items];
                moveParsonsItem(newItems, index, newItems, index+1, isParsons ? currentIndent || 0 : undefined);
                setItems(newItems);
            }}
        >
            <i className={classNames("icon icon-chevron-down", canReorderDown ? "icon-color-muted-hoverable icon-color-theme-on-hover" : "icon-color-disabled")} />
        </button>
    </div>;
};

interface IndentButtonsProps {
    currentItem: Immutable<ParsonsItemDTO>;
    index: number;
    items: Immutable<ParsonsItemDTO>[];
    setItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>> | ((items: Immutable<ParsonsItemDTO>[]) => void);
    canIndent?: boolean;
}

const IndentButtons = ({currentItem, index, items, setItems, canIndent}: IndentButtonsProps) => {
    const getPreviousItemIndentation = (index: number) => {
        const newItems = [...(items || [])];
    
        return newItems[Math.max(0, index-1)].indentation || 0;
    };

    const reduceIndentation = (index: number) => {
        const newItems = [...(items || [])];
    
        if (isDefined(newItems[index].indentation)) {
            const indentedItem = {...newItems[index], indentation: Math.max((newItems[index].indentation || 0) - 1, 0)};
            newItems.splice(index, 1, indentedItem);
        }
        setItems(newItems);
    };

    const increaseIndentation = (index: number) => {
        if (index === 0) return;

        const newItems = [...(items || [])];
        // This condition is insane but of course 0, undefined, and null are all false-y.
        if (isDefined(newItems[index].indentation)) {
            const indentedItem = {...newItems[index], indentation: Math.min(
                (newItems[index].indentation || 0) + 1, Math.min((newItems[Math.max(index-1, 0)].indentation || 0) + 1, PARSONS_MAX_INDENT)
            )};
            newItems.splice(index, 1, indentedItem);
        }
        setItems(newItems);
    };

    const canDecreaseIndentation = canIndent && isDefined(currentItem?.indentation) && currentItem.indentation > 0;
    const canIncreaseIndentation = canIndent && isDefined(currentItem?.indentation) && index !== 0 && 
        currentItem.indentation <= getPreviousItemIndentation(index) && currentItem.indentation < PARSONS_MAX_INDENT;
    return <div className="indent-buttons">
        <button
            type="button" className={`reduce ${canDecreaseIndentation ? 'show' : 'hide'} me-1`}
            onClick={() => reduceIndentation(index)} aria-label={classNames(`Reduce indentation for ${getAccessibleItemName(currentItem)}`, {"(disabled)": !canDecreaseIndentation})}
            disabled={!canDecreaseIndentation}
        >
            <i className="icon icon-chevron-left icon-color-white" />
        </button>
        <button
            type="button" className={`increase ${canIncreaseIndentation ? 'show' : 'hide'} me-2`}
            onClick={() => increaseIndentation(index)} aria-label={classNames(`Increase indentation for ${getAccessibleItemName(currentItem)}`, {"(disabled)": !canIncreaseIndentation})}
            disabled={!canIncreaseIndentation}
        >
            <i className="icon icon-chevron-right icon-color-white" />
        </button>
    </div>;
};

type BaseDraggableProps = {
    currentItem: Immutable<ParsonsItemDTO>;
    index: number;
    items: Immutable<ParsonsItemDTO>[];
    setItems: Dispatch<SetStateAction<Immutable<ParsonsItemDTO>[]>> | ((items: Immutable<ParsonsItemDTO>[]) => void);
    swapItemList: () => void;
    readonly?: boolean;
};

type AvailableItemsProps = {
    inAvailableItems: true;
    isParsons?: boolean;
    canIndent?: false;
};

type AttemptItemsProps = {
    inAvailableItems?: false;
} & (
    { isParsons: true; canIndent?: boolean; } |
    { isParsons?: false; canIndent?: false; }
);

export type ParsonsDraggableItemProps = BaseDraggableProps & (AvailableItemsProps | AttemptItemsProps);

export const ParsonsDraggableItem = ({currentItem, index, items, setItems, inAvailableItems, readonly, swapItemList, canIndent, isParsons}: ParsonsDraggableItemProps) => {
    const getStyle = (style: DraggingStyle | NotDraggingStyle | undefined, snapshot: DraggableStateSnapshot) => {
        if (!snapshot.isDropAnimating || !isParsons) return style;
        
        return {
            ...style,
            // cannot be 0, but make it super tiny
            transitionDuration: `0.001s`,
        };
    };

    const markupItem = <Markup trusted-markup-encoding={"html"}>
        {currentItem.value}
    </Markup>;

    const itemType = `${isParsons ? "parsons" : "reorder"}-item`;
    return <Draggable
        key={currentItem.id}
        draggableId={`${currentItem.id || index}|${itemType}-${inAvailableItems ? "available" : "choice"}`}
        index={index}
        isDragDisabled={readonly}
    >
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
            return <div
                id={`${currentItem.id || index}|${itemType}-${inAvailableItems ? "available" : "choice"}`}
                className={`${itemType} indent-${currentItem.indentation}`}
                ref={provided.innerRef}
                aria-label={getAccessibleItemName(currentItem)}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getStyle(provided.draggableProps.style, snapshot)}
                aria-describedby={undefined}
            >
                <ReorderButtons index={index} items={items} setItems={setItems} isParsons={isParsons} currentIndent={currentItem.indentation} inAvailableItems={inAvailableItems} />
                {isParsons ? <pre className="item-text">{markupItem}</pre> : <div className="item-text">{markupItem}</div>}
                <Spacer/>
                <div className="hidden-buttons d-flex">
                    <button
                        type="button" className="swap-button btn btn-blank py-1 px-0 m-0 me-2 border-0" 
                        title={
                            inAvailableItems
                                ? `Move ${getAccessibleItemName(currentItem)} into your answer`
                                : `Move ${getAccessibleItemName(currentItem)} back to the items list`
                        }
                        onClick={swapItemList}
                    >
                        <i className="icon icon-sm icon-arrow-left-right icon-color-muted-hoverable icon-color-theme-on-hover" />
                    </button>
                    {canIndent && <IndentButtons currentItem={currentItem} index={index} items={items} setItems={setItems} canIndent={canIndent}/>}
                </div>
            </div>;
        }}
    </Draggable>;
};
