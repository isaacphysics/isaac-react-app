import React, {useContext} from "react";
import katex from "katex";
import 'katex/dist/contrib/mhchem.js';
import renderA11yString from '../../services/katex-a11y';
import he from "he";
import {LoggedInUser, FigureNumberingContext, FigureNumbersById} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {useSelector} from "react-redux";
import {EXAM_BOARD} from "../../services/constants";
import {useCurrentExamBoard} from "../../services/examBoard";

type MathJaxMacro = string|[string, number];

const BaseMacros: {[key: string]: MathJaxMacro} = {
    // See http://docs.mathjax.org/en/latest/tex.html#defining-tex-macros
    // Mathematics:
    "quantity": ["{#1}\\,{\\rm{#2}}", 2],
    "valuedef": ["{#1}={\\quantity{#2}{#3}}", 3],
    "vtr": ["{\\underline{\\boldsymbol{#1}}}", 1],
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
    "standardstate": ["\\mathbin{\u29B5}", 0],
    // Set theory:
    "N": "\\mathbb{N}",
    "Z": "\\mathbb{Z}",
    "Q": "\\mathbb{Q}",
    "R": "\\mathbb{R}",
    "C": "\\mathbb{C}"
};
const BooleanLogicMathsMacros: {[key: string]: MathJaxMacro} = {
    "true": "\\boldsymbol{\\rm{T}}",
    "false": "\\boldsymbol{\\rm{F}}",
    "and": ["{#1} \\land {#2}", 2],
    "or": ["{#1} \\lor {#2}", 2],
    "not": ["\\lnot{#1}", 1],
    "bracketnot": ["\\lnot{(#1)}", 1],
    "xor": ["{#1} \\veebar {#2}", 2],
    "equivalent": "\\equiv"
};
const BooleanLogicEngineeringMacros: {[key: string]: MathJaxMacro} = {
    "and" : ["{#1} \\cdot {#2}", 2],
    "or" : ["{#1} + {#2}", 2],
    "not" : ["\\overline{#1}", 1],
    "bracketnot" : ["\\overline{#1}", 1], // Don't do anything different to "not" for engineering syntax!
    "xor" : ["{#1} \\oplus {#2}", 2],
    "true" : "1",
    "false" : "0",
    "equivalent" : "=",
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
const KatexMacrosWithMathsBool = mathjaxToKatex(MacrosWithMathsBoolean);
const KatexMacrosWithEngineeringBool = mathjaxToKatex(MacrosWithEngineeringBoolean);

const KatexOptions = {
    throwOnError: false,
    strict: false,
    colorIsTextColor: true,
    output: "html"
};

function patternQuote(s: string) {
    return s.replace(/([\^$(){}+*?\-|[\]:\\])/g,'\\$1')
}

function endPattern(end: string) {
    return new RegExp(patternQuote(end)+"|\\\\.|[{}]","g");
}

function sortLength(a: string, b: string) {
    if (a.length !== b.length) {return b.length - a.length}
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
if (config.processEnvironments) {parts.push("\\\\begin\\{([^}]*)\\}")}
if (config.processEscapes)      {parts.push("\\\\*\\\\\\$")}
if (config.processRefs)         {parts.push("\\\\(eq)?ref\\{[^}]*\\}")}
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
    var delim = matchers[key];
    if (delim != null) {                              // a start delimiter
        return {
            end: delim.end, endPattern: new RegExp(endPattern(delim.end), "g"), mode: delim.mode, pcount: 0,
            olen: match[0].length
        };
    } else if (match[0].substr(0,6) === "\\begin") {  // \begin{...}
        let end = "\\end{" + match[1] + "}";
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

export function katexify(html: string, user: LoggedInUser | null, examBoard: EXAM_BOARD | null, screenReaderHoverText: boolean, figureNumbers: FigureNumbersById) {
    start.lastIndex = 0;
    let match: RegExpExecArray | null;
    let output = "";
    let index = 0;
    while ((match = start.exec(html)) !== null) {
        output += html.substring(index, match.index);
        index = match.index;

        // Find blocks of LaTeX
        let search = startMatch(match);
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
                let macrosToUse = KatexMacrosWithMathsBool;
                if (examBoard == EXAM_BOARD.AQA) {
                    macrosToUse = KatexMacrosWithEngineeringBool;
                }
                let katexOptions = {...KatexOptions, displayMode: search.mode == "display", macros: macrosToUse};
                let katexRenderResult = katex.renderToString(latexMunged, katexOptions);

                let screenreaderText;
                try {
                    let pauseChars = katexOptions.displayMode ? ". &nbsp;" : ",";  // trailing comma/full-stop for pause in speaking
                    screenreaderText = `${renderA11yString(latexMunged, katexOptions)}${pauseChars}`;
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn(`Unsupported equation for screenreader text: '${latexMunged}'`, e);
                    screenreaderText = "[[Unsupported equation]]";
                }
                katexRenderResult = katexRenderResult.replace('<span class="katex">',
                    `<span class="katex"><span class="sr-only">${screenreaderText}</span>`);

                if (screenReaderHoverText) {
                    katexRenderResult = katexRenderResult.replace('<span class="katex">',
                        `<span class="katex" title="${screenreaderText.replace(/,/g, "").replace(/\s\s+/g, " ")}">`);
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
            let result = "unknown reference " + match[0];
            const ref = match[0].match(/ref\{([^}]*)\}/);
            if (ref && ref[1]) {
                const number = figureNumbers[ref[1]];
                if (number) {
                    result = "Figure " + number;
                }
            }

            output += result;
            index = match.index + match[0].length;
        }
        start.lastIndex = index;
    }
    output += html.substring(index, html.length);
    return output;
}

const htmlDom = document.createElement("html");
function manipulateHtml(html: string) {
    // This can't be quick but it is more robust than writing regular expressions...
    htmlDom.innerHTML = html;

    // Table manipulation
    const tableElements = htmlDom.getElementsByTagName("table");
    for (let i = 0; i < tableElements.length; i++) {
        const table = tableElements[i];

        // Add bootstrap classes
        const currentTableClasses = (table.getAttribute("class") || "").split(" ");
        const bootstrapTableClasses = ["table", "table-bordered", "w-100", "text-center", "bg-white", "m-0"];
        const uniqueTableClasses = Array.from(new Set([...currentTableClasses, ...bootstrapTableClasses]));
        table.setAttribute("class", uniqueTableClasses.join(" "));

        // Insert parent div to handle table overflow
        const parent = table.parentElement as HTMLElement;
        const div = document.createElement("div");
        div.setAttribute("class", "overflow-auto mb-4");
        parent.insertBefore(div, table);
        div.appendChild(parent.removeChild(table));
    }

    return htmlDom.innerHTML;
}

export const TrustedHtml = ({html, span}: {html: string; span?: boolean}) => {
    const user = useSelector((state: AppState) => state && state.user || null);
    const screenReaderHoverText = useSelector((state: AppState) => state && state.userPreferences &&
        state.userPreferences.BETA_FEATURE && state.userPreferences.BETA_FEATURE.SCREENREADER_HOVERTEXT || false);
    const examBoard = useCurrentExamBoard();

    const figureNumbers = useContext(FigureNumberingContext);

    html = manipulateHtml(katexify(html, user, examBoard, screenReaderHoverText, figureNumbers));

    const ElementType = span ? "span" : "div";
    return <ElementType dangerouslySetInnerHTML={{__html: html}} />;
};
