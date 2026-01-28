import React, {lazy, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {ChemicalFormulaDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    jsonHelper,
    sanitiseInequalityState,
    siteSpecific,
    useCurrentQuestionAttempt,
    parsePseudoSymbolicAvailableSymbols
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import { Button, InputGroup, UncontrolledTooltip } from "reactstrap";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import { v4 as uuid_v4 } from "uuid";
import { Inequality } from "inequality";
import { selectors, useAppSelector } from "../../state";
import { CHEMICAL_ELEMENTS, CHEMICAL_PARTICLES, CHEMICAL_STATES } from "../elements/modals/inequality/constants";
import { initialiseInequality, InputState, SymbolicTextInput, useModalWithScroll } from "./IsaacSymbolicQuestion";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

const symbolicInputValidator = (input: string, mayRequireStateSymbols?: boolean) => {
    const openRoundBracketsCount = input.split("(").length - 1;
    const closeRoundBracketsCount = input.split(")").length - 1;
    const openSquareBracketsCount = input.split("[").length - 1;
    const closeSquareBracketsCount = input.split("]").length - 1;
    const openCurlyBracketsCount = input.split("{").length - 1;
    const closeCurlyBracketsCount = input.split("}").length - 1;
    const regexStr = /[^ 0-9A-Za-z()[\]{}*+,-./<=>^_\\]+/;
    const badCharacters = new RegExp(regexStr);
    const errors = [];
    if (badCharacters.test(input)) {
        const usedBadChars: string[] = [];
        for(let i = 0; i < input.length; i++) {
            const char = input.charAt(i);
            if (badCharacters.test(char)) {
                if (!usedBadChars.includes(char)) {
                    usedBadChars.push(char);
                }
            }
        }
        errors.push('Some of the characters you are using are not allowed: ' + usedBadChars.join(" "));
    }

    if (openRoundBracketsCount !== closeRoundBracketsCount
        || openSquareBracketsCount !== closeSquareBracketsCount
        || openCurlyBracketsCount !== closeCurlyBracketsCount) {
        // Rather than a long message about which brackets need closing
        errors.push('You are missing some brackets.');
    }
    if (/\.[0-9]/.test(input)) {
        errors.push('Please convert decimal numbers to fractions.');
    }
    if (/\(s\)|\(aq\)|\(l\)|\(g\)/.test(input) && !mayRequireStateSymbols) {
        errors.push('This question does not require state symbols.');
    }
    return errors;
};

const TooltipContents = (nuclear?: boolean) => nuclear
    ? <>
        Here are some examples of expressions you can type:<br />
        {"^{238}_{92}U -> ^{4}_{2}\\alphaparticle + _{90}^{234}Th"}<br />
        {"^{0}_{-1}e"}<br />
        {"\\gammaray"}<br />
        As you type, the box above will preview the result.
    </>
    : <>
        Here are some examples of expressions you can type:<br />
        H2O<br />
        2 H2 + O2 -&gt; 2 H2O<br />
        CH3(CH2)3CH3<br />
        {"NaCl(aq) -> Na^{+}(aq) +  Cl^{-}(aq)"}<br />
        As you type, the box above will preview the result.
    </>;

const IsaacSymbolicChemistryQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicChemistryQuestionDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ChemicalFormulaDTO>(questionId);
    const userPreferences = useAppSelector(selectors.user.preferences);
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const [textInput, setTextInput] = useState('');

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    const hasMetaSymbols = doc.availableSymbols ? doc.availableSymbols.length > 0 && !doc.availableSymbols.every(
        symbol => CHEMICAL_ELEMENTS.includes(symbol.trim()) || CHEMICAL_PARTICLES.hasOwnProperty(symbol.trim())
    ) : false;

    function currentAttemptMhchemExpression(): string {
        return (currentAttemptValue?.result && currentAttemptValue.result.mhchem) || "";
    }

    const [inputState, setInputState] = useState<InputState>(() => ({
        mhchemExpression: '',
        userInput: '',
        valid: true
    }));

    const updateState = (state: any) => {
        const newState = sanitiseInequalityState(state);
        const mhchemExpression = newState?.result?.mhchem || "";
        if (state.userInput !== "" || modalVisible) {
            // Only call dispatch if the user has inputted text or is interacting with the modal
            // Otherwise this causes the response to reset on reload removing the banner
            dispatchSetCurrentAttempt({type: 'chemicalFormula', value: JSON.stringify(newState), mhchemExpression});
        }
        initialEditorSymbols.current = state.symbols;
    };

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        initialEditorSymbols.current = _flattenDeep(currentAttemptValue.symbols);
    }, [currentAttempt, currentAttemptValue]);

    useEffect(() => {
        // Only update the text-entry box if the graphical editor is visible OR if this is the first load
        const mhchemExpression = currentAttemptMhchemExpression();
        if (modalVisible || textInput === '') {
            setTextInput(mhchemExpression);
        }
        if (inputState.mhchemExpression !== mhchemExpression) {
            setInputState({...inputState, userInput: textInput, mhchemExpression});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;
    const showTextEntry = !readonly && (userPreferences?.DISPLAY_SETTING?.CHEM_TEXT_ENTRY ?? false);

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();
    useLayoutEffect(() => {
        if (readonly) return; // as the ref won't be defined
        
        initialiseInequality(doc.isNuclear ? "nuclear" : "chemistry", hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);

    // Automatically filters out state symbols/brackets/etc from Nuclear Physics questions
    const modifiedAvailableSymbols = doc.availableSymbols ? [...doc.availableSymbols] : [];
    if (doc.isNuclear && !hasMetaSymbols) {
        modifiedAvailableSymbols.push("_plus", "_minus", "_fraction", "_right_arrow");
    }

    // We need these symbols available to do processing with, but don't want to display them to the user as available.
    const removedSymbols = ["+","-","/","->","<=>","()","[]","."];
    let symbolList = parsePseudoSymbolicAvailableSymbols(modifiedAvailableSymbols)?.filter(str => !removedSymbols.includes(str)).map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

    symbolList = symbolList?.replace('electron', 'e').replace('alpha', '\\alphaparticle').replace('beta', '\\betaparticle').replace('gamma', '\\gammaray').replace('neutron', '\\neutron')//
        .replace('proton', '\\proton').replace(/(?<!anti)neutrino/, '\\neutrino').replace('antineutrino', '\\antineutrino');

    const mayRequireStateSymbols = !hasMetaSymbols || doc.availableSymbols?.some(symbol => CHEMICAL_STATES.includes(symbol));

    return <div className="symbolic-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {showTextEntry && <div className="eqn-editor-input">
            <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
            <InputGroup className="my-2 separate-input-group">
                <SymbolicTextInput
                    editorMode={doc.isNuclear ? "nuclear" : "chemistry"} inputState={inputState} setInputState={setInputState}
                    textInput={textInput} setTextInput={setTextInput} initialEditorSymbols={initialEditorSymbols}
                    dispatchSetCurrentAttempt={dispatchSetCurrentAttempt} sketchRef={sketchRef}
                />
                <>
                    {siteSpecific(
                        <Button type="button" className="eqn-editor-help" id={helpTooltipId} tag="a" href="/solving_problems#symbolic_text">?</Button>,
                        <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                    )}
                    {!modalVisible ? 
                        <UncontrolledTooltip className="spaced-tooltip" placement="top" autohide={false} target={helpTooltipId}>
                            <TooltipContents nuclear={doc.isNuclear} />
                        </UncontrolledTooltip>
                        : null}
                </>
            </InputGroup>
            <QuestionInputValidation userInput={textInput} validator={(input) => symbolicInputValidator(input, mayRequireStateSymbols)} />
            {symbolList && <div className="eqn-editor-symbols">
                The following symbols may be useful: <pre>{symbolList}</pre>
            </div>}
        </div>}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
            role={readonly ? undefined : "button"} className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={readonly ? undefined : 0}
            onClick={() => !readonly && openModal()} onKeyDown={ifKeyIsEnter(() => !readonly && openModal())}
            dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your answer' }}
        />
        {modalVisible && <InequalityModal
            close={closeModalAndReturnToScrollPosition}
            onEditorStateChange={(state: any) => {
                dispatchSetCurrentAttempt({ type: 'chemicalFormula', value: JSON.stringify(state), mhchemExpression: (state && state.result && state.result.mhchem) || "" });
                initialEditorSymbols.current = state.symbols;
            }}
            availableSymbols={modifiedAvailableSymbols}
            initialEditorSymbols={initialEditorSymbols.current}
            editorSeed={editorSeed}
            editorMode={doc.isNuclear ? "nuclear" : "chemistry"}
            questionDoc={doc}
        />}
    </div>
};
export default IsaacSymbolicChemistryQuestion;
