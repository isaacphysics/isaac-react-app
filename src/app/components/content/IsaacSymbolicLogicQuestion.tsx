import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {LogicFormulaDTO, IsaacSymbolicLogicQuestionDTO} from "../../../IsaacApiTypes";
import { InequalityModal } from "./InequalityModal";
import katex from "katex";
import {IsaacHints} from "./IsaacHints";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacSymbolicLogicQuestionProps {
    doc: IsaacSymbolicLogicQuestionDTO;
    questionId: string;
    currentAttempt?: LogicFormulaDTO;
    setCurrentAttempt: (questionId: string, attempt: LogicFormulaDTO) => void;
}
const IsaacSymbolicLogicQuestionComponent = (props: IsaacSymbolicLogicQuestionProps) => {

    const [modalVisible, setModalVisible] = useState(false);

    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value);
        } catch(e) {
            currentAttemptValue = { result: { tex: '\\textrm{PLACEHOLDER HERE}' } };
        }
    }

    const closeModal = () => {
        document.body.removeChild(document.getElementById('the-ghost-of-inequality') as Node);
        document.body.style.overflow = "initial";
        setModalVisible(false);
    };

    return (
        <div className="symboliclogic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <div className="eqn-editor-preview" onClick={() => setModalVisible(true)} dangerouslySetInnerHTML={{ __html: katex.renderToString((currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex) ? currentAttemptValue.result.tex : '') }} />
            {modalVisible && <InequalityModal
                close={closeModal}
                onEditorStateChange={(state: any) => { setCurrentAttempt(questionId, { type: 'logicFormula', value: JSON.stringify(state), pythonExpression: state.result.python }) }}
                availableSymbols={doc.availableSymbols}
            />}
            <IsaacHints hints={doc.hints} />
        </div>
    );
};

export const IsaacSymbolicLogicQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicLogicQuestionComponent);
