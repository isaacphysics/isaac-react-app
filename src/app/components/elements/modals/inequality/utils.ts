import {
    CHEMICAL_ELEMENTS,
    CHEMICAL_PARTICLES,
    DIFFERENTIAL_REGEX,
    HYP_FUNCTION_NAMES,
    LOG_FUNCTION_NAMES,
    LogicSyntax,
    MenuItemProps, MenuItems,
    TRIG_FUNCTION_NAMES
} from "./constants";
import {GREEK_LETTERS_MAP, isDefined, REVERSE_GREEK_LETTERS_MAP} from "../../../../services";

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
    // ...this.state.menuItems,
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


export function sanitiseInequalityState(state: any) {
    const saneState = JSON.parse(JSON.stringify(state));
    if (saneState.result?.tex) {
        saneState.result.tex = saneState.result.tex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP[l] : l).join('');
    }
    if (saneState.result?.python) {
        saneState.result.python = saneState.result.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] || l).join('');
    }
    if (saneState.result?.uniqueSymbols) {
        saneState.result.uniqueSymbols = saneState.result.uniqueSymbols.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] || l).join('');
    }
    if (saneState.symbols) {
        for (const symbol of saneState.symbols) {
            if (symbol.expression.latex) {
                symbol.expression.latex = symbol.expression.latex.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] ? '\\' + REVERSE_GREEK_LETTERS_MAP[l] : l).join('');
            }
            if (symbol.expression.python) {
                symbol.expression.python = symbol.expression.python.split('').map((l: string) => REVERSE_GREEK_LETTERS_MAP[l] || l).join('');
            }
        }
    }
    return saneState;
}

export const parsePseudoSymbolicAvailableSymbols = (availableSymbols?: string[]) => {
    if (!availableSymbols) return;
    const theseSymbols = availableSymbols.slice(0).map(s => s.trim());
    let i = 0;
    while (i < theseSymbols.length) {
        if (theseSymbols[i] === '_trigs') {
            theseSymbols.splice(i, 1, 'cos()', 'sin()', 'tan()');
            i += 3;
        } else if (theseSymbols[i] === '_1/trigs') {
            theseSymbols.splice(i, 1, 'cosec()', 'sec()', 'cot()');
            i += 3;
        } else if (theseSymbols[i] === '_inv_trigs') {
            theseSymbols.splice(i, 1, 'arccos()', 'arcsin()', 'arctan()');
            i += 3;
        } else if (theseSymbols[i] === '_inv_1/trigs') {
            theseSymbols.splice(i, 1, 'arccosec()', 'arcsec()', 'arccot()');
            i += 3;
        } else if (theseSymbols[i] === '_hyp_trigs') {
            theseSymbols.splice(i, 1, 'cosh()', 'sinh()', 'tanh()', 'cosech()', 'sech()', 'coth()');
            i += 6;
        } else if (theseSymbols[i] === '_inv_hyp_trigs') {
            theseSymbols.splice(i, 1, 'arccosh()', 'arcsinh()', 'arctanh()', 'arccosech()', 'arcsech()', 'arccoth()');
            i += 6;
        } else if (theseSymbols[i] === '_logs') {
            theseSymbols.splice(i, 1, 'log()', 'ln()');
            i += 2;
        } else if (theseSymbols[i] === '_no_alphabet') {
            theseSymbols.splice(i, 1);
        } else {
            i += 1;
        }
    }
    return theseSymbols;
}
