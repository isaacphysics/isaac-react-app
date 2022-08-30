import React, {useEffect, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {Col, Row} from "reactstrap";
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    DraggingStyle,
    DragStart,
    DragUpdate,
    Droppable,
    DroppableProvided,
    DropResult,
    NotDraggingStyle,
} from "react-beautiful-dnd";
import _differenceBy from "lodash/differenceBy";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {isDefined} from "../../services/miscUtils";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";

// REMINDER: If you change this, you also have to change $parsons-step in questions.scss
const PARSONS_MAX_INDENT = 3;
const PARSONS_INDENT_STEP = 45;

const IsaacParsonsQuestion = ({doc, questionId, readonly} : IsaacQuestionProps<IsaacParsonsQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ParsonsChoiceDTO>(questionId);

    const [ availableItems, setAvailableItems ] = useState<ParsonsItemDTO[]>([...doc.items ?? []]);
    const [ draggedElement, setDraggedElement ] = useState<HTMLElement | null>(null);
    const [ initialX, setInitialX ] = useState<number | null>(null);
    const [ currentIndent, setCurrentIndent ] = useState<number | null>(null);
    const [ currentMaxIndent, setCurrentMaxIndent ] = useState<number>(0);
    const [ currentDestinationIndex, setCurrentDestinationIndex ] = useState<number | null>(null);

    const canIndent = (!isDefined(doc.disableIndentation) || !doc.disableIndentation) && !readonly;

    // WARNING: There's a limit to how far to the right we can drag an element, presumably due to react-beautiful-dnd
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
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
                    const movingElement = document.getElementById(draggedElement.id);
                    if (movingElement?.style) {
                        // movingElement.style.transform = `translate(${i*PARSONS_INDENT_STEP}px, 0px)`;
                    }
                }
                const previousItem = currentAttempt?.items?.[(currentDestinationIndex || 0) - 1];
                setCurrentMaxIndent(previousItem ? (previousItem.indentation || 0) + 1 : 0);
                setCurrentIndent(i);
            }
        }
    }

    const onKeyUp = (e: KeyboardEvent) => {
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
    }

    const moveItem = (src: ParsonsItemDTO[] | undefined, fromIndex: number, dst: ParsonsItemDTO[] | undefined, toIndex: number, indent: number) => {
        if (!src || !dst) return;
        const srcItem = src.splice(fromIndex, 1)[0];
        srcItem.indentation = indent;
        dst.splice(toIndex, 0, srcItem);
    }

    const onDragStart = (initial: DragStart) => {
        const draggedElement: HTMLElement | null = document.getElementById(initial.draggableId);
        const choiceElement: HTMLElement | null = document.getElementById("parsons-choice-area");
        setDraggedElement(draggedElement);
        setInitialX(choiceElement && choiceElement.getBoundingClientRect().left);
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.source || !result.destination) {
            return;
        }
        if (result.source.droppableId === result.destination.droppableId && result.destination.droppableId === 'answerItems' && currentAttempt) {
            // Reorder currentAttempt
            const items = [...(currentAttempt?.items || [])];
            moveItem(items, result.source.index, items, result.destination.index, currentIndent || 0);
            dispatchSetCurrentAttempt({...currentAttempt, items});
        } else if (result.source.droppableId === result.destination.droppableId && result.destination.droppableId === 'availableItems') {
            // Reorder availableItems
            const items = [...availableItems];
            moveItem(items, result.source.index, items, result.destination.index, 0);
            setAvailableItems(items);
        } else if (result.source.droppableId === 'availableItems' && result.destination.droppableId === 'answerItems') {
            // Move from availableItems to currentAttempt
            const srcItems = [...availableItems];
            const dstItems = [...(currentAttempt?.items || [])];
            moveItem(srcItems, result.source.index, dstItems, result.destination.index, currentIndent || 0);
            // We can't guarantee that `currentAttempt` is defined, so we have to explicitly state `type: "parsonsChoice"` here.
            dispatchSetCurrentAttempt({type: "parsonsChoice", items: dstItems});
            setAvailableItems(srcItems);
        } else if (result.source.droppableId === 'answerItems' && result.destination.droppableId === 'availableItems' && currentAttempt) {
            // Move from currentAttempt to availableItems
            const srcItems = [...(currentAttempt?.items || [])];
            const dstItems = [...availableItems];
            moveItem(srcItems, result.source.index, dstItems, result.destination.index, 0);
            dispatchSetCurrentAttempt({...currentAttempt, items: srcItems });
            setAvailableItems(dstItems);
        } else {
            console.error("Not sure how we got here...");
        }
        setDraggedElement(null);
        setInitialX(null);
        setCurrentIndent(null);
    }

    const onDragUpdate = (initial: DragUpdate) => {
        // FIXME: Needs moving because onDragUpdate is not called at all the times we need it.
        if (!initial.destination || initial.destination.index <= 0) {
            setCurrentMaxIndent(0);
            setCurrentDestinationIndex(null);
        } else {
            setCurrentDestinationIndex(initial.destination.index);
        }
    }

    const getStyle = (style: DraggingStyle | NotDraggingStyle | undefined, snapshot: DraggableStateSnapshot) => {
        if (!snapshot.isDropAnimating) {
            return style;
        }
        return {
            ...style,
            // cannot be 0, but make it super tiny
            transitionDuration: `0.001s`,
        };
    }

    const getPreviousItemIndentation = (index: number) => {
        if (!currentAttempt?.items) return -1;
        const items = [...(currentAttempt.items || [])];
        return items[Math.max(0, index-1)].indentation || 0;
    }

    const reduceIndentation = (index: number) => {
        if (!currentAttempt?.items || doc.disableIndentation) return;

        const items = [...(currentAttempt.items || [])];
        if (isDefined(items[index].indentation)) {
            items[index].indentation = Math.max((items[index].indentation || 0) - 1, 0);
        }
        dispatchSetCurrentAttempt({...currentAttempt, ...{ items }});
    }

    const increaseIndentation = (index: number) => {
        if (index === 0 || !currentAttempt?.items || doc.disableIndentation) return;

        const items = [...(currentAttempt.items || [])];
        // This condition is insane but of course 0, undefined, and null are all false-y.
        if (isDefined(items[index].indentation)) {
            items[index].indentation = Math.min((items[index].indentation || 0) + 1, Math.min((items[Math.max(index-1, 0)].indentation || 0) + 1, PARSONS_MAX_INDENT));
        }
        dispatchSetCurrentAttempt({...currentAttempt, ...{ items }});
    }

    const onCurrentAttemptUpdate = (newCurrentAttempt?: ParsonsChoiceDTO, newAvailableItems?: ParsonsItemDTO[]) => {
        if (!newCurrentAttempt) {
            const defaultAttempt: ParsonsChoiceDTO = {
                type: "parsonsChoice",
                items: [],
            }
            dispatchSetCurrentAttempt(defaultAttempt);
        }
        if (newCurrentAttempt) {
            // This makes sure that available items and current attempt items contain different items.
            // This is because available items always start from the document's available items (see constructor)
            // and the current attempt is assigned afterwards, so we need to carve it out of the available items.
            // This also takes care of updating the two lists when a user moves items from one to the other.
            let fixedAvailableItems: ParsonsItemDTO[] = [];
            const currentAttemptItems: ParsonsItemDTO[] = newCurrentAttempt.items || [];
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
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onMouseMove);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('keyup', onKeyUp);
        }
    });

    useEffect(() => {
        onCurrentAttemptUpdate(currentAttempt, availableItems);
    }, [currentAttempt, availableItems])

    return <div className="parsons-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {/* TODO Accessibility */}
        <Row className="my-md-3">
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
                <Col md={{size: 6}} className="parsons-available-items">
                    <h4>Available items</h4>
                    <Droppable droppableId="availableItems">
                        {(provided: DroppableProvided) => {
                            return <div ref={provided.innerRef} className={`parsons-items ${availableItems && availableItems.length > 0 ? "" : "empty"}`}>
                                {availableItems && availableItems.map((item, index) => {
                                    return <Draggable
                                        key={item.id}
                                        draggableId={`${item.id || index}|parsons-item-available`}
                                        index={index}
                                        isDragDisabled={readonly}
                                    >
                                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                            return <div
                                                id={`${item.id || index}|parsons-item-available`}
                                                className={`parsons-item indent-${item.indentation}`}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getStyle(provided.draggableProps.style, snapshot)}
                                            >
                                                <pre>{item.value}</pre>
                                            </div>
                                        }}
                                    </Draggable>
                                })}
                                {(!availableItems || availableItems.length === 0) && <div>&nbsp;</div>}
                                {provided.placeholder}
                            </div>
                        }}
                    </Droppable>
                </Col>
                <Col md={{size: 6}} className="no-print">
                    <h4 className="mt-sm-4 mt-md-0">Your answer</h4>
                    <Droppable droppableId="answerItems">
                        {(provided: DroppableProvided) => {
                            return <div id="parsons-choice-area" ref={provided.innerRef} className={classNames("parsons-items", draggedElement ? "is-dragging" : "", {[`ghost-indent-${currentIndent}`]: currentIndent !== null, "empty": !(currentAttempt && currentAttempt.items && currentAttempt.items.length > 0)})}>
                                {currentAttempt && currentAttempt.items && currentAttempt.items.map((item, index) => {
                                    const canDecreaseIndentation = canIndent && isDefined(item?.indentation) && item.indentation > 0;
                                    const canIncreaseIndentation = canIndent && isDefined(item?.indentation) && index !== 0 && item.indentation <= getPreviousItemIndentation(index) && item.indentation < PARSONS_MAX_INDENT;
                                    return <Draggable
                                        key={item.id}
                                        draggableId={`${item.id || index}|parsons-item-choice`}
                                        index={index}
                                        isDragDisabled={readonly}
                                    >
                                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                                            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                                            return <div
                                                onMouseEnter={e => (e.target as HTMLElement).classList.add('show-controls')}
                                                onMouseLeave={e => (e.target as HTMLElement).classList.remove('show-controls')}
                                                id={`${item.id || index}|parsons-item-choice`}
                                                className={`parsons-item indent-${item.indentation}`}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getStyle(provided.draggableProps.style, snapshot)}
                                            >
                                                    <pre>
                                                        {item.value}
                                                        {canIndent && <div className="controls">
                                                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                                            <span
                                                                className={`reduce ${canDecreaseIndentation ? 'show' : 'hide' }`}
                                                                role="img" onMouseUp={() => reduceIndentation(index)}
                                                                aria-label={`reduce indentation ${!canDecreaseIndentation ? "(disabled)" : ""}`}
                                                            >
                                                                &nbsp;
                                                            </span>
                                                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                                            <span
                                                                className={`increase ${canIncreaseIndentation ? 'show' : 'hide' }`}
                                                                role="img" onMouseUp={() => increaseIndentation(index)}
                                                                aria-label={`increase indentation ${!canIncreaseIndentation ? "(disabled)" : ""}`}
                                                            >
                                                                &nbsp;
                                                            </span>
                                                        </div>}
                                                    </pre>
                                            </div>
                                        }}
                                    </Draggable>
                                })}
                                {(!currentAttempt || currentAttempt?.items?.length === 0) &&
                                    <div className="text-muted text-center">
                                        {readonly ? "No answer entered" : "Drag items across to build your answer"}
                                    </div>
                                }
                                {provided.placeholder}
                            </div>
                        }}
                    </Droppable>
                </Col>
            </DragDropContext>
        </Row>
    </div>
};
export default IsaacParsonsQuestion;
