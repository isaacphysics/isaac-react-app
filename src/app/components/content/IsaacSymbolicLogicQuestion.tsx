import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {IsaacSymbolicLogicQuestionDTO, LogicFormulaDTO} from "../../../IsaacApiTypes";
import {InequalityModal} from "../elements/modals/InequalityModal";
import katex from "katex";
import {EXAM_BOARD} from "../../services/constants";
import {ifKeyIsEnter} from "../../services/navigation";
import {selectors} from "../../state/selectors";

import _flattenDeep from 'lodash/flattenDeep';
import {useCurrentExamBoard} from "../../services/examBoard";
import {selectQuestionPart} from "../../services/questions";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const pageQuestions = selectors.questions.getQuestions(state);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    let r: {currentAttempt?: LogicFormulaDTO | null} = {};
    if (questionPart) {
        r.currentAttempt = questionPart.currentAttempt;
    }
    return r;
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacSymbolicLogicQuestionProps {
    doc: IsaacSymbolicLogicQuestionDTO;
    questionId: string;
    currentAttempt?: LogicFormulaDTO | null;
    setCurrentAttempt: (questionId: string, attempt: LogicFormulaDTO) => void;
    examBoard: EXAM_BOARD;
}
const IsaacSymbolicLogicQuestionComponent = (props: IsaacSymbolicLogicQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const [modalVisible, setModalVisible] = useState(false);
    const initialEditorSymbols = useRef(JSON.parse(doc.formulaSeed || '[]'));
    const examBoard = useCurrentExamBoard();

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value);
        } catch(e) {
            currentAttemptValue = { result: { tex: '\\textrm{PLACEHOLDER HERE}' } };
        }
    }

    const closeModal = (previousYPosition: number) => () => {
        document.body.style.overflow = "initial";
        setModalVisible(false);
        window.scrollTo(0, previousYPosition);
    };

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    return (
        <div className="symbolic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <div
                role="button" className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={0}
                onClick={() => setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => setModalVisible(true))}
                dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your expression' }}
            />
            {modalVisible && <InequalityModal
                close={closeModal(window.scrollY)}
                onEditorStateChange={(state: any) => {
                    setCurrentAttempt(questionId, { type: 'logicFormula', value: JSON.stringify(state), pythonExpression: (state && state.result && state.result.python)||"" })
                    initialEditorSymbols.current = state.symbols;
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols.current}
                visible={modalVisible}
                editorMode='logic'
                logicSyntax={examBoard == EXAM_BOARD.OCR ? 'logic' : 'binary'}
                questionDoc={doc}
            />}
        </div>
    );
};

export const IsaacSymbolicLogicQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicLogicQuestionComponent);
