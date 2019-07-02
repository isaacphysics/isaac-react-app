import React from "react";
import katex from "katex";
import '../../services/mhchem';
import he from "he";
import {UserPreferencesDTO} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {connect} from "react-redux";

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
};
const BooleanLogicMathsMacros: {[key: string]: MathJaxMacro} = {
    "true": "\\boldsymbol{\\rm{T}}",
    "false": "\\boldsymbol{\\rm{F}}",
    "and": ["{#1} \\wedge {#2}", 2],
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

export function katexify(html: string, userPreferences: UserPreferencesDTO | null) {
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
                if (userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA) {
                    macrosToUse = KatexMacrosWithEngineeringBool;
                }
                output += katex.renderToString(latexMunged,
                    {...KatexOptions, displayMode: search.mode == "display", macros: macrosToUse});
                index = match.index + match[0].length;
            } else {
                // Unmatched start, so output the start and continue searching from after it.
                output += html.substring(index, start.lastIndex);
                index = start.lastIndex;
            }
        } else {
            // It's a ref
            output += match[0];
            index = match.index + match[0].length;
        }
        start.lastIndex = index;
    }
    output += html.substring(index, html.length);
    return output;
}

function manipulateHtml(html: string) {
    const htmlAsDom = document.createElement( 'html' );
    htmlAsDom.innerHTML = html;

    // Table manipulation - apply bootstrap classes and insert parent div to handle table overflow
    const tableElements = htmlAsDom.getElementsByTagName("table");
    const tableClasses = "table table-bordered w-100 text-center bg-white m-0";
    for (let i = 0; i < tableElements.length; i++) {
        const table = tableElements[i];
        table.setAttribute("class", (table.getAttribute("class") || "") + tableClasses);
        const parent = table.parentElement as HTMLElement;
        const div = document.createElement("div");
        div.setAttribute("class", "overflow-auto");
        parent.insertBefore(div, table);
        div.appendChild(parent.removeChild(table));
    }

    return htmlAsDom.innerHTML;
}

const stateToProps = (state: AppState) => ({
    userPreferences: state ? state.userPreferences : null
});

interface TrustedHtmlProps {
    html: string;
    span?: boolean;
    userPreferences: UserPreferencesDTO | null;
}

let TrustedHtmlComponent = ({html, span, userPreferences}: TrustedHtmlProps) => {
    html = manipulateHtml(katexify(html, userPreferences));
    if (span) {
        return <span dangerouslySetInnerHTML={{__html: html}} />;
    } else {
        return <div dangerouslySetInnerHTML={{__html: html}} />;
    }
};

export const TrustedHtml = connect(stateToProps)(TrustedHtmlComponent);
