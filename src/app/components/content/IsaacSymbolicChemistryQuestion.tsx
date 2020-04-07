import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChemicalFormulaDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import {InequalityModal} from "../elements/modals/InequalityModal";
import katex from "katex";
import {IsaacHints} from "./IsaacHints";
import {ifKeyIsEnter} from "../../services/navigation";
import {questions} from "../../state/selectors";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const questionPart = questions.selectQuestionPart(questionId)(state);
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

    const closeModal = () => {
        document.body.style.overflow = "initial";
        setModalVisible(false);
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
                close={closeModal}
                onEditorStateChange={(state: any) => {
                    setCurrentAttempt(questionId, { type: 'chemicalFormula', value: JSON.stringify(state), mhchemExpression: (state && state.result && state.result.mhchem) || "" })
                    setInitialEditorSymbols(state.symbols);
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols}
                visible={modalVisible}
                editorMode='chemistry'
            />}
            <IsaacHints questionPartId={questionId} hints={doc.hints} />
        </div>
    );
};

export const IsaacSymbolicChemistryQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicChemistryQuestionComponent);
