import React, {ChangeEvent, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {ChemicalFormulaDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    isDefined,
    jsonHelper,
    sanitiseInequalityState,
    siteSpecific,
    useCurrentQuestionAttempt,
    parsePseudoSymbolicAvailableSymbols
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import { Button, Input, InputGroup, UncontrolledTooltip } from "reactstrap";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import { v4 as uuid_v4 } from "uuid";
import { Inequality, makeInequality } from "inequality";
import { parseInequalityChemistryExpression, parseInequalityNuclearExpression, ParsingError } from "inequality-grammar";
import { selectors, useAppSelector } from "../../state";
import { CHEMICAL_ELEMENTS, CHEMICAL_PARTICLES, CHEMICAL_STATES } from "../elements/modals/inequality/constants";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

interface ChildrenMap {
    children: {[key: string]: ChildrenMap}
}

function countChildren(root: ChildrenMap) {
    let q = [root];
    let count = 1;
    while (q.length > 0) {
        const e = q.shift();
        if (!e) continue;

        const c = Object.keys(e.children).length;
        if (c > 0) {
            count = count + c;
            q = q.concat(Object.values(e.children));
        }
    }
    return count;
}

function isError(p: ParsingError | any[]): p is ParsingError {
    return p.hasOwnProperty("error");
}

const IsaacSymbolicChemistryQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicChemistryQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<ChemicalFormulaDTO>(questionId);
    const userPreferences = useAppSelector(selectors.user.preferences);

    const [modalVisible, setModalVisible] = useState(false);
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

    const symbolicInputValidator = (input: string) => {
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
        if (/\(s\)|\(aq\)|\(l\)|\(g\)/.test(input) && hasMetaSymbols && !doc.availableSymbols?.some(symbol => CHEMICAL_STATES.includes(symbol))) {
            errors.push('This question does not require state symbols.');
        }
        return errors;
    };

    function currentAttemptMhchemExpression(): string {
        return (currentAttemptValue?.result && currentAttemptValue.result.mhchem) || "";
    }

    const [inputState, setInputState] = useState(() => ({
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

    const closeModalAndReturnToScrollPosition = useCallback(function(previousYPosition: number) {
        return function() {
            document.body.style.overflow = "initial";
            setModalVisible(false);
            if (isDefined(previousYPosition)) {
                window.scrollTo(0, previousYPosition);
            }
        };
    }(window.scrollY), [modalVisible]);

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    const showTextEntry = !readonly && (userPreferences?.DISPLAY_SETTING?.CHEM_TEXT_ENTRY ?? false);

    useLayoutEffect(() => {
        if (!showTextEntry) return; // as the ref will not be defined

        if (!isDefined(hiddenEditorRef.current)) {
            throw new Error("Unable to initialise inequality; target element not found.");
        }

        const {sketch, p} = makeInequality(
            hiddenEditorRef.current,
            100,
            0,
            _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
            {
                editorMode: doc.isNuclear ? "nuclear" : "chemistry",
                textEntry: true,
                fontItalicPath: '/assets/common/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/common/fonts/STIXGeneral-Regular.ttf',
            }
        );
        if (!isDefined(sketch)) throw new Error("Unable to initialize Inequality.");

        sketch.log = { initialState: [], actions: [] };
        sketch.onNewEditorState = updateState;
        sketch.onCloseMenus = () => undefined;
        sketch.isUserPrivileged = () => true;
        sketch.onNotifySymbolDrag = () => undefined;
        sketch.isTrashActive = () => false;
        sketch.editorMode = doc.isNuclear ? "nuclear" : "chemistry";

        sketchRef.current = sketch;

        return () => {
            if (sketchRef.current) {
                sketchRef.current.onNewEditorState = () => null;
                sketchRef.current.onCloseMenus = () => null;
                sketchRef.current.isTrashActive = () => false;
                sketchRef.current = null;
            }
            p.remove();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setTextInput(input);
        setInputState({...inputState, mhchemExpression: input, userInput: textInput});

        const parsedExpression = doc.isNuclear ? parseInequalityNuclearExpression(input) : parseInequalityChemistryExpression(input);
        if (!isError(parsedExpression) && !(parsedExpression.length === 0 && input !== '')) {
            if (input === '') {
                const state = {result: {tex: "", python: "", mathml: ""}};
                dispatchSetCurrentAttempt({ type: 'chemicalFormula', value: JSON.stringify(sanitiseInequalityState(state)), mhchemExpression: ""});
                initialEditorSymbols.current = [];
            } else if (parsedExpression.length === 1) {
                // This and the next one are using input instead of textInput because React will update the state whenever it sees fit
                // so textInput will almost certainly be out of sync with input which is the current content of the text box.
                sketchRef.current?.parseSubtreeObject(parsedExpression[0], true, true, input);
            } else {
                const sizes = parsedExpression.map(countChildren);
                const i = sizes.indexOf(Math.max.apply(null, sizes));
                sketchRef.current?.parseSubtreeObject(parsedExpression[i], true, true, input);
            }
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

    symbolList = symbolList?.replace('electron', 'e').replace('alpha', '\\alphaparticle').replace('beta', '\\betaparticle').replace('gamma', '\\gammaray').replace('neutron', '\\neutron')//
        .replace('proton', '\\proton').replace(/(?<!anti)neutrino/, '\\neutrino').replace('antineutrino', '\\antineutrino');

    return (
        <div className="symbolic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {showTextEntry && <div className="eqn-editor-input">
                <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                <InputGroup className="my-2 separate-input-group">
                    <Input type="text" onChange={updateEquation} value={textInput}
                        placeholder="Type your formula here"/>
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
                <QuestionInputValidation userInput={textInput} validator={symbolicInputValidator} />
                {symbolList && <div className="eqn-editor-symbols">
                    The following symbols may be useful: <pre>{symbolList}</pre>
                </div>}
            </div>}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
                role={readonly ? undefined : "button"} className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={readonly ? undefined : 0}
                onClick={() => !readonly && setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => !readonly && setModalVisible(true))}
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
    );
};
export default IsaacSymbolicChemistryQuestion;
