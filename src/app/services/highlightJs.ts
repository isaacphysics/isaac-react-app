import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import php from 'highlight.js/lib/languages/php';
import phpTemplate from 'highlight.js/lib/languages/php-template';
import xml from 'highlight.js/lib/languages/xml';
import csharp from 'highlight.js/lib/languages/csharp';
import plaintext from 'highlight.js/lib/languages/plaintext';
import sql from 'highlight.js/lib/languages/pgsql';
import java from 'highlight.js/lib/languages/java';
import vbnet from 'highlight.js/lib/languages/vbnet';
import haskell from 'highlight.js/lib/languages/haskell';
import xmlhtml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import {LanguageFn, Mode} from "highlight.js";

const importHljsCore = import("highlight.js/lib/core");

async function registerLanguages() {
    await importHljsCore.then(({default: hljs}) => {
        hljs.registerLanguage('java', java);
        hljs.registerLanguage('vba', vbnet);
        hljs.registerLanguage('javascript', javascript);
        hljs.registerLanguage('python', python);
        hljs.registerLanguage('php', php);
        hljs.registerLanguage('phpfile', phpTemplate);
        hljs.registerLanguage('xml', xml);
        hljs.registerLanguage('csharp', csharp);
        hljs.registerLanguage('haskell', haskell);
        hljs.registerLanguage('plaintext', plaintext);
        hljs.registerLanguage('assembly', assemblyHighlightDefinition);
        hljs.registerLanguage('sql', sql);
        hljs.registerLanguage('html', xmlhtml);
        hljs.registerLanguage('css', css);
        hljs.registerLanguage('pseudocode', isaacPseudocodeHighlightDefinition);
    });
}

const highlightElement = (e: HTMLElement) => importHljsCore.then(({default: hljs}) => {
    return hljs.highlightElement(e);
});

function addLineNumbers(code: Element) {
    // Adapt the PrismJS code for line numbering:
    // https://github.com/PrismJS/prism/blob/v1.24.1/plugins/line-numbers/prism-line-numbers.js
    // This will not work for code that is wrapped onto multiple lines; see the PrismJS
    // code above for a (horrid!) method for dealing with wrapped lines.

    const pre = code.parentElement;

    // This works only for <code> wrapped inside <pre> and not inline code.
    if (!pre || !/pre/i.test(pre.nodeName)) {
        return;
    }

    // Abort if line numbers already exists
    if (code.querySelector('.line-numbers-rows')) {
        return;
    }

    const newlines = code.textContent?.match(/\n(?!$)/g);
    const numberOfLines = newlines ? newlines.length + 1 : 1;

    // Add blank spans, one per line, that will be numbered using a CSS counter:
    const lineNumberSpans = new Array(numberOfLines + 1).join('<span></span>');

    const lineNumbersWrapper = document.createElement('span');
    lineNumbersWrapper.setAttribute('aria-hidden', 'true');
    lineNumbersWrapper.className = 'line-numbers-rows';
    lineNumbersWrapper.innerHTML = lineNumberSpans;

    if (pre.hasAttribute('data-start')) {
        pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start') as string, 10) - 1);
    }

    code.appendChild(lineNumbersWrapper);
}

const isaacPseudocodeHighlightDefinition: LanguageFn = function(hljsLib) {

    const KEYWORDS = [
        "GLOBAL",
        "MOD",
        "DIV",
        "AND",
        "OR",
        "NOT",
        "IF",
        "THEN",
        "ELSEIF",
        "ELSE",
        "ENDIF",
        "SWITCH",
        "CASE",
        "DEFAULT",
        "ENDSWITCH",
        "FOR",
        "FOREACH",
        "IN",
        "TO",
        "NEXT",
        "WHILE",
        "ENDWHILE",
        "DO",
        "REPEAT",
        "UNTIL",
        "FUNCTION",
        "RETURN",
        "ENDFUNCTION",
        "PROCEDURE",
        "ENDPROCEDURE",
        "TRY",
        "CATCH",
        "FINALLY",
        "ENDTRY",
        "BYREF",
        "BYVAL",
        "RECORD",
        "ENDRECORD",
        "ARRAY",
        "CLASS",
        "ENDCLASS",
        "PRIVATE",
        "PUBLIC",
        "PROTECTED",
        "NEW",
        "EXTENDS",
        "SUPER",
        "DICTIONARY",
        "LIST",
    ];

    const LITERALS = [
        "False",
        "True",
        "Null",
    ];

    const BUILT_INS = [
        "STR",
        "INT",
        "FLOAT",
        "INPUT",
        "PRINT",
        "LEN",
        "UPPER",
        "LOWER",
        "SPLIT",
        "MID",
        "LEFT",
        "RIGHT",
        "INDEXOF",
        "STRIP",
        "CONTAINS",
        "DELETE",
        "APPEND",
        "POP",
        "CREATE_FILE",
        "OPEN_READ",
        "OPEN_WRITE",
        "OPEN_APPEND",
        "READ_LINE",
        "READ_ALL",
        "WRITE_LINE",
        "WRITE_ALL",
        "CLOSE",
        "END_OF_FILE",
        "ASC",
        "CHR",
        "RANDOM_INT",
        "STR_TO_DATE",
        "STR_TO_TIME",
    ];

    const FUNCTION_DEFINITION = {
        match: [
            /FUNCTION|PROCEDURE/,
            / +/,
            hljsLib.UNDERSCORE_IDENT_RE,
            /(?=\()/
        ],
        scope: {
            1: "keyword",
            3: "title.function"
        },
        contains: [],
    };

    return {
        name: 'pseudocode',
        aliases: [
            'isaacPseudocode',
        ],
        keywords: {
            $pattern: hljsLib.UNDERSCORE_IDENT_RE,
            keyword: KEYWORDS,
            literal: LITERALS,
            built_in: BUILT_INS,
        },
        contains: [
            hljsLib.QUOTE_STRING_MODE,
            // C-style comments:
            hljsLib.C_LINE_COMMENT_MODE,
            hljsLib.C_BLOCK_COMMENT_MODE,
            // Or Python-style comments:
            hljsLib.HASH_COMMENT_MODE,
            // Other nice things to highlight:
            hljsLib.NUMBER_MODE,
            FUNCTION_DEFINITION,
        ]
    };
};

const assemblyHighlightDefinition: LanguageFn = function(hljsLib) {

    const KEYWORDS: string[] = [
        // LMC:
        "STA",
        "LDA",
        "ADD",
        "SUB",
        "BRA",
        "BRZ",
        "BRP",
        "INP",
        "OUT",
        "HLT",
        "DAT",
        // AQA:
        "LDR",
        "STR",
        "MOV",
        "ADD",
        "SUB",
        "CMP",
        "BEQ",
        "BNE",
        "BLT",
        "BGT",
        "B",
        "AND",
        "ORR",
        "XOR",
        "MVN",
        "LSL",
        "LSR",
        "HALT",
    ];

    return {
        name: 'assembly',
        aliases: [],
        keywords: KEYWORDS,
        contains: [
            // C-style comments:
            hljsLib.C_LINE_COMMENT_MODE,
            // Other nice things to highlight:
            { // number literals
                className: 'number',
                variants: [
                    { // literal
                        begin: '[#$=]\\d+' },
                    { // bare number
                        begin: '\\b\\d+' }
                ],
                relevance: 0
            },
            {  // register names
                className: 'variable',
                variants: [
                    {begin: 'R\\d+' },
                ],
                relevance: 0
            },
            { // 1 arg LMC instructions
                begin: [
                    /(ADD|SUB|STA|LDA)/,
                    / +/,
                    /[a-zA-Z0-9]+/,
                ],
                beginScope: {
                    1: "keyword",
                    3: "variable",
                },
                contains: []
            } as Mode,
            { // 2 arg instructions:
                begin: [
                    /LDR|STR|MOV|CMP|MVN/,
                    / +/,
                    /[a-zA-Z0-9]+/,
                    / *, */,
                    /[a-zA-Z0-9]+/,
                ],
                beginScope: {
                    1: "keyword",
                    3: "variable",
                    5: "variable",
                },
                contains: []
            } as Mode,
            { // 2 arg instructions (static number):
                begin: [
                    /LDR|STR|MOV|CMP|MVN/,
                    / +/,
                    /[a-zA-Z0-9]+/,
                    / *, */,
                    /#[0-9]+/,
                ],
                beginScope: {
                    1: "keyword",
                    3: "variable",
                    5: "number",
                },
                contains: []
            } as Mode,
            { // 3 arg instructions:
                begin: [
                    /ADD|SUB|AND|ORR|XOR|LSL|LSR/,
                    / +/,
                    /[a-zA-Z0-9]+/,
                    / *, */,
                    /[a-zA-Z0-9]+/,
                    / *, */,
                    /[a-zA-Z0-9]+/,
                ],
                beginScope: {
                    1: "keyword",
                    3: "variable",
                    5: "variable",
                    7: "variable",
                },
                contains: []
            } as Mode,
            { // 3 arg instructions (static number):
                begin: [
                    /ADD|SUB|AND|ORR|XOR|LSL|LSR/,
                    / +/,
                    /[a-zA-Z0-9]+/,
                    / *, */,
                    /[a-zA-Z0-9]+/,
                    / *, */,
                    /#[0-9]+/,
                ],
                beginScope: {
                    1: "keyword",
                    3: "variable",
                    5: "variable",
                    7: "number",
                },
                contains: []
            } as Mode,
            { // calls with labels
                begin: [
                    // LMC | AQA
                    /(BR[APZ])|(BEQ|BNE|BLT|BGT|B)/,
                    / +/,
                    /[a-zA-Z][a-zA-Z0-9]+/,
                ],
                beginScope: {
                    1: "keyword",
                    3: "symbol",
                },
                contains: []
            } as Mode,
            { // AQA labelled blocks
                begin: [
                    /^[a-zA-Z][a-zA-Z0-9]*/,
                    /:/
                ],
                beginScope: {
                    1: "symbol"
                }
            } as Mode,
            { // LMC variable declarations
                begin: [
                    /^[a-zA-Z][a-zA-Z0-9]*/,
                    /(?= *(DAT))/
                ],
                beginScope: {
                    1: "variable"
                }
            } as Mode,
            { // LMC labelled blocks (symbols)
                begin: [
                    /^[a-zA-Z][a-zA-Z0-9]*/,
                    /(?= +(INP|OUT|ADD|SUB|STA|LDA|HLT|BR[APZ]))/
                ],
                beginScope: {
                    1: "symbol"
                }
            } as Mode,
        ]
    };
};

export const highlightJsService = {
    registerLanguages,
    addLineNumbers,
    highlightElement
};
