import { Inequality } from "inequality";
import React from "react";
import { FormulaDTO, LogicFormulaDTO, ChemicalFormulaDTO } from "../../../../IsaacApiTypes";
import { EditorMode } from "../modals/inequality/constants";
import { parseBooleanExpression, parseInequalityChemistryExpression, parseInequalityNuclearExpression, parseMathsExpression, ParsingError } from "inequality-grammar";
import { ValidatedChoice } from "../../../../IsaacAppTypes";
import { sanitiseInequalityState } from "../../../services/questions";
import { isPhy, siteSpecific } from "../../../services";
import { Button, Input, InputGroup, UncontrolledTooltip } from "reactstrap";
import QuestionInputValidation from "./QuestionInputValidation";
import classNames from "classnames";

type GeneralFormulaDTO = FormulaDTO | LogicFormulaDTO | ChemicalFormulaDTO;

interface ChildrenMap {
    children: {[key: string]: ChildrenMap};
}

// The parser retuns a complex structure that isn't fully typed, but we still want to label its use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InequalitySymbol = any;

export type InequalityState = {
    result?: {
        tex?: string;
        python?: string;
        mathml?: string;
        mhchem?: string;
        uniqueSymbols?: string;
    };
    symbols?: InequalitySymbol[];
    textEntry?: boolean;
    userInput?: string;
};

// Inequality grammar is not currently typed
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
export function isError(p: ParsingError | any[]): p is ParsingError {
    return p.hasOwnProperty("error");
}

export const symbolicTextInputValidator = (input: string, editorMode: string, mayRequireStateSymbols?: boolean, demoPage?: boolean,) => {
    const errors = [];
    if (demoPage) {
        const parsedExpression = editorMode === "maths"
            ? parseMathsExpression(input) 
            : editorMode === "chemistry"
                ? parseInequalityChemistryExpression(input)
                : editorMode === "nuclear"
                    ? parseInequalityNuclearExpression(input)
                    : parseBooleanExpression(input);

        if (isError(parsedExpression) && parsedExpression.error) {
            errors.push(`Syntax error: unexpected token "${parsedExpression.error.token.value || ''}"`);
        }
    }

    if (["maths", "logic"].includes(editorMode) && /\\[a-zA-Z()]|[{}]/.test(input)) {
        errors.push('LaTeX syntax is not supported.');
    }

    let badCharacters = new RegExp(/[^ 0-9A-Za-z]+/);
    if (editorMode === 'maths') {
        badCharacters = new RegExp(/[^ 0-9A-Za-z()*+,-./<=>^_±²³¼½¾×÷]+/);
    } else if (editorMode === 'logic') {
        badCharacters = new RegExp(/[^ A-Za-z&|01()~¬∧∨⊻+.!=]+/);
    } else if (["chemistry", "nuclear"].includes(editorMode)) {
        badCharacters = new RegExp(/[^ 0-9A-Za-z()[\]{}*+,-./<=>^_\\]+/);
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

    const openRoundBracketsCount = input.split("(").length - 1;
    const closeRoundBracketsCount = input.split(")").length - 1;
    const openSquareBracketsCount = ["nuclear", "chemistry"].includes(editorMode) ? input.split("[").length - 1 : 0;
    const closeSquareBracketsCount = ["nuclear", "chemistry"].includes(editorMode) ? input.split("]").length - 1 : 0;
    const openCurlyBracketsCount = ["nuclear", "chemistry"].includes(editorMode) ? input.split("{").length - 1 : 0;
    const closeCurlyBracketsCount = ["nuclear", "chemistry"].includes(editorMode) ? input.split("}").length - 1 : 0;
    if (openRoundBracketsCount !== closeRoundBracketsCount
        || openSquareBracketsCount !== closeSquareBracketsCount
        || openCurlyBracketsCount !== closeCurlyBracketsCount) {
        if (["nuclear", "chemistry"].includes(editorMode)) {
            // Rather than a long message about which brackets need closing
            errors.push('You are missing some brackets.');
        } else {
            errors.push('You are missing some ' + (closeRoundBracketsCount > openRoundBracketsCount ? 'opening' : 'closing') + ' brackets.');
        }
    }

    if (["chemistry", "nuclear", "maths"].includes(editorMode) && /\.[0-9]/.test(input)) {
        errors.push('Please convert decimal numbers to fractions.');
    }
    if (editorMode === "chemistry" && /\(s\)|\(aq\)|\(l\)|\(g\)/.test(input) && !mayRequireStateSymbols) {
        errors.push('This question does not require state symbols.');
    }
    if (editorMode === "maths") {
        if (/[<>=].+[<>=]/.test(input)) {
            errors.push('We are not able to accept double inequalities, and answers will never require them.');
        }
        const invTrig = input.match(/(((sin|cos|tan|sec|cosec|cot)(h?))(\^|\*\*)[({]?-1[)}]?)/);
        if (invTrig != null) {
            const trigFunction = invTrig[2];
            if (invTrig[4] === 'h') {
                errors.push("To create the inverse " + trigFunction + " function, use 'ar" + trigFunction + "'.");
            }
            else {
                errors.push("To create the inverse " + trigFunction + " function, use 'arc" + trigFunction + "'.");
            }
        }
        if (/[A-Zbd-z](sin|cos|tan|log|ln|sqrt)\(/.test(input)) {
            // A warning about a common mistake naive users may make (no warning for asin or arcsin though):
            return ["Make sure to use spaces or * signs before function names like 'sin' or 'sqrt'!"];
        }
    }
    return errors;
};

const TooltipContents = ({editorMode}: {editorMode: EditorMode}) => {
    const example: React.ReactNode = 
        editorMode === "maths" ? <> a*x^2 + b x + c <br/> (-b ± sqrt(b**2 - 4ac)) / (2a) <br/> 1/2 mv**2 <br/> log(x_a, 2) == log(x_a) / log(2) <br/> </>
            : editorMode === "chemistry" ? <> H2O <br/> 2 H2 + O2 -&gt; 2 H2O <br/> CH3(CH2)3CH3 <br/> {"NaCl(aq) -> Na^{+}(aq) +  Cl^{-}(aq)"} <br/> </>
                : editorMode === "nuclear" ? <>  {"^{238}_{92}U -> ^{4}_{2}\\alphaparticle + _{90}^{234}Th"} <br/> {"^{0}_{-1}e"} <br/> {"\\gammaray"} <br/> </>
                    : <> A and (B or not C) <br/> A &amp; (B | !C) <br/> True &amp; ~(False + Q) <br/> 1 . ~(0 + Q) <br/></>;

    return <>
        Here are some examples of expressions you can type:<br />
        <br />
        {example}
        <br />
        As you type, the box below will preview the result.
    </>;
};

interface SymbolicTextInputProps {
    editorMode: EditorMode;
    demoPage?: boolean;
    hiddenEditorRef: React.MutableRefObject<HTMLDivElement | null>;
    textInput: string;
    setTextInput: React.Dispatch<React.SetStateAction<string>>;
    setHideSeed?: React.Dispatch<React.SetStateAction<boolean>>;
    setHasStartedEditing: React.Dispatch<React.SetStateAction<boolean>>;
    initialSeedText?: string;
    helpTooltipId: string;
    editorSeed?: InequalitySymbol[];
    emptySubmission: boolean;
    initialEditorSymbols: React.MutableRefObject<InequalitySymbol[]>;
    dispatchSetCurrentAttempt: (attempt: GeneralFormulaDTO | ValidatedChoice<GeneralFormulaDTO>) => void;
    sketchRef: React.MutableRefObject<Inequality | null | undefined>;
    mayRequireStateSymbols?: boolean;
    symbolList?: string;
}

export const SymbolicTextInput = ({editorMode, demoPage, hiddenEditorRef, textInput, setTextInput, setHideSeed, setHasStartedEditing, initialSeedText, editorSeed, helpTooltipId, initialEditorSymbols, dispatchSetCurrentAttempt, sketchRef, emptySubmission, mayRequireStateSymbols, symbolList}: SymbolicTextInputProps) => {
    const constructCurrentAttemptValue = (value: string): GeneralFormulaDTO => ({
        type: editorMode === "maths" ? 'formula' : editorMode === "logic" ? "logicFormula" : "chemicalFormula", 
        value: value, 
        ...(["chemistry", "nuclear"].includes(editorMode) ? {mhchemExpression: ""} : {pythonExpression: ""})
    });

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

    const updateEquation = (input: string) => {
        setTextInput(input);

        const parsedExpression = editorMode === "maths"
            ? parseMathsExpression(input) 
            : editorMode === "chemistry"
                ? parseInequalityChemistryExpression(input)
                : editorMode === "nuclear"
                    ? parseInequalityNuclearExpression(input)
                    : parseBooleanExpression(input);

        if (!isError(parsedExpression) && !(parsedExpression.length === 0 && input !== '')) {
            if (input === '') {
                const state = {result: {tex: "", python: "", mathml: ""}};
                dispatchSetCurrentAttempt(constructCurrentAttemptValue(JSON.stringify(sanitiseInequalityState(state))));
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

    return <div className="eqn-editor-input">
        <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
        <InputGroup className="my-2 separate-input-group">
            <div className="d-flex flex-nowrap w-100">
                <div className="position-relative flex-grow-1">      
                    <Input type="text" onChange={(e) => updateEquation(e.target.value)} value={textInput} placeholder={(editorMode === "logic" && !demoPage) ? "or type your formula here" : "Type your formula here"} className={classNames({"h-100": isPhy}, {"text-body-tertiary": emptySubmission && textInput === initialSeedText})}/>
                    {initialSeedText && <button type="button" className="eqn-editor-reset-text-input" aria-label={"Reset to initial value"} onClick={() => {
                        updateEquation('');
                        if (sketchRef.current) sketchRef.current.loadTestCase(editorSeed ?? []);
                        setHasStartedEditing(false);
                        dispatchSetCurrentAttempt({...constructCurrentAttemptValue(""), frontEndValidation: false});
                        setTextInput(initialSeedText);
                        if (setHideSeed) setHideSeed(false);
                    }}>
                        ↺
                    </button>}
                </div>
                <>
                    {siteSpecific(
                        <Button id={helpTooltipId} type="button" className="eqn-editor-help" tag="a" href="/solving_problems#symbolic_text">?</Button>,
                        <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                    )}
                    <UncontrolledTooltip target={helpTooltipId} placement="top" autohide={false}>
                        <TooltipContents editorMode={editorMode}/>
                    </UncontrolledTooltip>
                </>
            </div>
            <QuestionInputValidation userInput={textInput} validator={(input) => symbolicTextInputValidator(input, editorMode, mayRequireStateSymbols, demoPage)}/>
        </InputGroup>
        {symbolList && <div className="eqn-editor-symbols">
            The following symbols may be useful: <pre>{symbolList}</pre>
        </div>}
    </div>;
};
