import React, {lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {ChemicalFormulaDTO, IsaacSymbolicChemistryQuestionDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    jsonHelper,
    sanitiseInequalityState,
    useCurrentQuestionAttempt,
    parsePseudoSymbolicAvailableSymbols,
    initialiseInequality,
    useModalWithScroll,
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import { v4 as uuid_v4 } from "uuid";
import { Inequality } from "inequality";
import { selectors, useAppSelector } from "../../state";
import { CHEMICAL_ELEMENTS, CHEMICAL_PARTICLES, CHEMICAL_STATES } from "../elements/modals/inequality/constants";
import classNames from "classnames";
import { Loading } from "../handlers/IsaacSpinner";
import { InequalityState, InequalitySymbol, SymbolicTextInput } from "../elements/inputs/SymbolicTextInput";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

const IsaacSymbolicChemistryQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicChemistryQuestionDTO>) => {
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<ChemicalFormulaDTO>(questionId);
    const currentAttemptValue: InequalityState | undefined = currentAttempt && currentAttempt.value ? jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}}) : undefined;
    
    const [hideSeed, setHideSeed] = useState(!!currentAttempt);
    const initialSeedText = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined)?.[0]?.expression?.mhchem ?? '', [doc.formulaSeed]);
    const previewText = (currentAttemptValue && currentAttemptValue.result) ? currentAttemptValue.result.tex
        // chemistry questions *should* show the seed in grey in the preview box if no attempt has been made
        : !hideSeed ? initialSeedText : undefined;
    const [textInput, setTextInput] = useState(currentAttemptValue ? currentAttemptValue.result?.mhchem : initialSeedText);

    const [hasStartedEditing, setHasStartedEditing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const emptySubmission = !hasStartedEditing && !currentAttemptValue;
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    const userPreferences = useAppSelector(selectors.user.preferences);

    const editorSeed: InequalitySymbol[] = useRef(jsonHelper.parseOrDefault(doc.formulaSeed, undefined)).current;
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const hasMetaSymbols = doc.availableSymbols ? doc.availableSymbols.length > 0 && !doc.availableSymbols.every(
        symbol => CHEMICAL_ELEMENTS.includes(symbol.trim()) || CHEMICAL_PARTICLES.hasOwnProperty(symbol.trim())
    ) : false;

    const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);
    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    const editorMode = doc.isNuclear ? "nuclear" : "chemistry";

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

    const mayRequireStateSymbols = !hasMetaSymbols || CHEMICAL_STATES?.some(state => symbolList?.includes(state));

    const updateState = (state: InequalityState) => {
        const newState = sanitiseInequalityState(state);
        const mhchemExpression = newState?.result?.mhchem || "";
        if (state.userInput !== "" || modalVisible) {
            // Only call dispatch if the user has inputted text or is interacting with the modal
            // Otherwise this causes the response to reset on reload removing the banner
            dispatchSetCurrentAttempt({type: 'chemicalFormula', value: JSON.stringify(newState), mhchemExpression});
        }
        initialEditorSymbols.current = state.symbols ?? [];
    };

    useEffect(() => {
        // Only update the text-entry box if the graphical editor is visible
        const mhchemExpression = (currentAttemptValue?.result && currentAttemptValue.result.mhchem) || "";
        if (modalVisible) {
            setTextInput(mhchemExpression);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    const showTextEntry = !readonly && (userPreferences?.DISPLAY_SETTING?.CHEM_TEXT_ENTRY ?? false);
    useLayoutEffect(() => {
        if (!showTextEntry) return; // as the ref won't be defined
        
        initialiseInequality(editorMode, hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        initialEditorSymbols.current = _flattenDeep(currentAttemptValue.symbols);
    }, [currentAttempt, currentAttemptValue]);

    const openInequality = () => {
        if (!readonly) {
            openModal();
            setHideSeed(true);
        }
    };

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
        {showTextEntry && <SymbolicTextInput editorMode={editorMode} hiddenEditorRef={hiddenEditorRef}
            textInput={textInput} setTextInput={setTextInput} setHasStartedEditing={setHasStartedEditing} initialSeedText={initialSeedText}
            editorSeed={editorSeed} setHideSeed={setHideSeed} initialEditorSymbols={initialEditorSymbols} dispatchSetCurrentAttempt={dispatchSetCurrentAttempt}
            sketchRef={sketchRef} emptySubmission={emptySubmission} helpTooltipId={helpTooltipId} mayRequireStateSymbols={mayRequireStateSymbols} symbolList={symbolList}
        />}
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
