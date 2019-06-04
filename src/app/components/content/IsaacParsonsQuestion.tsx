import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";

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

    const swapItems = (fromIndex: number, toIndex: number) => {
        console.log(fromIndex, toIndex);
        console.log(currentAttemptValue.items);
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

    return (
        <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            {currentAttemptValue && <div className="parsons-items">
                <DragDropContext onDragEnd={(e) => e.destination ? swapItems(e.source.index, e.destination.index) : void 0}>
                    <Droppable droppableId="droppable">
                        {(providedDroppable, snapshot) => (
                            <div {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                                {currentAttemptValue.items && currentAttemptValue.items.map((item, index) => (
                                    <Draggable draggableId={item.id as string} key={item.id} index={index}>
                                        {(providedDraggable, snapshot) => (
                                            <div ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} {...providedDraggable.dragHandleProps}>
                                                {item.value} {item.indentation}
                                            </div>
                                        )}
                                    </Draggable>))}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>}
            <IsaacHints hints={doc.hints} />
        </div>
    );
};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent);
