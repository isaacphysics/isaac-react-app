import React, {useState, useEffect, useMemo} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {SortableContainer, SortableElement, SortStart, SortEvent, SortEnd} from "react-sortable-hoc";

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
    const [draggedElement, setDraggedElement] = useState<Element | null>(null);
    const [resolve, setResolve] = useState<any | null>(() => {});

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

    function moveItem(fromIndex: number, toIndex: number) {
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

    const SortableItem = SortableElement(({value}: {value: ParsonsItemDTO}) => {
        return value ? <div id={`parsons-item-${value.id}`} className={`parsons-item indent-${value.indentation}`}><pre>{value.value} [{value.indentation}]</pre></div> : <div>ERROR: Missing item?</div>
    });
    
    const SortableList = SortableContainer(({items}: {items: any}) => {
        return <div className="parsons-items">
            {items && items.map((item: any, index: any) => {
                return <SortableItem key={`item-${index}`} index={index} value={item} />;
            })}
        </div>
    });

    function onUpdateBeforeSortStart(sort: SortStart, event: SortEvent) {
        return new Promise(function(res) {
            setDraggedElement(sort.node);
            setResolve(res);
        });
    }

    useMemo(() => {
        debugger;
        if (resolve) {
            resolve();
        }
    }, [resolve]);

    function onSortMove(event: SortEvent) {
        console.log(draggedElement);
    }

    function onSortEnd(sort: SortEnd, event: SortEvent) {
        moveItem(sort.oldIndex, sort.newIndex);
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
                <SortableList
                items={currentAttemptValue.items}
                updateBeforeSortStart={onUpdateBeforeSortStart}
                onSortMove={onSortMove}
                onSortEnd={onSortEnd}
                />
            </div>}
            <IsaacHints hints={doc.hints} />
        </div>
    );
};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent);
