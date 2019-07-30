import React, {ChangeEvent, FormEvent, useMemo} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacItemQuestionDTO, ItemChoiceDTO, ItemDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {CustomInput, Label} from "reactstrap";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: (question.currentAttempt as ItemChoiceDTO)} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacItemQuestionProps {
    doc: IsaacItemQuestionDTO;
    questionId: string;
    currentAttempt?: ItemChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => void;
}

const IsaacItemQuestionComponent = (props: IsaacItemQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;

    function updateItems(changeEvent: ChangeEvent<HTMLInputElement>, item: ItemDTO) {
        let selected = changeEvent.target.checked;
        let currentItems = currentAttempt && currentAttempt.items || [];
        let itemChoice: ItemChoiceDTO = {type: "itemChoice", items: currentItems};

        if (selected) {
            if (!itemChoice.items) {
                itemChoice.items = [item];
            } else if (itemChoice.items.filter(i => i.id == item.id).length == 0) {
                itemChoice.items.push(item);
            }
        } else if (itemChoice.items) {
            itemChoice.items = itemChoice.items.filter(i => i.id !== item.id);
        }
        setCurrentAttempt(questionId, itemChoice);
    }

    return (
        <div className="multichoice-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>

            <ul>{doc.items && doc.items.map((item) =>
                <li key={item.value} className="list-unstyled">
                    <Label className="label-radio multichoice-option">
                        <CustomInput
                            id={`${questionId}|${item.id}`}
                            color="secondary"
                            type="checkbox"
                            checked={!!(currentAttempt && currentAttempt.items && currentAttempt.items.filter(i => i.id == item.id).length == 1)}
                            onChange={(changeEvent: ChangeEvent<HTMLInputElement>) => updateItems(changeEvent, item)}
                        />
                        <IsaacContentValueOrChildren value={item.value} encoding={doc.encoding} />
                    </Label>
                </li>)
            }</ul>

            <IsaacHints questionPartId={questionId} hints={doc.hints}/>
        </div>
    );
};

export const IsaacItemQuestion = connect(stateToProps, dispatchToProps)(IsaacItemQuestionComponent);
