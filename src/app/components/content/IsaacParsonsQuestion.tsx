import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {DragDropContext, Draggable, Droppable, ResponderProvided, DragUpdate, DropResult, DragStart} from "react-beautiful-dnd";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacParsonsQuestionProps {
    doc: IsaacParsonsQuestionDTO;
    questionId: string;
    currentAttempt?: ParsonsChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ParsonsChoiceDTO) => void;
}
const IsaacParsonsQuestionComponent = (props: IsaacParsonsQuestionProps) => {

    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);

    let currentAttemptValue: ParsonsChoiceDTO = {};
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value) as ParsonsChoiceDTO;
        } catch(e) {
            currentAttemptValue.items = doc.items;
        }
    } else {
        currentAttemptValue.items = doc.items;
    } // TODO Improve this -^

    function swapItems(fromIndex: number, toIndex: number) {
        if (currentAttemptValue.items) {
            const sourceItem = currentAttemptValue.items.splice(fromIndex, 1)[0];
            currentAttemptValue.items.splice(toIndex, 0, sourceItem);
        }
        const attempt: ParsonsChoiceDTO = {
            type: "parsonsChoice",
            items: currentAttemptValue.items,
        }
        setCurrentAttempt(questionId, attempt);
    }

    function onDragStart(initial: DragStart, provided: ResponderProvided) {
        const element = document.getElementById(`parsons-item-${initial.draggableId}`);
        if (element) {
            element.addEventListener("drag", (e: DragEvent) => {
                console.log(e);
            });
            setDraggedElement(element);
        }
    }

    function onDragUpdate(initial: DragUpdate, provided: ResponderProvided) {
        // console.log(arguments);
    }

    function onDragEnd(result: DropResult, provided: ResponderProvided) {
        const element = document.getElementById(`parsons-item-${result.draggableId}`)
        if (result.destination) {
            swapItems(result.source.index, result.destination.index);
        }
        setDraggedElement(null);
    }

    return (
        <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            {currentAttemptValue && <div className="parsons-items">
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
                    <Droppable droppableId="droppable">
                        {(providedDroppable, snapshot) => {
                            return <div className="parsons-items" ref={providedDroppable.innerRef} {...providedDroppable.droppableProps}>
                                {currentAttemptValue.items && currentAttemptValue.items.map((item, index) => (
                                    <Draggable draggableId={item.id as string} key={item.id} index={index}>
                                        {(providedDraggable, snapshot) => {
                                            let d: JSX.Element = <div
                                                    id={`parsons-item-${item.id}`}
                                                    className={`parsons-item indent-${item.indentation || 0}`}
                                                    ref={providedDraggable.innerRef}
                                                    {...providedDraggable.dragHandleProps}
                                                    {...providedDraggable.draggableProps}
                                                    draggable={true}
                                                    onDrag={(event: React.DragEvent) => { console.log(event); }}
                                                ><pre>{item.value} {item.indentation}</pre>
                                            </div>
                                            debugger;
                                            return d;
                                        }}
                                    </Draggable>))}{providedDroppable.placeholder}
                            </div>
                        }}
                    </Droppable>
                </DragDropContext>
            </div>}
            <IsaacHints hints={doc.hints} />
        </div>
    );
};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent);
