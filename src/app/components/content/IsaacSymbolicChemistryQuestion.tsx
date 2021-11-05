import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChemicalFormulaDTO, ChoiceDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import {InequalityModal} from "../elements/modals/InequalityModal";
import katex from "katex";
import {ifKeyIsEnter} from "../../services/navigation";
import {selectors} from "../../state/selectors";

import _flattenDeep from 'lodash/flattenDeep';
import {selectQuestionPart} from "../../services/questions";
import {jsonHelper} from "../../services/json";
import { isDefined } from '../../services/miscUtils';
import {Action, Dispatch} from "redux";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const pageQuestions = selectors.questions.getQuestions(state);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    let r: {currentAttempt?: ChemicalFormulaDTO | null} = {};
    if (questionPart) {
        r.currentAttempt = questionPart.currentAttempt;
    }
    return r;
};
const dispatchToProps = (dispatch : Dispatch<Action>) => {
    return {
        setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => setCurrentAttempt(questionId, attempt)(dispatch)
    }
};

interface IsaacSymbolicChemistryQuestionProps {
    doc: IsaacSymbolicChemistryQuestionDTO;
    questionId: string;
    currentAttempt?: ChemicalFormulaDTO | null;
    setCurrentAttempt: (questionId: string, attempt: ChemicalFormulaDTO) => void;
    readonly?: boolean;
}
const IsaacSymbolicChemistryQuestionComponent = (props: IsaacSymbolicChemistryQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt, readonly} = props;
    const [modalVisible, setModalVisible] = useState(false);
    const initialEditorSymbols = useRef(jsonHelper.parseOrDefault(doc.formulaSeed, []));

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        initialEditorSymbols.current = _flattenDeep(currentAttemptValue.symbols);
    }, [currentAttempt, currentAttemptValue]);

    const closeModal = (previousYPosition: number) => () => {
        document.body.style.overflow = "initial";
        setModalVisible(false);
        if (isDefined(previousYPosition)) {
            window.scrollTo(0, previousYPosition);
        }
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
                role={readonly ? undefined : "button"} className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={readonly ? undefined : 0}
                onClick={() => !readonly && setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => !readonly && setModalVisible(true))}
                dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your answer' }}
            />
            {modalVisible && <InequalityModal
                close={closeModal(window.scrollY)}
                onEditorStateChange={(state: any) => {
                    setCurrentAttempt(questionId, { type: 'chemicalFormula', value: JSON.stringify(state), mhchemExpression: (state && state.result && state.result.mhchem) || "" })
                    initialEditorSymbols.current = state.symbols;
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols.current}
                visible={modalVisible}
                editorMode='chemistry'
                questionDoc={doc}
            />}
        </div>
    );
};

export const IsaacSymbolicChemistryQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicChemistryQuestionComponent);
