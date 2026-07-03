import React, {useCallback, useEffect, useMemo, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacReorderQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {Col, Label, Row} from "reactstrap";
import {DragDropContext, Droppable, DropResult} from "@hello-pangea/dnd";
import _differenceBy from "lodash/differenceBy";
import {above, useCurrentQuestionAttempt, useDeviceSize} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";
import {Immutable} from "immer";
import { handleParsonsItemDrag, onParsonsCurrentAttemptUpdate, ParsonsDraggableItem, swapItemList } from "../elements/ParsonsDraggableItem";

const IsaacReorderQuestion = ({doc, questionId, readonly} : IsaacQuestionProps<IsaacReorderQuestionDTO>) => {
    const deviceSize = useDeviceSize();
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<ItemChoiceDTO>(questionId);
    const [availableItems, setAvailableItems] = useState<Immutable<ItemDTO>[]>([...doc.items ?? []]);
    const attemptItems = useMemo(() => (currentAttempt?.items || []) as Immutable<ItemChoiceDTO>[], [currentAttempt?.items]);
    const setAttemptItems = useCallback((items: Immutable<ItemChoiceDTO>[]) => {
        if (currentAttempt) {
            dispatchSetCurrentAttempt({...currentAttempt, items});
        } else {
            dispatchSetCurrentAttempt({type: "itemChoice", items});
        }
    }, [currentAttempt, dispatchSetCurrentAttempt]);

    const onDragEnd = (result: DropResult) => {
        handleParsonsItemDrag(result, availableItems, setAvailableItems, attemptItems, setAttemptItems);
    };

    useEffect(() => {
        if (!currentAttempt) {
            setAttemptItems([]);
        } else {
            onParsonsCurrentAttemptUpdate(availableItems, setAvailableItems, attemptItems, doc.items);
        }
    }, [availableItems, currentAttempt, doc.items, attemptItems, setAttemptItems]);

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
                    <Label className="visually-hidden" id="item-section-info">
                        To pick up an item, press space or enter.
                        Use the up and down arrow keys to move the item within the current list.
                        {above['md'](deviceSize) ? 
                            <span>
                                Use the left and right arrow keys to move the item between the available items and your answer.
                            </span> : 
                            <span>
                                Use the contained list swap button to move the item between the available items and your answer.
                            </span>
                        }
                        Press space or enter again to move the item to a new position.
                    </Label>
                    <Droppable droppableId="availableItems">
                        {(provided, snapshot) =>
                            <div ref={provided.innerRef}
                                className={classNames("parsons-items", {"empty": !(availableItems && availableItems.length > 0), "drag-over": snapshot.isDraggingOver})}
                            >
                                {availableItems && availableItems.map((item, index) =>
                                    <ParsonsDraggableItem key={item.id} currentItem={item} index={index} inAvailableItems readonly={readonly}
                                        setItems={setAvailableItems} items={availableItems}
                                        swapItemList={() => swapItemList(availableItems, setAvailableItems, attemptItems, setAttemptItems, index)}
                                    />
                                )}
                                {(!availableItems || availableItems.length === 0)
                                    ? <div>&nbsp;</div>
                                    : provided.placeholder}
                            </div>
                        }
                    </Droppable>
                </Col>
                <Col md={{size: 6}} className={classNames({"no-print": !currentAttempt || currentAttempt?.items?.length === 0})}>
                    <h4 className="mt-sm-4 mt-md-0">Your answer</h4>
                    <Droppable droppableId="answerItems">
                        {(provided, snapshot) =>
                            <div id="parsons-choice-area" ref={provided.innerRef}
                                className={classNames("parsons-items", {"empty": !(currentAttempt && currentAttempt.items && currentAttempt.items.length > 0), "drag-over": snapshot.isDraggingOver})}
                            >
                                {currentAttempt && currentAttempt.items && currentAttempt.items.map((item, index) =>
                                    <ParsonsDraggableItem key={item.id} currentItem={item} index={index} readonly={readonly}
                                        setItems={(items: Immutable<ItemDTO>[]) => dispatchSetCurrentAttempt({...currentAttempt, items})} 
                                        items={(currentAttempt?.items || []) as Immutable<ItemDTO>[]}
                                        swapItemList={() => swapItemList(attemptItems, setAttemptItems, availableItems, setAvailableItems, index)}
                                    />
                                )}
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
    </div>;
};
export default IsaacReorderQuestion;
