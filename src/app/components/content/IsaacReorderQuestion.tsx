import React, {useEffect, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacReorderQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {Col, Row} from "reactstrap";
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult
} from "react-beautiful-dnd";
import _differenceBy from "lodash/differenceBy";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";
import {TrustedHtml} from "../elements/TrustedHtml";

const ReorderDraggableItem = ({item, index, inAvailableItems, readonly}: {item: ItemDTO; index: number; inAvailableItems?: boolean; readonly?: boolean}) => {
    return <Draggable
        key={item.id}
        draggableId={`${item.id || index}|reorder-item-choice`}
        index={index}
        isDragDisabled={readonly}
    >
        {(provided) => {
            return <div
                id={`${item.id || index}|reorder-item-${inAvailableItems ? "available" : "choice"}`}
                className={`reorder-item`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={provided.draggableProps.style}
            >
                <TrustedHtml html={item.value ?? ""}/>
            </div>
        }}
    </Draggable>
}

export const IsaacReorderQuestion = ({doc, questionId, readonly} : IsaacQuestionProps<IsaacReorderQuestionDTO>) => {

    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);

    const [availableItems, setAvailableItems] = useState<ItemDTO[]>([...doc.items ?? []]);

    const moveItem = (src: ItemDTO[] | undefined, fromIndex: number, dst: ItemDTO[] | undefined, toIndex: number) => {
        if (!src || !dst) return;
        const srcItem = src.splice(fromIndex, 1)[0];
        dst.splice(toIndex, 0, srcItem);
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.source || !result.destination) {
            return;
        }
        if (result.source.droppableId === result.destination.droppableId && result.destination.droppableId === 'answerItems' && currentAttempt) {
            // Reorder currentAttempt
            const items = [...(currentAttempt?.items || [])];
            moveItem(items, result.source.index, items, result.destination.index);
            dispatchSetCurrentAttempt({...currentAttempt, items});
        } else if (result.source.droppableId === result.destination.droppableId && result.destination.droppableId === 'availableItems') {
            // Reorder availableItems
            const items = [...availableItems];
            moveItem(items, result.source.index, items, result.destination.index);
            setAvailableItems(items);
        } else if (result.source.droppableId === 'availableItems' && result.destination.droppableId === 'answerItems') {
            // Move from availableItems to currentAttempt
            const srcItems = [...availableItems];
            const dstItems = [...(currentAttempt?.items || [])];
            moveItem(srcItems, result.source.index, dstItems, result.destination.index);
            dispatchSetCurrentAttempt({type: "itemChoice", items: dstItems});
            setAvailableItems(srcItems);
        } else if (result.source.droppableId === 'answerItems' && result.destination.droppableId === 'availableItems' && currentAttempt) {
            // Move from currentAttempt to availableItems
            const srcItems = [...(currentAttempt?.items || [])];
            const dstItems = [...availableItems];
            moveItem(srcItems, result.source.index, dstItems, result.destination.index);
            dispatchSetCurrentAttempt({...currentAttempt, items: srcItems});
            setAvailableItems(dstItems);
        } else {
            console.error("Not sure how we got here...");
        }
    }

    const onCurrentAttemptUpdate = (newCurrentAttempt?: ItemChoiceDTO, newAvailableItems?: ItemDTO[]) => {
        if (!newCurrentAttempt) {
            const defaultAttempt: ItemChoiceDTO = {
                type: "itemChoice",
                items: [],
            }
            dispatchSetCurrentAttempt(defaultAttempt);
        }
        if (newCurrentAttempt) {
            // This makes sure that available items and current attempt items contain different items.
            // This is because available items always start from the document's available items (see constructor)
            // and the current attempt is assigned afterwards, so we need to carve it out of the available items.
            // This also takes care of updating the two lists when a user moves items from one to the other.
            let fixedAvailableItems: ItemDTO[] = [];
            const currentAttemptItems: ItemDTO[] = newCurrentAttempt.items || [];
            if (doc.items) {
                fixedAvailableItems = doc.items.filter(item => {
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
            const diff = _differenceBy(newAvailableItems, fixedAvailableItems, 'id');
            // This stops re-rendering when availableItems have not changed from one state update to the next.
            // The set difference is empty if the two sets contain the same elements (by 'id', see above).
            if (diff.length > 0) {
                setAvailableItems(fixedAvailableItems);
            }
        }
    }

    useEffect(() => {
        onCurrentAttemptUpdate(currentAttempt, availableItems);
    }, [currentAttempt, availableItems])

    return <div className="parsons-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        <Row className="my-md-3">
            <DragDropContext onDragEnd={onDragEnd}>
                <Col md={{size: 6}} className="parsons-available-items">
                    <h4>Available items</h4>
                    <Droppable droppableId="availableItems">
                        {(provided, snapshot) =>
                            <div ref={provided.innerRef}
                                        className={classNames("parsons-items", {"empty": !(availableItems && availableItems.length > 0), "drag-over": snapshot.isDraggingOver})}>
                                {availableItems && availableItems.map((item, index) =>
                                    <ReorderDraggableItem item={item} index={index} inAvailableItems readonly={readonly}/>)}
                                {(!availableItems || availableItems.length === 0)
                                    ? <div>&nbsp;</div>
                                    : provided.placeholder}
                            </div>
                        }
                    </Droppable>
                </Col>
                <Col md={{size: 6}} className="no-print">
                    <h4 className="mt-sm-4 mt-md-0">Your answer</h4>
                    <Droppable droppableId="answerItems">
                        {(provided, snapshot) =>
                            <div id="parsons-choice-area" ref={provided.innerRef}
                                        className={classNames("parsons-items", {"empty": !(currentAttempt && currentAttempt.items && currentAttempt.items.length > 0), "drag-over": snapshot.isDraggingOver})}>
                                {currentAttempt && currentAttempt.items && currentAttempt.items.map((item, index) =>
                                    <ReorderDraggableItem item={item} index={index} readonly={readonly}/>)}
                                {(!currentAttempt || currentAttempt?.items?.length === 0)
                                    ? <div className="text-muted text-center">
                                        {readonly ? "No answer entered" : "Drag items across to build your answer"}
                                    </div>
                                    : provided.placeholder}
                            </div>
                        }
                    </Droppable>
                </Col>
            </DragDropContext>
        </Row>
    </div>
}
