import React, {useEffect, useState, ChangeEvent} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Button, Col, Container, Row, Label, Input} from "reactstrap";
import queryString from "query-string";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE} from "../../services/constants";

import { InequalityModal } from "../elements/InequalityModal";
import katex from "katex";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";


const stateToProps = (state: AppState, {match: {params: {questionId}}, location: {search}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlQuestionId: questionId,
        queryParams: queryString.parse(search)
    };
};
const dispatchToProps = {fetchDoc};

interface EqualityPageProps {
    queryParams: {board?: string};
    history: any;
    fetchDoc: (documentType: DOCUMENT_TYPE, questionId: string) => void;
}
const EqualityPageComponent = (props: EqualityPageProps) => {
    const {queryParams, history, fetchDoc} = props;

    const [modalVisible, setModalVisible] = useState(false);
    const [initialEditorSymbols, setInitialEditorSymbols] = useState([]);
    const [currentAttempt, setCurrentAttempt] = useState();
    const [editorSyntax, setEditorSyntax] = useState('logic');

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value);
        } catch(e) {
            currentAttemptValue = { result: { tex: '\\textrm{PLACEHOLDER HERE}' } };
        }
    }

    const closeModal = () => {
        document.body.style.overflow = "auto";
        setModalVisible(false);
    };

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    return <div className="pattern-01">
            <Container>
                <Row>
                    <Col>
                        <TitleAndBreadcrumb currentPageTitle="Inequality Demo Page" />
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 2}} className="py-4 syntax-picker">
                        <Label for="inequality-syntax-select">Syntax</Label>
                        <Input type="select" name="syntax" id="inequality-syntax-select" value={editorSyntax} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditorSyntax(e.target.value)}>
                            <option value="logic">Boolean Logic</option>
                            <option value="binary">Digital Electronics</option>
                        </Input>
                    </Col>
                    <Col md={{size: 8}} className="py-4 question-panel">
                        <div className="symboliclogic-question">
                            <Label>&nbsp;</Label>
                            <div className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} onClick={() => setModalVisible(true)} dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter a formula' }} />
                            {modalVisible && <InequalityModal
                                close={closeModal}
                                onEditorStateChange={(state: any) => {
                                    setCurrentAttempt({ type: 'logicFormula', value: JSON.stringify(state), pythonExpression: (state && state.result && state.result.python)||"" })
                                    setInitialEditorSymbols(state.symbols);
                                }}
                                availableSymbols={[]}
                                initialEditorSymbols={initialEditorSymbols}
                                syntax={editorSyntax}
                                visible={modalVisible}
                            />}
                        </div>
                    </Col>
                </Row>
                {currentAttempt && <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4 inequality-results">
                        <h4>Python</h4>
                        <pre>{currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python}</pre>
                        <h4>Available symbols</h4>
                        <pre>{currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.uniqueSymbols}</pre>
                        <h4>Inequality seed</h4>
                        <pre>{currentAttemptValue && currentAttemptValue.symbols && JSON.stringify(currentAttemptValue.symbols)}</pre>
                        <h4>LaTeX</h4>
                        <pre>{currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex}</pre>
                        <h4>MathML</h4>
                        <pre>{currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.mathml}</pre>
                    </Col>
                </Row>}
            </Container>
        </div>;
};

export const Equality = withRouter(connect(stateToProps, dispatchToProps)(EqualityPageComponent));
