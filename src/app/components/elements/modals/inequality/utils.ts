import {
    CHEMICAL_ELEMENTS,
    CHEMICAL_PARTICLES,
    DIFFERENTIAL_REGEX,
    TRIG_FUNCTION_NAMES,
    HYP_FUNCTION_NAMES,
    LOG_FUNCTION_NAMES,
    LOWER_CASE_GREEK_LETTERS,
    UPPER_CASE_GREEK_LETTERS,
    LogicSyntax,
    MenuItemProps,
    MenuItems,
    EditorMode
} from "./constants";
import {GREEK_LETTERS_MAP, isDefined, sanitiseInequalityState} from "../../../../services";
import React from "react";
import {isEqual, uniqWith} from "lodash";
import {Inequality, makeInequality, WidgetSpec} from "inequality";

// This file contains helper functions used specifically in the Inequality modal

// --- Functions to generate various kinds of menu items (i.e. specifications for items in the inequality menu tabs at the top) ---

export function generateSingleLetterMenuItem(letter: string, label?: string): MenuItemProps {
    return {type: "Symbol", properties: { letter: letter }, menu: { label: label || letter, texLabel: true, className: `symbol-${letter}` }};
}

export function generateLetterMenuItem(l: string): MenuItemProps | undefined {
    if (!/^[a-zA-Z]/.test(l)) return;
    const letter = l === 'epsilon' ? 'varepsilon' : l;
    const parts = letter.split('_');
    const modifiers = ['prime'];
    // This is going to generate many broken symbols...
    const item = generateSingleLetterMenuItem(GREEK_LETTERS_MAP[parts[0]] || parts[0], GREEK_LETTERS_MAP[parts[0]] ? `\\${parts[0]}` : parts[0]);
    // ... but that's OK because we are going to fix them now!
    if (parts.length > 1) {
        if (modifiers.includes(parts[1])) {
            item.properties.modifier = parts[1];
            item.menu.label += "'";
        }
        if (!modifiers.includes(parts[parts.length - 1])) {
            const subscriptLetter = parts[parts.length - 1];
            let subscriptSymbol;
            if (isNaN(parseInt(subscriptLetter))) {
                subscriptSymbol = { type: 'Symbol', properties: { letter: GREEK_LETTERS_MAP[subscriptLetter] || subscriptLetter, upright: subscriptLetter.length > 1 } }
            } else {
                subscriptSymbol = { type: 'Num', properties: { significand: subscriptLetter } };
            }
            item.children = { subscript: subscriptSymbol };
            item.menu.label += `_{${GREEK_LETTERS_MAP[subscriptLetter] ? `\\${subscriptLetter}` : subscriptLetter}}`
            item.menu.className = `${item.menu.className} has-subscript`;
        }
    }
    return item;
}

export function generateLogicFunctionsItems(syntax: LogicSyntax = "logic"): MenuItemProps[] {
    const labels: any = {
        logic: { and: "\\land", or: "\\lor", xor: '\\veebar', not: "\\lnot", equiv: "=", True: "\\mathsf{T}", False: "\\mathsf{F}" },
        binary: { and: "\\cdot", or: "+", xor: '\\oplus', not: "\\overline{x}", equiv: "=", True: "1", False: "0" }
    };
    return [
        {type: "LogicBinaryOperation", properties: { operation: "and" }, menu: { label: labels[syntax]['and'], texLabel: true, className: 'and' }},
        {type: "LogicBinaryOperation", properties: { operation: "or" }, menu: { label: labels[syntax]['or'], texLabel: true, className: 'or' }},
        {type: "LogicBinaryOperation", properties: { operation: "xor" }, menu: { label: labels[syntax]['xor'], texLabel: true, className: 'xor' }},
        {type: "LogicNot", properties: {}, menu: { label: labels[syntax]['not'], texLabel: true, className: 'not' }},
        {type: "Relation", properties: { relation: "equiv" }, menu: { label: labels[syntax]['equiv'], texLabel: true, className: 'equiv' }},
        {type: "LogicLiteral", properties: { value: true }, menu: { label: labels[syntax]['True'], texLabel: true, className: 'true' }},
        {type: "LogicLiteral", properties: { value: false }, menu: { label: labels[syntax]['False'], texLabel: true, className: 'false' }},
        {type: "Brackets", properties: { type: "round" }, menu: { label: "\\small{(x)}", texLabel: true, className: 'brackets' }}
    ];
}

export function generateMathsBasicFunctionsItems(): MenuItemProps[] {
    return [
        {type: "BinaryOperation", properties: { operation: "+" }, menu: { label: "+", texLabel: true, className: 'plus' }},
        {type: "BinaryOperation", properties: { operation: "-" }, menu: { label: "-", texLabel: true, className: 'minus' }},
        {type: "BinaryOperation", properties: { operation: "±" }, menu: { label: "\\pm", texLabel: true, className: 'plusminus' }},
        {type: "Fraction", properties: {}, menu: { label: "\\frac{a}{b}", texLabel: true, className: 'fraction' }},
        {type: "Brackets", properties: { type: "round" }, menu: { label: "\\small{(x)}", texLabel: true, className: 'brackets' }},
        {type: "AbsoluteValue", properties: {}, menu: { label: '\\small{|x|}', texLabel: true, className: 'abs' }},
        {type: "UnaryOperation", properties: { operation: "!", type: "postfix" }, menu: { label: '\\small{x!}', texLabel: true, className: 'factorial' }},
        {type: "Radix", properties: {}, menu: { label: '\\small{\\sqrt{x}}', texLabel: true, className: 'radix sqrt' }},
        {type: "Relation", properties: { relation: '=' }, menu: { label: '=', texLabel: true, className: 'relation equal' }},
        {type: "Relation", properties: { relation: '<' }, menu: { label: '<', texLabel: true, className: 'relation less' }},
        {type: "Relation", properties: { relation: '>' }, menu: { label: '>', texLabel: true, className: 'relation greater' }},
        {type: "Relation", properties: { relation: '<=' }, menu: { label: '\\leq', texLabel: true, className: 'relation less-or-equal' }},
        {type: "Relation", properties: { relation: '>=' }, menu: { label: '\\geq', texLabel: true, className: 'relation greater-or-equal' }},
    ];
}

export function generateMathsTrigFunctionItem(name: string): MenuItemProps {
    let children: { [key: string]: any } | null = null;
    let functionName: string;
    let label: string;
    let fontSize: string;
    if (name.substring(0, 3) === 'arc') {
        functionName = name.substring(3);
        if (name.substring(3, 7) === 'sech' || name.substring(3, 8) === 'cosec') {
            label = `\\text{${functionName}}`;
        } else {
            label = `\\${functionName}`;
        }
        label += '^{-1}';
        fontSize = ['arccosech'].includes(name) ? '0.8em' : '1em';
        children = { superscript: { type: 'Num', properties: { significand: '-1' }, children: {} } };
    } else {
        functionName = name;
        if (name.substring(0, 4) === 'sech' || name.substring(0, 5) === 'cosec') {
            label = `\\text{${functionName}}`;
        } else {
            label = `\\${functionName}`;
        }
        fontSize = ['cosech'].includes(name) ? '1em' : '1.2em';
    }
    const item: MenuItemProps = {
        type: "Fn",
        properties: {
            name: functionName,
            innerSuperscript: true,
            allowSubscript: false
        },
        menu: {
            label: label,
            texLabel: true,
            className: 'function trig ' + name,
            fontSize: fontSize
        }
    };
    if (children !== null) {
        item.children = children;
    }
    return item;
}

export function generateMathsTrigFunctionsItems(): MenuItemProps[] {
    return TRIG_FUNCTION_NAMES.map(generateMathsTrigFunctionItem);
}

export function generateMathsHypFunctionsItems(): MenuItemProps[] {
    return HYP_FUNCTION_NAMES.map(generateMathsTrigFunctionItem);
}

export function generateMathsLogFunctionItem(name: string): MenuItemProps {
    if (name === 'ln') {
        return {type: 'Fn', properties: { name: 'ln', innerSuperscript: false, allowSubscript: false }, menu: { label: '\\text{ln}', texLabel: true, className: 'function ln' }};
    } else { // assume log, defaults to base 10, can have other bases
        return {type: 'Fn', properties: { name: 'log', innerSuperscript: false, allowSubscript: true }, menu: { label: '\\text{log}', texLabel: true, className: 'function log' }};
    }
}

export function generateMathsLogFunctionsItems(): MenuItemProps[] {
    return LOG_FUNCTION_NAMES.map(generateMathsLogFunctionItem);
}

export function generateMathsDifferentialItem(parsedDifferential: string[]): MenuItemProps {
    const nameToLetterMap: { [name: string]: string } = {"delta":"δ","Delta":"∆","d":"d"};
    const nameToLatexMap: { [name: string]: string } = {"delta":"\\delta","Delta":"\\Delta","d":"d"};
    const differentialType: string = parsedDifferential[1];
    const differentialOrder = parsedDifferential[2] || 0;
    const differentialArgument = parsedDifferential[3] || null;
    const differentialLetter = nameToLetterMap[differentialType] || "?";
    const differentialLatex = "\\mathrm{" + ( nameToLatexMap[differentialType] || "?" ) + "}";

    const differentialSymbol: MenuItemProps = {type: 'Differential', properties: { letter: differentialLetter }, menu: { label: differentialLatex, texLabel: true, className: '' }};

    if (differentialOrder > 1) {
        differentialSymbol.children = {
            ...differentialSymbol.children,
            order: {
                type: "Num",
                properties: {
                    significand: `${differentialOrder}`,
                }
            }
        };
        differentialSymbol.menu.label = differentialSymbol.menu.label + "^{" + differentialOrder + "}";
    }

    if (differentialArgument) {
        differentialSymbol.children = { ...differentialSymbol.children, argument: generateLetterMenuItem(differentialArgument) };
        differentialSymbol.menu.label = differentialSymbol.menu.label + differentialSymbol.children.argument.menu.label;
    }

    return differentialSymbol;
}

export function generateMathsDefaultDerivativesItems(availableSymbols: string[] | undefined): MenuItemProps[] {
    // Do we need to generate special derivatives?
    if (!availableSymbols || availableSymbols.length === 0) {
        const derivativeItem: MenuItemProps = {type: 'Derivative', properties: {}, menu: { label: '\\frac{\\mathrm{d}\\ \\cdot}{\\mathrm{d}\\ \\cdots}', texLabel: true, className: 'derivative' }};
        derivativeItem.children = {
            numerator: { type: 'Differential', properties: { letter: 'd' } },
            denominator: { type: 'Differential', properties: { letter: 'd' } }
        }
        return [
            {type: 'Differential', properties: { letter: 'd' }, menu: { label: '\\mathrm{d}^{\\circ}\\circ', texLabel: true, className: 'differential-d' }},
            {type: 'Differential', properties: { letter: '∆' }, menu: { label: '\\mathrm{\\Delta}^{\\circ}\\circ', texLabel: true, className: 'differential-upper-delta' }},
            {type: 'Differential', properties: { letter: 'δ' }, menu: { label: '\\mathrm{\\delta}^{\\circ}\\circ', texLabel: true, className: 'differential-lower-delta' }},
            derivativeItem
        ];
    }
    return [];
}

export function generateMathsDerivativeAndLetters(symbol: string): { derivative: MenuItemProps[]; letters: MenuItemProps[] } {
    const parts = symbol.replace(/^Derivative/, '').split(';').map(s => s.replace(/[()\s]/g, ''));
    const letters = new Array<MenuItemProps>();
    const top = parts[0];
    if (isDefined(GREEK_LETTERS_MAP[top]) || /^[a-zA-Z]$/.test(top)) {
        // Do this only if we have a single greek letter or a single latin letter.
        letters.push(generateSingleLetterMenuItem(GREEK_LETTERS_MAP[top] || top, GREEK_LETTERS_MAP[top] ? '\\' + top : top))
    }
    const pieces = parts.slice(1);
    const orders: { [piece: string]: number } = {};
    // Count how many times one should derive each variable
    for (const piece of pieces) {
        orders[piece] = orders[piece] + 1 || 1;
    }
    const derivativeOrder = Object.values(orders).reduce((a, c) => a + c, 0);
    const denominatorObjects: any[] = [];
    let texBottom = '';
    for (const p of Object.entries(orders)) {
        const letter = p[0];
        letters.push(generateSingleLetterMenuItem(GREEK_LETTERS_MAP[letter] || letter, GREEK_LETTERS_MAP[letter] ? '\\' + letter : letter));
        const order = p[1];
        const o = {
            type: 'Differential',
            properties: { letter: 'd' }, // TODO Support other types of differentials
            children: {
                argument: {
                    type: 'Symbol',
                    properties: { letter: GREEK_LETTERS_MAP[letter] || letter }
                },
                order: null as any | null
            }
        };
        texBottom += `\\mathrm{d}${GREEK_LETTERS_MAP[letter] ? '\\' + letter : letter}`;
        if (order > 1) {
            o.children = { ...o.children, order: {
                    type: 'Num',
                    properties: { significand: `${order}` }
                }};
            texBottom += `^{${order}}`;
        }
        if (!o.children.order) {
            delete o.children.order;
        }
        denominatorObjects.push(o);
    }
    // This sure would look a lot better as a reduce but I can't figure it out.
    let denominator = denominatorObjects.pop();
    while (denominatorObjects.length > 0) {
        const acc = denominatorObjects.pop();
        acc.children.right = denominator;
        denominator = acc;
    }
    // Build up the object
    const texLabel = '\\frac{\\mathrm{d}' + (derivativeOrder > 1 ? `^{${derivativeOrder}}` : '') + `}{${texBottom}}`;
    const derivativeObject: MenuItemProps = {type: 'Derivative', properties: { }, menu: { label: texLabel, texLabel: true, fontSize: '1.5em', className: 'derivative' }};
    const numerator = {
        type: 'Differential',
        properties: { letter: 'd' },
        children: derivativeOrder > 1 ? { order: { type: 'Num', properties: { significand: `${derivativeOrder}` } } } : { }
    };
    derivativeObject.children = { numerator, denominator };

    const derivative = [derivativeObject]

    if (isDefined(GREEK_LETTERS_MAP[top]) || /^[a-zA-Z]$/.test(top)) {
        // Do this only if we have a single greek letter or a single latin letter.
        const argument = {
            type: 'Symbol',
            properties: { letter: GREEK_LETTERS_MAP[top] || top }
        }
        const compoundNumerator = {
            type: 'Differential',
            properties: { letter: 'd' },
            children: derivativeOrder > 1 ? { argument, order: { type: 'Num', properties: { significand: `${derivativeOrder}` } } } : { argument }
        };
        const compoundTexLabel = '\\frac{\\mathrm{d}' + (derivativeOrder > 1 ? `^{${derivativeOrder}}` : '') + `${GREEK_LETTERS_MAP[top] || top}}{${texBottom}}`;
        const compoundDerivativeObject: MenuItemProps = {type: 'Derivative', properties: { }, menu: { label: compoundTexLabel, texLabel: true, fontSize: '1.5em', className: 'derivative' }};
        compoundDerivativeObject.children = { numerator: compoundNumerator, denominator };
        derivative.push(compoundDerivativeObject);
    }
    return { derivative, letters };
}

export function generateMathsDifferentialAndLetters(symbol: string): { differential?: MenuItemProps | null; letters?: MenuItemProps[] | null } {
    // We wouldn't be here if the regex didn't parse in the first place, so the assertion is justified
    const parsedDifferential = DIFFERENTIAL_REGEX.exec(symbol)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const differentialType = parsedDifferential[1];
    const differentialOrder = parsedDifferential[2] || 0;
    const differentialArgument = parsedDifferential[3] || null;

    if (differentialType === "d" && differentialOrder === 0 && differentialArgument == null) {
        return { letters: [generateSingleLetterMenuItem('d')] }
    } else {
        return {
            differential: generateMathsDifferentialItem(parsedDifferential as string[]),
            letters: differentialArgument ? [generateSingleLetterMenuItem(GREEK_LETTERS_MAP[differentialArgument] || differentialArgument, GREEK_LETTERS_MAP[differentialArgument] ? '\\' + differentialArgument : differentialArgument)] : null
        }
    }
}

export function generateChemicalStatesMenuItems() {
    return [
        {type: 'StateSymbol', properties: { state: 'gas' }, menu: { label: '\\text{(g)}', texLabel: true, className: 'chemical-state gas' }},
        {type: 'StateSymbol', properties: { state: 'liquid' }, menu: { label: '\\text{(l)}', texLabel: true, className: 'chemical-state liquid' }},
        {type: 'StateSymbol', properties: { state: 'aqueous' }, menu: { label: '\\text{(aq)}', texLabel: true, className: 'chemical-state aqueous' }},
        {type: 'StateSymbol', properties: { state: 'solid' }, menu: { label: '\\text{(s)}', texLabel: true, className: 'chemical-state solid' }},
        {type: 'StateSymbol', properties: { state: 'metal' }, menu: { label: '\\text{(m)}', texLabel: true, className: 'chemical-state metal' }},
    ]
}

export function generateChemicalOperationsMenuItems() {
    return [
        {type: 'BinaryOperation', properties: { operation: '+' }, menu: { label: '+', texLabel: true, className: 'chemical-operations plus' }},
        {type: 'BinaryOperation', properties: { operation: '-' }, menu: { label: '-', texLabel: true, className: 'chemical-operations minus' }},
        {type: 'Fraction', properties: { }, menu: { label: '\\frac{a}{b}', texLabel: true, className: 'chemical-operations fraction' }},
        {type: 'Relation', properties: { relation: 'rightarrow' }, menu: { label: '\\rightarrow', texLabel: true, className: 'chemical-operations rightarrow' }},
        {type: 'Relation', properties: { relation: 'equilibrium' }, menu: { label: '\\rightleftharpoons', texLabel: true, className: 'chemical-operations equilibrium' }},
        {type: 'Brackets', properties: { type: 'round', mode: 'chemistry' }, menu: { label: '(x)', texLabel: true, className: 'chemical-operations brackets round' }},
        {type: 'Brackets', properties: { type: 'square', mode: 'chemistry' }, menu: { label: '[x]', texLabel: true, className: 'chemical-operations brackets square' }},
        {type: 'Relation', properties: { relation: '.' }, menu: { label: '\\cdot', texLabel: true, className: 'chemical-operations dot' }},
    ]
}

export function generateChemicalElementMenuItem(symbol: string): MenuItemProps | undefined {
    if (CHEMICAL_ELEMENTS.includes(symbol)) {
        return {
            type: "ChemicalElement",
            properties: {
                element: symbol
            },
            menu: {label: `\\text{${symbol}}`, texLabel: true, className: `chemical-element ${symbol}`}
        };
    } else if (CHEMICAL_PARTICLES.hasOwnProperty(symbol)) {
        return {
            type: "Particle",
            properties: CHEMICAL_PARTICLES[symbol].properties,
            menu: {...CHEMICAL_PARTICLES[symbol].menu, className: `chemical-particle ${symbol}`}
        };
    }
    return undefined;
}

export const generateDefaultMenuItems = (parsedAvailableSymbols: string[], logicSyntax?: LogicSyntax): MenuItems => ({
    upperCaseLetters: [],
    lowerCaseLetters: [],
    upperCaseGreekLetters: [],
    lowerCaseGreekLetters: [],
    logicFunctionsItems: generateLogicFunctionsItems(logicSyntax ?? "logic"),
    mathsBasicFunctionsItems: generateMathsBasicFunctionsItems(),
    mathsTrigFunctions: generateMathsTrigFunctionsItems(),
    mathsHypFunctions: generateMathsHypFunctionsItems(),
    mathsLogFunctions: generateMathsLogFunctionsItems(),
    mathsDerivatives: generateMathsDefaultDerivativesItems(parsedAvailableSymbols),
    chemicalStates: generateChemicalStatesMenuItems(),
    chemicalOperations: generateChemicalOperationsMenuItems(),
    // The following are reduced versions in case there are available symbols and should replace their respective sub-sub-menus.
    letters: [],
    otherFunctions: [],
    chemicalElements: [],
    chemicalParticles: [],
    parsedChemicalElements: []
});

// --- Callback/effect definitions ---

interface InequalityHandlers {
    onTouchStart: (e: TouchEvent) => void;
    handleKeyPress: (ev: KeyboardEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseDown: (e: MouseEvent) => void;
    onCursorMoveEnd: () => void;
}
export function setupAndTeardownDocStyleAndListeners({onCursorMoveEnd, onMouseMove, onTouchMove, handleKeyPress, onMouseDown, onTouchStart, inequalityModalRef}: InequalityHandlers & {inequalityModalRef: React.RefObject<HTMLDivElement>}) {
    window.addEventListener("keyup", handleKeyPress);

    if (inequalityModalRef.current) {
        inequalityModalRef.current.addEventListener("mousedown", onMouseDown);
        inequalityModalRef.current.addEventListener("touchstart", onTouchStart);
        inequalityModalRef.current.addEventListener("mousemove", onMouseMove);
        inequalityModalRef.current.addEventListener("touchmove", onTouchMove);
    }
    // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
    document.body.addEventListener("mouseup", onCursorMoveEnd);
    document.body.addEventListener("touchend", onCursorMoveEnd);

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.width = '100vw';
    document.documentElement.style.height = '100vh';
    document.documentElement.style.touchAction = 'none';
    document.body.style.overflow = "hidden";
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.body.style.touchAction = 'none';

    return () => {
        window.removeEventListener("keyup", handleKeyPress);

        if (inequalityModalRef.current) {
            inequalityModalRef.current.removeEventListener('mousedown', onMouseDown);
            inequalityModalRef.current.removeEventListener('touchstart', onTouchStart);
            inequalityModalRef.current.removeEventListener('mousemove', onMouseMove);
            inequalityModalRef.current.removeEventListener('touchmove', onTouchMove);
        }
        // MouseUp and TouchEnd on body because they are not intercepted by inequalityElement (I blame dark magic)
        document.body.removeEventListener("mouseup", onCursorMoveEnd);
        document.body.removeEventListener("touchend", onCursorMoveEnd);

        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.touchAction = 'auto';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = 'auto';

        const canvas = inequalityModalRef.current?.getElementsByTagName('canvas')[0];
        if (canvas) {
            inequalityModalRef.current.removeChild(canvas);
        }
    };
}

export function generateMenuItems({editorMode, logicSyntax, parsedAvailableSymbols}: {editorMode: EditorMode; logicSyntax?: LogicSyntax; parsedAvailableSymbols: string[]}) {
    const baseItems = generateDefaultMenuItems(parsedAvailableSymbols, logicSyntax);

    if (parsedAvailableSymbols.length > 0) {
        // ~~~ Assuming these are only letters... might become more complicated in the future.
        // THE FUTURE IS HERE! Sorry.
        const customMenuItems: {mathsDerivatives: MenuItemProps[]; letters: MenuItemProps[]; otherFunctions: MenuItemProps[]; chemicalElements: MenuItemProps[]} = {
            mathsDerivatives: new Array<MenuItemProps>(),
            letters: new Array<MenuItemProps>(),
            otherFunctions: new Array<MenuItemProps>(),
            chemicalElements: new Array<MenuItemProps>(),
        };

        parsedAvailableSymbols.forEach((l) => {
            const availableSymbol = l.trim();
            if (availableSymbol.endsWith('()')) {
                // Functions
                const functionName = availableSymbol.replace('()', '');
                if (TRIG_FUNCTION_NAMES.includes(functionName)) {
                    customMenuItems.otherFunctions.push(generateMathsTrigFunctionItem(functionName));
                } else if (HYP_FUNCTION_NAMES.includes(functionName)) {
                    customMenuItems.otherFunctions.push(generateMathsTrigFunctionItem(functionName));
                } else if (LOG_FUNCTION_NAMES.includes(functionName)) {
                    customMenuItems.otherFunctions.push(generateMathsLogFunctionItem(functionName));
                } else {
                    // What
                    // eslint-disable-next-line no-console
                    console.warn(`Could not parse available symbol "${availableSymbol} as a function"`);
                }
            } else if (availableSymbol.startsWith('Derivative')) {
                const items = generateMathsDerivativeAndLetters(availableSymbol);
                if (items.derivative) {
                    customMenuItems.mathsDerivatives.push(...items.derivative);
                    customMenuItems.letters.push(...items.derivative);
                }
                if (items.letters) {
                    customMenuItems.letters.push(...items.letters);
                }
            } else if (DIFFERENTIAL_REGEX.test(availableSymbol) && !/^(?:Delta|delta|d)$/.test(availableSymbol)) {
                // The second clause makes sure we don't capture Delta, delta, and d as differentials but fall through to make them regular letters.
                const items = generateMathsDifferentialAndLetters(availableSymbol);
                if (items.differential) {
                    customMenuItems.mathsDerivatives.push(items.differential);
                    customMenuItems.letters.push(items.differential);
                }
                if (items.letters) {
                    customMenuItems.letters.push(...items.letters);
                }
            } else {
                // Everything else is a letter, unless we are doing chemistry
                if (editorMode === "chemistry") {
                    // Available chemical elements
                    const item = generateChemicalElementMenuItem(availableSymbol);
                    if (item) {
                        customMenuItems.chemicalElements.push(item);
                    }
                } else {
                    const item = generateLetterMenuItem(availableSymbol);
                    if (isDefined(item)) {
                        customMenuItems.letters.push(item);
                    }
                }
            }
        });
        return [{
            ...baseItems,
            mathsDerivatives: [ ...baseItems.mathsDerivatives, ...customMenuItems.mathsDerivatives ],
            letters: uniqWith([ ...baseItems.letters, ...customMenuItems.letters ], (a, b) => isEqual(a, b))/*.sort((a: MenuItem, b: MenuItem) => {
                        if ((a.type === 'Symbol' && b.type === 'Symbol') || (a.type !== 'Symbol' && b.type !== 'Symbol')) {
                            return a.menu.label.localeCompare(b.menu.label);
                        }
                        if (a.type === 'Derivative' && b.type === 'Differential') {
                            return -1;
                        } else if (a.type === 'Differential' && b.type === 'Derivative') {
                            return 1;
                        }
                        if (a.type === 'Symbol' && b.type !== 'Symbol') {
                            return -1;
                        } else if (a.type !== 'Symbol' && b.type === 'Symbol') {
                            return 1;
                        }
                        return 0;
                    })*/,
            otherFunctions: [ ...baseItems.otherFunctions, ...customMenuItems.otherFunctions ],
            chemicalElements: [ ...baseItems.chemicalElements, ...customMenuItems.chemicalElements ],
        }, false] as [MenuItems, boolean];
    } else {
        if (editorMode === "logic") {
            // T and F are reserved in logic. The jury is still out on t and f.
            return [{
                ...baseItems,
                upperCaseLetters: "ABCDEGHIJKLMNOPQRSUVWXYZ".split("").map(letter => generateSingleLetterMenuItem(letter)),
                lowerCaseLetters: "abcdeghijklmnopqrsuvwxyz".split("").map(letter => generateSingleLetterMenuItem(letter)),
            }, true] as [MenuItems, boolean];
        } else if (editorMode === "chemistry") {
            return [{
                ...baseItems,
                chemicalElements: CHEMICAL_ELEMENTS.map(generateChemicalElementMenuItem),
                chemicalParticles: Object.keys(CHEMICAL_PARTICLES).map(generateChemicalElementMenuItem),
            }, true] as [MenuItems, boolean];
        } else {
            // Assuming editorMode === 'maths'
            return [{
                ...baseItems,
                upperCaseLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => generateSingleLetterMenuItem(letter)),
                lowerCaseLetters: "abcdefghijklmnopqrstuvwxyz".split("").map(letter => generateSingleLetterMenuItem(letter)),
                upperCaseGreekLetters: UPPER_CASE_GREEK_LETTERS.map( letter => generateSingleLetterMenuItem(GREEK_LETTERS_MAP[letter] || letter, GREEK_LETTERS_MAP[letter] ? '\\' + letter : letter) ),
                lowerCaseGreekLetters: LOWER_CASE_GREEK_LETTERS.map( letter => generateSingleLetterMenuItem(GREEK_LETTERS_MAP[letter] || letter, GREEK_LETTERS_MAP[letter] ? '\\' + letter : letter) ),
            }, true] as [MenuItems, boolean];
        }
    }
}

// --- Event handlers (the longer ones at least) ---

interface HandlerArgs {
    previousCursor: React.MutableRefObject<{x: number; y: number} | null>;
    potentialSymbolSpec: React.MutableRefObject<MenuItemProps | null>;
    movingMenuItem: React.MutableRefObject<HTMLElement | null>;
    movingMenuBar: React.MutableRefObject<HTMLElement | null>;
    disappearingMenuItem: React.MutableRefObject<HTMLElement | null>;
    sketch: React.RefObject<Nullable<Inequality>>;
}
export function handleMoveCallback({previousCursor, movingMenuBar, movingMenuItem, potentialSymbolSpec, sketch}: HandlerArgs, isTrashActive: React.MutableRefObject<boolean>, menuRef: React.RefObject<HTMLDivElement>, setMenuOpen: (b: boolean) => void, x: number, y: number) {

    const trashCan = document.getElementById('inequality-trash');
    if (trashCan) {
        const trashCanRect = trashCan.getBoundingClientRect();
        if (trashCanRect && x >= trashCanRect.left && x <= trashCanRect.right && y >= trashCanRect.top && y <= trashCanRect.bottom) {
            trashCan.classList.add('active');
            isTrashActive.current = true;
        } else {
            trashCan.classList.remove('active');
            isTrashActive.current = false;
        }
    }

    // No need to run any further if we are not dealing with a menu item.
    if (!movingMenuItem.current) return;

    if (previousCursor.current) {
        const dx =  x - previousCursor.current.x;
        if (movingMenuBar.current) {
            const menuBarRect = movingMenuBar.current.getBoundingClientRect();
            const menuItems = movingMenuBar.current.getElementsByClassName('menu-item');
            const lastMenuItem = menuItems.item(menuItems.length-1);
            if (lastMenuItem) {
                const newUlLeft = Math.min(0, menuBarRect.left + dx);
                const lastMenuItemRect = lastMenuItem.getBoundingClientRect();
                if (lastMenuItemRect.right > window.innerWidth || dx >= 0) {
                    movingMenuBar.current.style.left = `${newUlLeft}px`;
                }
            }
        }
        movingMenuItem.current.style.top = `${y}px`;
        movingMenuItem.current.style.left = `${x}px`;

        // Auto-close the menu on small-screens when dragging outside the area
        if (window.innerWidth < 1024) {
            const menuBox = menuRef.current?.getBoundingClientRect();
            if (isDefined(menuBox)) {
                if (previousCursor.current.y <= menuBox.height && y > menuBox.height) {
                    setMenuOpen(false);
                }
            }
        }
    }
    if (potentialSymbolSpec.current && sketch.current) {
        sketch.current.updatePotentialSymbol(potentialSymbolSpec.current as WidgetSpec, x, y);
    }

    previousCursor.current = { x, y };
}

export function onCursorMoveEndCallback({movingMenuItem, previousCursor, sketch, disappearingMenuItem, movingMenuBar, potentialSymbolSpec}: HandlerArgs) {
    // No need to run if we are not dealing with a menu item.
    if (!movingMenuItem.current) return;

    const menuTabs = document.getElementById('inequality-menu-tabs') as Element;
    const menuTabsRect = menuTabs ? menuTabs.getBoundingClientRect() : null;

    const trashCan = document.getElementById('inequality-trash') as Element;
    const trashCanRect = trashCan ? trashCan.getBoundingClientRect() : null;

    if (previousCursor.current && sketch.current) {
        if (menuTabsRect && previousCursor.current.y <= menuTabsRect.top) {
            sketch.current.abortPotentialSymbol();
        } else if (trashCanRect &&
            previousCursor.current.x >= trashCanRect.left &&
            previousCursor.current.x <= trashCanRect.right &&
            previousCursor.current.y >= trashCanRect.top &&
            previousCursor.current.y <= trashCanRect.bottom) {
            sketch.current.abortPotentialSymbol();
        } else {
            sketch.current.commitPotentialSymbol();
        }
    }

    previousCursor.current = null;
    document.body.removeChild(movingMenuItem.current);
    if (disappearingMenuItem.current) {
        disappearingMenuItem.current.style.opacity = '1';
        disappearingMenuItem.current = null;
    }
    movingMenuItem.current = null;
    movingMenuBar.current = null;
    potentialSymbolSpec.current = null;
}

interface PrepareInequalityArgs {
    editorMode?: EditorMode;
    logicSyntax?: LogicSyntax;
    inequalityModalRef: React.RefObject<HTMLDivElement>;
    isTrashActive: React.MutableRefObject<boolean>;
    sketch: React.MutableRefObject<Nullable<Inequality>>;
    initialEditorSymbols: { type: string; properties: any }[];
    onEditorStateChange?: (state: any) => void;
    setEditorState: (state: any) => void;
}
export function prepareInequality({editorMode, inequalityModalRef, initialEditorSymbols, isTrashActive, sketch, logicSyntax, setEditorState, onEditorStateChange}: PrepareInequalityArgs) {
    const { sketch: newSketch, p } = makeInequality(
        inequalityModalRef.current,
        window.innerWidth,
        window.innerHeight,
        initialEditorSymbols,
        {
            editorMode: editorMode ?? "logic",
            logicSyntax: logicSyntax ?? "logic",
            textEntry: false,
            fontItalicPath: '/assets/fonts/STIXGeneral-Italic.ttf',
            fontRegularPath: '/assets/fonts/STIXGeneral-Regular.ttf'
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
    newSketch.onNewEditorState = (state: any) => {
        const modal = inequalityModalRef.current;
        if (modal) {
            const newState = sanitiseInequalityState(state);
            setEditorState((prev: any) => ({...prev, ...newState}));
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
