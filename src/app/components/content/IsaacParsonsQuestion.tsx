import React, {useCallback, useEffect, useMemo, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {Col, Label, Row} from "reactstrap";
import {
    DragDropContext,
    DragStart,
    DragUpdate,
    Droppable,
    DroppableProvided,
    DropResult,
} from "@hello-pangea/dnd";
import _differenceBy from "lodash/differenceBy";
import {above, isDefined, PARSONS_INDENT_STEP, PARSONS_MAX_INDENT, useCurrentQuestionAttempt, useDeviceSize} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";
import {Immutable} from "immer";
import { handleParsonsItemDrag, onParsonsCurrentAttemptUpdate, ParsonsDraggableItem, swapItemList } from "../elements/ParsonsDraggableItem";

const enforceValidIndentation = (items: Immutable<ParsonsItemDTO>[]) => {
    const newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
        const currentItem = newItems[i];
        if (i === 0 && currentItem.indentation && currentItem.indentation > 0) {
            newItems[i] = {...currentItem, indentation: 0};
        }
        if (i > 0 && currentItem.indentation && currentItem.indentation > (newItems[i-1].indentation || 0) + 1) {
            newItems[i] = {...currentItem, indentation: (newItems[i-1].indentation || 0) + 1};
        }
        if (currentItem.indentation && currentItem.indentation > PARSONS_MAX_INDENT) {
            newItems[i] = {...currentItem, indentation: PARSONS_MAX_INDENT};
        }
    }
    return newItems;
};

const IsaacParsonsQuestion = ({doc, questionId, readonly} : IsaacQuestionProps<IsaacParsonsQuestionDTO>) => {
    const deviceSize = useDeviceSize();
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<ParsonsChoiceDTO>(questionId);
    const [availableItems, setAvailableItems] = useState<Immutable<ParsonsItemDTO>[]>([...doc.items ?? []]);
    const attemptItems = useMemo(() => (currentAttempt?.items || []) as Immutable<ParsonsChoiceDTO>[], [currentAttempt?.items]);
    const setAttemptItems = useCallback((items: Immutable<ParsonsChoiceDTO>[]) => {
        if (currentAttempt) {
            dispatchSetCurrentAttempt({...currentAttempt, items: enforceValidIndentation(items)});
        } else {
            dispatchSetCurrentAttempt({type: "parsonsChoice", items: enforceValidIndentation(items)});
        }
    }, [currentAttempt, dispatchSetCurrentAttempt]);

    const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);
    const [initialX, setInitialX] = useState<number | null>(null);
    const [currentIndent, setCurrentIndent] = useState<number | null>(null);
    const [currentMaxIndent, setCurrentMaxIndent] = useState<number>(0);
    const [currentDestinationIndex, setCurrentDestinationIndex] = useState<number | null>(null);
    const canIndent = (!isDefined(doc.disableIndentation) || !doc.disableIndentation) && !readonly;

    // WARNING: There's a limit to how far to the right we can drag an element, presumably due to @hello-pangea/dnd
    const onMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (draggedElement) {
            const x = draggedElement.getBoundingClientRect().left;
            let cursorX = -1;
            if (e instanceof MouseEvent) {
                cursorX = e.clientX;
            } else if (e instanceof TouchEvent && e.touches[0]) {
                cursorX = e.touches[0].clientX;
            }
            if (canIndent && initialX && x) {
                const d = Math.max(0, x - initialX);
                const i = Math.min(Math.floor(d/PARSONS_INDENT_STEP), Math.min(currentMaxIndent, PARSONS_MAX_INDENT));
                if (cursorX >= initialX) {
                    if (draggedElement?.style) {
                        // movingElement.style.transform = `translate(${i*PARSONS_INDENT_STEP}px, 0px)`;
                    }
                }
                const previousItem = currentAttempt?.items?.[(currentDestinationIndex || 0) - 1];
                setCurrentMaxIndent(previousItem ? (previousItem.indentation || 0) + 1 : 0);
                setCurrentIndent(i);
            }
        }
    }, [draggedElement, currentAttempt, initialX, currentMaxIndent, canIndent, currentDestinationIndex]);

    const onKeyUp = useCallback((e: KeyboardEvent) => {
        // There's a bug somewhere that adds this event twice, but only one has a non-zero timestamp.
        // The condition on draggedElement *might* be sufficient, but let's be explicit.
        if (e.timeStamp > 0 && draggedElement) {
            const className = draggedElement.className;
            const matches = className.match(/indent-([0-3])/);
            const localCurrentIndent: number = currentIndent || (matches && parseInt(matches[1])) || 0;
            let newIndent = currentIndent;
            if (canIndent) {
                if (e.key === '[' || e.code === 'BracketLeft') {
                    newIndent = Math.max(localCurrentIndent - 1, 0);
                } else if (e.key === ']' || e.code === 'BracketRight') {
                    newIndent = Math.min(localCurrentIndent + 1, Math.min(currentMaxIndent, PARSONS_MAX_INDENT));
                }
            }
            let newCurrentMaxIndent = 0;
            const previousItem = currentAttempt?.items?.[(currentDestinationIndex || 0) - 1];
            if (previousItem) {
                newCurrentMaxIndent = (previousItem.indentation || 0) + 1;
            }
            setCurrentIndent(newIndent);
            setCurrentMaxIndent(newCurrentMaxIndent);
            setDraggedElement((prevDraggedElement) => Object.assign(
                {},
                prevDraggedElement,
                { className: className.replace((matches && matches[0]) || `indent-${localCurrentIndent}`, `indent-${newIndent}`) }
            ));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draggedElement, currentIndent, currentMaxIndent, canIndent, currentDestinationIndex]);

    const onDragStart = (initial: DragStart) => {
        const draggedElement: HTMLElement | null = document.getElementById(initial.draggableId);
        const choiceElement: HTMLElement | null = document.getElementById("parsons-choice-area");
        setDraggedElement(draggedElement);
        setInitialX(choiceElement && choiceElement.getBoundingClientRect().left);
        setCurrentIndent(draggedElement?.className.match(/indent-([0-3])/g)?.map((match) => parseInt(match.split('-')[1]))?.[0] || 0);
    };

    const onDragEnd = (result: DropResult) => {
        handleParsonsItemDrag(result, availableItems, setAvailableItems, attemptItems, setAttemptItems, true, currentIndent);
        setDraggedElement(null);
        setInitialX(null);
        setCurrentIndent(null);
    };

    const onDragUpdate = (initial: DragUpdate) => {
        // FIXME: Needs moving because onDragUpdate is not called at all the times we need it.
        if (!initial.destination || initial.destination.index <= 0) {
            setCurrentMaxIndent(0);
            setCurrentDestinationIndex(null);
        } else {
            setCurrentDestinationIndex(initial.destination.index);
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onMouseMove);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [onMouseMove, onKeyUp]);

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
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
                <Col md={6} className="parsons-available-items">
                    <h4>Available items</h4>
                    <Label className="visually-hidden" id="item-section-info">
                        To pick up an item, press space or enter.
                        Use the up and down arrow keys to move the item within the current list.
                        {above['md'](deviceSize) ? 
                            "Use the left and right arrow keys to move the item between the available items and your answer." : 
                            "Use the contained list swap button to move the item between the available items and your answer."}
                        Press space or enter again to move the item to a new position.
                        Items in your answer can be indented using the [ and ] keys, or using the contained indent buttons.
                    </Label>
                    <Droppable droppableId="availableItems">
                        {(provided: DroppableProvided) => {
                            return <div ref={provided.innerRef} className={classNames("parsons-items", {"empty": !(availableItems && availableItems.length > 0), "is-dragging": draggedElement})}>
                                {availableItems && availableItems.map((item, index) => 
                                    <ParsonsDraggableItem key={item.id} currentItem={item} index={index} inAvailableItems readonly={readonly}
                                        setItems={setAvailableItems} items={availableItems} isParsons
                                        swapItemList={() => swapItemList(availableItems, setAvailableItems, attemptItems, setAttemptItems, index, true)}
                                    />
                                )}
                                {(!availableItems || availableItems.length === 0) && <div>&nbsp;</div>}
                                {provided.placeholder}
                            </div>;
                        }}
                    </Droppable>
                </Col>
                <Col md={6} className={classNames({"no-print": !currentAttempt || currentAttempt?.items?.length === 0})}>
                    <h4 className="mt-4 mt-md-0">Your answer</h4>
                    <Droppable droppableId="answerItems">
                        {(provided: DroppableProvided) => {
                            return <div id="parsons-choice-area" ref={provided.innerRef} className={classNames("parsons-items", {[`ghost-indent-${currentIndent}`]: isDefined(draggedElement) && currentIndent !== null, "empty": !(currentAttempt && currentAttempt.items && currentAttempt.items.length > 0), "is-dragging": draggedElement})}>
                                {currentAttempt && currentAttempt.items && currentAttempt.items.map((item, index) => 
                                    <ParsonsDraggableItem key={item.id} currentItem={item} index={index} readonly={readonly}
                                        items={attemptItems} setItems={setAttemptItems} canIndent={canIndent} isParsons
                                        swapItemList={() => swapItemList(attemptItems, setAttemptItems, availableItems, setAvailableItems, index, true)}
                                    />
                                )}
                                {(!currentAttempt || currentAttempt?.items?.length === 0) &&
                                    <div className="text-muted text-center">
                                        {readonly ? "No answer entered" : "Drag items across to build your answer"}
                                    </div>
                                }
                                {provided.placeholder}
                            </div>;
                        }}
                    </Droppable>
                </Col>
            </DragDropContext>
        </Row>
    </div>;
};
export default IsaacParsonsQuestion;
