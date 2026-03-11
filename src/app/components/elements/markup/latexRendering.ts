import {useContext} from "react";
import {useGetSegueEnvironmentQuery} from "../../../state";
import {FigureNumberingContext, FigureNumbersById} from "../../../../IsaacAppTypes";
import he from "he";
import {BOOLEAN_NOTATION, dropZoneRegex, isAda, renderA11yString, useUserPreferences} from "../../../services";
import katex, {KatexOptions} from "katex";
import 'katex/dist/contrib/mhchem.mjs';

type MathJaxMacro = string|[string, number];

const BaseMacros: {[key: string]: MathJaxMacro} = {
    // See http://docs.mathjax.org/en/latest/tex.html#defining-tex-macros
    // Mathematics:
    "quantity": ["{#1}\\,{\\rm{#2}}", 2],
    "valuedef": ["{#1}={\\quantity{#2}{#3}}", 3],
    "vtr": ["{\\underline{\\boldsymbol{#1}}}", 1],
    "eqalign": ["\\begin{aligned}#1\\end{aligned}", 1],
    "d": "\\mathrm{d}",
    "vari": ["#1", 1],
    "s": ["_{\\sf{#1}}", 1],
    "half": ["\\frac{1}{2}", 0],
    "third": ["\\frac{1}{3}", 0],
    "quarter": ["\\frac{1}{4}", 0],
    "eighth": ["\\frac{1}{8}", 0],
    "e": ["\\textrm{e}", 0],
    "units": ["\\rm{#1}", 1],
    // Chemistry:
    "standardstate": ["\u29B5", 0], // Below we unescape HTML encoding using 'he', otherwise would need "\\mathbin{\u29B5}".
    // Set theory:
    "N": "\\mathbb{N}",
    "Z": "\\mathbb{Z}",
    "Q": "\\mathbb{Q}",
    "R": "\\mathbb{R}",
    "C": "\\mathbb{C}"
};
const BooleanLogicMathsMacros: {[key: string]: MathJaxMacro} = {
    "true": "\\mathbf{T}",
    "false": "\\mathbf{F}",
    "and": ["{#1} \\land {#2}", 2],
    "or": ["{#1} \\lor {#2}", 2],
    "not": ["\\lnot{#1}", 1],
    "bracketnot": ["\\lnot{(#1)}", 1],
    "xor": ["{#1} \\veebar {#2}", 2],
    "equivalent": "=", // Fall back to equals rather than the more correct "\\equiv"
    // FIXME: remove the lowercase versions above in future!
    "True": "\\mathbf{T}",
    "False": "\\mathbf{F}",
    "And": ["{#1} \\land {#2}", 2],
    "Or": ["{#1} \\lor {#2}", 2],
    "Not": ["\\lnot{#1}", 1],
    "BracketNot": ["\\lnot{(#1)}", 1],
    "Xor": ["{#1} \\veebar {#2}", 2],
    "Equivalent": "=", // Fall back to equals rather than the more correct "\\equiv"
};
const BooleanLogicEngineeringMacros: {[key: string]: MathJaxMacro} = {
    "true" : "1",
    "false" : "0",
    "and" : ["{#1} \\cdot {#2}", 2],
    "or" : ["{#1} + {#2}", 2],
    "not" : ["\\overline{#1}", 1],
    "bracketnot" : ["\\overline{#1}", 1], // Don't do anything different to "not" for engineering syntax!
    "xor" : ["{#1} \\oplus {#2}", 2],
    "equivalent" : "=",
    // FIXME: remove the lowercase versions above in future!
    "True" : "1",
    "False" : "0",
    "And" : ["{#1} \\cdot {#2}", 2],
    "Or" : ["{#1} + {#2}", 2],
    "Not" : ["\\overline{#1}", 1],
    "BracketNot" : ["\\overline{#1}", 1], // Don't do anything different to "Not" for engineering syntax!
    "Xor" : ["{#1} \\oplus {#2}", 2],
    "Equivalent" : "=",
};

function mathjaxToKatex(macros: {[key: string]: MathJaxMacro}) {
    return Object.keys(macros).reduce((acc, key) => {
        const name = "\\" + key;
        let value: MathJaxMacro = macros[key];
        if (typeof value != 'string') {
            value = value[0];
        }
        // @ts-ignore
        acc[name] = value;
        return acc;
    }, {});
}

// Create MathJax versions for each of the two syntaxes, then create KaTeX versions of those:
const MacrosWithMathsBoolean = Object.assign({}, BaseMacros, BooleanLogicMathsMacros);
const MacrosWithEngineeringBoolean = Object.assign({}, BaseMacros, BooleanLogicEngineeringMacros);
const KatexBaseMacros = mathjaxToKatex(BaseMacros);
const KatexMacrosWithMathsBool = mathjaxToKatex(MacrosWithMathsBoolean);
const KatexMacrosWithEngineeringBool = mathjaxToKatex(MacrosWithEngineeringBoolean);

const customKatexOptions: KatexOptions = {
    throwOnError: false,
    strict: false,
    colorIsTextColor: true,
};

function patternQuote(s: string) {
    return s.replace(/([\^$(){}+*?\-|[\]:\\])/g,'\\$1');
}

function endPattern(end: string) {
    return new RegExp(patternQuote(end)+"|\\\\.|[{}]","g");
}

function sortLength(a: string, b: string) {
    if (a.length !== b.length) {return b.length - a.length;}
    return (a == b ? 0 : (a < b ? -1 : 1));
}

const config = {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    displayMath: [ ['$$','$$'], ["\\[","\\]"], ["\\begin{equation}", "\\end{equation}"] ],
    processEscapes: true,
    processEnvironments: true,
    processRefs: true
};

type Mode = "inline" | "display";

interface Match {
    mode: Mode;
    end: string;
    pattern: RegExp;
}

// This parser heavily inspired by https://github.com/mathjax/MathJax/blob/419b0a6eee7eefc0f85e47f7d4f8227ec28b8e57/unpacked/extensions/tex2jax.js

let i, m;
const starts = [];
const matchers: {[key: string]: Match} = {};
const parts = [];
for (i = 0, m = config.inlineMath.length; i < m; i++) {
    starts.push(patternQuote(config.inlineMath[i][0]));
    matchers[config.inlineMath[i][0]] = {
        mode: "inline",
        end: config.inlineMath[i][1],
        pattern: endPattern(config.inlineMath[i][1])
    };
}
for (i = 0, m = config.displayMath.length; i < m; i++) {
    starts.push(patternQuote(config.displayMath[i][0]));
    matchers[config.displayMath[i][0]] = {
        mode: "display",
        end: config.displayMath[i][1],
        pattern: endPattern(config.displayMath[i][1])
    };
}
parts.push(starts.sort(sortLength).join("|"));
if (config.processEnvironments) {parts.push("\\\\begin\\{([^}]*)\\}");}
if (config.processEscapes)      {parts.push("\\\\*\\\\\\$");}
if (config.processRefs)         {parts.push("\\\\(eq)?ref\\{[^}]*\\}");}
const start = new RegExp(parts.join("|"),"g");

interface Search {
    mode?: Mode;
    end?: string;
    endPattern?: RegExp;
    pcount?: number;
    olen?: number;
    clen?: number;
    opos?: number;
    blen?: number;
    isBeginEnd?: boolean;
    just?: string;
    matched?: boolean;
}

function startMatch(match: RegExpMatchArray): Search {
    const key: string = match[0];
    // @ts-ignore
    const delim = matchers[key];
    if (delim != null) {                              // a start delimiter
        return {
            end: delim.end, endPattern: new RegExp(endPattern(delim.end), "g"), mode: delim.mode, pcount: 0,
            olen: match[0].length
        };
    } else if (match[0].substr(0,6) === "\\begin") {  // \begin{...}
        const end = "\\end{" + match[1] + "}";
        return {
            end: end, mode: "display", pcount: 0,
            endPattern: endPattern(end),
            olen: 0,
            isBeginEnd: true
        };
    } else if (match[0].substr(0,4) === "\\ref" || match[0].substr(0,6) === "\\eqref") {
        return {
            endPattern: undefined
        };
    } else {
        return {
            just: "$"
        };
    }
}

function endMatch(match: RegExpExecArray, search: Search) {
    if (match[0] == search.end) {
        if (search.pcount === 0) {
            search.matched = true;
            search.clen = search.isBeginEnd ? 0 : match[0].length;
        }
    }
    else if (match[0] === "{" && search.pcount !== undefined) {search.pcount++;}
    else if (match[0] === "}" && search.pcount !== undefined) {search.pcount--;}
}

function munge(latex: string) {
    return latex
        .replace(/eqnarray/g, "aligned")
        .replace(/\\newline/g, "\\\\");
}

const REF = "==REF==yzskvUeunVc==";
const ENDREF = "==ENDREF==";
const REF_REGEXP = new RegExp(REF + "(.*?)" + ENDREF, "g");
const SR_REF_REGEXP = new RegExp("start text, " + REF_REGEXP.source + ", end text,", "g");

export function katexify(
    html: string,
    booleanNotation : BOOLEAN_NOTATION | undefined,
    showScreenReaderHoverText: boolean,
    preferMathML: boolean,
    figureNumbers: FigureNumbersById
) {
    start.lastIndex = 0;
    let match: RegExpExecArray | null;
    let output = "";
    let index = 0;

    function createReference(ref: string | null, ifMissing: string, format: boolean = true) {
        if (ref) {
            const number = figureNumbers[ref];
            if (number) {
                const figure = `Figure&nbsp;${number}`;
                return format ? `<strong class="text-theme figure-reference">${figure}</strong>` : figure;
            }
        }
        return ifMissing;
    }

    while ((match = start.exec(html)) !== null) {
        output += html.substring(index, match.index);
        index = match.index;

        // Find blocks of LaTeX
        const search = startMatch(match);
        if (search.just) {
            output += search.just;
            index = match.index + match[0].length;
        } else if (search.endPattern) {
            search.endPattern.lastIndex = start.lastIndex;
            while (!search.matched && (match = search.endPattern.exec(html)) !== null) {
                endMatch(match, search);
            }
            if (search.matched && match) {
                const latex = html.substring(index + (search.olen || 0), match.index + match[0].length - (search.clen || 0));
                const latexUnEntitied = he.decode(latex);
                const latexMunged = munge(latexUnEntitied);
                let macrosToUse;
                if (isAda) {
                    macrosToUse = booleanNotation === BOOLEAN_NOTATION.ENG ? KatexMacrosWithEngineeringBool : KatexMacrosWithMathsBool;
                } else {
                    macrosToUse = KatexBaseMacros;
                }
                macrosToUse = {...macrosToUse, "\\ref": (context: {consumeArgs: (n: number) => {text: string}[][]}) => {
                    const args = context.consumeArgs(1);
                    const reference = args[0].reverse().map((t: {text: string}) => t.text).join("");
                    return "\\text{" + REF + reference + ENDREF + "}";
                }};
                const katexOptions = {...customKatexOptions, displayMode: search.mode == "display", macros: macrosToUse, output: "html"} as KatexOptions;
                let katexRenderResult = katex.renderToString(latexMunged, katexOptions);
                katexRenderResult = katexRenderResult.replace(REF_REGEXP, (_, match) => {
                    return createReference(match, "unknown reference " + match);
                });

                let screenReaderText;
                try {
                    const pauseChars = katexOptions.displayMode ? ". &nbsp;" : ",";  // trailing comma/full-stop for pause in speaking
                    screenReaderText = `${renderA11yString(latexMunged, katexOptions)}${pauseChars}`;
                    screenReaderText = screenReaderText.replace(SR_REF_REGEXP, (_, match) => {
                        return createReference(match, "unknown reference " + match, false);
                    });
                } catch {
                    screenReaderText = undefined;
                }

                // KaTeX has phantom elements that make a mess of selection and of copy-paste.
                // Until https://github.com/KaTeX/KaTeX/issues/3668 is resolved, apply suggested fix ourselves, awfully:
                katexRenderResult = katexRenderResult.replaceAll("color:transparent;", "color:transparent;visibility:hidden;");

                // If katex-a11y fails, or MathML preferred, generate MathML using KaTeX for accessibility:
                if (!preferMathML && screenReaderText) {
                    katexRenderResult = katexRenderResult.replace('<span class="katex">',
                        `<span class="katex"><span class="visually-hidden" aria-label="${screenReaderText}" role="text"></span>`);
                } else {
                    const katexMathML = katex.renderToString(latexMunged.replace(dropZoneRegex, "clickable drop zone"), {...katexOptions, output: "mathml"})
                        .replace(`class="katex"`, `class="katex-mathml"`);
                    katexRenderResult = katexRenderResult.replace('<span class="katex">',
                        `<span class="katex">${katexMathML}`);
                }

                if (showScreenReaderHoverText) {
                    // Show screenreader text on hover so we can easily tell what's being output by katex-a11y
                    katexRenderResult = katexRenderResult.replace(
                        '<span class="katex-html"',
                        `<span class="katex-html" title="${
                            screenReaderText ? 
                                "Screenreader text: " + screenReaderText.replace(/,/g, "").replace(/\s\s+/g, " ") : 
                                "Accessible with a screenreader that supports MathML"
                        }"`);
                }

                output += katexRenderResult;

                index = match.index + match[0].length;
            } else {
                // Unmatched start, so output the start and continue searching from after it.
                output += html.substring(index, start.lastIndex);
                index = start.lastIndex;
            }
        } else {
            // It's a ref
            const ref = match[0].match(/ref\{([^}]*)\}/);
            const result = createReference(ref && ref[1], "unknown reference " + match[0]);

            output += result;
            index = match.index + match[0].length;
        }
        start.lastIndex = index;
    }
    output += html.substring(index, html.length);
    return output;
}

// A hook wrapper around katexify that gets its required parameters from the current redux state and existing figure numbering context
export const useRenderKatex = (forceAltText?: boolean) => {
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();
    const {preferredBooleanNotation, preferMathML} = useUserPreferences();
    const figureNumbers = useContext(FigureNumberingContext);

    const useMathML = (!forceAltText && preferMathML) ?? false;

    return (markup: string) => katexify(markup, preferredBooleanNotation && BOOLEAN_NOTATION[preferredBooleanNotation], segueEnvironment === "DEV", useMathML, figureNumbers);
};
