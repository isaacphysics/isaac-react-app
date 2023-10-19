import React, { ChangeEvent, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as RS from "reactstrap";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { FormulaDTO, IsaacSymbolicQuestionDTO } from "../../../IsaacApiTypes";
import katex from "katex";
import {
  ifKeyIsEnter,
  isDefined,
  jsonHelper,
  sanitiseInequalityState,
  parsePseudoSymbolicAvailableSymbols,
  useCurrentQuestionAttempt,
} from "../../services";
import { Inequality, makeInequality } from "inequality";
import { parseMathsExpression, ParsingError } from "inequality-grammar";
import _flattenDeep from "lodash/flatMapDeep";
import { v4 as uuid_v4 } from "uuid";
import { IsaacQuestionProps } from "../../../IsaacAppTypes";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

// Magic starts here
interface ChildrenMap {
  children: { [key: string]: ChildrenMap };
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

const IsaacSymbolicQuestion = ({ doc, questionId, readonly }: IsaacQuestionProps<IsaacSymbolicQuestionDTO>) => {
  const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<FormulaDTO>(questionId);

  const [modalVisible, setModalVisible] = useState(false);
  const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
  const initialEditorSymbols = useRef(editorSeed ?? []);
  const [textInput, setTextInput] = useState("");

  function currentAttemptPythonExpression(): string {
    return (currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python) || "";
  }

  const [inputState, setInputState] = useState(() => ({
    pythonExpression: currentAttemptPythonExpression(),
    userInput: "",
    valid: true,
  }));

  let currentAttemptValue: any | undefined;
  if (currentAttempt && currentAttempt.value) {
    currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {
      result: { tex: "\\textrm{PLACEHOLDER HERE}" },
    });
  }

  const updateState = (state: any) => {
    const newState = sanitiseInequalityState(state);
    const pythonExpression = newState?.result?.python || "";
    const previousPythonExpression = currentAttemptValue?.result?.python || "";
    if (!previousPythonExpression || previousPythonExpression !== pythonExpression) {
      dispatchSetCurrentAttempt({ type: "formula", value: JSON.stringify(newState), pythonExpression });
    }
    initialEditorSymbols.current = state.symbols;
  };

  useEffect(() => {
    // Only update the text-entry box if the graphical editor is visible OR if this is the first load
    const pythonExpression = currentAttemptPythonExpression();
    if (modalVisible || textInput === "") {
      setTextInput(pythonExpression);
    }
    if (inputState.pythonExpression !== pythonExpression) {
      setInputState({ ...inputState, userInput: textInput, pythonExpression });
    }
  }, [currentAttempt]);

  const closeModal = (previousYPosition: number) => () => {
    document.body.style.overflow = "initial";
    setModalVisible(false);
    if (isDefined(previousYPosition)) {
      window.scrollTo(0, previousYPosition);
    }
  };

  const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

  const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<Inequality>();

  useLayoutEffect(() => {
    const { sketch } = makeInequality(
      hiddenEditorRef.current,
      100,
      0,
      _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
      {
        textEntry: true,
        fontItalicPath: "/assets/fonts/STIXGeneral-Italic.ttf",
        fontRegularPath: "/assets/fonts/STIXGeneral-Regular.ttf",
      },
    );
    if (isDefined(sketch)) {
      sketch.log = { initialState: [], actions: [] };
      sketch.onNewEditorState = updateState;
      sketch.onCloseMenus = () => undefined;
      sketch.isUserPrivileged = () => true;
      sketch.onNotifySymbolDrag = () => undefined;
      sketch.isTrashActive = () => false;

      sketchRef.current = sketch;
    }
  }, [hiddenEditorRef.current]);

  const [errors, setErrors] = useState<string[]>();

  const debounceTimer = useRef<number | null>(null);
  const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
    const pycode = e.target.value;
    setTextInput(pycode);
    setInputState({ ...inputState, pythonExpression: pycode, userInput: textInput });

    // Parse that thing
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    debounceTimer.current = window.setTimeout(() => {
      const parsedExpression = parseMathsExpression(pycode);

      if (isError(parsedExpression) || (parsedExpression.length === 0 && pycode !== "")) {
        const openBracketsCount = pycode.split("(").length - 1;
        const closeBracketsCount = pycode.split(")").length - 1;
        const regexStr = "[^ 0-9A-Za-z()*+,-./<=>^_±²³¼½¾×÷=]+";
        const badCharacters = new RegExp(regexStr);
        const _errors = [];
        if (/\\[a-zA-Z()]|[{}]/.test(pycode)) {
          _errors.push("LaTeX syntax is not supported.");
        }
        if (/\|.+?\|/.test(pycode)) {
          _errors.push("Vertical bar syntax for absolute value is not supported; use abs() instead.");
        }
        if (badCharacters.test(pycode)) {
          const usedBadChars: string[] = [];
          for (let i = 0; i < pycode.length; i++) {
            const char = pycode.charAt(i);
            if (badCharacters.test(char)) {
              if (!usedBadChars.includes(char)) {
                usedBadChars.push(char);
              }
            }
          }
          _errors.push("Some of the characters you are using are not allowed: " + usedBadChars.join(" "));
        }
        if (openBracketsCount !== closeBracketsCount) {
          _errors.push(
            "You are missing some " + (closeBracketsCount > openBracketsCount ? "opening" : "closing") + " brackets.",
          );
        }
        if (/\.[0-9]/.test(pycode)) {
          _errors.push("Please convert decimal numbers to fractions.");
        }
        setErrors(_errors);
      } else {
        if (/[A-Zbd-z](sin|cos|tan|log|ln|sqrt)\(/.test(pycode)) {
          // A warning about a common mistake naive users may make (no warning for asin or arcsin though):
          setErrors(["Make sure to use spaces or * signs before function names like 'sin' or 'sqrt'!"]);
        } else {
          setErrors(undefined);
        }
        if (pycode === "") {
          const state = { result: { tex: "", python: "", mathml: "" } };
          dispatchSetCurrentAttempt({
            type: "formula",
            value: JSON.stringify(sanitiseInequalityState(state)),
            pythonExpression: "",
          });
          initialEditorSymbols.current = [];
        } else if (parsedExpression.length === 1) {
          // This and the next one are using pycode instead of textInput because React will update the state whenever it sees fit
          // so textInput will almost certainly be out of sync with pycode which is the current content of the text box.
          sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[0], true, true, pycode);
        } else {
          const sizes = parsedExpression.map(countChildren);
          const i = sizes.indexOf(Math.max.apply(null, sizes));
          sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[i], true, true, pycode);
        }
      }
    }, 250);
  };

  const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);
  const symbolList = parsePseudoSymbolicAvailableSymbols(doc.availableSymbols)
    ?.map((str) => str.trim().replace(/;/g, ","))
    .sort()
    .join(", ");

  return (
    <div className="symbolic-question">
      <div className="question-content">
        <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
          {doc.children}
        </IsaacContentValueOrChildren>
      </div>
      {/* TODO Accessibility */}
      {modalVisible && (
        <InequalityModal
          close={closeModal(window.scrollY)}
          onEditorStateChange={updateState}
          availableSymbols={doc.availableSymbols}
          initialEditorSymbols={initialEditorSymbols.current}
          editorSeed={editorSeed}
          editorMode="maths"
          questionDoc={doc}
        />
      )}
      {!readonly && (
        <div className="eqn-editor-input">
          <div
            ref={hiddenEditorRef}
            className="equation-editor-text-entry"
            style={{ height: 0, overflow: "hidden", visibility: "hidden" }}
          />
          <RS.InputGroup className="my-2">
            <RS.Input type="text" onChange={updateEquation} value={textInput} placeholder="Type your formula here" />
            <RS.InputGroupAddon addonType="append">
              <RS.Button
                type="button"
                className="eqn-editor-help"
                id={helpTooltipId}
                tag="a"
                href="/solving_problems#symbolic_text"
              >
                ?
              </RS.Button>
              <RS.UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                Here are some examples of expressions you can type:
                <br />
                <br />
                a*x^2 + b x + c<br />
                (-b ± sqrt(b**2 - 4ac)) / (2a)
                <br />
                1/2 mv**2
                <br />
                log(x_a, 2) == log(x_a) / log(2)
                <br />
                <br />
                As you type, the box below will preview the result.
              </RS.UncontrolledTooltip>
            </RS.InputGroupAddon>
          </RS.InputGroup>
          {isDefined(errors) && Array.isArray(errors) && errors.length > 0 && (
            <div className="eqn-editor-input-errors">
              <strong>Careful!</strong>
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {symbolList && (
            <div className="eqn-editor-symbols">
              The following symbols may be useful: <pre>{symbolList}</pre>
            </div>
          )}
        </div>
      )}
      <div
        role={readonly ? undefined : "button"}
        className={`eqn-editor-preview rounded ${!previewText ? "empty" : ""}`}
        tabIndex={readonly ? undefined : 0}
        onClick={() => !readonly && setModalVisible(true)}
        onKeyDown={ifKeyIsEnter(() => !readonly && setModalVisible(true))}
        dangerouslySetInnerHTML={{
          __html: !inputState.valid
            ? "<small>or click to replace your typed answer</small>"
            : previewText
            ? katex.renderToString(previewText)
            : "<small>or click here to drag and drop your answer</small>",
        }}
      />
    </div>
  );
};
export default IsaacSymbolicQuestion;
