import React, {ChangeEvent, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {selectors, useAppSelector} from "../../state";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacSymbolicLogicQuestionDTO, LogicFormulaDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    isDefined,
    jsonHelper,
    sanitiseInequalityState,
    siteSpecific,
    useCurrentQuestionAttempt,
    useUserPreferences
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {Button, Input, InputGroup, UncontrolledTooltip} from 'reactstrap';
import {v4 as uuid_v4} from "uuid";
import {Inequality, makeInequality} from 'inequality';
import {parseBooleanExpression, ParsingError} from 'inequality-grammar';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

// Magic starts here
interface ChildrenMap {
    children: {[key: string]: ChildrenMap};
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

export const symbolicLogicInputValidator = (input: string) => {
    const openBracketsCount = input.split('(').length - 1;
    const closeBracketsCount = input.split(')').length - 1;
    const regexStr = "[^ A-Za-z&|01()~¬∧∨^⊻+.!=]+";
    const badCharacters = new RegExp(regexStr);

    const errors = [];
    if (/\\[a-zA-Z()]|[{}]/.test(input)) {
        errors.push('LaTeX syntax is not supported.');
    }
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
    if (openBracketsCount !== closeBracketsCount) {
        errors.push('You are missing some ' + (closeBracketsCount > openBracketsCount ? 'opening' : 'closing') + ' brackets.');
    }
    return errors;
};

const IsaacSymbolicLogicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicLogicQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<LogicFormulaDTO>(questionId);

    const [modalVisible, setModalVisible] = useState(false);
    const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const {preferredBooleanNotation} = useUserPreferences();
    const [textInput, setTextInput] = useState('');
    const user = useAppSelector(selectors.user.orNull);

    let currentAttemptValue: any | undefined = undefined;

    function currentAttemptPythonExpression(): string {
        return (currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python) || "";
    }

    const [inputState, setInputState] = useState(() => ({pythonExpression: currentAttemptPythonExpression(), userInput: '', valid: true}));
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    const updateState = (state: any) => {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        dispatchSetCurrentAttempt({type: 'logicFormula', value: JSON.stringify(newState), pythonExpression});
        initialEditorSymbols.current = state.symbols;
    };

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        initialEditorSymbols.current = _flattenDeep(currentAttemptValue.symbols);
    }, [currentAttempt, currentAttemptValue]);

    useEffect(() => {
        // Only update the text-entry box if the graphical editor is visible OR if this is the first load
        const pythonExpression = currentAttemptPythonExpression();
        if (modalVisible || textInput === '') {
            setTextInput(pythonExpression);
        }
        if (inputState.pythonExpression !== pythonExpression) {
            setInputState({...inputState, userInput: textInput, pythonExpression});
        }
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

    useLayoutEffect(() => {        
        if (readonly) return; // as the ref won't be defined

        if (!isDefined(hiddenEditorRef.current)) {
            throw new Error("Unable to initialise inequality; target element not found.");
        }

        const { sketch, p } = makeInequality(
            hiddenEditorRef.current,
            100,
            0,
            _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
            {
                editorMode: "logic",
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
    }, [hiddenEditorRef.current]);

    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setTextInput(input);
        setInputState({...inputState, pythonExpression: input, userInput: textInput});

        const parsedExpression = parseBooleanExpression(input);
        if (!isError(parsedExpression) && !(parsedExpression.length === 0 && input !== '')) {
            if (input === '') {
                const state = {result: {tex: "", python: "", mathml: ""}};
                dispatchSetCurrentAttempt({ type: 'logicFormula', value: JSON.stringify(sanitiseInequalityState(state)), pythonExpression: ""});
                initialEditorSymbols.current = [];
            } else if (parsedExpression.length === 1) {
                // This and the next one are using input instead of textInput because React will update the state whenever it sees fit
                // so textInput will almost certainly be out of sync with input which is the current content of the text box.
                sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[0], true, true, input);
            } else {
                const sizes = parsedExpression.map(countChildren);
                const i = sizes.indexOf(Math.max.apply(null, sizes));
                sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[i], true, true, input);
            }
        }
    };

    const helpTooltipId = CSS.escape(`eqn-editor-help-${uuid_v4()}`);
    const symbolList = doc.availableSymbols?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

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
                dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your expression' }}
            />
            {modalVisible && <InequalityModal
                close={closeModalAndReturnToScrollPosition}
                onEditorStateChange={(state: any) => {
                    dispatchSetCurrentAttempt({ type: 'logicFormula', value: JSON.stringify(state), pythonExpression: (state && state.result && state.result.python)||"" });
                    initialEditorSymbols.current = state.symbols;
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols.current}
                editorSeed={editorSeed}
                editorMode='logic'
                logicSyntax={preferredBooleanNotation === "ENG" ? 'binary' : 'logic'}
                questionDoc={doc}
            />}
            {!readonly && <div className="eqn-editor-input">
                <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                <InputGroup className="my-2 separate-input-group">
                    <Input type="text" onChange={updateEquation} value={textInput} placeholder="or type your expression here"/>
                    <>
                        {siteSpecific(
                            <Button type="button" className="eqn-editor-help" id={helpTooltipId}>?</Button>,
                            <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                        )}
                        <UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                            Here are some examples of expressions you can type:<br />
                            <br />
                            A and (B or not C)<br />
                            A &amp; (B | !C)<br />
                            True &amp; ~(False + Q)<br />
                            1 . ~(0 + Q)<br />
                            As you type, the box above will preview the result.
                        </UncontrolledTooltip>
                    </>
                </InputGroup>
                <QuestionInputValidation userInput={textInput} validator={symbolicLogicInputValidator} />
                {symbolList && <div className="eqn-editor-symbols">
                    The following symbols may be useful: <pre>{symbolList}</pre>
                </div>}
            </div>}
        </div>
    );
};
export default IsaacSymbolicLogicQuestion;
