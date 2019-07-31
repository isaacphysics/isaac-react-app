import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {LogicFormulaDTO, IsaacSymbolicLogicQuestionDTO} from "../../../IsaacApiTypes";
import { InequalityModal } from "../elements/InequalityModal";
import katex from "katex";
import {IsaacHints} from "./IsaacHints";
import { determineExamBoardFrom } from "../../services/examBoard";
import { EXAM_BOARD } from "../../services/constants";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    const examBoard = state && determineExamBoardFrom(state.userPreferences);
    let r: { currentAttempt?: LogicFormulaDTO | null, examBoard? : EXAM_BOARD | null } = { examBoard };
    if (question) {
        r.currentAttempt = question.currentAttempt;
    }
    return r;
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacSymbolicLogicQuestionProps {
    doc: IsaacSymbolicLogicQuestionDTO;
    questionId: string;
    currentAttempt?: LogicFormulaDTO | null;
    setCurrentAttempt: (questionId: string, attempt: LogicFormulaDTO) => void;
    examBoard?: EXAM_BOARD | null;
}
const IsaacSymbolicLogicQuestionComponent = (props: IsaacSymbolicLogicQuestionProps) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [initialEditorSymbols, setInitialEditorSymbols] = useState([]);

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

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    return (
        <div className="symboliclogic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <div className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} onClick={() => setModalVisible(true)} dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your expression' }} />
            {modalVisible && <InequalityModal
                close={closeModal}
                onEditorStateChange={(state: any) => {
                    setCurrentAttempt(questionId, { type: 'logicFormula', value: JSON.stringify(state), pythonExpression: (state && state.result && state.result.python)||"" })
                    setInitialEditorSymbols(state.symbols);
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols}
                visible={modalVisible}
                syntax={props.examBoard == EXAM_BOARD.OCR ? 'logic' : 'binary'}
            />}
            <IsaacHints questionPartId={questionId} hints={doc.hints} />
        </div>
    );
};

export const IsaacSymbolicLogicQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicLogicQuestionComponent);
