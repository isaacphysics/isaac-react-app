import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacParsonsQuestionDTO, ParsonsChoiceDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";

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

    const [modalVisible, setModalVisible] = useState(false);
    const [initialEditorSymbols, setInitialEditorSymbols] = useState([]);

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

    return (
        <div className="parsons-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            {currentAttemptValue && <div className="parsons-items">
                <ul>
                    {currentAttemptValue.items && currentAttemptValue.items.map(item => <li>{item.value}</li>)}
                </ul>
            </div>}
            <IsaacHints hints={doc.hints} />
        </div>
    );
};

export const IsaacParsonsQuestion = connect(stateToProps, dispatchToProps)(IsaacParsonsQuestionComponent);
