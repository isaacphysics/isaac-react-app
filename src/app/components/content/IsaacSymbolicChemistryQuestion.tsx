import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChemicalFormulaDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import {InequalityModal} from "../elements/modals/InequalityModal";
import katex from "katex";
import {ifKeyIsEnter} from "../../services/navigation";
import {selectors} from "../../state/selectors";

import _flattenDeep from 'lodash/flattenDeep';
import {selectQuestionPart} from "../../services/questions";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const pageQuestions = selectors.questions.getQuestions(state);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    let r: {currentAttempt?: ChemicalFormulaDTO | null} = {};
    if (questionPart) {
        r.currentAttempt = questionPart.currentAttempt;
    }
    return r;
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacSymbolicChemistryQuestionProps {
    doc: IsaacSymbolicChemistryQuestionDTO;
    questionId: string;
    currentAttempt?: ChemicalFormulaDTO | null;
    setCurrentAttempt: (questionId: string, attempt: ChemicalFormulaDTO) => void;
}
const IsaacSymbolicChemistryQuestionComponent = (props: IsaacSymbolicChemistryQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const [modalVisible, setModalVisible] = useState(false);
    const [initialEditorSymbols, setInitialEditorSymbols] = useState([]);

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value);
        } catch(e) {
            currentAttemptValue = { result: { tex: '\\textrm{PLACEHOLDER HERE}' } };
        }
    }

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        setInitialEditorSymbols(_flattenDeep(currentAttemptValue.symbols));
    }, [currentAttempt, currentAttemptValue]);

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
                dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your answer' }}
            />
            {modalVisible && <InequalityModal
                close={closeModal(window.scrollY)}
                onEditorStateChange={(state: any) => {
                    setCurrentAttempt(questionId, { type: 'chemicalFormula', value: JSON.stringify(state), mhchemExpression: (state && state.result && state.result.mhchem) || "" })
                    setInitialEditorSymbols(state.symbols);
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols}
                visible={modalVisible}
                editorMode='chemistry'
            />}
        </div>
    );
};

export const IsaacSymbolicChemistryQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicChemistryQuestionComponent);
