import React, {lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {ChemicalFormulaDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    jsonHelper,
    sanitiseInequalityState,
    siteSpecific,
    useCurrentQuestionAttempt,
    parsePseudoSymbolicAvailableSymbols,
    isPhy
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import { Button, Input, InputGroup, UncontrolledTooltip } from "reactstrap";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import { v4 as uuid_v4 } from "uuid";
import { Inequality } from "inequality";
import { selectors, useAppSelector } from "../../state";
import { CHEMICAL_ELEMENTS, CHEMICAL_PARTICLES, CHEMICAL_STATES } from "../elements/modals/inequality/constants";
import { InequalityState, initialiseInequality, InputState, updateEquationHelper, useModalWithScroll } from "./IsaacSymbolicQuestion";
import classNames from "classnames";
import { Loading } from "../handlers/IsaacSpinner";

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

const IsaacSymbolicChemistryQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicChemistryQuestionDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ChemicalFormulaDTO>(questionId);
    const userPreferences = useAppSelector(selectors.user.preferences);
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);

    const [hasStartedEditing, setHasStartedEditing] = useState(false);
    const [hideSeed, setHideSeed] = useState(currentAttempt ?? false);
    
    let currentAttemptValue: InequalityState | undefined;
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    const initialSeedText = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined)?.[0]?.expression?.mhchem ?? '', [doc.formulaSeed]);
    const [textInput, setTextInput] = useState(currentAttemptValue ? currentAttemptValue.result?.mhchem : initialSeedText);

    const emptySubmission = !hasStartedEditing && !currentAttemptValue && !currentAttemptValue?.result;

    const hasMetaSymbols = doc.availableSymbols ? doc.availableSymbols.length > 0 && !doc.availableSymbols.every(
        symbol => CHEMICAL_ELEMENTS.includes(symbol.trim()) || CHEMICAL_PARTICLES.hasOwnProperty(symbol.trim())
    ) : false;

    function currentAttemptMhchemExpression(): string {
        return (currentAttemptValue?.result && currentAttemptValue.result.mhchem) || "";
    }

    const [inputState, setInputState] = useState<InputState>({ mhchemExpression: '', userInput: ''});

    const updateState = (state: InequalityState) => {
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
        // Only update the text-entry box if the graphical editor is visible
        const mhchemExpression = currentAttemptMhchemExpression();
        if (modalVisible) {
            setTextInput(mhchemExpression);
        }
        if (inputState.mhchemExpression !== mhchemExpression) {
            setInputState({...inputState, userInput: textInput, mhchemExpression});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    const showTextEntry = !readonly && (userPreferences?.DISPLAY_SETTING?.CHEM_TEXT_ENTRY ?? false);
    const editorMode = doc.isNuclear ? "nuclear" : "chemistry";

    const previewText = (currentAttemptValue && currentAttemptValue.result)
        ? currentAttemptValue.result.tex
        // chemistry questions *should* show the seed in grey in the preview box if no attempt has been made
        : !hideSeed
            ? jsonHelper.parseOrDefault(doc.formulaSeed, undefined)?.[0]?.expression?.latex
            : undefined;
        // hide seed?: undefined;

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();


    useLayoutEffect(() => {
        if (!showTextEntry) return; // as the ref won't be defined
        
        initialiseInequality(editorMode, hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const updateEquation = (input: string) => {
        updateEquationHelper({
            input, editorMode, inputState, setInputState, setTextInput, setHasStartedEditing,
            initialEditorSymbols, dispatchSetCurrentAttempt, sketchRef
        });
    };

    const openInequality = () => {
        if (!readonly) {
            openModal();
            setHideSeed(true);
        }
    };

    const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);

    // Automatically filters out state symbols/brackets/etc from Nuclear Physics questions
    const modifiedAvailableSymbols = doc.availableSymbols ? [...doc.availableSymbols] : [];
    if (doc.isNuclear && !hasMetaSymbols) {
        modifiedAvailableSymbols.push("_plus", "_minus", "_fraction", "_right_arrow");
    }

    // We need these symbols available to do processing with, but don't want to display them to the user as available.
    const removedSymbols = ["+","-","/","->","<=>","()","[]","."];
    let symbolList = parsePseudoSymbolicAvailableSymbols(modifiedAvailableSymbols)?.filter(str => !removedSymbols.includes(str)).map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

    symbolList = symbolList?.replace('electron', 'e').replace('alpha', '\\alphaparticle').replace('beta', '\\betaparticle').replace('gamma', '\\gammaray').replace('neutron', '\\neutron')
        .replace('proton', '\\proton').replace(/(?<!anti)neutrino/, '\\neutrino').replace('antineutrino', '\\antineutrino');

    const mayRequireStateSymbols = !hasMetaSymbols || doc.availableSymbols?.some(symbol => CHEMICAL_STATES.includes(symbol));

    return <div className="symbolic-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {showTextEntry
            ? <i className="text-muted small">Click in either box below to edit your answer.</i>
            : previewText && <i className="text-muted small">Click in the box below to edit your answer.</i>
        }
        {showTextEntry && <div className="eqn-editor-input mb-2">
            <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
            <InputGroup className="mt-2 separate-input-group">
                <div className="position-relative flex-grow-1">
                    <Input type="text" value={textInput} placeholder="Type your formula here" className={classNames({"h-100": isPhy}, {"text-body-tertiary": emptySubmission})} onChange={(e) => updateEquation(e.target.value)} />
                    {initialSeedText && <button type="button" className="eqn-editor-reset-text-input" aria-label={"Reset to initial value"} onClick={() => {
                        updateEquation('');
                        if (sketchRef.current) sketchRef.current.loadTestCase(editorSeed ?? "");
                        setHasStartedEditing(false);
                        dispatchSetCurrentAttempt({ type: 'chemicalFormula', value: "", mhchemExpression: "", frontEndValidation: false });
                        setTextInput(initialSeedText);
                        setHideSeed(false);
                    }}>
                        ↺
                    </button>}
                </div>
                <>
                    {siteSpecific(
                        <Button type="button" className="eqn-editor-help" id={helpTooltipId} tag="a" href="/solving_problems#symbolic_text">?</Button>,
                        <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                    )}
                    {!modalVisible ? 
                        (doc.isNuclear
                            ? <UncontrolledTooltip className="spaced-tooltip" placement="top" autohide={false} target={helpTooltipId}>
                                Here are some examples of expressions you can type:<br />
                                {"^{238}_{92}U -> ^{4}_{2}\\alphaparticle + _{90}^{234}Th"}<br />
                                {"^{0}_{-1}e"}<br />
                                {"\\gammaray"}<br />
                                As you type, the box above will preview the result.
                            </UncontrolledTooltip>
                            : <UncontrolledTooltip className="spaced-tooltip" placement="top" autohide={false} target={helpTooltipId}>
                                Here are some examples of expressions you can type:<br />
                                H2O<br />
                                2 H2 + O2 -&gt; 2 H2O<br />
                                CH3(CH2)3CH3<br />
                                {"NaCl(aq) -> Na^{+}(aq) +  Cl^{-}(aq)"}<br />
                                As you type, the box above will preview the result.
                            </UncontrolledTooltip>
                        )
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
            role={readonly ? undefined : "button"} tabIndex={readonly ? undefined : 0}
            className={classNames("eqn-editor-preview rounded mt-2", {"empty": !previewText, "text-body-tertiary": previewText && emptySubmission})} 
            onClick={openInequality} onKeyDown={ifKeyIsEnter(openInequality)}
            dangerouslySetInnerHTML={{ __html: previewText && (doc.showInequalitySeed || !emptySubmission)
                ? katex.renderToString(previewText) 
                : (showTextEntry ? '<span>or click here to drag and drop your answer</span>' : '<span>Click to enter your answer</span>')
            }}
        />
        {modalVisible && <Suspense fallback={<Loading/>}>
            <InequalityModal
                editorMode={editorMode} initialEditorSymbols={initialEditorSymbols.current}
                availableSymbols={modifiedAvailableSymbols} editorSeed={editorSeed} questionDoc={doc}
                onEditorStateChange={updateState} close={closeModalAndReturnToScrollPosition}
            />
        </Suspense>}
    </div>;
};
export default IsaacSymbolicChemistryQuestion;
