import React, {useState, useEffect, useMemo} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO, ParsonsItemDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {SortableContainer, SortableElement, SortStart, SortEvent, SortEnd} from "react-sortable-hoc";

interface IsaacParsonsQuestionProps {
    doc: IsaacParsonsQuestionDTO;
    questionId: string;
    currentAttempt?: ParsonsChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ParsonsChoiceDTO) => void;
}

class IsaacParsonsQuestionComponent extends React.Component<IsaacParsonsQuestionProps> {
    state: {
        draggedElement?: Element | null;
        currentAttemptValue: ParsonsChoiceDTO;
    };

    constructor(props: IsaacParsonsQuestionProps) {
        super(props);
        const {doc, currentAttempt} = props;

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
        this.state = {
            draggedElement: null,
            currentAttemptValue: currentAttemptValue,
        }
    }

    moveItem = (fromIndex: number, toIndex: number) => {
        const t = Object.assign({}, this.state.currentAttemptValue);
        if (t.items) {
            const sourceItem = t.items.splice(fromIndex, 1)[0];
            t.items.splice(toIndex, 0, sourceItem);
        }
        this.setState({ currentAttemptValue: t});
        const attempt: ParsonsChoiceDTO = {
            type: "parsonsChoice",
            items: this.state.currentAttemptValue.items,
        }
        this.props.setCurrentAttempt(this.props.questionId, attempt);
    }

    private SortableItem = SortableElement(({value}: {value: ParsonsItemDTO}) => {
        return value ? <div id={`parsons-item-${value.id}`} className={`parsons-item indent-${value.indentation}`}><pre>{value.value} [{value.indentation}]</pre></div> : <div>ERROR: Missing item?</div>
    });
    
    private SortableList = SortableContainer(({items}: {items: any}) => {
        return <div className="parsons-items">
            {items && items.map((item: any, index: any) => {
                return <this.SortableItem key={`item-${index}`} index={index} value={item} />;
            })}
        </div>
    });

    onUpdateBeforeSortStart = (sort: SortStart, event: SortEvent) => {
        return new Promise((res) => {
            this.setState({ draggedElement: sort.node }, res);
        });
    }

    onSortMove = (event: SortEvent) => {
        console.log(this.state.draggedElement);
    }

    onSortEnd = (sort: SortEnd, event: SortEvent) => {
        this.moveItem(sort.oldIndex, sort.newIndex);
        this.setState({ draggedElement: null });
    }

    render() {
        return <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={this.props.doc.value} encoding={this.props.doc.encoding}>
                    {this.props.doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            {this.state.currentAttemptValue && <div className="parsons-items">
                <this.SortableList
                items={this.state.currentAttemptValue.items}
                updateBeforeSortStart={this.onUpdateBeforeSortStart}
                onSortMove={this.onSortMove}
                onSortEnd={this.onSortEnd}
                />
            </div>}
            <IsaacHints hints={this.props.doc.hints} />
        </div>
    }
}

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent);
