import { Inequality, WidgetSpec, makeInequality } from "inequality";
import { InequalityState } from "../components/elements/inputs/SymbolicTextInput";
import { EditorMode, LogicSyntax } from "../components/elements/modals/inequality/constants";
import { REVERSE_GREEK_LETTERS_MAP_LATEX, REVERSE_GREEK_LETTERS_MAP_PYTHON } from "./constants";
import { isDefined } from "./miscUtils";
import _flattenDeep from 'lodash/flatMapDeep';

/**
 * IMPORTANT: only import this file from lazily-imported components!!
 */

interface PrepareInequalityArgs {
    editorMode?: EditorMode;
    logicSyntax?: LogicSyntax;
    inequalityModalRef: React.RefObject<HTMLDivElement>;
    isTrashActive: React.MutableRefObject<boolean>;
    sketch: React.MutableRefObject<Nullable<Inequality>>;
    initialEditorSymbols: WidgetSpec[];
    onEditorStateChange?: (state: InequalityState) => void;
    setEditorState: React.Dispatch<React.SetStateAction<InequalityState>>;
}

export function prepareInequality({editorMode, inequalityModalRef, initialEditorSymbols, isTrashActive, sketch, logicSyntax, setEditorState, onEditorStateChange}: PrepareInequalityArgs) {
    if (!isDefined(inequalityModalRef.current)) {
        throw new Error("Unable to initialise inequality; target element not found.");
    }
    
    const { sketch: newSketch, p } = makeInequality(
        inequalityModalRef.current,
        window.innerWidth,
        window.innerHeight,
        initialEditorSymbols,
        {
            editorMode: editorMode ?? "logic",
            logicSyntax: logicSyntax ?? "logic",
            textEntry: false,
            fontItalicPath: '/assets/common/fonts/STIXGeneral-Italic.ttf',
            fontRegularPath: '/assets/common/fonts/STIXGeneral-Regular.ttf'
        }
    );
    if (!isDefined(newSketch)) {
        throw new Error("Unable to initialize inequality.");
    }
    newSketch.log = {
        initialState: [],
        actions: [{
            event: "OPEN",
            timestamp: Date.now()
        }]
    };
    newSketch.onCloseMenus = () => undefined;
    newSketch.isTrashActive = () => isTrashActive.current;
    newSketch.onNewEditorState = (state: InequalityState) => {
        const modal = inequalityModalRef.current;
        if (modal) {
            const newState = sanitiseInequalityState(state);
            setEditorState((prev: InequalityState) => ({...prev, ...newState}));
            onEditorStateChange?.(newState);
        }
    };
    sketch.current = newSketch;
    return () => {
        if (sketch.current) {
            sketch.current.onNewEditorState = () => null;
            sketch.current.onCloseMenus = () => null;
            sketch.current.isTrashActive = () => false;
            sketch.current = null;
        }
        p.remove();
    };
}

export const initialiseInequality = (editorMode: string, hiddenEditorRef: React.MutableRefObject<HTMLDivElement | null>, sketchRef: React.MutableRefObject<Inequality | null | undefined>, currentAttemptValue: InequalityState | undefined, updateState: (state: InequalityState) => void) => {
    if (!isDefined(hiddenEditorRef.current)) {
        throw new Error("Unable to initialise inequality; target element not found.");
    }

    const {sketch, p} = makeInequality(
        hiddenEditorRef.current,
        100,
        0,
        _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
        {
            editorMode,
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
    sketch.editorMode = editorMode;

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
};

export function sanitiseInequalityState(state: InequalityState): InequalityState {
    const saneState = JSON.parse(JSON.stringify(state));
    if (saneState.result?.tex) {
        saneState.result.tex = saneState.result.tex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_LATEX[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP_LATEX[l] : l).join('');
    }
    if (saneState.result?.python) {
        saneState.result.python = saneState.result.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_PYTHON[l] || l).join('');
    }
    if (saneState.result?.uniqueSymbols) {
        saneState.result.uniqueSymbols = saneState.result.uniqueSymbols.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_PYTHON[l] || l).join('');
    }
    if (saneState.symbols) {
        for (const symbol of saneState.symbols) {
            if (symbol.expression.latex) {
                symbol.expression.latex = symbol.expression.latex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_LATEX[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP_LATEX[l] : l).join('');
            }
            if (symbol.expression.python) {
                symbol.expression.python = symbol.expression.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP_PYTHON[l] || l).join('');
            }
        }
    }
    return saneState;
}

const pseudoToSymbolDict: {[key: string]: string[]} = {
    // Maths pseudosymbols
    '_trigs': ['cos()', 'sin()', 'tan()'],
    '_1/trigs': ['cosec()', 'sec()', 'cot()'],
    '_inv_trigs': ['arccos()', 'arcsin()', 'arctan()'],
    '_inv_1/trigs': ['arccosec()', 'arcsec()', 'arccot()'],
    '_hyp_trigs': ['cosh()', 'sinh()', 'tanh()', 'cosech()', 'sech()', 'coth()'],
    '_inv_hyp_trigs': ['arccosh()', 'arcsinh()', 'arctanh()', 'arccosech()', 'arcsech()', 'arccoth()'],
    '_logs': ['log()', 'ln()'],
    '_no_alphabet': [],
    // Chemistry pseudosymbols
    '_state_symbols': ['(s)', '(l)', '(g)', '(aq)'],
    '_plus': ['+'],
    '_minus': ['-'],
    '_fraction': ['/'],
    '_right_arrow': ['->'],
    '_equilibrium_arrow': ['<=>'],
    '_brackets_round': ['()'],
    '_brackets_square': ['[]'],
    '_dot': ['.'],
    // Adding a pseudosymbol to an empty list in the content editor causes the list to start with a comma
    // and so this empty string is used to avoid adding it to the list of available symbols
    '': []
};

export const parsePseudoSymbolicAvailableSymbols = (availableSymbols?: string[]) => {
    if (!availableSymbols) return;

    const theseSymbols = availableSymbols.slice(0).map(s => s.trim());
    let i = 0;
    while (i < theseSymbols.length) {
        const currentSymbol = theseSymbols[i];
        if (currentSymbol in pseudoToSymbolDict) {
            const translatedSymbols = pseudoToSymbolDict[currentSymbol];
            theseSymbols.splice(i, 1, ...translatedSymbols);
            i += translatedSymbols.length;
        } else {
            i += 1;
        }
    }
    return theseSymbols;
};
