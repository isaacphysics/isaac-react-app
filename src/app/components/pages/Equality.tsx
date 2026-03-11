import React, {ChangeEvent, lazy, Suspense, useLayoutEffect, useRef, useState} from "react";
import {Col, Container, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {ifKeyIsEnter, isStaff, siteSpecific, sanitiseInequalityState, jsonHelper} from "../../services";
import katex from "katex";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useLocation} from "react-router";
import {Inequality} from 'inequality';
import {selectors, useAppSelector, useGetSegueEnvironmentQuery} from "../../state";
import {EditorMode, LogicSyntax} from "../elements/modals/inequality/constants";
import { InequalityState, initialiseInequality, SymbolicTextInput, useModalWithScroll } from "../content/IsaacSymbolicQuestion";
import { ChemicalFormulaDTO, FormulaDTO, LogicFormulaDTO } from "../../../IsaacApiTypes";
import { Loading } from "../handlers/IsaacSpinner";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

const Equality = () => {
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const user = useAppSelector(selectors.user.orNull);
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();

    const [currentAttempt, dispatchSetCurrentAttempt] = useState<FormulaDTO | LogicFormulaDTO | ChemicalFormulaDTO>({type: 'formula', value: "", pythonExpression: ''});
    const currentAttemptValue: InequalityState | undefined = (currentAttempt && currentAttempt.value) ? jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}}) : undefined;
    const [editorMode, setEditorMode] = useState<EditorMode>((queryParams.mode as EditorMode) || siteSpecific('maths', 'logic'));
    const userPreferences = useAppSelector(selectors.user.preferences);

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;
    const [textInput, setTextInput] = useState('');
    const allowTextInput = ['maths', 'logic'].includes(editorMode) || (userPreferences?.DISPLAY_SETTING?.CHEM_TEXT_ENTRY && ['chemistry', 'nuclear'].includes(editorMode));
    const [editorSyntax, setEditorSyntax] = useState<LogicSyntax>('logic');

    const [hasStartedEditing, setHasStartedEditing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    const initialEditorSymbols = useRef<string[]>([]);
    const availableSymbols = queryParams.symbols && (queryParams.symbols as string).split(',').map(s => s.trim());

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    function updateState(state: InequalityState) {
        if (["maths", "logic"].includes(editorMode)) {
            const newState = sanitiseInequalityState(state);
            const pythonExpression = newState?.result?.python || "";
            const previousPythonExpression = currentAttempt.value || "";
            if (!previousPythonExpression || previousPythonExpression !== pythonExpression) {
                dispatchSetCurrentAttempt({ type: 'formula', value: JSON.stringify(newState), pythonExpression });
            }
            initialEditorSymbols.current = state.symbols ?? [];
        } else {
            const newState = sanitiseInequalityState(state);
            const mhchemExpression = newState?.result?.mhchem || "";
            const previousMhchemExpression = currentAttempt.value || "";
            if (!previousMhchemExpression || previousMhchemExpression !== mhchemExpression) {
                dispatchSetCurrentAttempt({ type: 'chemicalFormula', value: JSON.stringify(newState), mhchemExpression });
            }
            initialEditorSymbols.current = state.symbols ?? [];
        }
    }

    const updateEditor = (e: ChangeEvent<HTMLInputElement>) => {
        setEditorMode(e.target.value as EditorMode); 
        if (sketchRef.current) {
            sketchRef.current.editorMode = e.target.value as EditorMode;
        }
    };

    useLayoutEffect(() => {
        if (!allowTextInput) return; // as the ref won't be defined
        
        initialiseInequality(editorMode, hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Equation editor demo page" icon={{type: "icon", icon: "icon-concept"}} />
        <Row>
            {/* Editor Mode and Logic Syntax settings */}
            <Col md={3} className="py-4 syntax-picker mode-picker">
                <div>
                    <Label for="inequality-mode-select">Editor mode:</Label>
                    <Input type="select" name="mode" id="inequality-mode-select" value={editorMode} onChange={updateEditor}> 
                        <option value="maths">Maths</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="nuclear">Nuclear Physics</option>
                        <option value="logic">Boolean Logic</option>
                    </Input>
                </div>
                {editorMode === 'logic' && <div className="mt-4">
                    <Label for="inequality-syntax-select">Boolean Logic Syntax</Label>
                    <Input type="select" name="syntax" id="inequality-syntax-select" value={editorSyntax} onChange={(e) => { 
                        setEditorSyntax(e.target.value as LogicSyntax);
                        if (sketchRef.current) sketchRef.current.logicSyntax = editorSyntax;
                    }}> 
                        <option value="logic">Boolean Logic</option>
                        <option value="binary">Digital Electronics</option>
                    </Input>
                </div>}
            </Col>
            {/* Inequality Editor */}
            <Col md={8} className="pb-4 pt-md-4 question-panel equality-page">
                {allowTextInput && <SymbolicTextInput editorMode={editorMode} hiddenEditorRef={hiddenEditorRef} demoPage
                    textInput={textInput} setTextInput={setTextInput} setHasStartedEditing={setHasStartedEditing}
                    initialEditorSymbols={initialEditorSymbols} dispatchSetCurrentAttempt={() => {}} sketchRef={sketchRef} 
                    emptySubmission={!hasStartedEditing} helpTooltipId={"inequality-help"}
                />}
                <div
                    role="button" className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''} ${!allowTextInput && 'mt-4'}`} tabIndex={0}
                    onClick={openModal} onKeyDown={ifKeyIsEnter(openModal)}
                    dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : `<span>${allowTextInput ? 'or c' : 'C'}lick here to enter a formula</span>` }}
                />
                {modalVisible && <Suspense fallback={<Loading/>}>
                    <InequalityModal
                        editorMode={editorMode} logicSyntax={editorSyntax}
                        initialEditorSymbols={initialEditorSymbols.current} availableSymbols={availableSymbols || []}
                        onEditorStateChange={(state: InequalityState) => {
                            updateState(state);
                            dispatchSetCurrentAttempt(["maths", "logic"].includes(editorMode)
                                ? { type: 'logicFormula', value: JSON.stringify(state), pythonExpression: (state && state.result && state.result.python) || "" }
                                : { type: 'chemicalFormula', value: JSON.stringify(state), mhchemExpression: (state && state.result && state.result.mhchem) || "" }
                            );
                            setTextInput(["maths", "logic"].includes(editorMode) ? (state?.result?.python || '') : (state?.result?.mhchem || ''));
                            initialEditorSymbols.current = state.symbols ?? [];
                        }}
                        close={closeModalAndReturnToScrollPosition}
                    />
                </Suspense>}
            </Col>
        </Row>
        {currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex && <Row>
            {/* Result Summary */}
            <Col md={{size: 8, offset: 2}} className="py-4 inequality-results">
                <h4>LaTeX</h4>
                <pre>${currentAttemptValue?.result?.tex}$</pre>
                {["chemistry", "nuclear"].includes(editorMode) && <>
                    <h4>MhChem</h4>
                    <pre>{currentAttemptValue?.result?.mhchem}</pre>
                </>}
                {!["chemistry", "nuclear"].includes(editorMode) && <>
                    <h4>Python</h4>
                    <pre>{currentAttemptValue?.result?.python}</pre>
                    <h4>MathML</h4>
                    <pre>{currentAttemptValue?.result?.mathml}</pre>
                </>}
                <h4>Available symbols</h4>
                <pre>{currentAttemptValue?.result?.uniqueSymbols}</pre>
                {(segueEnvironment === "DEV" || isStaff(user)) && <>
                    <h4>Inequality seed</h4>
                    <pre>{currentAttemptValue.symbols && JSON.stringify(currentAttemptValue.symbols)}</pre>
                </>}
            </Col>
        </Row>}
    </Container>;
};
export default Equality;
